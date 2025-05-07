import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { NotificationsCard } from "@/components/notifications-card";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
export default function Page() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-col flex-1">
        <div className="@container/main flex flex-col flex-1 gap-2">
          <div className="flex flex-col gap-4 md:gap-6 py-4 md:py-6">
            <div className="gap-4 lg:gap-6 grid grid-cols-4 px-4 lg:px-6">
              <NotificationsCard className="col-span-2 h-[400px]" />
              <div className="col-span-2">
                <SectionCards />
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
