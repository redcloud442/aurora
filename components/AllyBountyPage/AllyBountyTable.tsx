"use client";

import { getAllyBounty } from "@/services/Bounty/Member";
import { useRole } from "@/utils/context/roleContext";
import { user_table } from "@prisma/client";
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
import { AllyBountyColumn } from "./AllyBountyColum";

type AllyBountyTableProps = {
  modalOpen: boolean;
};

const AllyBountyTable = ({ modalOpen }: AllyBountyTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { teamMemberProfile } = useRole();

  const columnAccessor = sorting?.[0]?.id || "user_date_created";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["ally-bounty", teamMemberProfile?.company_member_id],
      queryFn: async ({ pageParam = 1 }) => {
        const { data, totalCount } = await getAllyBounty({
          page: pageParam,
          limit: 10,
          columnAccessor,
          isAscendingSort,
          search: "",
        });

        return {
          page: pageParam,
          data: data as unknown as (user_table & {
            total_bounty_earnings: string;
            package_ally_bounty_log_date_created: Date;
            company_referral_date: Date;
          })[],
          totalCount,
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

  // Flatten data for the table
  const flattenedData = useMemo(() => {
    const allData = data?.pages.flatMap((page) => page.data) ?? [];

    return allData;
  }, [data]);

  const columns = AllyBountyColumn();

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
      activePage={0}
    />
  );
};

export default AllyBountyTable;
