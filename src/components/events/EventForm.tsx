"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  Type,
  MapPin,
  Settings,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useArkivWallet } from "@/hooks/useArkivClient";
import { createEvent } from "@/lib/arkiv/events";
import { createCoverImage } from "@/lib/arkiv/images";
import { EVENT_CATEGORIES, LOCATION_TYPES } from "@/lib/utils/constants";
import { CoverImageUpload } from "@/components/events/CoverImageUpload";
import { createImagePreviewUrl } from "@/lib/utils/imageCompression";
import type { CompressedImage } from "@/lib/utils/imageCompression";
import type { EventPayload } from "@/lib/arkiv/types";

const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000),
    category: z.string().min(1, "Please select a category"),
    locationType: z.string().min(1, "Please select a format"),
    location: z.string().min(2, "Location is required"),
    venue: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endDate: z.string().min(1, "End date is required"),
    endTime: z.string().min(1, "End time is required"),
    timezone: z.string().min(1, "Timezone is required"),
    capacity: z.number().min(1, "Capacity must be at least 1").max(100000),
    tags: z.string().optional(),
    externalUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(`${data.startDate}T${data.startTime}`);
      const end = new Date(`${data.endDate}T${data.endTime}`);
      return end > start;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  );

type EventFormData = z.infer<typeof eventSchema>;

const STEPS = [
  { id: "basics", label: "Basics", icon: Type },
  { id: "datetime", label: "Date & Location", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "preview", label: "Preview", icon: Eye },
] as const;

interface EventFormProps {
  organizerKey: string;
  onSuccess: (entityKey: string) => void;
}

