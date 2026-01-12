"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, X, Filter } from "lucide-react";
import type { IncidentFilters } from "@/lib/incidents/types";

type IncidentFiltersBarProps = {
  filters: IncidentFilters;
  onFiltersChange: (filters: Partial<IncidentFilters>) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
};

export function IncidentFiltersBar({
  filters,
  onFiltersChange,
  onReset,
  totalCount,
  filteredCount,
}: IncidentFiltersBarProps) {
  const hasActiveFilters = filters.search || filters.showEnded;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtres</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCount} / {totalCount} incident(s)
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par adresse, ville..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Show ended toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="show-ended"
            checked={filters.showEnded}
            onCheckedChange={(checked: boolean) => onFiltersChange({ showEnded: checked })}
          />
          <Label htmlFor="show-ended" className="text-sm cursor-pointer">
            Afficher les incidents terminés
          </Label>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
