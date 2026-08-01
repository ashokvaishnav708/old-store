import { z } from 'zod';
import { listingPlans } from './plans';

export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72)
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

export const listingConditions = ['new', 'like_new', 'used', 'use_marks','defect'] as const;
// Statuses a listing owner may set directly via PATCH. 'pending'/'active'/'rejected'
// are staff-controlled transitions handled by the /api/admin/listings/:id/approve
// and /reject endpoints instead.
export const listingStatuses = ['sold', 'archived'] as const;

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

export const createPaymentSchema = z.object({
  listingId: z.uuid(),
  plan: z.enum(listingPlans)
});

export const rejectListingSchema = z.object({
  reason: z.string().trim().min(3).max(500)
});

export const complaintSchema = z
  .object({
    targetListingId: z.uuid().optional(),
    targetUserId: z.uuid().optional(),
    reason: z.string().trim().min(3).max(200),
    details: z.string().trim().max(2000).optional()
  })
  .refine(data => Boolean(data.targetListingId) !== Boolean(data.targetUserId), {
    message: 'Provide exactly one of targetListingId or targetUserId.'
  });

export const respondComplaintSchema = z.object({
  status: z.enum(['in_review', 'resolved', 'dismissed']),
  resolutionNote: z.string().trim().max(2000).optional()
});

export const createAssistantSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72)
});

export const banEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  reason: z.string().trim().max(500).optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(72)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
export type ListingQuery = z.infer<typeof listingQuerySchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type RejectListingInput = z.infer<typeof rejectListingSchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;
export type RespondComplaintInput = z.infer<typeof respondComplaintSchema>;
export type CreateAssistantInput = z.infer<typeof createAssistantSchema>;
export type BanEmailInput = z.infer<typeof banEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
