"use client";

import { getTransactionHistory } from "@/services/Transaction/Transaction";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
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

  const { setTransactionHistory } = useUserTransactionHistoryStore();

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [
        "transaction-history",
        tab,
        teamMemberProfile?.company_member_id,
      ],
      queryFn: async ({ pageParam = 1 }) => {
        const { transactionHistory: historyData, totalTransactions } =
          await getTransactionHistory({
            page: pageParam as number,
            limit: 10,
            status: tab,
          });

        return {
          page: pageParam,
          data: historyData,
          totalCount: totalTransactions,
        };
      },
      getNextPageParam: (lastPage) => {
        const hasMore = lastPage.data.length >= 10;
        return hasMore ? lastPage.page + 1 : undefined;
      },
      enabled: !!teamMemberProfile?.company_member_id && modalOpen,
      staleTime: 1000 * 60 * 5, // Cache is fresh for 5 mins
      gcTime: 1000 * 60 * 10, // Cache is stale for 10 mins
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      initialPageParam: 1,
    });

  const flattenedData = useMemo(() => {
    const allData = data?.pages.flatMap((page) => page.data) ?? [];
    const totalCount = data?.pages?.[0]?.totalCount ?? 0;

    setTransactionHistory({
      data: allData,
      count: totalCount,
    });

    return allData;
  }, [data]);

  const columns = useMemo(() => TransactionHistoryColumn({ type: tab }), [tab]);

  const table = useReactTable({
    data: flattenedData,
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
  };

  const handleNextPage = () => {
    fetchNextPage();
  };

  return (
    <Tabs
      defaultValue="EARNINGS"
      onValueChange={handleTabChange}
      className="w-full space-y-4"
    >
      <TabsList variant={"underline"}>
        <TabsTrigger variant={"underline"} value="EARNINGS">
          Packages & Referrals
        </TabsTrigger>
        <TabsTrigger variant={"underline"} value="WITHDRAWAL">
          Withdrawal
        </TabsTrigger>
        <TabsTrigger variant={"underline"} value="DEPOSIT">
          Deposit
        </TabsTrigger>
      </TabsList>

      <CardTable
        table={table}
        activePage={data?.pages?.[0]?.page ?? 0}
        totalCount={data?.pages?.[0]?.totalCount ?? 0}
        isFetchingList={isLoading || isFetchingNextPage}
        setActivePage={handleNextPage}
        pageCount={
          data?.pages?.[0]?.totalCount
            ? Math.ceil(data.pages[0].totalCount / 10)
            : 0
        }
      />
    </Tabs>
  );
};

export default TransactionHistoryTable;
