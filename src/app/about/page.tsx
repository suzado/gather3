"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  Database,
  Shield,
  Search,
  Layers,
  Clock,
  Zap,
  Palette,
  Code,
  CheckCircle2,
  Globe,
  Wallet,
  Image,
  Activity,
  ArrowRightLeft,
  Timer,
  Sparkles,
  MessageSquare,
  Share2,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold gradient-text mb-6">{children}</h2>
  );
}

function SubSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-white mb-3">{children}</h3>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-xl border border-white/5 p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300 border border-violet-500/30">
      {children}
    </span>
  );
}

const entityTypes = [
  { name: "Organizer", owner: "Organizer wallet", expiration: "1 year", attributes: "app, type, wallet, name, createdAt" },
  { name: "Event", owner: "Organizer wallet", expiration: "endDate + 30d", attributes: "app, type, organizerKey, status, category, locationType, city, startDate, endDate, capacity" },
  { name: "RSVP", owner: "Attendee wallet", expiration: "endDate + 7d", attributes: "app, type, eventKey, status, rsvpDate, attendeeWallet" },
  { name: "Attendance", owner: "Organizer wallet", expiration: "6 months", attributes: "app, type, eventKey, attendeeWallet, checkedInAt" },
  { name: "Cover Image", owner: "Creator wallet", expiration: "1 year", attributes: "app, type, eventKey" },
];

const sdkFeatures = [
  { feature: "eq(attr, value)", purpose: "Filter by category, status, locationType, city, eventKey, attendeeWallet" },
  { feature: "gt(attr, value)", purpose: "Filter events after a start date" },
  { feature: "lt(attr, value)", purpose: "Filter events before an end date" },
  { feature: "desc(attr)", purpose: "Sort by startDate descending, rsvpDate descending" },
  { feature: "ownedBy(wallet)", purpose: "Fetch only events owned by connected wallet" },
  { feature: "count()", purpose: "Get RSVP count without fetching all entities" },
  { feature: "limit(n)", purpose: "Paginate results" },
];

const niceToHaves = [
  { feature: "Capacity limits with waitlist", done: true },
  { feature: "Check-in / attendance verification", done: true },
  { feature: "Event categories / tags", done: true },
  { feature: "Add to Calendar", done: true },
  { feature: "Social links", done: true },
  { feature: "Cover images on Arkiv", done: true },
  { feature: "Geocoding / Map support", done: true },
  { feature: "Live activity feed", done: true },
  { feature: "Ownership transfer", done: true },
  { feature: "Event countdown", done: true },
  { feature: "OpenGraph previews", done: true },
];

