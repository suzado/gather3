"use client";

import { useState } from "react";
import { CalendarPlus, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  downloadIcsFile,
  buildGoogleCalendarUrl,
} from "@/lib/utils/calendar";
import type { IcsEventData } from "@/lib/utils/calendar";

interface AddToCalendarButtonProps {
  event: IcsEventData;
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);

  const handleIcsDownload = () => {
    downloadIcsFile(event);
    setOpen(false);
  };

  const handleGoogleCalendar = () => {
    window.open(buildGoogleCalendarUrl(event), "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground"
        >
          <CalendarPlus className="h-4 w-4 mr-2 text-violet-400" />
          Add to Calendar
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-56 p-2 glass border-white/10"
      >
        <button
          onClick={handleIcsDownload}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
        >
          <Download className="h-4 w-4 text-violet-400/70" />
          Download .ics file
        </button>
        <button
          onClick={handleGoogleCalendar}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
        >
          <ExternalLink className="h-4 w-4 text-violet-400/70" />
          Google Calendar
        </button>
      </PopoverContent>
    </Popover>
  );
}
