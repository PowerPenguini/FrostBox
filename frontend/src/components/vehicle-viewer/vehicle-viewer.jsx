import { useState, Fragment } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import {
  IconWorld,
  IconEngine,
  IconRouter,
  IconBusinessplan,
  IconRoad,
  IconInfoCircle,
  IconSettings,
  IconNotebook,
  IconGasStation,
} from "@tabler/icons-react";

import { VehicleEventListView } from "./vehicle-event-list-view";
import { VehicleTollView } from "@/components/vehicle-viewer/vehicle-toll-view";
import { VehicleEventAddView } from "./vehicle-event-add-view";
import { VehicleIntervalsView } from "./vehicle-service-view";
import { VehicleProfitabilityView } from "@/components/vehicle-viewer/vehicle-profitability-view";
import { VehicleFuelView } from "./vehicle-fuel-view";
import { VehicleViewerProvider } from "@/state/vehicle-viewer-context";
import { useVehicleViewer } from "@/state/vehicle-viewer-context";
import { VehicleServiceEventWizard } from "@/components/vehicle-viewer/service-wizard/vehicle-service-event-wizard";
import { EventTypesProvider } from "@/state/event-types-context";
import { VehicleIntervalWizard } from "./interval-wizard/vehicle-interval-wizard";
export function VehicleViewer({ vehicle }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0 w-fit text-left">
          {vehicle.registration_number}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 md:max-w-[900px] md:max-h-[600px] overflow-hidden">
        <EventTypesProvider>
          <VehicleViewerProvider>
            <SidebarProvider>
              <ViewerSidebar />
              <main className="flex flex-col flex-1 h-[600px] overflow-hidden">
                <HeaderBreadcrumb vehicle={vehicle} />{" "}
                <ViewerContent open={open} vehicle={vehicle} />
              </main>
            </SidebarProvider>
          </VehicleViewerProvider>
        </EventTypesProvider>
      </DialogContent>
    </Dialog>
  );
}

function HeaderBreadcrumb({ vehicle }) {
  const { views, jump } = useVehicleViewer();

  return (
    <Breadcrumb className="p-4">
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink>
            {vehicle.brand} {vehicle.model} ({vehicle.registration_number})
          </BreadcrumbLink>
        </BreadcrumbItem>
        {views.map((v, i) => (
          <Fragment key={i}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {i === views.length - 1 ? (
                <BreadcrumbPage>{v}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href="#" onClick={() => jump(i)}>
                  {v}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function ViewerSidebar() {
  const { views, goTo } = useVehicleViewer();
  const nav = [
    { name: "Rentowność", icon: IconBusinessplan },
    { name: "Opłaty drogowe", icon: IconRoad },
    { name: "Paliwo", icon: IconGasStation },
    { name: "Interwały serwisowe", icon: IconEngine },
    { name: "Dziennik zdarzeń", icon: IconNotebook },
    { name: "Spedycja", icon: IconWorld },
    { name: "Informacje", icon: IconInfoCircle },
    { name: "Telemetria", icon: IconRouter },
    { name: "Ustawienia", icon: IconSettings },
  ];
  return (
    <Sidebar collapsible="none" className="hidden md:flex">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((m) => (
                <SidebarMenuItem key={m.name}>
                  <SidebarMenuButton
                    isActive={views[0] === m.name}
                    onClick={() => goTo(m.name)}
                  >
                    <m.icon />
                    <span>{m.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function ViewerContent({ open, vehicle }) {
  const { views } = useVehicleViewer();
  const active = views.at(-1);

  function render(vehicle) {
    switch (active) {
      case "Rentowność":
        return <VehicleProfitabilityView item={vehicle} />;
      case "Opłaty drogowe":
        return <VehicleTollView item={vehicle} />;
      case "Paliwo":
        return <VehicleFuelView item={vehicle} />;
      case "Interwały serwisowe":
        return <VehicleIntervalsView open={open} vehicle={vehicle} />;
      case "Dziennik zdarzeń":
        return <VehicleEventListView vehicleId={vehicle.id} />;
      case "Dodaj zdarzenie":
        return <VehicleEventAddView vehicleId={vehicle.id} />;
      case "Telemetria":
        return <div>📡 Telemetria (placeholder)</div>;
      case "Spedycja":
        return <div>🚛 Spedycja (placeholder)</div>;
      case "Serwis okresowy":
        return (
          <VehicleServiceEventWizard
            vehicleId={vehicle.id}
            category="periodic_service"
          />
        );
      case "Serwis awaryjny":
        return (
          <VehicleServiceEventWizard
            vehicleId={vehicle.id}
            category="emergency_service"
          />
        );
      case "Dodaj interwały":
        return <VehicleIntervalWizard />;
      default:
        return <div className="p-4 text-muted-foreground">Nieznany widok</div>;
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-4 pt-0 overflow-y-auto">
      {render(vehicle)}
    </div>
  );
}
