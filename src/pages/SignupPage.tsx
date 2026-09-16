import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Panel, { PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Mochi, { MOCHI_COLORS } from "@/components/Mochi";
import { signUpEmail } from "@/services/auth";
import { COLLEGE_DOMAIN_HINT } from "@/lib/constants";
import { sfx } from "@/lib/sfx";

export default function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [color, setColor] = useState(localStorage.getItem("nexorium-color") ?? "#4cc9f0");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const isCollegeMail = email.toLowerCase().endsWith(`@${COLLEGE_DOMAIN_HINT}`);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      localStorage.setItem("nexorium-color", color);
      const { needsVerification } = await signUpEmail(email.trim(), password, fullName.trim());
      if (needsVerification) {
        setOk(true);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg.includes("already registered") ? "This email already has a guest pass — try logging in." : msg);
    } finally {
      setBusy(false);
    }
  };

  if (ok) {
    return (
      <div className="mx-auto max-w-md px-4 pb-20 pt-20 text-center">
        <Panel className="p-8">
          <div className="font-display text-xl font-extrabold text-accent-warm">CHECK YOUR MAILBOX</div>
          <p className="mt-3 font-display text-sm font-bold text-inkdim">
            Confirmation email sent to <span className="text-ink">{email}</span>. Click the link, then log in.
          </p>
          <Button to="/login" className="mt-6">GO TO LOGIN</Button>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-12 sm:pt-16">
      <div className="text-center">
        <div className="font-display text-[11px] font-extrabold uppercase tracking-[0.4em] text-inkdim">NEW GUEST</div>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
          DESIGN YOUR <span className="text-plasma text-glow">MOCHI</span>
        </h1>
      </div>

      {/* Character preview + color picker */}
      <Panel className="mt-6 p-5 text-center">
        <PanelHeader>PICK YOUR COLOR</PanelHeader>
        <div className="flex flex-col items-center pt-4">
          <motion.div key={color} initial={{ scale: 0.85 }} animate={{ scale: 1 }}>
            <Mochi color={color} size={90} />
          </motion.div>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {MOCHI_COLORS.map((c) => (
              <button
                key={c.value}
                aria-label={`Color ${c.name}`}
                onClick={() => {
                  setColor(c.value);
                  sfx.blip();
                }}
                className={`h-8 w-8 rounded-full border-[3px] transition-transform hover:scale-110 ${
                  color === c.value ? "border-ink" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="mt-4">
        <PanelHeader>GUEST REGISTRATION</PanelHeader>
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field
            label="FULL NAME"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
          <Field
            label="EMAIL"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`you@${COLLEGE_DOMAIN_HINT}`}
            hint={isCollegeMail ? "✓ College domain — events are FREE for you" : "External participants pay a small event fee"}
            autoComplete="email"
          />
          <Field
            label="PASSWORD"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Minimum 6 characters"
            autoComplete="new-password"
          />
          {error && <p className="font-display text-sm font-bold text-alert">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "PREPARING YOUR PASS…" : "JOIN THE FEST"}
          </Button>
        </form>
      </Panel>

      <p className="mt-6 text-center font-display text-xs font-bold tracking-wider text-inkdim">
        ALREADY REGISTERED?{" "}
        <Link to="/login" className="text-plasma">
          LOG IN
        </Link>
      </p>
    </div>
  );
}
