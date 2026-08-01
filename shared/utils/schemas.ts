import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72)
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1)
});

export const listingConditions = ['new', 'like_new', 'used', 'for_parts'] as const;
export const listingStatuses = ['active', 'sold', 'archived', 'draft'] as const;

export const listingSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().min(0).max(10_000_000),
  currency: z.string().trim().length(3).default('EUR'),
  condition: z.enum(listingConditions),
  categoryId: z.uuid(),
  location: z.string().trim().max(120).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional()
});

export const listingUpdateSchema = listingSchema.partial().extend({
  status: z.enum(listingStatuses).optional()
});

export const listingQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  categoryId: z.uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condition: z.enum(listingConditions).optional(),
  location: z.string().trim().max(120).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20)
});

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(2000)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
export type ListingQuery = z.infer<typeof listingQuerySchema>;
export type MessageInput = z.infer<typeof messageSchema>;