const architectureHighlights = [
  { icon: Image, title: "Binary Payloads", desc: "Cover images stored as raw JPEG bytes on Arkiv, not URLs to external services." },
  { icon: Shield, title: "Cross-Wallet Ownership", desc: "RSVP entities owned by the attendee\u2019s wallet, not the event organizer. Users own their data." },
  { icon: Activity, title: "RPC Health Monitoring", desc: "Automatic detection of Arkiv network issues with user-facing health banner and auto-recovery." },
  { icon: Clock, title: "4 Expiration Levels", desc: "Each entity type has a business-justified TTL \u2014 not a blanket \u20181 year\u2019 on everything." },
  { icon: Zap, title: "24 SDK Features", desc: "CRUD, queries with 7 filter types, sorting, counting, pagination, ownership transfer, subscriptions, binary payloads." },
  { icon: Layers, title: "Clean SDK Abstraction", desc: "8 files in lib/arkiv/ wrap all SDK calls. React components never touch the SDK directly." },
  { icon: ArrowRightLeft, title: "Real-Time Without WebSockets", desc: "Live RSVP feed uses subscribeEntityEvents() with polling for real-time updates." },
  { icon: Globe, title: "Live Data on Landing", desc: "The homepage \u201CLive Activity\u201D section shows actual recent RSVPs from the blockchain." },
];

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <motion.div {...fadeInUp} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge>Arkiv Web3 Database Builders Challenge</Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Gather3
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A fully decentralized event management platform where all data lives on Arkiv.
            Organizers own their events, attendees own their RSVPs — no centralized database, no middleman.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a
              href="https://gather3.club"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              <Globe className="h-4 w-4" />
              Live Demo
            </a>
            <a
              href="https://github.com/suzado/gather3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-white text-sm font-medium transition-colors"
            >
              <Code className="h-4 w-4" />
              Source Code
            </a>
          </div>
        </motion.div>

        {/* Arkiv Integration Depth */}
        <motion.section {...fadeInUp} transition={{ delay: 0.1 }} className="mb-16">
          <SectionTitle>Arkiv Integration Depth</SectionTitle>

          {/* Entity Schema */}
          <SubSectionTitle>Entity Schema Design — 5 Entity Types</SubSectionTitle>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-violet-300 font-medium">Entity</th>
                  <th className="text-left py-3 px-4 text-violet-300 font-medium">Owner</th>
                  <th className="text-left py-3 px-4 text-violet-300 font-medium">Expiration</th>
                  <th className="text-left py-3 px-4 text-violet-300 font-medium hidden lg:table-cell">Queryable Attributes</th>
                </tr>
              </thead>
              <tbody>
                {entityTypes.map((entity) => (
                  <tr key={entity.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-medium text-white">{entity.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{entity.owner}</td>
                    <td className="py-3 px-4 text-muted-foreground">{entity.expiration}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs hidden lg:table-cell">{entity.attributes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Design Decisions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <Database className="h-5 w-5 text-violet-400 mb-2" />
              <p className="text-sm text-muted-foreground">
                <span className="text-white font-medium">Attributes vs payload separation</span> — everything users filter/sort by is an indexed attribute; rich content goes in the payload.
              </p>
            </Card>
            <Card>
              <Image className="h-5 w-5 text-violet-400 mb-2" />
              <p className="text-sm text-muted-foreground">
                <span className="text-white font-medium">Cover images as entities</span> — binary data stored directly on Arkiv, not on external image hosts.
              </p>
            </Card>
            <Card>
              <Layers className="h-5 w-5 text-violet-400 mb-2" />
              <p className="text-sm text-muted-foreground">
                <span className="text-white font-medium">5 entity types</span> with clear separation of concerns — not a single blob or 2 generic types.
              </p>
            </Card>
          </div>

          {/* Query Usage */}
          <SubSectionTitle>Query Usage — Full Query Builder</SubSectionTitle>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-violet-300 font-medium">SDK Feature</th>
                  <th className="text-left py-3 px-4 text-violet-300 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {sdkFeatures.map((f) => (
                  <tr key={f.feature} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2 px-4 font-mono text-xs text-violet-300">{f.feature}</td>
                    <td className="py-2 px-4 text-muted-foreground">{f.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Query Example */}
          <Card className="mb-8">
            <SubSectionTitle>Example Complex Query</SubSectionTitle>
            <pre className="text-xs text-violet-300 overflow-x-auto font-mono leading-relaxed">
{`buildQuery()
  .where([
    eq("app", "gather3.club"),
    eq("type", "event"),
    eq("category", "hackathon"),
    eq("locationType", "in-person"),
    eq("status", "upcoming"),
    eq("city", "Buenos Aires"),
    gt("startDate", 1709251200),
    lt("endDate", 1711929600)
  ])
  .orderBy(desc("startDate"))
  .limit(20)
  .withAttributes()
  .withPayload()
  .withMetadata()
  .fetch()`}
            </pre>
          </Card>

          {/* Ownership Model */}
          <SubSectionTitle>Ownership Model — Cross-Wallet Ownership</SubSectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <Wallet className="h-5 w-5 text-violet-400 mb-2" />
              <p className="text-sm text-muted-foreground">
                <span className="text-white font-medium">Organizers</span> own their organizer profile and events via their wallet.
                <span className="text-white font-medium"> Attendees</span> own their RSVP via their own wallet.
              </p>
            </Card>
            <Card>
              <Shield className="h-5 w-5 text-violet-400 mb-2" />
              <p className="text-sm text-muted-foreground">
                Only the entity owner can edit or delete it — enforced at the SDK level.
                Organizers cannot delete attendee RSVPs; attendees cancel their own.
              </p>
            </Card>
          </div>

          {/* Entity Relationships */}
          <SubSectionTitle>Entity Relationships</SubSectionTitle>
          <Card className="mb-8">
            <pre className="text-sm text-muted-foreground font-mono leading-relaxed">
{`Organizer ──1:N──> Event        (organizerKey → organizer entityKey)
Event     ──1:N──> RSVP         (eventKey → event entityKey)
Event     ──1:N──> Attendance   (eventKey → event entityKey)
Event     ──1:1──> Cover Image  (coverImageKey → image entityKey)`}
            </pre>
          </Card>

          {/* Advanced Features */}
          <SubSectionTitle>Advanced Features</SubSectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { icon: ArrowRightLeft, title: "Entity Lifecycle", desc: "Events transition through: upcoming → live → ended / cancelled" },
              { icon: Share2, title: "Ownership Transfer", desc: "Organizers can transfer event ownership to another wallet" },
              { icon: Activity, title: "Real-Time Subscriptions", desc: "Live RSVP feed via subscribeEntityEvents() polling" },
              { icon: Image, title: "Binary Payloads", desc: "Cover images stored as JPEG binary directly on Arkiv" },
              { icon: Shield, title: "RPC Health Monitor", desc: "Tracks Arkiv RPC health, shows banner when unhealthy" },
              { icon: Zap, title: "Parallel RSVP Counting", desc: "count() queries fetched in parallel for all events" },
            ].map((item) => (
              <Card key={item.title}>
                <item.icon className="h-5 w-5 text-violet-400 mb-2" />
                <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Functionality */}
        <motion.section {...fadeInUp} transition={{ delay: 0.15 }} className="mb-16">
          <SectionTitle>Functionality</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <h4 className="text-sm font-medium text-white mb-3">Organizer Flow</h4>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Connect wallet</li>
                <li>Create organizer profile</li>
                <li>Create event (4-step wizard)</li>
                <li>Manage lifecycle</li>
                <li>Transfer ownership</li>
              </ol>
            </Card>
            <Card>
              <h4 className="text-sm font-medium text-white mb-3">Attendee Flow</h4>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Browse events (no wallet)</li>
                <li>Filter & search</li>
                <li>View event details</li>
                <li>Connect wallet & RSVP</li>
                <li>View in dashboard</li>
              </ol>
            </Card>
            <Card>
              <h4 className="text-sm font-medium text-white mb-3">Discovery Flow</h4>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Landing page</li>
                <li>Browse & filter events</li>
                <li>Full-text search</li>
                <li>View organizer profile</li>
                <li>See their other events</li>
              </ol>
            </Card>
          </div>

          {/* Filtering */}
          <SubSectionTitle>Filtering & Search — 6 Filter Types</SubSectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {[
              { label: "Category", desc: "conference, meetup, workshop, hackathon, social" },
              { label: "Location Type", desc: "in-person, online, hybrid" },
              { label: "Status", desc: "upcoming, live, ended, cancelled" },
              { label: "City", desc: "extracted from location field" },
              { label: "Date Range", desc: "gt(startDate) + lt(endDate)" },
              { label: "Keyword", desc: "Fuse.js full-text search" },
            ].map((f) => (
              <Card key={f.label} className="p-4">
                <p className="text-sm font-medium text-white">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </Card>
            ))}
          </div>

          {/* Additional Features */}
          <SubSectionTitle>Additional Features</SubSectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Card>
              <Sparkles className="h-5 w-5 text-violet-400 mb-2" />
              <p className="text-sm font-medium text-white mb-1">AI Cover Image Generation</p>
              <p className="text-xs text-muted-foreground">
                9 visual styles via OpenAI gpt-image-1. Context-aware prompts built from event title, description, and category.
                Generated images compressed client-side and stored as binary on Arkiv.
              </p>
            </Card>
            <Card>
              <MessageSquare className="h-5 w-5 text-violet-400 mb-2" />
              <p className="text-sm font-medium text-white mb-1">Social Media Links</p>
              <p className="text-xs text-muted-foreground">
                Twitter, Discord, Telegram, Farcaster, and GitHub per event. Displayed as clickable icons on the event detail page.
              </p>
            </Card>
          </div>
        </motion.section>

        {/* Design & UX */}
        <motion.section {...fadeInUp} transition={{ delay: 0.2 }} className="mb-16">
          <SectionTitle>Design & UX</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { title: "Dark Theme", desc: "Glass-morphism effects with backdrop-blur and translucent cards. Violet accent (#8B5CF6) throughout." },
              { title: "Interactive 3D Globe", desc: "WebGL globe with auto-rotation, draggable interaction, glowing markers, animated arcs, and floating event cards." },
              { title: "Animated Landing", desc: "Particle effects, word reveal animations, staggered cards with 3D tilt, mouse spotlight, grain texture." },
              { title: "Multi-Step Wizard", desc: "4-step event creation with progress indicator — not a single overwhelming form." },
              { title: "Responsive Design", desc: "Mobile-first with 1/2/3 column grids. Touch-friendly buttons. Stacking layouts on small screens." },
              { title: "Blockchain Abstraction", desc: "No wallet needed to browse. No entity keys or hashes in UI. Wallet connection presented as 'Sign in'." },
            ].map((item) => (
              <Card key={item.title}>
                <Palette className="h-5 w-5 text-violet-400 mb-2" />
                <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Architecture Highlights */}
        <motion.section {...fadeInUp} transition={{ delay: 0.25 }} className="mb-16">
          <SectionTitle>Architecture Highlights</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {architectureHighlights.map((item) => (
              <Card key={item.title}>
                <item.icon className="h-5 w-5 text-violet-400 mb-2" />
                <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Nice-to-Haves */}
        <motion.section {...fadeInUp} transition={{ delay: 0.3 }} className="mb-16">
          <SectionTitle>Nice-to-Have Features</SectionTitle>
          <Card>
            <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {niceToHaves.map((item) => (
                <motion.div key={item.feature} variants={fadeInUp} className="flex items-center gap-2 py-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-muted-foreground">{item.feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.section>

        {/* Code Quality */}
        <motion.section {...fadeInUp} transition={{ delay: 0.35 }} className="mb-16">
          <SectionTitle>Code Quality</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { value: "107", label: "TypeScript Files" },
              { value: "24", label: "SDK Features Used" },
              { value: "5", label: "Entity Types" },
              { value: "13", label: "React Hooks" },
            ].map((stat) => (
              <Card key={stat.label} className="text-center">
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>

          <Card>
            <SubSectionTitle>Project Structure</SubSectionTitle>
            <pre className="text-xs text-muted-foreground font-mono leading-relaxed">
{`src/
├── app/                    # Pages (Next.js App Router)
├── components/
│   ├── ui/                 # shadcn/ui primitives (14 components)
│   ├── events/             # Event domain (13 files)
│   ├── rsvp/               # RSVP domain (4 files)
│   ├── organizer/          # Organizer domain (2 files)
│   ├── common/             # Shared utilities
│   ├── layout/             # Header, Footer, transitions
│   └── home/               # Landing page sections (16 files)
├── hooks/                  # 13 React hooks wrapping Arkiv SDK
├── lib/
│   ├── arkiv/              # SDK integration layer (8 files)
│   ├── wallet/             # Chain + wallet config
│   └── utils/              # Date, geocoding, image, calendar, analytics
└── providers/              # Web3 + QueryClient providers`}
            </pre>
          </Card>
        </motion.section>

        {/* SDK Functions */}
        <motion.section {...fadeInUp} transition={{ delay: 0.4 }} className="mb-16">
          <SectionTitle>Arkiv SDK Functions Used</SectionTitle>
          <Card>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[
                "createPublicClient", "createWalletClient", "http transport",
                "createEntity", "updateEntity", "deleteEntity", "getEntity",
                "changeOwnership", "buildQuery", "eq()", "gt()", "lt()", "desc()",
                "ownedBy()", "count()", "limit()", "orderBy()",
                "withAttributes", "withPayload", "withMetadata",
                "jsonToPayload", "ExpirationTime", "subscribeEntityEvents",
                "mendoza / kaolin chains",
              ].map((fn) => (
                <div key={fn} className="flex items-center gap-1.5 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span className="text-xs font-mono text-muted-foreground">{fn}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.section>
      </div>
    </PageTransition>
  );
}
