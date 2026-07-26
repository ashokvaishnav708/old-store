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
  title: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  condition: string;
  status: string;
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
