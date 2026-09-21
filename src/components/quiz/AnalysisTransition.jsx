import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const STEPS = [
  'Checking your budget…',
  'Comparing your strengths…',
  'Looking at your schedule…',
  'Evaluating your work style…',
  'Preparing your HustleDNA…',
];

export default function AnalysisTransition({ onContinue }) {
  const [visible, setVisible] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (visible < STEPS.length) {
      const t = setTimeout(() => setVisible((v) => v + 1), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Analyzing your profile…</h1>

      <div className="mt-8 w-full space-y-3">
        {STEPS.map((label, i) => (
          i < visible && (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gradient">
                <Check className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </motion.div>
          )
        ))}
      </div>

      {ready && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-8"
        >
          <h2 className="text-xl font-semibold tracking-wide text-gradient">PROFILE READY</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your answers are saved. The HustleMatch engine is ready to compare them against real
            business models.
          </p>
          <button
            onClick={onContinue}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            CONTINUE
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}