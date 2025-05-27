import { formatNumberLocale, formateMonthDateYearv2 } from "@/utils/function";
import { LegionRequestData } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";

export const LegionBountyColumn = (): ColumnDef<LegionRequestData>[] => {
  return [
    {
      // Index column
      id: "package_ally_bounty_log_date_created",
      header: () => <div className="text-start text-xs font-bold">Date</div>,
      cell: ({ row }) => (
        <div className="text-start text-sm sm:text-md w-auto">
          {formateMonthDateYearv2(
            row.original.package_ally_bounty_log_date_created
          )}
        </div>
      ),
    },

    {
      accessorKey: "user_username",
      header: () => (
        <div className="text-start text-xs font-bold w-auto">Username</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-start text-sm sm:text-md w-auto">
            {row.getValue("user_username")}
          </div>
        );
      },
    },
    {
      accessorKey: "total_bounty_earnings",
      header: () => <div className="text-start text-xs font-bold">Amount</div>,
      cell: ({ row }) => (
        <div className="text-start text-sm sm:text-md">
          ₱ {formatNumberLocale(row.getValue("total_bounty_earnings"))}
        </div>
      ),
    },
  ];
};
