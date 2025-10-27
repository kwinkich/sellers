import type { ReactNode } from "react";

interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => React.Key;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  className?: string;
  itemClassName?: string;
}

export function InfiniteScrollList<T>({
  items,
  renderItem,
  getKey,
  isLoading = false,
  isError = false,
  error = null,
  hasNextPage = false,
  isFetchingNextPage = false,
  sentinelRef,
  emptyMessage = "Ничего не найдено",
  loadingMessage = "Загрузка...",
  errorMessage = "Ошибка загрузки",
  className = "flex flex-col gap-2 p-2",
  itemClassName = "",
}: InfiniteScrollListProps<T>) {
  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-base-gray">{loadingMessage}</div>
      </div>
    );
  }

  if (isError && items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-destructive">
        {errorMessage}: {error?.message || "Неизвестная ошибка"}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-muted-foreground px-2">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        {items.map((item, index) => (
          <div
            key={getKey ? getKey(item, index) : (item as any)?.id ?? index}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="px-2 py-3">
          {isFetchingNextPage && (
            <div className="text-center text-xs text-base-gray">
              Загрузка...
            </div>
          )}
          <div ref={sentinelRef} className="h-1" />
        </div>
      )}
    </>
  );
}
