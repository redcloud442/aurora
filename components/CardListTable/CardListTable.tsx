import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import TableLoading from "../ui/tableLoading";
type Props<T> = {
  table: ReactTable<T>;
  activePage: number;
  totalCount: number;
  isFetchingList: boolean;
  setActivePage: Dispatch<SetStateAction<number>>;
  pageCount: number;
};

const CardTable = <T extends object>({
  table,
  activePage,
  totalCount,
  isFetchingList,
  setActivePage,
  pageCount,
}: Props<T>) => {
  const rows = table.getRowModel().rows;

  return (
    <>
      <ScrollArea className="space-y-6 h-[400px] sm:h-[750px] relative">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 relative">
          {isFetchingList && <TableLoading />}
          {rows.length ? (
            rows.map((row) => (
              <div
                key={row.id}
                className="bg-tertiary border p-3 border-zinc-800 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 ease-in-out"
              >
                <div className="grid grid-cols-1 gap-2">
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id}>
                      <div className="text-xs text-zinc-400 font-semibold tracking-wide mb-1">
                        {typeof cell.column.columnDef.header === "string"
                          ? cell.column.columnDef.header
                          : flexRender(cell.column.columnDef.header, {
                              ...cell.getContext(),
                              //@ts-expect-error - this is a workaround to get the header
                              header: cell.column.header!,
                            })}
                      </div>

                      <div className="text-sm text-white font-medium leading-snug break-words">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-zinc-500 py-20">
              No data found.
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex justify-center gap-y-2 sm:justify-between sm:flex-row flex-col items-center pt-4">
        <span className="text-sm text-zinc-400">
          Showing {Math.min(activePage * 10, totalCount)} of {totalCount}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={activePage <= 1}
            onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              variant={page === activePage ? "default" : "ghost"}
              onClick={() => setActivePage(page)}
              className={`rounded-md px-3 py-1 text-sm transition-all ${
                page === activePage
                  ? "bg-tertiary text-black font-bold"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            disabled={activePage >= pageCount}
            onClick={() =>
              setActivePage((prev) => Math.min(prev + 1, pageCount))
            }
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default CardTable;
