import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
  clearable?: boolean;
  // Pagination/infinite scroll
  onLoadMore?: () => void;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
  // Custom portal container for better iOS/Telegram WebView compatibility
  portalContainer?: HTMLElement | null;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Выберите значение",
  className,
  disabled,
  searchPlaceholder = "Поиск...",
  noResultsText = "Нет результатов",
  clearable = true,
  onLoadMore,
  canLoadMore,
  isLoadingMore,
  portalContainer,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Custom portal container for better iOS/Telegram WebView compatibility
  const portalEl = React.useMemo(() => {
    if (portalContainer) return portalContainer;
    if (typeof document === "undefined") return null;
    return document.getElementById("portal-root") || document.body;
  }, [portalContainer]);

  // Lock body scroll when popover is open to prevent background movement (iOS-safe)
  React.useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Focus search input when popover opens
  React.useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Reset search and focus when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setFocusedIndex(-1);
    }
  }, [open]);

  const selectedOption = React.useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value]
  );

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const s = search.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(s) ||
        String(o.value).toLowerCase().includes(s)
    );
  }, [options, search]);

  const handleSelect = (option: SearchableSelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + 1;
          return next >= filteredOptions.length ? 0 : next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const prevIndex = prev - 1;
          return prevIndex < 0 ? filteredOptions.length - 1 : prevIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const handleScroll = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    if (!canLoadMore || isLoadingMore) return;
    const threshold = 24; // px
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceToBottom <= threshold) {
      onLoadMore?.();
    }
  }, [canLoadMore, isLoadingMore, onLoadMore]);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => handleScroll();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  // Scroll focused item into view
  React.useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedEl =
        listRef.current.querySelectorAll<HTMLElement>("li > button")[
          focusedIndex
        ];
      focusedEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIndex]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "w-full min-h-16 rounded-2xl bg-white-gray border-0 p-3 text-left justify-between",
            "flex items-center gap-2 overflow-hidden",
            disabled ? "opacity-50 pointer-events-none" : "",
            className
          )}
          disabled={disabled}
          onKeyDown={handleKeyDown}
        >
          <span className="text-black text-sm font-medium truncate flex-1">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {clearable && selectedOption && (
              <div
                role="button"
                tabIndex={0}
                className="ml-1 text-gray-500 hover:text-black rounded-full transition-colors cursor-pointer p-1"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClear(e as any);
                  }
                }}
                aria-label="Очистить выбор"
              >
                ×
              </div>
            )}
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 text-gray-500 transition-transform",
                open && "rotate-180"
              )}
            />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        // @ts-ignore - align with MultiSelectChips; PopoverContent accepts container at runtime
        container={portalEl as any}
        className="z-[9999] p-2 w-[var(--radix-popper-anchor-width)] min-w-[var(--radix-popper-anchor-width)]"
        align="start"
        onKeyDown={handleKeyDown as any}
      >
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 rounded-md border px-2 text-base"
              inputMode="search"
              autoComplete="off"
            />
          </div>

          <div
            ref={listRef}
            className="max-h-64 overflow-auto pr-1"
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              contain: "content",
            }}
          >
            {filteredOptions.length ? (
              <ul className="space-y-1" role="listbox">
                {filteredOptions.map((option, index) => {
                  const isSelected = String(option.value) === String(value);
                  const isFocused = index === focusedIndex;
                  const isDisabled = option.disabled;

                  return (
                    <li key={String(option.value)}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={isDisabled}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                          "flex items-center justify-between border",
                          isDisabled && "opacity-50 cursor-not-allowed",
                          isSelected
                            ? "bg-primary/10 text-primary border-primary/20"
                            : isFocused
                            ? "bg-muted/60 border-transparent"
                            : "hover:bg-muted/60 border-transparent"
                        )}
                        onClick={() => handleSelect(option)}
                        onMouseEnter={() => setFocusedIndex(index)}
                      >
                        <span className="flex-1 text-left truncate">
                          {option.label}
                        </span>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-2">
                            <div className="h-2 w-2 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground px-2 py-4">
                {noResultsText}
              </div>
            )}

            {isLoadingMore && (
              <div className="text-center text-xs text-muted-foreground py-2">
                Загрузка...
              </div>
            )}
          </div>

          <div className="flex justify-between pt-1">
            <Button
              className="w-full h-10"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Готово
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
