"use client";

import { getLegionBounty } from "@/services/Bounty/Member";
import { useIndirectReferralStore } from "@/store/useIndirrectReferralStore";
import { useRole } from "@/utils/context/roleContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import CardTable from "../CardListTable/CardListTable";
import { LegionBountyColumn } from "./LegionBountyColumn";

type LegionBountyTableProps = {
  modalOpen: boolean;
};

const LegionBountyTable = ({ modalOpen }: LegionBountyTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { teamMemberProfile } = useRole();
  const { indirectReferral, setIndirectReferral } = useIndirectReferralStore();

  const columnAccessor = sorting?.[0]?.id || "user_date_created";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["legion-bounty", teamMemberProfile?.company_member_id],
      queryFn: async ({ pageParam = 1 }) => {
        const { data, totalCount } = await getLegionBounty({
          teamMemberId: teamMemberProfile?.company_member_id || "",
          page: pageParam,
          limit: 10,
          columnAccessor,
          isAscendingSort,
          search: "",
        });

        return {
          page: pageParam,
          data: data || [],
          totalCount: totalCount || 0,
        };
      },
      getNextPageParam: (lastPage) => {
        const hasMore = lastPage.data.length >= 10;
        return hasMore ? lastPage.page + 1 : undefined;
      },
      enabled: !!teamMemberProfile || modalOpen,
      staleTime: 1000 * 60 * 5, // Cache is fresh for 5 mins
      gcTime: 1000 * 60 * 10, // Cache is stale for 10 mins
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      initialPageParam: 1,
    });

  // Flatten and set to store
  const flattenedData = useMemo(() => {
    const allData = data?.pages.flatMap((page) => page.data) ?? [];
    const totalCount = data?.pages?.[0]?.totalCount ?? 0;

    setIndirectReferral({ data: allData, count: totalCount });

    return allData;
  }, [data]);

  const columns = LegionBountyColumn();

  const table = useReactTable({
    data: flattenedData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleNextPage = () => {
    fetchNextPage();
  };

  return (
    <CardTable
      table={table}
      totalCount={data?.pages?.[0]?.totalCount ?? 0}
      isFetchingList={isLoading || isFetchingNextPage}
      setActivePage={handleNextPage}
      pageCount={
        data?.pages?.[0]?.totalCount
          ? Math.ceil(data.pages[0].totalCount / 10)
          : 0
      }
      activePage={data?.pages?.[0]?.page ?? 0}
    />
  );
};

export default LegionBountyTable;
