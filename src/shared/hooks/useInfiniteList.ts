import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useMemo } from "react";

function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  const sorter = (obj: any) =>
    Object.keys(obj)
      .sort()
      .reduce((acc: any, k) => {
        acc[k] = obj[k];
        return acc;
      }, {});
  return JSON.stringify(value, (_, val) => {
    if (val && typeof val === "object") {
      if (seen.has(val as object)) return;
      seen.add(val as object);
      return Array.isArray(val) ? val : sorter(val);
    }
    return val;
  });
}

function computeNextPage(p?: any): number | undefined {
  const cp = p?.currentPage;
  const tp = p?.totalPages;
  return typeof cp === "number" && typeof tp === "number" && cp >= 1 && cp < tp
    ? cp + 1
    : undefined;
}

export function useInfiniteList<T>(
  key: QueryKey,
  fetchPage: (page: number, limit: number) => Promise<any>,
  limit = 50
) {
  const [allItems, setAllItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const keySig = useMemo(() => stableStringify(key), [key]);

  // Reset when the *content* of the key changes
  useEffect(() => {
    setAllItems([]);
    setCurrentPage(1);
    setHasNextPage(false);
    setIsFetchingNextPage(false);
  }, [keySig]);

  const query = useQuery({
    queryKey: [keySig, { page: currentPage, limit }],
    queryFn: async () => {
      try {
        const res = await fetchPage(currentPage, limit);
        const items = Array.isArray(res?.data) ? (res.data as T[]) : [];
        const nextPage = computeNextPage(res?.meta?.pagination);
        return { items, nextPage };
      } catch (e) {
        console.error("useInfiniteList queryFn:", e);
        return { items: [] as T[], nextPage: undefined };
      }
    },
    retry: 0,
    throwOnError: false,
    staleTime: 5 * 60 * 1000,
  });

  // Append items from the query result
  useEffect(() => {
    const data = query.data;
    if (!data) return;

    const items = data.items ?? [];
    if (currentPage === 1) setAllItems(items);
    else if (items.length) setAllItems((prev) => [...prev, ...items]);

    setHasNextPage(!!data.nextPage);
  }, [query.data, currentPage]);

  // Clear the "fetching next page" flag when the background fetch settles
  useEffect(() => {
    if (!query.isFetching) setIsFetchingNextPage(false);
  }, [query.isFetching]);

  const fetchNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || query.isFetching) return;
    setIsFetchingNextPage(true);
    setCurrentPage((p) => p + 1); // let useQuery fetch the next page
  }, [hasNextPage, isFetchingNextPage, query.isFetching]);

  return useMemo(
    () => ({
      data: { pages: [{ items: allItems }] },
      allItems,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      isFetching: query.isFetching,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    }),
    [
      allItems,
      query.isLoading,
      query.isError,
      query.error,
      query.isFetching,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    ]
  );
}
