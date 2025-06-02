import { formateMonthDateYearv2, formatNumberLocale } from "@/utils/function";
import { user_table } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const AllyBountyColumn = (): ColumnDef<
  user_table & {
    total_bounty_earnings: string;
    package_ally_bounty_log_date_created: Date;
    company_referral_date: Date;
  }
>[] => {
  return [
    {
      // Index column
      accessorKey: "index",
      id: "package_ally_bounty_log_date_created",
      header: () => (
        <div className="text-start text-xs font-bold p-0">Date</div>
      ),
      cell: ({ row }) => (
        <div className="text-start text-sm sm:text-md">
          {formateMonthDateYearv2(
            row.original.package_ally_bounty_log_date_created
          )}
        </div>
      ),
    },

    {
      accessorKey: "user_username",
      header: () => (
        <div className="text-start text-xs font-bold p-0">Username</div>
      ),
      cell: ({ row }) => (
        <div className="text-start text-sm sm:text-md">
          {row.getValue("user_username")}
        </div>
      ),
    },
    {
      accessorKey: "total_bounty_earnings",
      header: () => (
        <div className="text-start text-xs font-bold p-0">Amount</div>
      ),
      cell: ({ row }) => (
        <div className="text-start text-sm sm:text-md">
          ₱ {formatNumberLocale(row.getValue("total_bounty_earnings"))}
        </div>
      ),
    },
  ];
};
