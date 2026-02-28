import {
  ORGANIZER_COUNT,
  TARGET_EVENTS,
  EVENT_CATEGORIES,
  LOCATION_TYPES,
  type EventCategory,
  type LocationType,
} from "./config";

// --- Types ---

export interface GeneratedOrganizer {
  name: string;
  bio: string;
  avatarUrl?: string;
  website?: string;
  twitter?: string;
}

export interface GeneratedEvent {
  title: string;
  description: string;
  location: string;
  venue?: string;
  startDate: number; // unix seconds
  endDate: number;
  timezone: string;
  capacity: number;
  tags: string[];
  externalUrl?: string;
  category: EventCategory;
  locationType: LocationType;
  city: string;
}

// --- OpenAI helper ---

async function openaiChat(
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local or environment.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.9,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

// --- Generators ---

export async function generateOrganizers(): Promise<GeneratedOrganizer[]> {
  console.log(`  Generating ${ORGANIZER_COUNT} organizer profiles via OpenAI...`);

  const result = await openaiChat(
    "You generate realistic seed data for a Web3 event platform. Return valid JSON only.",
    `Generate ${ORGANIZER_COUNT} unique organizer profiles for a global event platform (not just tech — all kinds of events).

Mix between very different types of organizers from around the world:
- Music venues and festival promoters
- Sports clubs and sailing associations
- Museums and cultural institutions
- Poker clubs and card game groups
- Car enthusiast clubs and rally organizers
- Food & foraging communities
- Tech companies and hackathon organizers
- Universities and student groups
- Environmental and activist groups
- Art galleries and creative collectives

They should be from different countries — USA, UK, Germany, Japan, Brazil, Nigeria, Singapore, Poland, Argentina, France, Italy, Australia, etc.

Return a JSON object with key "organizers" containing an array. Each item has:
- "name": string (2-50 chars, the organizer or org name)
- "bio": string (50-300 chars, describing who they are and what they organize)
- "twitter": string or null (twitter handle without @)
- "website": string or null (full URL)

Make it diverse and realistic. Names should match the country of origin and type of organization.`
  );

  console.log(`  Generated ${result.organizers.length} organizer profiles`);
  return result.organizers;
}

export async function generateEvents(): Promise<GeneratedEvent[]> {
  console.log(`  Generating ${TARGET_EVENTS} events via OpenAI...`);

  // Spread events across all of 2026
  const yearStart = Math.floor(new Date("2026-01-01T00:00:00Z").getTime() / 1000);
  const yearEnd = Math.floor(new Date("2026-12-31T23:59:59Z").getTime() / 1000);

  const result = await openaiChat(
    "You generate realistic seed data for a Web3 event platform. Return valid JSON only.",
    `Generate ${TARGET_EVENTS} unique events for a GLOBAL event platform. These are NOT just tech events — generate a wide variety of real-world events.

IMPORTANT REQUIREMENTS:
1. Events should be spread across the ENTIRE year 2026 (January through December). Distribute them evenly — some in Q1, Q2, Q3, Q4. Do NOT cluster them in one time period.
2. Events should be in DIFFERENT CITIES AROUND THE WORLD. Each event in a different city:
   - Americas: New York, San Francisco, Buenos Aires, São Paulo, Miami, Toronto, Mexico City, Bogotá
   - Europe: London, Berlin, Paris, Lisbon, Amsterdam, Zurich, Barcelona, Warsaw, Rome, Prague
   - Asia: Tokyo, Singapore, Seoul, Bangkok, Dubai, Hong Kong, Bangalore, Shanghai
   - Africa: Lagos, Nairobi, Cape Town
   - Oceania: Sydney, Auckland
   - Online events too (2-3 of them)
3. Use REAL venue names that exist in those cities.
4. Use the CORRECT timezone for each city (e.g. "America/New_York", "Europe/Berlin", "Asia/Tokyo").

EVENT TYPES — generate a creative MIX of these kinds of events:
- Concerts and music festivals (jazz night, electronic music, classical)
- Food & nature (mushroom foraging, strawberry picking, wine tasting, cooking class)
- Sports (sailing regatta, marathon, cycling tour, surfing competition)
- Card games & board games (poker tournament, chess championship, board game night)
- Car & motorsport (classic car rally, car show, go-kart race)
- Art & culture (museum night, art exhibition, photography walk, film screening)
- Tech & hackathons (blockchain hackathon, AI workshop, startup pitch night)
- Social & community (neighborhood cleanup, charity gala, book club, language exchange)
- Activism (climate march, protest, fundraiser)
- Education (university lecture, coding bootcamp, history talk)

Map each event to the best fitting platform category:
- "conference" = large formal events, summits, expos
- "meetup" = casual gatherings, clubs, regular meetings
- "workshop" = hands-on learning, classes, bootcamps
- "hackathon" = competitions, tournaments, races, challenges
- "social" = parties, galas, mixers, festivals, cultural nights

Return a JSON object with key "events" containing an array. Each item has:
- "title": string (3-100 chars, creative and specific — e.g. "Nuit Blanche: Paris Museum Marathon", "Tokyo Ramen & Sake Crawl", "Regata del Plata")
- "description": string (100-1500 chars, vivid and engaging, describing what attendees will experience)
- "location": string — MUST be in the format "City, Country" (e.g. "Tokyo, Japan", "Berlin, Germany", "São Paulo, Brazil", "Lagos, Nigeria"). For online events use "Online".
- "venue": string or null — MUST be the name of a REAL, EXISTING building, park, stadium, hall, gallery, or venue in that city. Use actual well-known places (e.g. "Madison Square Garden", "Berghain", "Palau de la Música Catalana", "Łazienki Royal Baths", "Sydney Opera House", "Maracanã Stadium"). For online events use "Zoom" or "Discord". Do NOT invent fictional venue names.
- "startDate": number (unix timestamp in seconds, spread between ${yearStart} and ${yearEnd})
- "endDate": number (unix timestamp, 1-12 hours after startDate depending on event type)
- "timezone": string (IANA timezone matching the city)
- "capacity": number (10-5000, bigger for concerts/conferences, smaller for workshops/clubs)
- "tags": string[] (2-5 relevant tags, e.g. "music", "jazz", "sailing", "poker", "foraging", "blockchain", "art", "food", "cars", "marathon")
- "externalUrl": string or null
- "category": one of [${EVENT_CATEGORIES.map((c) => `"${c}"`).join(", ")}]
- "locationType": one of [${LOCATION_TYPES.map((l) => `"${l}"`).join(", ")}]
- "city": string (just the city name, e.g. "Tokyo", "Berlin", "Online")

Make it feel like a real, vibrant global event platform. Some titles in local languages. Vary sizes wildly.`
  );

  // Validate and fix dates
  const events: GeneratedEvent[] = result.events.map((e: any) => ({
    ...e,
    startDate: Math.floor(Number(e.startDate)),
    endDate: Math.floor(Number(e.endDate)),
    capacity: Math.floor(Number(e.capacity)),
    tags: Array.isArray(e.tags) ? e.tags : [],
    category: EVENT_CATEGORIES.includes(e.category) ? e.category : "meetup",
    locationType: LOCATION_TYPES.includes(e.locationType)
      ? e.locationType
      : "in-person",
  }));

  console.log(`  Generated ${events.length} events`);
  return events;
}
