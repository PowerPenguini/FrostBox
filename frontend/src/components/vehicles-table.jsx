"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconPlus,
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
import { Spinner } from "./spinner";
import { useVehiclesDataContext } from "@/state/vehicles-data-context";
import { VehicleCellViewer } from "@/components/vehicle-cell-viewer";

const columns = [
  {
    accessorKey: "Typ",
    header: "Typ",
    cell: ({ row }) => row.original.type,
    enableHiding: false,
  },
  {
    accessorKey: "Numer rejestracyjny",
    header: "Numer rejestracyjny",
    cell: ({ row }) => (
      <VehicleCellViewer item={row.original} />
    ),
    enableHiding: false,
  },

  {
    accessorKey: "Marka",
    header: "Marka",
    cell: ({ row }) => row.original.brand,
  },
  {
    accessorKey: "Model",
    header: "Model",
    cell: ({ row }) => row.original.model,
  },
  {
    accessorKey: "Koszt (30 dni)",
    header: () =>  <div className="text-right">Koszt (30 dni)</div>,
    cell: ({ row }) => <div className="text-right">{row.original.last_30_days_cost} zł</div>,
  },
  {
    accessorKey: "Koszt opłaty drogowej (30 dni)",
    header: () =>  <div className="text-right">Koszt opłaty drogowej (30 dni)</div>,
    cell: ({ row }) => <div className="text-right">{row.original.last_30_days_toll_cost} zł</div>,
  },
  {
    accessorKey: "Koszt paliwa (30 dni)",
    header: () =>  <div className="text-right">Koszt paliwa (30 dni)</div>,
    cell: ({ row }) => <div className="text-right">{row.original.last_30_days_fuel_cost} zł</div>,
  },
  {
    id: "actions",
    cell: () => (
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
          <DropdownMenuItem variant="destructive">Usuń</DropdownMenuItem>
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

export function VehiclesTable() {
  const { data, loading, error } = useVehiclesDataContext(); // TODO: Make error
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row.id,
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
          <AddVehicleDrawer></AddVehicleDrawer>
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

function AddVehicleDrawer() {
  const { refetchData } = useVehiclesDataContext();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [vin, setVin] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const isMobile = useIsMobile();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!brand) {
      // TODO add validation
      setError("Wprowadź markę pojazdu");
      return;
    }

    if (!model) {
      setError("Wprowadź model pojazdu");
      return;
    }

    if (!vin) {
      setError("Wprowadź VIN pojazdu");
      return;
    }

    if (!registrationNumber) {
      setError("Wprowadź numer rejestracyjny");
      return;
    }

    try {
      const response = await fetch("/api/v1/analysers/uta/upload/", {
        method: "POST",
        body: {},
      });

      if (response.ok) {
        toast("Pojazd dodany pomyślnie!");
      } else {
        toast("Błąd podczas dodawania pojazdu.");
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
          <span className="hidden lg:inline">Dodaj pojazd</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Dodaj pojazd</DrawerTitle>
          <DrawerDescription>
            Pojazd musi być dodany do systemu, aby móg być poprawnie rozpoznany
            na dokumentach kosztowych i przychodowych.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto text-sm">
          <form
            id="cost-document-form"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              <Label htmlFor="brand">Marka</Label>
              <Input
                id="brand"
                placeholder="Volvo"
                onChange={(e) => setBrand(e.target.value)}
              />
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="FMX"
                onChange={(e) => setModel(e.target.value)}
              />
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                placeholder="5N1AR2MN8FC123456"
                onChange={(e) => setVin(e.target.value)}
              />
              <Label htmlFor="registration_number">Numer rejestracyjny</Label>
              <Input
                id="registration_number"
                placeholder="EL2K25"
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />

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
