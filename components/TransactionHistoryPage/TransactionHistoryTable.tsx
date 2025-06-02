"use client";

import { getTransactionHistory } from "@/services/Transaction/Transaction";
import { useRole } from "@/utils/context/roleContext";
import { company_transaction_table } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import CardTable from "../CardListTable/CardListTable";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { TransactionHistoryColumn } from "./TransactionHistoryColumn";

type TransactionHistoryTableProps = {
  modalOpen: boolean;
};

const PAGE_SIZE = 10;

const TransactionHistoryTable = ({
  modalOpen,
}: TransactionHistoryTableProps) => {
  const { teamMemberProfile } = useRole();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [tab, setTab] = useState<"EARNINGS" | "WITHDRAWAL" | "DEPOSIT">(
    "EARNINGS"
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "transaction-history",
      tab,
      teamMemberProfile?.company_member_id,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const { transactionHistory, totalTransactions } =
        await getTransactionHistory({
          page: pageParam,
          limit: PAGE_SIZE,
          status: tab,
        });

      return {
        data: transactionHistory,
        totalCount: totalTransactions,
        pageParam,
        nextCursor:
          transactionHistory.length === PAGE_SIZE ? pageParam + 1 : undefined,
        prevCursor: pageParam > 1 ? pageParam - 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage) => firstPage.prevCursor,
    initialPageParam: 1,
    enabled: !!teamMemberProfile?.company_member_id && modalOpen,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const currentData = useMemo(() => {
    return data?.pages?.[currentPageIndex]?.data ?? [];
  }, [data, currentPageIndex]);

  const totalCount = data?.pages?.[0]?.totalCount ?? 0;

  const columns = useMemo(() => TransactionHistoryColumn({ type: tab }), [tab]);

  const table = useReactTable({
    data: currentData,
    columns: columns as ColumnDef<company_transaction_table>[],
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleTabChange = (type?: string) => {
    setTab(type as "EARNINGS" | "WITHDRAWAL" | "DEPOSIT");
    setCurrentPageIndex(0);
    refetch();
  };

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

    // Already fetched this page
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
    <Tabs
      defaultValue="EARNINGS"
      onValueChange={handleTabChange}
      className="w-full space-y-4"
    >
      <TabsList variant={"underline"}>
        <TabsTrigger value="EARNINGS">Packages & Referrals</TabsTrigger>
        <TabsTrigger value="WITHDRAWAL">Withdrawal</TabsTrigger>
        <TabsTrigger value="DEPOSIT">Deposit</TabsTrigger>
      </TabsList>

      <CardTable
        table={table}
        activePage={currentPageIndex + 1}
        totalCount={totalCount}
        isFetchingList={isLoading || isFetchingNextPage}
        pageCount={Math.ceil(totalCount / PAGE_SIZE)}
        handleNextPage={handleNextPage}
        handlePreviousPage={handlePreviousPage}
        handlePageChange={handlePageChange}
      />
    </Tabs>
  );
};

export default TransactionHistoryTable;
