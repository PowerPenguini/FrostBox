"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLayoutColumns,
  IconPlus,
  IconCircleXFilled,
  IconAlertTriangleFilled,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";
import { useCostDocumentsDataContext } from "@/state/cost-documents-data-context";
import { Spinner } from "./spinner";
const typeOptions = {
  uta: [{ value: "cost_breakdown", label: "Zestawienie kosztów" }],
  gastruck: [
    { value: "cars_invoice", label: "Faktura z podziałem na pojazdy" },
  ],
};

const renderStatus = (status) => {
  if (status === "added") {
    return (
      <>
        <IconCircleCheckFilled className="w-8 fill-green-500 dark:fill-green-400" />{" "}
        Dodany
      </>
    );
  } else if (status === "withdrawn") {
    return (
      <>
        <IconCircleXFilled className="fill-red-700" /> Wycofany
      </>
    );
  } else if (status === "incorrect") {
    return (
      <>
        <IconAlertTriangleFilled className="fill-amber-600" />
        Nieprawidłowy
      </>
    );
  }
};

function formatDateTime(jsonDate) {
  const dateObject = new Date(jsonDate);

  const day = String(dateObject.getDate()).padStart(2, "0");
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const year = dateObject.getFullYear();
  const hours = String(dateObject.getHours()).padStart(2, "0");
  const minutes = String(dateObject.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

const columns = [
  {
    accessorKey: "ID",
    header: "ID dokumentu",
    cell: ({ row }) => {
      return <div className="text-foreground w-32">{row.original.id}</div>;
    },
    enableHiding: false,
  },

  {
    accessorKey: "Źródło",
    header: "Źródło",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.source}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "Status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {renderStatus(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "Liczba kosztów",
    header: () => <div className="w-full">Liczba kosztów</div>,
    cell: ({ row }) => <div className="w-full">{row.original.costs_number}</div>, // TODO: maybe cost_quantity?
  },
  {
    accessorKey: "Dodał/a",
    header: "Dodał/a",
    cell: ({ row }) => {
      return row.original.owner;
    },
  },
  {
    accessorKey: "Data dodania",
    header: "Data dodania",
    cell: ({ row }) => (
      <div className="w-32">{formatDateTime(row.original.created_at)}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {row.original.status === "incorrect" ? (
            <>
              <DropdownMenuItem>Popraw</DropdownMenuItem>{" "}
              <DropdownMenuSeparator />
            </>
          ) : null}

          {row.original.status === "withdrawn" ? (
            <DropdownMenuItem variant="destructive">Ukryj</DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive">Wycofaj</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function Row({ row }) {
  return (
    <TableRow>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function CostDocumentsTable() { // TODO: If empty rerenders into oblivion
  const { data, loading, error } = useCostDocumentsDataContext(); // TODO: Make error
  
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  console.log("rerender af")
  
  
  const table = useReactTable({
    data: data,
    columns: columns,
    state: {
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input type="text" placeholder="Wyszukaj dokument" />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Wybierz kolumny</span>
                <span className="lg:hidden">Kolumny</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddCostDocumentDrawer></AddCostDocumentDrawer>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : data?.length ? (
              table
                .getRowModel()
                .rows.map((row) => <Row key={row.id} row={row} />)
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nie znaleziono dokumentów.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end px-4">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Wiersze na stronę
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Strona {table.getState().pagination.pageIndex + 1} z{" "}
            {table?.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function AddCostDocumentDrawer() {
  const { refetchData } = useCostDocumentsDataContext();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [type, setType] = useState("");
  const isMobile = useIsMobile();
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!source) {
      setError("Wybierz źródło dokumentu");
      return;
    }

    if (!type) {
      setError("Wybierz typ dokumentu");
      return;
    }

    if (!file) {
      setError("Wybierz plik");
      return;
    }

    const formData = new FormData();
    formData.append("source", source);
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/analysers/uta/upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast("Dokument dodany pomyślnie!");
      } else {
        toast("Błąd podczas przesyłania dokumentu.");
      }
    } catch (error) {
      toast("Błąd sieci podczas przesyłania dokumentu.");
    } finally {
      refetchData();
      setOpen(false);
      setFile(null);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Dodaj dokument</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Dodaj dokument kosztowy</DrawerTitle>
          <DrawerDescription>
            Dodaj znane dokumenty, aby zautomatyzować rejestrację kosztów
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto text-sm">
          <form
            id="cost-document-form"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              <Label htmlFor="source">Źródło</Label>
              <Select
                onValueChange={(value) => {
                  setSource(value);
                  setType("");
                }}
              >
                {/* TODO: PROPER FORM SYNTAX  */}
                <SelectTrigger id="source" className="w-full"> 
                  <SelectValue placeholder="Wybierz źródło" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uta">UTA</SelectItem>
                  <SelectItem value="gastruck">GasTruck</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="type">Typ dokumentu</Label>
              <Select
                onValueChange={(value) => setType(value)}
                disabled={!source}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Wybierz typ dokumentu" />
                </SelectTrigger>
                <SelectContent>
                  {source &&
                    typeOptions[source].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Label htmlFor="file">Plik</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button form="cost-document-form" type="submit">
            Dodaj
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Anuluj</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