export function EventForm({ organizerKey, onSuccess }: EventFormProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageData, setCoverImageData] = useState<CompressedImage | null>(null);
  const arkivWallet = useArkivWallet();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      locationType: "",
      location: "",
      venue: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      capacity: 100,
      tags: "",
      externalUrl: "",
    },
  });

  const fieldsForStep: Record<number, (keyof EventFormData)[]> = {
    0: ["title", "description", "category"],
    1: ["locationType", "location", "startDate", "startTime", "endDate", "endTime", "timezone"],
    2: ["capacity"],
    3: [],
  };

  async function validateAndNext() {
    const fields = fieldsForStep[step];
    const valid = await form.trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(data: EventFormData) {
    if (!arkivWallet) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsSubmitting(true);
    try {
      const startTimestamp = Math.floor(
        new Date(`${data.startDate}T${data.startTime}`).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(`${data.endDate}T${data.endTime}`).getTime() / 1000
      );

      // Upload cover image to Arkiv if provided
      let coverImageKey: string | undefined;
      if (coverImageData) {
        const { entityKey: imageKey } = await createCoverImage(
          arkivWallet,
          coverImageData.data
        );
        coverImageKey = imageKey;
      }

      const payload: EventPayload = {
        title: data.title,
        description: data.description,
        location: data.location,
        venue: data.venue || undefined,
        coverImageKey,
        startDate: startTimestamp,
        endDate: endTimestamp,
        timezone: data.timezone,
        capacity: data.capacity,
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        externalUrl: data.externalUrl || undefined,
      };

      const city = extractCity(data.location);

      const { entityKey } = await createEvent(
        arkivWallet,
        payload,
        organizerKey,
        data.category,
        data.locationType,
        city
      );

      toast.success("Event created successfully!");
      onSuccess(entityKey);
    } catch (err) {
      console.error("Event creation error:", err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("insufficient funds") || message.toLowerCase().includes("insufficient balance")) {
        toast.error("Insufficient funds. You need testnet ETH for gas fees. Visit the Arkiv faucet to get some.", { duration: 8000 });
      } else if (message.includes("User denied") || message.includes("user rejected")) {
        toast.error("Transaction was cancelled.");
      } else {
        toast.error("Failed to create event. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const watchedValues = form.watch();

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isComplete = i < step;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-violet-500/20 text-violet-400"
                    : isComplete
                      ? "text-emerald-400 cursor-pointer hover:bg-white/5"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    isActive
                      ? "border-violet-500 bg-violet-500/20"
                      : isComplete
                        ? "border-emerald-500 bg-emerald-500/20"
                        : "border-white/10"
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${
                    isComplete ? "bg-emerald-500/50" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && <StepBasics form={form} />}
              {step === 1 && <StepDateTime form={form} />}
              {step === 2 && (
                <StepSettings
                  form={form}
                  coverImageData={coverImageData}
                  setCoverImageData={setCoverImageData}
                />
              )}
              {step === 3 && (
                <StepPreview
                  values={watchedValues}
                  coverImageData={coverImageData}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={validateAndNext}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Event
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepBasics({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Event Basics</h2>
        <p className="text-sm text-muted-foreground">
          Start with the core details of your event
        </p>
      </div>

      <FormField
        control={form.control}
        name="title"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>Event Title</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Web3 Developer Meetup"
                className="glass border-white/10 text-lg"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your event — what will attendees experience?"
                className="glass border-white/10 min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select
              onValueChange={field.onChange as (v: string) => void}
              defaultValue={field.value as string}
            >
              <FormControl>
                <SelectTrigger className="glass border-white/10">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EVENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepDateTime({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Date & Location</h2>
        <p className="text-sm text-muted-foreground">
          When and where will your event take place?
        </p>
      </div>

      <FormField
        control={form.control}
        name="locationType"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>Format</FormLabel>
            <Select
              onValueChange={field.onChange as (v: string) => void}
              defaultValue={field.value as string}
            >
              <FormControl>
                <SelectTrigger className="glass border-white/10">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {LOCATION_TYPES.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Buenos Aires, Argentina or Online"
                className="glass border-white/10"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="venue"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>Venue (optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Centro Cultural Recoleta"
                className="glass border-white/10"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }: { field: Record<string, unknown> }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" className="glass border-white/10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }: { field: Record<string, unknown> }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input type="time" className="glass border-white/10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }: { field: Record<string, unknown> }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" className="glass border-white/10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endTime"
          render={({ field }: { field: Record<string, unknown> }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input type="time" className="glass border-white/10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="timezone"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>Timezone</FormLabel>
            <FormControl>
              <Input className="glass border-white/10" {...field} />
            </FormControl>
            <FormDescription>
              Auto-detected from your browser
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepSettings({
  form,
  coverImageData,
  setCoverImageData,
}: {
  form: any;
  coverImageData: CompressedImage | null;
  setCoverImageData: (img: CompressedImage | null) => void;
}) {
  const watchedValues = form.watch();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure capacity, tags, and media
        </p>
      </div>

      <FormField
        control={form.control}
        name="capacity"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>Capacity</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                className="glass border-white/10"
                {...field}
                onChange={(e) => {
                  const val = e.target.valueAsNumber;
                  (field.onChange as (value: number | undefined) => void)(isNaN(val) ? undefined : val);
                }}
              />
            </FormControl>
            <FormDescription>Maximum number of attendees</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>Tags (optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="web3, ethereum, defi (comma-separated)"
                className="glass border-white/10"
                {...field}
              />
            </FormControl>
            <FormDescription>Comma-separated tags for discoverability</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Cover Image (optional)</label>
        <CoverImageUpload
          onImageReady={setCoverImageData}
          eventTitle={watchedValues.title}
          eventDescription={watchedValues.description}
          eventCategory={watchedValues.category}
        />
      </div>

      <FormField
        control={form.control}
        name="externalUrl"
        render={({ field }: { field: Record<string, unknown> }) => (
          <FormItem>
            <FormLabel>External URL (optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="https://your-event-site.com"
                className="glass border-white/10"
                {...field}
              />
            </FormControl>
            <FormDescription>Link to external event page or resources</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function StepPreview({
  values,
  coverImageData,
}: {
  values: EventFormData;
  coverImageData: CompressedImage | null;
}) {
  const category = EVENT_CATEGORIES.find((c) => c.value === values.category);
  const locType = LOCATION_TYPES.find((l) => l.value === values.locationType);
  const coverPreviewUrl = coverImageData
    ? createImagePreviewUrl(coverImageData.data)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Preview</h2>
        <p className="text-sm text-muted-foreground">
          Review your event before creating
        </p>
      </div>

      <div className="glass rounded-xl p-6 space-y-4">
        {coverPreviewUrl && (
          <div className="rounded-lg overflow-hidden -mx-2 -mt-2 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreviewUrl}
              alt="Event cover"
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {category && <Badge variant="secondary">{category.label}</Badge>}
          {locType && <Badge variant="outline">{locType.label}</Badge>}
        </div>

        <h3 className="text-2xl font-bold">{values.title || "Untitled Event"}</h3>

        <p className="text-muted-foreground whitespace-pre-wrap">
          {values.description || "No description"}
        </p>

        <Separator className="bg-white/10" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium">{values.location || "—"}</p>
            {values.venue && (
              <p className="text-muted-foreground text-xs">{values.venue}</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">Capacity</p>
            <p className="font-medium">{values.capacity} attendees</p>
          </div>
          <div>
            <p className="text-muted-foreground">Starts</p>
            <p className="font-medium">
              {values.startDate} {values.startTime}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Ends</p>
            <p className="font-medium">
              {values.endDate} {values.endTime}
            </p>
          </div>
        </div>

        {values.tags && (
          <>
            <Separator className="bg-white/10" />
            <div className="flex flex-wrap gap-2">
              {values.tags.split(",").map((tag) => (
                <Badge key={tag.trim()} variant="outline" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function extractCity(location: string): string {
  const parts = location.split(",").map((p) => p.trim());
  return parts[0] || location;
}
