import { formateMonthDateYearv2, formatNumberLocale } from "@/utils/function";
import { company_transaction_table } from "@prisma/client";
import { Row } from "@tanstack/react-table";

type TransactionHistoryColumnProps = {
  type: "EARNINGS" | "WITHDRAWAL" | "DEPOSIT";
};

export const TransactionHistoryColumn = ({
  type,
}: TransactionHistoryColumnProps) => {
  return [
    {
      accessorKey: "company_transaction_date",
      header: () => <div className="text-start text-lg  font-bold">Date</div>,
      cell: ({ row }: { row: Row<company_transaction_table> }) => {
        return (
          <div className="text-start w-1/3">
            {formateMonthDateYearv2(row.getValue("company_transaction_date"))}
          </div>
        );
      },
    },
    {
      accessorKey: "company_transaction_description",
      header: () => (
        <div className="text-start text-lg font-bold">Transaction Details</div>
      ),
      cell: ({ row }: { row: Row<company_transaction_table> }) => (
        <div className="text-start">
          {row.getValue("company_transaction_description")}
        </div>
      ),
    },
    ...(type !== "EARNINGS"
      ? [
          {
            accessorKey: "company_transaction_details",
            header: () => (
              <div className="text-start text-lg font-bold">Details</div>
            ),
            cell: ({ row }: { row: Row<company_transaction_table> }) => (
              <div className="text-start">
                {row.getValue("company_transaction_details")}
              </div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "company_transaction_amount",
      header: () => <div className="text-start text-lg font-bold">Amount</div>,
      cell: ({ row }: { row: Row<company_transaction_table> }) => (
        <div className="text-start">
          ₱ {formatNumberLocale(row.getValue("company_transaction_amount"))}
        </div>
      ),
    },
  ];
};
