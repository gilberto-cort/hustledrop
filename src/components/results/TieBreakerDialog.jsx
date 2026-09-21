import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function TieBreakerDialog({ open, onOpenChange, tie, onAnswer }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Two very close matches</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {tie?.question}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {(tie?.options || []).map((opt) => (
            <Button
              key={opt.modelId}
              variant="outline"
              onClick={() => onAnswer(opt.modelId)}
              className="w-full justify-start whitespace-normal rounded-xl border-white/15 py-4 text-left text-sm font-medium hover:border-white/30"
            >
              {opt.text}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}