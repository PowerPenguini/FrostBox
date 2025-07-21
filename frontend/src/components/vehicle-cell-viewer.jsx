import { useIsMobile } from "@/hooks/use-mobile";
import { VehicleEventListView } from "./vehicle-event-list-view";
import { VehicleTollView } from "@/components/vehicle-toll-view";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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

import { useState, useEffect } from "react";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import {
  IconWorld,
  IconEngine,
  IconRouter,
  IconBusinessplan,
  IconRoad,
  IconInfoCircle,
  IconSettings,
  IconNotebook,
  IconHelpHexagon,
} from "@tabler/icons-react";
import { VehicleServiceView } from "./vehicle-service-view";

export function VehicleCellViewer({ item }) {
  const data = {
    nav: [
      { name: "Rentowność", icon: IconBusinessplan },
      { name: "Opłaty drogowe", icon: IconRoad },
      { name: "Interwały serwisowe", icon: IconEngine },
      { name: "Dziennik zdarzeń", icon: IconNotebook },
      { name: "Spedycja", icon: IconWorld },
      { name: "Informacje", icon: IconInfoCircle },
      { name: "Telemetria", icon: IconRouter },
      { name: "Ustawienia", icon: IconSettings },
    ],
  };
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState("Rentowność");

  function renderActiveView(open, item) {
    switch (activeView) {
      case "Rentowność":
        return <div>📊 Rentowność (placeholder)</div>;
      case "Opłaty drogowe":
        return <VehicleTollView />;
      case "Telemetria":
        return <div>📡 Telemetria (placeholder)</div>;
      case "Interwały serwisowe":
        return <VehicleServiceView open={open} item={item} />;
      case "Spedycja":
        return <div>🚛 Spedycja (placeholder)</div>;
      case "Dziennik zdarzeń":
        return <VehicleEventListView vehicleId={item.id} />;
      default:
        return <div className="text-muted-foreground">Nieznany widok</div>;
    }
  }

  const dialogMobile = (
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        <Button variant="link" className="px-0 w-fit text-foreground text-left">
          {item.registration_number}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Pojazd</DrawerTitle>
          <DrawerDescription>
            Showing total visitors for the last 6 months
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-4 overflow-y-auto text-sm"></div>
      </DrawerContent>
    </Drawer>
  );
  const dialogDesktop = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0 w-fit text-foreground text-left">
          {item.registration_number}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 md:max-w-[800px] lg:max-w-[980px] md:max-h-[600px] overflow-hidden">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((menuItem) => (
                      <SidebarMenuItem key={menuItem.name}>
                        <SidebarMenuButton
                          isActive={activeView === menuItem.name}
                          onClick={() => setActiveView(menuItem.name)}
                        >
                          <menuItem.icon />
                          <span>{menuItem.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex flex-col flex-1 h-[600px] overflow-hidden">
            <header className="flex items-center gap-2 h-16 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 transition-[width,height] ease-linear shrink-0">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        {item.brand} {item.model} ({item.registration_number})
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activeView}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-col gap-4 p-4 pt-0 overflow-y-auto">
              {renderActiveView(open, item)}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );

  return isMobile ? dialogMobile : dialogDesktop;
}
