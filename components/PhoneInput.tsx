'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const PHONE_REGEX =
  /^\+(\d{1,3})?[\s]{0,}[\s.-]?\(?\d{1,3}\)?([\s]{0,}[\s.-]?\d{1,4}){2,3}$/;

export function PhoneInput({
  value,
  onChange,
  onBlur,
  error,
  placeholder = '+381651234567',
  disabled = false,
  className,
}: PhoneInputProps) {
  const [isTouched, setIsTouched] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const validatePhone = (phone: string) => {
    if (!phone) {
      return null;
    }

    if (!phone.startsWith('+')) {
      return 'Broj telefona mora početi sa +';
    }

    if (!PHONE_REGEX.test(phone)) {
      return 'Neispravan format broja telefona';
    }

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Dozvoli samo: brojeve, +, razmake, crtice i zagrade
    const sanitizedValue = newValue.replace(/[^0-9+\s\-().]/g, '');

    if (sanitizedValue !== newValue) {
      newValue = sanitizedValue;
    }

    onChange(newValue);

    // Live validacija
    if (newValue && isTouched) {
      const validationError = validatePhone(newValue);
      setLocalError(validationError);
    } else if (!newValue) {
      setLocalError(null);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    if (value) {
      const validationError = validatePhone(value);
      setLocalError(validationError);
    }
    onBlur?.();
  };

  const hasError = (localError || error) && isTouched;

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-10',
            hasError && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
        />
        {isTouched && value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-sm text-red-500">{localError || error}</p>
      )}
      {!hasError && !value && (
        <p className="text-xs text-muted-foreground">Format: +381651234567</p>
      )}
    </div>
  );
}
