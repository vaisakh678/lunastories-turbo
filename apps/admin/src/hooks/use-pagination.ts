import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export function usePagination(defaults?: { perPage?: number }) {
  const [state, setState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(defaults?.perPage ?? 20),
    search: parseAsString.withDefault(""),
  });

  return {
    page: state.page,
    perPage: state.perPage,
    search: state.search,
    setPage: (page: number) => setState({ page }),
    setPerPage: (perPage: number) => setState({ perPage, page: 1 }),
    setSearch: (search: string) => setState({ search, page: 1 }),
  };
}
