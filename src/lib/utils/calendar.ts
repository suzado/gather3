// Calendar integration utilities — ICS file generation & Google Calendar deep links

export interface IcsEventData {
  title: string;
  description: string;
  startDate: number; // unix timestamp (seconds)
  endDate: number; // unix timestamp (seconds)
  timezone: string; // IANA timezone string
  location: string;
  venue?: string;
  entityKey: string; // unique event identifier
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldIcsLine(line: string): string {
  const maxLen = 75;
  if (line.length <= maxLen) return line;
  let result = line.slice(0, maxLen);
  let i = maxLen;
  while (i < line.length) {
    result += "\r\n " + line.slice(i, i + maxLen - 1);
    i += maxLen - 1;
  }
  return result;
}

function formatIcsDateWithTz(timestamp: number, timezone: string): string {
  const date = new Date(timestamp * 1000);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}T${get("hour")}${get("minute")}${get("second")}`;
}

function formatUtcDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function buildLocation(event: IcsEventData): string {
  return event.venue ? `${event.venue}, ${event.location}` : event.location;
}

export function generateIcsContent(event: IcsEventData): string {
  const location = buildLocation(event);
  const dtstamp = formatUtcDate(Math.floor(Date.now() / 1000));

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gather3//Event//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    foldIcsLine(`UID:${event.entityKey}@gather3.club`),
    `DTSTAMP:${dtstamp}`,
    foldIcsLine(
      `DTSTART;TZID=${event.timezone}:${formatIcsDateWithTz(event.startDate, event.timezone)}`
    ),
    foldIcsLine(
      `DTEND;TZID=${event.timezone}:${formatIcsDateWithTz(event.endDate, event.timezone)}`
    ),
    foldIcsLine(`SUMMARY:${escapeIcsText(event.title)}`),
    foldIcsLine(`DESCRIPTION:${escapeIcsText(event.description)}`),
    foldIcsLine(`LOCATION:${escapeIcsText(location)}`),
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

export function downloadIcsFile(event: IcsEventData): void {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildGoogleCalendarUrl(event: IcsEventData): string {
  const location = buildLocation(event);
  const description =
    event.description.length > 1000
      ? event.description.slice(0, 997) + "..."
      : event.description;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatUtcDate(event.startDate)}/${formatUtcDate(event.endDate)}`,
    details: description,
    location: location,
    ctz: event.timezone,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
