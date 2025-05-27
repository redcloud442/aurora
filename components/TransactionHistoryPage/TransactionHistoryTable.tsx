"use client";

import { useToast } from "@/hooks/use-toast";
import { getTransactionHistory } from "@/services/Transaction/Transaction";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useRole } from "@/utils/context/roleContext";
import { company_transaction_table } from "@prisma/client";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import CardTable from "../CardListTable/CardListTable";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { TransactionHistoryColumn } from "./TransactionHistoryColumn";

const TransactionHistoryTable = () => {
  const { teamMemberProfile } = useRole();
  const { toast } = useToast();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [tab, setTab] = useState<"EARNINGS" | "WITHDRAWAL" | "DEPOSIT">(
    "EARNINGS"
  );

  const cachedLeaderboards = useRef<{
    [key: string]: {
      data: company_transaction_table[];
      totalCount: number;
    };
  }>({});

  const { transactionHistory, setTransactionHistory } =
    useUserTransactionHistoryStore();

  const fetchRequest = async () => {
    if (!teamMemberProfile?.company_member_id) return;

    const cacheKey = `${tab}-${activePage}`;
    if (cachedLeaderboards.current[cacheKey]) {
      const cachedData = cachedLeaderboards.current[cacheKey];
      setTransactionHistory({
        data: cachedData.data,
        count: cachedData.totalCount,
      });
      return;
    }

    setIsFetchingList(true);
    try {
      const { transactionHistory: transactionHistoryData, totalTransactions } =
        await getTransactionHistory({
          page: activePage,
          limit: 10,
          status: tab,
        });

      cachedLeaderboards.current[cacheKey] = {
        data: transactionHistoryData,
        totalCount: totalTransactions,
      };

      setTransactionHistory({
        data: transactionHistoryData,
        count: totalTransactions,
      });
    } catch (e) {
      toast({
        title: "Failed to fetch transaction history",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsFetchingList(false);
    }
  };
  useEffect(() => {
    fetchRequest();
  }, [tab, activePage]);

  const columns = useMemo(() => TransactionHistoryColumn({ type: tab }), [tab]);

  const table = useReactTable({
    data: transactionHistory.data ?? [],
    columns: columns as unknown as ColumnDef<company_transaction_table>[],
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

  const pageCount = Math.ceil((transactionHistory.count ?? 0) / 10);

  const handleTabChange = (type?: string) => {
    setTab(type as "EARNINGS" | "WITHDRAWAL" | "DEPOSIT");
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
        activePage={activePage}
        totalCount={transactionHistory.count ?? 0}
        isFetchingList={isFetchingList}
        setActivePage={setActivePage}
        pageCount={pageCount}
      />
    </Tabs>
  );
};

export default TransactionHistoryTable;
