"use client";

import { getLegionBounty } from "@/services/Bounty/Member";
import { useIndirectReferralStore } from "@/store/useIndirrectReferralStore";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData } from "@/utils/function";
import { LegionRequestData } from "@/utils/types";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import CardTable from "../CardListTable/CardListTable";
import { LegionBountyColumn } from "./LegionBountyColumn";

type FilterFormValues = {
  emailFilter: string;
};

const LegionBountyTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const { teamMemberProfile } = useRole();

  const { indirectReferral, setIndirectReferral } = useIndirectReferralStore();

  const columnAccessor = sorting?.[0]?.id || "user_date_created";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const cacheLegionBounty = useRef<{
    [key: string]: {
      data: LegionRequestData[];
      count: number;
    };
  }>({});

  const fetchAdminRequest = async () => {
    try {
      if (!teamMemberProfile) return;

      const cacheKey = `legion-bounty-${activePage}`;

      if (cacheLegionBounty.current[cacheKey]) {
        setIndirectReferral(cacheLegionBounty.current[cacheKey]);
        return;
      }

      setIsFetchingList(true);

      const sanitizedData = escapeFormData(getValues());

      const { emailFilter } = sanitizedData;

      const { data, totalCount } = await getLegionBounty({
        teamMemberId: teamMemberProfile.company_member_id,
        page: activePage,
        limit: 10,
        columnAccessor: columnAccessor,
        isAscendingSort: isAscendingSort,
        search: emailFilter,
      });

      setIndirectReferral({
        data: data || [],
        count: totalCount || 0,
      });

      cacheLegionBounty.current[cacheKey] = {
        data: data || [],
        count: totalCount || 0,
      };
    } catch (e) {
    } finally {
      setIsFetchingList(false);
    }
  };

  const columns = LegionBountyColumn();

  const table = useReactTable({
    data: indirectReferral.data || [],
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

  const { getValues } = useForm<FilterFormValues>({
    defaultValues: {
      emailFilter: "",
    },
  });

  useEffect(() => {
    fetchAdminRequest();
  }, [activePage, sorting, teamMemberProfile]);

  const pageCount = Math.ceil(indirectReferral.count / 10);

  return (
    <CardTable
      table={table}
      activePage={activePage}
      totalCount={indirectReferral.count}
      isFetchingList={isFetchingList}
      setActivePage={setActivePage}
      pageCount={pageCount}
    />
  );
};

export default LegionBountyTable;
