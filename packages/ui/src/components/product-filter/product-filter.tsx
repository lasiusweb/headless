import * as React from "react";
import { Minus, Plus, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Checkbox } from "../checkbox";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterSection {
  id: string;
  title: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio';
}

interface ProductFilterProps {
  sections: FilterSection[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, optionId: string, checked: boolean) => void;
  onClearFilters?: () => void;
  className?: string;
}

const ProductFilter = React.forwardRef<
  HTMLDivElement,
  ProductFilterProps
>(({
  sections,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className
}, ref) => {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    sections.reduce((acc, section) => {
      acc[section.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isActive = (sectionId: string, optionId: string) => {
    return activeFilters[sectionId]?.includes(optionId) || false;
  };

  const getActiveCount = (sectionId: string) => {
    return activeFilters[sectionId]?.length || 0;
  };

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {onClearFilters && (
          <Button variant="link" onClick={onClearFilters} className="text-sm p-0 h-auto">
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border-b pb-6 last:border-0 last:pb-0">
            <button
              type="button"
              className="flex items-center justify-between w-full"
              onClick={() => toggleSection(section.id)}
            >
              <h3 className="font-medium text-left">
                {section.title}
                {getActiveCount(section.id) > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {getActiveCount(section.id)}
                  </span>
                )}
              </h3>
              {openSections[section.id] ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>

            {openSections[section.id] && (
              <div className="mt-4 space-y-3">
                {section.options.map((option) => {
                  const isChecked = isActive(section.id, option.id);
                  
                  return (
                    <div key={option.id} className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            onFilterChange(section.id, option.id, !!checked);
                          }}
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground">{option.count}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active filters display */}
      <div className="pt-4">
        <h3 className="text-sm font-medium mb-2">Active Filters</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).flatMap(([sectionId, options]) =>
            options.map((optionId) => {
              const section = sections.find(s => s.id === sectionId);
              const option = section?.options.find(o => o.id === optionId);
              
              if (!section || !option) return null;
              
              return (
                <div 
                  key={`${sectionId}-${optionId}`} 
                  className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                >
                  <span>{option.label}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 rounded-full p-0"
                    onClick={() => onFilterChange(sectionId, optionId, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

ProductFilter.displayName = "ProductFilter";

export { ProductFilter };