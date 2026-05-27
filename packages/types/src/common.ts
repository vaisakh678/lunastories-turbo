export interface APIResponse<T, M = undefined> {
  data: T;
  message?: string;
  error?: string;
  /** Out-of-band metadata (e.g. generation usage/quota), typed per endpoint.
   *  Present on both success and error responses. Decoupled from feature
   *  DTOs via the `M` type parameter. */
  meta?: M;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
}
