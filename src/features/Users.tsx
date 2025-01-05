import {
  Column,
  ColumnFiltersState,
  ColumnPinningState,
  FilterFn,
  RowData,
  RowPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { data as userData } from "./data";
import { columns } from "./Column";
import {
  ArrowDownAZ,
  ArrowUpZA,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsLeftRight,
  ChevronsRight,
  Download,
  EllipsisVertical,
  EyeClosedIcon,
  FilterIcon,
  PinIcon,
  PinOff,
  Search,
  SlidersHorizontal,
  Tally4,
  X,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Checkbox } from "../components/ui/checkbox";
import * as XLSX from "xlsx";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
  }
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export default function Users() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    {}
  );
  const [rowPinning, setRowPinning] = useState<RowPinningState>({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value);

    // Store the itemRank info
    addMeta({
      itemRank,
    });

    // Return if the item should be filtered in/out
    return itemRank.passed;
  };

  const table = useReactTable({
    data: userData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    state: {
      columnFilters,
      globalFilter,
      columnVisibility,
      columnPinning,
      rowPinning,
    },
    onColumnPinningChange: setColumnPinning,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy",
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowPinningChange: setRowPinning,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const handleDownload = () => {
    const filteredRows = table.getFilteredRowModel().rows;

    // Get visible columns
    const visibleColumns = table
      .getAllColumns()
      .filter((col) => col.getIsVisible());

    // Extract the data exactly as displayed in the table
    const excelData = filteredRows.map((row) => {
      const rowData: Record<string, any> = {};

      row.getAllCells().forEach((cell) => {
        // Include only data for visible columns
        if (visibleColumns.some((col) => col.id === cell.column.id)) {
          const columnHeader = cell.column.columnDef.header?.toString() || "";
          rowData[columnHeader] = cell.getValue(); // Get the computed value from the cell
        }
      });

      return rowData;
    });

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    // Export to Excel file
    XLSX.writeFile(workbook, "filtered_data.xlsx");
  };
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row justify-between">
          <div>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              Deploy your new project in one-click.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative max-w-xs ml-auto order-first md:order-last">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <DebouncedInput
                value={globalFilter ?? ""}
                onChange={(value) => setGlobalFilter(String(value))}
                className="pl-10 pr-4 py-2 border rounded-md w-full"
                placeholder="Search all columns..."
              />
            </div>
            <div>
              <Tally4 />
            </div>

            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex items-center py-2"
            >
              <span className="hidden md:block">Export</span>
              <Download />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center text-xs"
                >
                  <SlidersHorizontal className="w-2 h-2" />{" "}
                  <span className="hidden md:block">View</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <div className="w-[200px] border rounded-md shadow-sm bg-white dark:bg-gray-800">
                  <div className="p-4">
                    <h4 className="font-bold text-sm mb-2 ">Toggle Columns</h4>
                    <Separator className="my-2" />
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer  p-2 rounded-md transition-colors">
                          <Checkbox
                            id="terms"
                            checked={table.getIsAllColumnsVisible()}
                            onCheckedChange={table.getToggleAllColumnsVisibilityHandler()}
                          />
                          <span className="font-bold text-sm">Toggle All</span>
                        </label>

                        {table.getAllLeafColumns().map((column) => (
                          <label
                            key={column.id}
                            onClick={() =>
                              column.toggleVisibility(!column.getIsVisible())
                            }
                            className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 p-1 rounded-md transition-colors"
                          >
                            <span
                              className={`flex items-center justify-center h-4 w-4 transition duration-150 ease-in-out`}
                            >
                              {column.getIsVisible() ? (
                                <Check size={16} />
                              ) : null}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {column.columnDef.header?.toString()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <ScrollArea className="w-full">
            <table className="min-w-full w-full">
              <thead className="bg-blue-50 border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <th
                          className={`py-4 px-3 text-black border-r relative ${
                            header.column.getIsPinned() === "left"
                              ? "sticky left-0 z-10 bg-blue-100"
                              : header.column.getIsPinned() === "right"
                              ? "sticky right-0 z-10 bg-white"
                              : ""
                          }`}
                          key={header.id}
                          colSpan={header.colSpan}
                        >
                          {header.isPlaceholder ? null : (
                            <>
                              {/* Header Title and Sorting */}
                              <div className="flex items-center justify-between w-full">
                                {/* Header Title and Sorting Section */}
                                <div
                                  className={
                                    header.column.getCanSort()
                                      ? "text-start text-nowrap cursor-pointer select-none flex items-center"
                                      : "text-start flex items-center"
                                  }
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  <div className="flex items-center">
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}

                                    {/* Sorting Icons */}
                                    <div className="flex items-center ml-2">
                                      {header.column.getIsSorted() === "asc" ? (
                                        <ArrowDownAZ className="w-6 h-6" />
                                      ) : header.column.getIsSorted() ===
                                        "desc" ? (
                                        <ArrowUpZA className="w-6 h-6" />
                                      ) : (
                                        <ChevronsLeftRight className="rotate-90 size-5 ml-2" />
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Filter and More Options Section */}
                                <div className="flex items-center justify-center">
                                  {/* Filter Icon */}
                                  <Popover>
                                    <PopoverTrigger className="p-1 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors">
                                      <FilterIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </PopoverTrigger>
                                    <PopoverContent className="p-3 w-[200px]">
                                      <div>
                                        <Filter column={header.column} />
                                      </div>
                                    </PopoverContent>
                                  </Popover>

                                  {/* More Options Icon */}
                                  {header.column.getCanFilter() ? (
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <Popover>
                                        <PopoverTrigger className="p-1 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors">
                                          <EllipsisVertical className="w-5 h-5 cursor-pointer" />
                                        </PopoverTrigger>
                                        <PopoverContent className="p-1 w-[150px]">
                                          <div className="space-y-3">
                                            {/* Hide Option */}
                                            <div
                                              className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
                                              onClick={() =>
                                                header.column.toggleVisibility(
                                                  !header.column.getIsVisible()
                                                )
                                              }
                                            >
                                              <span className="flex items-center">
                                                <EyeClosedIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                              </span>
                                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Hide
                                              </span>
                                            </div>

                                            {/* Pin Option */}
                                            <div
                                              className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
                                              onClick={() => {
                                                const isPinned =
                                                  header.column.getIsPinned();
                                                header.column.pin(
                                                  isPinned ? false : "left"
                                                );
                                              }}
                                            >
                                              <span className="flex items-center">
                                                {header.column.getIsPinned() ? (
                                                  <PinOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                ) : (
                                                  <PinIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                )}
                                              </span>
                                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {header.column.getIsPinned()
                                                  ? "Unpin"
                                                  : "Pin"}
                                              </span>
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, rowIndex) => {
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-blue-50 ${
                        rowIndex === 0 ? "sticky top-0 z-20 bg-white" : ""
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td
                            className={`py-2 px-2 border-b border-b-secondary ${
                              cell.column.getIsPinned() === "left"
                                ? "sticky left-0 z-10 bg-blue-100"
                                : cell.column.getIsPinned() === "right"
                                ? "sticky right-0 z-10 bg-white"
                                : ""
                            }`}
                            key={cell.id}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex gap-4 flex-col md:flex-row justify-between">
          <div className="flex w-full md:w-fit justify-between items-center ">
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1">
              Go to page:
              <Input
                type="number"
                min="1"
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="p-0 md:px-3 md:py-2 w-16"
              />
            </span>
          </div>
          <div className="flex w-full md:w-fit justify-between items-center gap-5">
            <Select
              onValueChange={(e) => {
                table.setPageSize(Number(e));
              }}
              value={table.getState().pagination.pageSize + ""}
            >
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize + ""}>
                    Show {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-x-1">
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft />
              </Button>
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft />
              </Button>
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight />
              </Button>
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  return filterVariant === "range" ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      <option value="complicated">complicated</option>
      <option value="relationship">relationship</option>
      <option value="single">single</option>
    </select>
  ) : (
    <div className="flex items-center gap-2">
      <DebouncedInput
        className="w-36 border shadow rounded pr-10" // increased padding-right to make space for the 'X' icon
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search...`}
        type="text"
        value={(columnFilterValue ?? "") as string}
      />
      <button
        type="button"
        onClick={() => column.setFilterValue("")}
        className=""
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    // See faceted column filters example for datalist search suggestions
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 100,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
