'use client';

import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  /** How many values to show inline before collapsing to "N selected" (default: 2) */
  maxDisplayed?: number;
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  disabled = false,
  maxDisplayed = 2,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const triggerLabel = React.useMemo(() => {
    if (selected.length === 0) return null;
    if (selected.length <= maxDisplayed) return selected.join(', ');
    return `${selected.length} selected`;
  }, [selected, maxDisplayed]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal h-9 px-3',
            selected.length === 0 && 'text-muted-foreground'
          )}
        >
          <span className="truncate flex-1 text-left text-sm">
            {triggerLabel ?? `All ${label.toLowerCase()}s`}
          </span>
          <span className="flex items-center gap-0.5 ml-1 shrink-0">
            {selected.length > 0 && (
              <span
                role="button"
                aria-label={`Clear ${label} filter`}
                onClick={clear}
                className="rounded p-0.5 hover:bg-muted"
              >
                <X className="size-3" />
              </span>
            )}
            <ChevronDown className="size-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="min-w-[180px] p-0" align="start">
        {/* Header: count + select-all / clear shortcut */}
        {options.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-b text-xs text-muted-foreground">
            <span>{selected.length} of {options.length} selected</span>
            {selected.length > 0 ? (
              <button
                onClick={() => onChange([])}
                className="text-destructive hover:underline"
              >
                Clear
              </button>
            ) : (
              <button
                onClick={() => onChange([...options])}
                className="hover:underline"
              >
                Select all
              </button>
            )}
          </div>
        )}

        {/* Option list */}
        <div className="max-h-60 overflow-y-auto p-1">
          {options.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options available
            </div>
          ) : (
            options.map(option => {
              const isChecked = selected.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggle(option)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground outline-none',
                    isChecked && 'font-medium'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-[3px] border',
                      isChecked
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-input bg-background'
                    )}
                    aria-hidden
                  >
                    {isChecked && <Check className="size-3" />}
                  </span>
                  <span className="truncate">
                    {option.length > 40 ? `${option.substring(0, 40)}…` : option}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
