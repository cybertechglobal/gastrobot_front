// components/TableDialog.tsx
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table } from '@/types/table';

interface TableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table?: Table | null;
  tableName: string;
  tableCapacity: string;
  onNameChange: (name: string) => void;
  onCapacityChange: (capacity: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const TableDialog: React.FC<TableDialogProps> = ({
  isOpen,
  onClose,
  table,
  tableName,
  tableCapacity,
  onNameChange,
  onCapacityChange,
  onSubmit,
  isLoading,
}) => {
  const isEditing = !!table;

  // Reset form when dialog opens/closes or table changes
  useEffect(() => {
    if (isOpen && table) {
      onNameChange(table.name);
      onCapacityChange(table.capacity.toString());
    } else if (isOpen && !table) {
      onNameChange('');
      onCapacityChange('');
    }
  }, [isOpen, table, onNameChange, onCapacityChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isFormValid =
    tableName.trim() && tableCapacity && parseInt(tableCapacity) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {isEditing ? 'Uredi sto' : 'Kreiraj novi sto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label
              htmlFor="tableName"
              className="text-gray-700 dark:text-gray-300"
            >
              Naziv stola
            </Label>
            <Input
              id="tableName"
              placeholder="npr. Sto 1"
              value={tableName}
              onChange={(e) => onNameChange(e.target.value)}
              className="border-gray-300 dark:border-gray-600 mt-1 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="tableCapacity"
              className="text-gray-700 dark:text-gray-300"
            >
              Kapacitet
            </Label>
            <Input
              id="tableCapacity"
              type="number"
              min="1"
              placeholder="4"
              value={tableCapacity}
              onChange={(e) => onCapacityChange(e.target.value)}
              className="border-gray-300 dark:border-gray-600 mt-1 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Otkaži
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
              disabled={isLoading || !isFormValid}
            >
              {isLoading
                ? isEditing
                  ? 'Ažuriranje...'
                  : 'Kreiranje...'
                : isEditing
                ? 'Ažuriraj'
                : 'Kreiraj Sto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
