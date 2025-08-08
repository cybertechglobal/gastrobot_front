'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

interface DeleteDialogProps {
  /** Custom trigger element to open the dialog */
  trigger: React.ReactNode;
  /** Custom description for the dialog */
  description: string;
  /** Title for the dialog, defaults to "Da li ste sigurni?" */
  title?: string;
  /** Success message for toast, defaults to generic message */
  successMessage?: string;
  /** Error message for toast, defaults to generic message */
  errorMessage?: string;
  /** Mutation function and options */
  mutationOptions: UseMutationOptions<void, unknown, void>;
  /** External control for dialog state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteDialog({
  trigger,
  description,
  title = 'Da li ste sigurni?',
  successMessage = 'Uspešno obrisano',
  errorMessage = 'Greška prilikom brisanja',
  mutationOptions,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const mutation = useMutation({
    ...mutationOptions,
    onSuccess: (...args) => {
      toast.success(successMessage);
      setIsOpen(false); // Close dialog on success
      mutationOptions.onSuccess?.(...args);
    },
    onError: (...args) => {
      toast.error(errorMessage);
      mutationOptions.onError?.(...args);
    },
  });

  // If external control is provided, don't render trigger
  if (open !== undefined) {
    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Original behavior with trigger
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Otkaži</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutation.mutate()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Obriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
