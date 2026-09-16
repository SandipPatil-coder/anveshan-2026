import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Panel, { PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { signInEmail } from "@/services/auth";
import { COLLEGE_DOMAIN_HINT } from "@/lib/constants";

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInEmail(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg.includes("Invalid login") ? "Invalid credentials. Check email and password." : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-14 sm:pt-20">
      <div className="text-center">
        <div className="font-mono text-[10px] tracking-[0.4em] text-inkdim">GUEST LOGIN</div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[0.2em] text-ink">
          GUEST <span className="text-plasma text-glow">ACCESS</span>
        </h1>
      </div>

      <Panel scanlines className="mt-8">
        <PanelHeader>AUTHENTICATION TERMINAL</PanelHeader>
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field
            label="EMAIL"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`you@${COLLEGE_DOMAIN_HINT}`}
            autoComplete="email"
          />
          <Field
            label="PASSWORD"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="font-mono text-xs tracking-[0.1em] text-alert">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "LINKING…" : "ENTER CONSOLE"}
          </Button>
        </form>
      </Panel>

      <p className="mt-6 text-center font-mono text-[11px] tracking-[0.15em] text-inkdim">
        NO GUEST PASS YET?{" "}
        <Link to="/signup" className="text-plasma hover:text-glow">
          SIGN UP
        </Link>
      </p>
    </div>
  );
}
