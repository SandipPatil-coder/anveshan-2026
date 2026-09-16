import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Mochi from "@/components/Mochi";
import { ROUTES } from "@/lib/constants";

/** Lost-in-the-grove 404: MOCHI drifts across the bamboo grove */
export default function NotFoundPage() {
  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center overflow-hidden px-4 py-24 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #fff 50%, transparent 50%), radial-gradient(1px 1px at 70% 20%, #fff 50%, transparent 50%), radial-gradient(1.5px 1.5px at 40% 70%, #fff 50%, transparent 50%), radial-gradient(1px 1px at 85% 60%, #fff 50%, transparent 50%)",
        }}
      />
      <motion.div
        initial={{ x: "-60vw", rotate: 0 }}
        animate={{ x: "60vw", rotate: 360 }}
        transition={{ duration: 9, ease: "linear", repeat: Infinity }}
        className="relative z-10"
      >
        <Mochi color="#9b5de5" size={80} />
      </motion.div>
      <h1 className="relative z-10 mt-6 font-display text-4xl font-extrabold tracking-wide text-ink">
        MOCHI LOST IN <span className="text-alert">THE GROVE</span>
      </h1>
      <p className="relative z-10 mt-2 font-display text-sm font-bold text-inkdim">
        This path leads into the bamboo grove. A tanuki must have moved the sign — this page doesn't exist.
      </p>
      <Button to={ROUTES.home} size="lg" className="relative z-10 mt-8">
        RETURN TO THE FEST
      </Button>
    </div>
  );
}
