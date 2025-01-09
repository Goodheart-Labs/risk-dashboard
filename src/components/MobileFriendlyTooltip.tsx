import { InfoIcon } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const triggerClasses =
  "inline-block rounded-full bg-transparent p-1 text-muted-foreground hover:text-black/80 dark:hover:text-white/80 align-middle";

export function MobileFriendlyTooltip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          className={cn(triggerClasses, "hidden sm:inline-block")}
        >
          <InfoIcon className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
      <Drawer>
        <DrawerTrigger className={cn(triggerClasses, "sm:hidden")}>
          <InfoIcon className="h-4 w-4" />
        </DrawerTrigger>
        <DrawerContent className="p-6">
          <DrawerTitle className="sr-only">Test</DrawerTitle>
          <div className="mt-8">{children}</div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
