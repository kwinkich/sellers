import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GResponse, GArrResponse } from "../api/types/res.types";

interface UseInfiniteScrollOptions<T> {
  queryKey: (string | number | object)[];
  queryFn: (
    page: number,
    limit: number
  ) => Promise<GResponse<T[]> | GArrResponse<T>>;
  limit?: number;
  enabled?: boolean;
  resetKey?: any;
  excludeIds?: Array<number>;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  loadNextPage: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
}

export function useInfiniteScroll<T>({
  queryKey,
  queryFn,
  limit = 20,
  enabled = true,
  resetKey,
  excludeIds = [],
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<T[]>([]);
  const [lastAppendedPage, setLastAppendedPage] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [...queryKey, { page, limit }],
    queryFn: () => queryFn(page, limit),
    enabled,
  });

  const currentItems = data?.data ?? [];
  const pagination = data?.meta?.pagination;
  const hasNextPage = pagination
    ? (pagination.currentPage ?? 0) < (pagination.totalPages ?? 0)
    : false;

  // Reset accumulation when resetKey changes (e.g., after a delete)
  useEffect(() => {
    setPage(1);
    setAllItems([]);
    setLastAppendedPage(0);
  }, [resetKey]);

  // Accumulate items for infinite scroll
  useEffect(() => {
    if (!pagination) return;

    const currentPage = pagination.currentPage ?? 0;

    if (currentPage === 1) {
      setAllItems(currentItems);
      setLastAppendedPage(1);
      return;
    }

    if (currentPage > lastAppendedPage) {
      setAllItems((prev) => [...prev, ...currentItems]);
      setLastAppendedPage(currentPage);
    }
  }, [currentItems, pagination?.currentPage, lastAppendedPage]);

  const loadNextPage = () => {
    if (hasNextPage && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isFetching) {
          loadNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching]);

  const base = allItems.length > 0 ? allItems : currentItems;
  const items = excludeIds.length
    ? base.filter((item: any) => !excludeIds.includes(item?.id))
    : base;

  return {
    items,
    isLoading,
    isError,
    error,
    hasNextPage,
    loadNextPage,
    sentinelRef,
    isFetchingNextPage: isFetching && page > 1,
  };
}
