"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventStatusBadge } from "./EventStatusBadge";
import { formatEventDate, formatEventTime } from "@/lib/utils/dates";
import type { GeocodedEvent } from "@/hooks/useGeocodedEvents";

// Fix Leaflet default icon path issue with bundlers
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface EventMapViewProps {
  events: GeocodedEvent[];
}

export function EventMapView({ events }: EventMapViewProps) {
  const center: [number, number] =
    events.length > 0
      ? [
          events.reduce((sum, e) => sum + e.latitude, 0) / events.length,
          events.reduce((sum, e) => sum + e.longitude, 0) / events.length,
        ]
      : [20, 0];

  const zoom = events.length > 0 ? 3 : 2;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-2xl"
      style={{ minHeight: "500px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {events.map((event) => (
        <Marker
          key={event.entityKey}
          position={[event.latitude, event.longitude]}
          icon={defaultIcon}
        >
          <Popup className="event-map-popup">
            <EventMapPopup event={event} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function EventMapPopup({ event }: { event: GeocodedEvent }) {
  return (
    <div className="w-64 p-1">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-[10px]">
          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
        </Badge>
        <EventStatusBadge status={event.status} />
      </div>
      <Link
        href={`/events/${event.entityKey}`}
        className="text-sm font-semibold hover:underline block mb-2 text-white"
      >
        {event.title}
      </Link>
      <div className="space-y-1 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{formatEventDate(event.startDate)}</span>
          <Clock className="h-3 w-3 ml-1 shrink-0" />
          <span>{formatEventTime(event.startDate)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {event.venue
              ? `${event.venue}, ${event.location}`
              : event.location}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 shrink-0" />
          <span>
            {event.rsvpCount ?? 0} / {event.capacity} spots
          </span>
        </div>
      </div>
    </div>
  );
}
