import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, CalendarPlus, Clock, AlertTriangle } from "lucide-react";
import { apiCall } from "@/lib/api";

interface CalendarEvent {
  title: string;
  date: string;
  google_url: string;
  type: string;
}

interface GoogleCalendarButtonProps {
  extractionId: number;
}

export default function GoogleCalendarButton({
  extractionId,
}: GoogleCalendarButtonProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await apiCall({
        url: `/api/v1/lease/google-calendar/${extractionId}`,
        method: "GET",
      });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error("Failed to load calendar events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadEvents();
    }
  }, [open, extractionId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "lease_end":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "renewal_notice":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "lease_start":
        return <Calendar className="h-4 w-4 text-green-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "lease_end":
        return "bg-red-100 text-red-700";
      case "renewal_notice":
        return "bg-amber-100 text-amber-700";
      case "lease_start":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Add to Google Calendar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
              alt="Google Calendar"
              className="h-5 w-5"
            />
            Add to Google Calendar
          </DialogTitle>
          <DialogDescription>
            Click on any event below to add it directly to your Google Calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No key dates found in this lease.</p>
            </div>
          ) : (
            events.map((event, index) => (
              <a
                key={index}
                href={event.google_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 hover:border-blue-200 transition-colors group"
              >
                {getEventIcon(event.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(event.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs ${getEventBadgeColor(event.type)}`}
                  >
                    {event.type.replace(/_/g, " ")}
                  </Badge>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </a>
            ))
          )}
        </div>

        {events.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={() => {
                // Open all events
                events.forEach((event) => {
                  window.open(event.google_url, "_blank");
                });
              }}
            >
              <CalendarPlus className="h-4 w-4" />
              Add All Events ({events.length})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
