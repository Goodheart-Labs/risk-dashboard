import Tippy from "@tippyjs/react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import "tippy.js/dist/tippy.css";

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <Tippy content={content}>
      <InfoCircledIcon className="ml-1 inline-block h-4 w-4 cursor-help align-text-top opacity-50 hover:opacity-100" />
    </Tippy>
  );
}
