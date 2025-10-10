'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Trash2,
  ChevronDown,
  Package,
  Loader2,
  Settings2,
  Sparkles,
  Check,
  X,
  Info,
  Layers,
  Hash,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddonGroup } from '@/types/addon';
import { AddonGroupFormDialog } from './AddonFormDialog';
import { DeleteDialog } from '../DeleteDialog';
import { deleteAddonGroup } from '@/lib/api/addon';
import { cn } from '@/lib/utils/utils';

interface AddonsListProps {
  addonGroups: AddonGroup[];
  restaurantId: string;
  isLoading: boolean;
}

export function AddonsList({
  addonGroups,
  restaurantId,
  isLoading,
}: AddonsListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<AddonGroup | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddonGroup | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const toggleExpanded = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleDelete = (addon: AddonGroup) => {
    setSelectedAddon(addon);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (addon: AddonGroup) => {
    setEditingAddon(addon);
    setEditDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
        </div>
        <span className="mt-4 text-lg font-medium text-muted-foreground">
          Učitavanje grupa dodataka...
        </span>
      </div>
    );
  }

  // Empty state
  if (!addonGroups || addonGroups.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/30 via-background to-muted/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />

        <div className="relative flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl">
              <Package className="h-16 w-16 text-primary" />
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Nema grupa dodataka
          </h3>
          <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed">
            Kreirajte prvu grupu dodataka da biste omogućili personalizaciju
            proizvoda. Grupe dodataka omogućavaju kupcima da biraju dodatke kao
            što su prelivi, dodaci, veličine, itd.
          </p>

          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Počnite sa kreiranjem prve grupe</span>
          </div>
        </div>
      </div>
    );
  }

  // Main list
  return (
    <>
      <div className="grid gap-6">
        {addonGroups.map((group, index) => {
          const isExpanded = expandedGroups.has(group.id);
          const optionsCount = Array.isArray(group.addonOptions)
            ? group.addonOptions.length
            : 0;
          const availableCount = Array.isArray(group.addonOptions)
            ? group.addonOptions.filter((opt) => opt.isAvailable).length
            : 0;

          return (
            <Card
              key={group.id}
              className={cn(
                'group relative overflow-hidden transition-all duration-300',
                'hover:shadow-sm hover:shadow-primary/5',
                'border-muted-foreground/10',
                isExpanded && 'shadow-lg shadow-primary/5'
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards',
              }}
            >
              {/* Color Accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-primary/50 to-primary" />

              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Title and Stats */}
                    <div className="flex items-start gap-4 flex-wrap">
                      <h3 className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {group.name}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {/* Selection Badges */}
                        <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                          <Settings2 className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium">
                            {group.minSelection} - {group.maxSelection}{' '}
                            selekcija
                          </span>
                        </div>

                        {/* Options Count */}
                        {optionsCount > 0 && (
                          <div className="flex items-center gap-1.5 bg-secondary/80 px-3 py-1.5 rounded-full">
                            <Layers className="h-3.5 w-3.5 text-secondary-foreground" />
                            <span className="text-xs font-medium text-secondary-foreground">
                              {optionsCount}{' '}
                              {optionsCount === 1 ? 'opcija' : 'opcije'}
                            </span>
                          </div>
                        )}

                        {/* Availability Status */}
                        {optionsCount > 0 && (
                          <div
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                              availableCount === optionsCount
                                ? 'bg-green-500/10'
                                : availableCount === 0
                                ? 'bg-red-500/10'
                                : 'bg-yellow-500/10'
                            )}
                          >
                            {availableCount === optionsCount ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : availableCount === 0 ? (
                              <X className="h-3.5 w-3.5 text-red-600" />
                            ) : (
                              <Info className="h-3.5 w-3.5 text-yellow-600" />
                            )}
                            <span
                              className={cn(
                                'text-xs font-medium',
                                availableCount === optionsCount
                                  ? 'text-green-700'
                                  : availableCount === 0
                                  ? 'text-red-700'
                                  : 'text-yellow-700'
                              )}
                            >
                              {availableCount}/{optionsCount} dostupno
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {group.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => handleEdit(group)}
                      title="Uredi grupu"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => handleDelete(group)}
                      title="Obriši grupu"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-9 w-9 transition-all',
                        isExpanded
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      )}
                      onClick={() => toggleExpanded(group.id)}
                      title={isExpanded ? 'Sakrij opcije' : 'Prikaži opcije'}
                    >
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Expanded Options */}
              {isExpanded &&
                group.addonOptions &&
                Array.isArray(group.addonOptions) && (
                  <CardContent className="relative pt-0 pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">
                          Opcije
                        </h4>
                      </div>

                      {group.addonOptions.length > 0 ? (
                        <div className="grid gap-3">
                          {group.addonOptions.map((option, optionIndex) => (
                            <div
                              key={option.id}
                              className={cn(
                                'group/option relative flex items-start justify-between',
                                'p-4 rounded-xl transition-all duration-300',
                                'border border-transparent',
                                option.isAvailable
                                  ? 'bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 hover:border-primary/20'
                                  : 'bg-destructive/5 opacity-75'
                              )}
                              style={{
                                animationDelay: `${optionIndex * 30}ms`,
                                animation: 'fadeInUp 0.3s ease-out forwards',
                              }}
                            >
                              <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      'flex items-center justify-center w-7 h-7 rounded-lg',
                                      'bg-white transition-all duration-300',
                                      option.isAvailable
                                        ? 'from-primary/20 to-primary/10 group-hover/option:from-primary/30 group-hover/option:to-primary/20'
                                        : 'from-destructive/20 to-destructive/10'
                                    )}
                                  >
                                    {option.isAvailable ? (
                                      <Check className="h-3.5 w-3.5 text-primary" />
                                    ) : (
                                      <X className="h-3.5 w-3.5 text-destructive" />
                                    )}
                                  </div>

                                  <span className="font-semibold text-foreground">
                                    {option.name}
                                  </span>

                                  {/* {!option.isAvailable && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Nedostupno
                                    </Badge>
                                  )} */}
                                </div>

                                {option.description && (
                                  <p className="text-sm text-muted-foreground ml-10">
                                    {option.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground mb-0.5">
                                    Cena
                                  </div>
                                  <div className="font-bold text-lg bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent">
                                    +{parseFloat(option.price).toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    RSD
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Hash className="h-10 w-10 text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Nema opcija u ovoj grupi
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
            </Card>
          );
        })}
      </div>

      <DeleteDialog
        trigger={<></>}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        description={`Ova akcija će trajno obrisati grupu dodataka ${selectedAddon?.name} i sve njene opcije.`}
        successMessage="Dodaci uspešno obrisani!"
        errorMessage="Greška pri brisanju grupe"
        mutationOptions={{
          mutationFn: () => deleteAddonGroup(selectedAddon?.id),
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ['addonGroups', restaurantId],
            });
            setDeleteDialogOpen(false);
            setSelectedAddon(null);
            router.refresh();
          },
        }}
      />

      {/* Edit Dialog */}
      <AddonGroupFormDialog
        restaurantId={restaurantId}
        addonGroup={editingAddon || undefined}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingAddon(null);
        }}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
