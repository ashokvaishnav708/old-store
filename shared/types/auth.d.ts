declare module '#auth-utils' {
  interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    userType: 'admin' | 'assistant' | 'private' | 'organisation';
    verified: boolean;
    listingLimit: number;
    userSubscription: 'basic' | 'advanced' | 'advanced_plus';
    subscriptionExpiresAt: string | null;
  }
}

export {};
