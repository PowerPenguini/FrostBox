"use client";
import { CostsTable } from "@/components/costs-table";
export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 lg:py-6 lg:px-6">
          <CostsTable />
        </div>
      </div>
    </div>
  );
}
