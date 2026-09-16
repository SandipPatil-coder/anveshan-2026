import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

/** 404 — a stray petal drifts over the paper */
export default function NotFoundPage() {
  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center overflow-hidden px-4 py-24 text-center">
      <motion.span
        className="text-5xl"
        animate={{ y: [0, -14, 0], rotate: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        aria-hidden
      >
        🌸
      </motion.span>
      <div className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-plasma">
        404 — 見つかりません
      </div>
      <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">
        THIS PATH LEADS <span className="text-plasma">NOWHERE</span>
      </h1>
      <p className="mt-3 text-sm font-medium text-inkdim">
        The page you're looking for doesn't exist — it slipped away like a petal on the wind.
      </p>
      <Button to={ROUTES.home} size="lg" className="mt-8">
        BACK TO THE FEST
      </Button>
    </div>
  );
}
