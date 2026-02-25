import { format, formatDistanceToNow, isPast, isFuture, isToday } from "date-fns";

export function formatEventDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return format(date, "MMM d, yyyy");
}

export function formatEventTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return format(date, "h:mm a");
}

export function formatEventDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

export function formatEventDateRange(start: number, end: number): string {
  const startDate = new Date(start * 1000);
  const endDate = new Date(end * 1000);

  if (format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd")) {
    return `${format(startDate, "MMM d, yyyy")} ${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;
  }
  return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
}

export function timeUntilEvent(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  if (isPast(date)) return "Started";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function isEventLive(startDate: number, endDate: number): boolean {
  const now = Date.now() / 1000;
  return now >= startDate && now <= endDate;
}

export function isEventPast(endDate: number): boolean {
  return isPast(new Date(endDate * 1000));
}

export function isEventUpcoming(startDate: number): boolean {
  return isFuture(new Date(startDate * 1000));
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}
