"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { EVENT_CATEGORIES, LOCATION_TYPES, EVENT_STATUSES } from "@/lib/utils/constants";
import type { EventCategory, LocationType, EventStatus } from "@/lib/utils/constants";
import type { EventFilters as EventFiltersType } from "@/lib/arkiv/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function FilterChip({ label, selected, onClick }: FilterChipProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200",
        "border outline-none",
        selected
          ? "border-transparent text-white"
          : "border-white/[0.08] text-muted-foreground hover:text-foreground/80 hover:border-white/[0.15] bg-white/[0.03]"
      )}
    >
      <AnimatePresence>
        {selected && (
          <motion.span
            layoutId="filter-chip-bg"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-blue-600"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

export function EventFilters({ filters, onFiltersChange, searchQuery, onSearchChange }: EventFiltersProps) {
  const toggleCategory = (value: EventCategory) => {
    onFiltersChange({
      ...filters,
      category: filters.category === value ? undefined : value,
    });
  };

  const toggleLocationType = (value: LocationType) => {
    onFiltersChange({
      ...filters,
      locationType: filters.locationType === value ? undefined : value,
    });
  };

  const toggleStatus = (value: EventStatus) => {
    onFiltersChange({
      ...filters,
      status: filters.status === value ? undefined : value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          type="text"
          placeholder="Search events by name, description, tags, location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "pl-10 pr-10 h-10",
            "bg-white/[0.03] border-white/[0.08]",
            "placeholder:text-muted-foreground/40",
            "focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
          )}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
          Category
        </span>
        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.value}
              label={cat.label}
              selected={filters.category === cat.value}
              onClick={() => toggleCategory(cat.value)}
            />
          ))}
        </div>
      </div>

      {/* Location type filters */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
          Format
        </span>
        <div className="flex flex-wrap gap-2">
          {LOCATION_TYPES.map((loc) => (
            <FilterChip
              key={loc.value}
              label={loc.label}
              selected={filters.locationType === loc.value}
              onClick={() => toggleLocationType(loc.value)}
            />
          ))}
        </div>
      </div>

      {/* Status filters */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
          Status
        </span>
        <div className="flex flex-wrap gap-2">
          {EVENT_STATUSES.map((s) => (
            <FilterChip
              key={s.value}
              label={s.label}
              selected={filters.status === s.value}
              onClick={() => toggleStatus(s.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
