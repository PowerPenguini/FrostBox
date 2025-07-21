"use client";
import { RevenueDocumentsTable } from "@/components/revenue-documents-table";
export default function Page() {
  return (
    <div className="flex flex-col flex-1">
      <div className="@container/main flex flex-col flex-1 gap-2">
        <div className="flex flex-col gap-4 md:gap-6 px-4 lg:px-6 py-4 lg:py-6">
          <RevenueDocumentsTable />
        </div>
      </div>
    </div>
  );
}
