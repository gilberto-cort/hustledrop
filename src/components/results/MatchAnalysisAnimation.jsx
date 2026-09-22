import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
  'ANALYZING YOUR HUSTLE DNA…',
  'Understanding how you like to work…',
  'Checking your practical constraints…',
  'Comparing business models…',
  'Evaluating tradeoffs…',
  'Finding your strongest matches…',
  'MATCH FOUND.',
];

export default function MatchAnalysisAnimation({ onComplete }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible < STEPS.length) {
      const t = setTimeout(() => setVisible((v) => v + 1), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => onComplete && onComplete(), 500);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center text-center">
      <div className="mb-8 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-brand-gradient transition-all duration-500"
          style={{ width: `${(visible / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="w-full space-y-3">
        {STEPS.map((label, i) => (
          i < visible && (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left"
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${i === STEPS.length - 1 ? 'bg-brand-gradient' : 'bg-white/10'}`}>
                <Check className="h-3.5 w-3.5 text-white" />
              </span>
              <span className={`text-sm font-medium ${i === STEPS.length - 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
}