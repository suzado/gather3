"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, User, Globe, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useArkivWallet, useWalletAddress } from "@/hooks/useArkivClient";
import { createOrganizer, updateOrganizer } from "@/lib/arkiv/organizer";
import type { OrganizerEntity, OrganizerPayload } from "@/lib/arkiv/types";

const organizerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500),
  avatarUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  twitter: z.string().max(15).optional(),
});

type OrganizerFormData = z.infer<typeof organizerSchema>;

interface OrganizerFormProps {
  existingOrganizer?: OrganizerEntity | null;
  onSuccess: (entityKey: string) => void;
}

export function OrganizerForm({ existingOrganizer, onSuccess }: OrganizerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const arkivWallet = useArkivWallet();
  const walletAddress = useWalletAddress();

  const form = useForm<OrganizerFormData>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      name: existingOrganizer?.name ?? "",
      bio: existingOrganizer?.bio ?? "",
      avatarUrl: existingOrganizer?.avatarUrl ?? "",
      website: existingOrganizer?.website ?? "",
      twitter: existingOrganizer?.twitter ?? "",
    },
  });

  async function onSubmit(data: OrganizerFormData) {
    if (!arkivWallet || !walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: OrganizerPayload = {
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatarUrl || undefined,
        website: data.website || undefined,
        twitter: data.twitter || undefined,
      };

      if (existingOrganizer) {
        await updateOrganizer(
          arkivWallet,
          existingOrganizer.entityKey,
          payload,
          walletAddress
        );
        toast.success("Profile updated!");
        onSuccess(existingOrganizer.entityKey);
      } else {
        const { entityKey } = await createOrganizer(arkivWallet, payload, walletAddress);
        toast.success("Organizer profile created!");
        onSuccess(entityKey);
      }
    } catch (err) {
      console.error("Organizer form error:", err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Organization Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., ETH Buenos Aires"
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
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell people about your organization..."
                    className="glass border-white/10 min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/avatar.png"
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
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://yoursite.com"
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
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="handle (without @)"
                      className="glass border-white/10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </motion.div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {existingOrganizer ? "Updating..." : "Creating Profile..."}
            </>
          ) : existingOrganizer ? (
            "Update Profile"
          ) : (
            "Create Organizer Profile"
          )}
        </Button>
      </form>
    </Form>
  );
}
