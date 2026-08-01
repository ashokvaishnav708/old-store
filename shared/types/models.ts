export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  position: number;
}

export interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  condition: string;
  location: string | null;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  seller: { id: string; name: string };
  thumbnail: string | null;
}

export interface ListingDetail {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  condition: string;
  status: string;
  planId: string;
  expiresAt: string | null;
  rejectionReason: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  viewCount: number;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  seller: { id: string; name: string; avatarUrl: string | null; createdAt: string };
  images: { id: string; url: string }[];
}

export interface MyListing {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  status: string;
  planId: string;
  expiresAt: string | null;
  rejectionReason: string | null;
  viewCount: number;
  createdAt: string;
  category: { id: string; name: string };
}

export interface FavoriteListing {
  listingId: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  status: string;
  favoritedAt: string;
  category: { id: string; name: string };
}

export interface ListingPage {
  items: ListingSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ConversationSummary {
  id: string;
  createdAt: string;
  listing: { id: string; title: string; slug: string };
  buyer: { id: string; name: string };
  isSeller: boolean;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface AdminListingSummary {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  status: string;
  planId: string;
  rejectionReason: string | null;
  createdAt: string;
  category: { id: string; name: string };
  seller: { id: string; name: string; email: string };
}

export interface AdminListingPage {
  items: AdminListingSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminComplaint {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  resolutionNote: string | null;
  createdAt: string;
  handledAt: string | null;
  reporter: { id: string; name: string };
  targetListing: { id: string; title: string; slug: string } | null;
  targetUserId: string | null;
}

export interface AdminAssistant {
  id: string;
  name: string;
  email: string;
  bannedAt: string | null;
  bannedReason: string | null;
  createdAt: string;
}

export interface AdminUserSearchResult {
  id: string;
  name: string;
  email: string;
  userType: string;
  bannedAt: string | null;
  bannedReason: string | null;
  listingLimit: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  senderId: string | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface AdminConversationThread {
  buyerId: string;
  sellerId: string;
  messages: MessageItem[];
}

export interface AdminConversationSummary {
  id: string;
  createdAt: string;
  listing: { id: string; title: string; slug: string };
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  lastMessage: string | null;
  lastMessageAt: string | null;
}
