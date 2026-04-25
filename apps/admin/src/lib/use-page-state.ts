import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export function usePageState() {
  const [state, setState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(20),
    search: parseAsString.withDefault(""),
  });

  return {
    page: state.page,
    perPage: state.perPage,
    search: state.search,
    setPage: (page: number) => setState({ page }),
    setSearch: (search: string) => setState({ search, page: 1 }),
  };
}
