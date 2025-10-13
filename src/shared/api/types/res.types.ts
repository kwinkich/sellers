export interface GResponse<T> {
  success: boolean;
  data: T;
  meta?: Meta;
}

export interface GArrResponse<T> {
  success: boolean;
  data: T[];
  meta: Meta;
}

export interface Meta {
  pagination: Pagination;
  sort: Sort;
  filters: Record<string, any>;
}

export interface Pagination {
  limit: number;
  totalPages?: number;
  currentPage?: number;
  totalItems?: number;
}

export interface Sort {
  by: string;
  order: "asc" | "desc";
}

export interface GError {
  code: string;
  message: string;
  details: Array<{
    path: string;
    message: string;
  }>;
  traceId: string;
}

export interface GErrorResponse {
  success: false;
  error: GError;
}

export type GApiResponse<
  T,
  IsArray extends boolean = false
> = IsArray extends true ? GArrResponse<T> : GResponse<T>;
