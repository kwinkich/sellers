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
    ? (pagination.currentPage || 1) < (pagination.totalPages || 1)
    : false;

  // Accumulate items for infinite scroll
  useEffect(() => {
    if (!pagination) return;

    const currentPage = pagination.currentPage || 1;

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

  return {
    items: allItems.length > 0 ? allItems : currentItems,
    isLoading,
    isError,
    error,
    hasNextPage,
    loadNextPage,
    sentinelRef,
    isFetchingNextPage: isFetching && page > 1,
  };
}
