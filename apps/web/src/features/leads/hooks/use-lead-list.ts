import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listLeadsRequest } from "../api/leads-api";

export const leadPageSizeOptions = [10, 20, 50];

export const getLeadInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const useLeadList = (token: string | null) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const leadsQuery = useQuery({
    queryKey: ["leads", { page, pageSize, search }],
    queryFn: () =>
      listLeadsRequest(token ?? "", {
        page: page + 1,
        pageSize,
        search: search || undefined,
        sortBy: "createdAt",
        sortOrder: "desc"
      }),
    enabled: Boolean(token),
    placeholderData: keepPreviousData
  });

  return {
    leadsQuery,
    page,
    pageSize,
    searchInput,
    setPage,
    setPageSize,
    setSearchInput,
    submitSearch: () => {
      setPage(0);
      setSearch(searchInput.trim());
    }
  };
};
