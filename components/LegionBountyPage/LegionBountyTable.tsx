"use client";

import { getLegionBounty } from "@/services/Bounty/Member";
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
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const columnAccessor = sorting?.[0]?.id || "user_date_created";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
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
        nextCursor: data.length === 10 ? pageParam + 1 : undefined,
        prevCursor: pageParam > 1 ? pageParam - 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.data.length >= 10;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const hasMore = firstPage.data.length >= 10;
      return hasMore ? firstPage.page - 1 : undefined;
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
  const currentData = useMemo(() => {
    return data?.pages?.[currentPageIndex]?.data ?? [];
  }, [data, currentPageIndex]);

  const totalCount = data?.pages?.[0]?.totalCount ?? 0;

  const columns = LegionBountyColumn();

  const table = useReactTable({
    data: currentData,
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

  const handleNextPage = async () => {
    const nextPage = currentPageIndex + 1;
    if (data?.pages.length && data.pages.length > nextPage) {
      setCurrentPageIndex(nextPage); // already fetched
    } else {
      const result = await fetchNextPage();
      if (!result.error) {
        setCurrentPageIndex(nextPage);
      }
    }
  };

  const handlePreviousPage = async () => {
    const prevPage = currentPageIndex - 1;
    if (prevPage >= 0) {
      if (data?.pages[prevPage]) {
        setCurrentPageIndex(prevPage); // already fetched
      } else {
        const result = await fetchPreviousPage();
        if (!result.error && data?.pages[prevPage]) {
          setCurrentPageIndex(prevPage);
        }
      }
    }
  };

  const handlePageChange = async (page: number) => {
    const index = page - 1;

    if (data?.pages[index]) {
      setCurrentPageIndex(index);
    } else {
      const targetFetchCount = index + 1;

      for (let i = data?.pages.length ?? 0; i < targetFetchCount; i++) {
        const result = await fetchNextPage();
        if (result.error) break;
      }

      setCurrentPageIndex(index);
    }
  };

  return (
    <>
      <h1 className="text-xl font-bold text-white">
        Total Indirect: {totalCount}
      </h1>
      <CardTable
        table={table}
        totalCount={totalCount}
        isFetchingList={isLoading || isFetchingNextPage}
        handleNextPage={handleNextPage}
        handlePreviousPage={handlePreviousPage}
        handlePageChange={handlePageChange}
        pageCount={
          data?.pages?.[0]?.totalCount
            ? Math.ceil(data.pages[0].totalCount / 10)
            : 0
        }
        activePage={currentPageIndex + 1}
      />
    </>
  );
};

export default LegionBountyTable;
