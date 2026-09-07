/**
 * WHY
 * Guards Firestore writes before records can affect public web or Android clients.
 *
 * HOW
 * Uses Zod schemas that mirror shared TypeScript models and reject malformed values.
 *
 * WHAT
 * Destination, role, and admin form schemas ready for React Hook Form.
 */
import { z } from "zod";

export const userRoleSchema = z.enum(["super_admin", "admin", "host", "explorer"]);
export const publishStatusSchema = z.enum(["draft", "review", "published", "archived"]);
export const difficultySchema = z.enum(["suave", "media", "alta", "experta"]);

export const destinationSchema = z.object({
  id: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(3).max(90),
  department: z.string().min(2),
  municipality: z.string().min(2),
  category: z.string().min(2),
  coordinates: z.object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180)
  }),
  summary: z.string().min(20).max(240),
  story: z.string().min(40).max(2200),
  priceUsd: z.number().finite().min(0).max(5000),
  difficulty: difficultySchema,
  durationHours: z.number().finite().positive().max(168),
  rating: z.number().finite().min(0).max(5),
  sustainabilityScore: z.number().finite().min(0).max(100),
  heroImage: z.string().min(1),
  gallery: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  status: publishStatusSchema,
  updatedAtIso: z.string().datetime()
});

export type DestinationInput = z.infer<typeof destinationSchema>;
