import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AddonGroup } from '@/types/addon';
import { useAddons } from '@/hooks/query/useAddons';

interface AddonGroupSelectorProps {
  restaurantId: string;
  selectedAddonGroupIds: string[];
  onSelectionChange: (addonGroupIds: string[]) => void;
  disabled?: boolean;
}

export function AddonGroupSelector({
  restaurantId,
  selectedAddonGroupIds,
  onSelectionChange,
  disabled = false,
}: AddonGroupSelectorProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { addonGroups, isLoading, error } = useAddons({
    restaurantId,
    enabled: !!restaurantId,
  });

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

  const handleToggleAddonGroup = (groupId: string, checked: boolean) => {
    if (disabled) return;

    const newSelection = checked
      ? [...selectedAddonGroupIds, groupId]
      : selectedAddonGroupIds.filter((id) => id !== groupId);

    onSelectionChange(newSelection);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground">Učitavanje dodataka...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-destructive">Greška pri učitavanju dodataka</p>
      </div>
    );
  }

  if (!addonGroups || addonGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Info className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">
          Nema dostupnih grupa dodataka za ovaj restoran
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Dodaci (opciono)</Label>
        {selectedAddonGroupIds.length > 0 && (
          <Badge variant="secondary">
            {selectedAddonGroupIds.length} izabrano
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {addonGroups.map((group: AddonGroup) => {
            const isSelected = selectedAddonGroupIds.includes(group.id);
            const isExpanded = expandedGroups.has(group.id);

            return (
              <Card
                key={group.id}
                className={`transition-all py-0 ${
                  disabled ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`addon-${group.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleToggleAddonGroup(group.id, checked as boolean)
                        }
                        disabled={disabled}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Label
                              htmlFor={`addon-${group.id}`}
                              className={`font-semibold text-base ${
                                disabled
                                  ? 'cursor-not-allowed'
                                  : 'cursor-pointer'
                              }`}
                            >
                              {group.name}
                            </Label>
                            {group.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {group.description}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleExpanded(group.id)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            disabled={disabled}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            Min: {group.minSelection}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Max: {group.maxSelection}
                          </Badge>
                          {group.addonOptions && (
                            <Badge variant="secondary" className="text-xs">
                              {Array.isArray(group.addonOptions)
                                ? group.addonOptions.length
                                : 0}{' '}
                              opcija
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && group.addonOptions && (
                      <div className="ml-9 mt-3 space-y-2 border-l-2 border-muted pl-4">
                        {Array.isArray(group.addonOptions) &&
                          group.addonOptions.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-start justify-between py-2 px-3 bg-muted/30 rounded-md"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {option.name}
                                  </span>
                                  {!option.isAvailable && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Nedostupno
                                    </Badge>
                                  )}
                                </div>
                                {option.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {option.description}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm font-semibold whitespace-nowrap ml-3">
                                +{parseFloat(option.price).toFixed(2)} RSD
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
