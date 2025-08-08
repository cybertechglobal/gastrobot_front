// components/Stepper.tsx
'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: string[];
  current: number;
  valid: boolean[]; // an array of booleans, one per step
  onStepClick: (i: number) => void;
}

export function Stepper({ steps, current, valid, onStepClick }: StepperProps) {
  // can we jump to step i?
  const canJumpTo = (i: number) => {
    if (i <= current) return true; // always go back
    // going forward only if **all** previous steps are valid:
    return valid.slice(0, i).every(Boolean);
  };

  return (
    <div className="flex items-center mb-10 px-5">
      {steps.map((label, i) => {
        const isDone = i < current && valid[i];
        const isActive = i === current;
        const enabled = canJumpTo(i);

        return (
          <React.Fragment key={i}>
            <div
              className="flex flex-col items-center"
              style={{ position: 'relative', maxWidth: '46px' }}
            >
              <button
                type="button"
                onClick={() => enabled && onStepClick(i)}
                disabled={!enabled}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-colors mb-3',
                  enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                  isDone
                    ? 'bg-green-700 text-white'
                    : isActive
                    ? 'border-2 border-dashed border-brand-teal text-brand-teal'
                    : 'bg-slate-700 text-slate-400'
                )}
              >
                {isDone ? <Check size={16} /> : i + 1}
              </button>

              <span className="text-xs text-gray-400">Korak {i + 1}</span>
              <span
                className="text-xs text-black dark:text-white hidden sm:block"
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  width: '110px',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-[2px] mb-7 mx-2 transition-colors',
                  i < current ? 'bg-green-700' : 'bg-slate-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
