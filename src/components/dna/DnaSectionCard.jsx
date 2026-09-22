import React from 'react';

export default function DnaSectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}