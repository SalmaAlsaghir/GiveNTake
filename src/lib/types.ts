export type Condition = "like-new" | "good" | "fair";

export type ListingStatus = 'available' | 'negotiating' | 'sold';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: Condition;
  category: string;
  imageUrls: string[];
  userId: string;
  username: string;
  userEmail: string;
  userPhone: string;
  location: string;
  createdAt: string;
  isActive: boolean;
  status: ListingStatus;
  collectionId?: string;
  collectionTitle?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  phone: string;
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          phone_number: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          phone_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          phone_number?: string | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          price: number;
          currency: string;
          condition: 'like-new' | 'good' | 'fair';
          category_id: string;
          collection_id: string | null;
          location: string | null;
          created_at: string;
          is_active: boolean;
          status: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          price: number;
          currency?: string;
          condition: 'like-new' | 'good' | 'fair';
          category_id: string;
          collection_id?: string | null;
          location?: string | null;
          created_at?: string;
          is_active?: boolean;
          status?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          condition?: 'like-new' | 'good' | 'fair';
          category_id?: string;
          collection_id?: string | null;
          location?: string | null;
          created_at?: string;
          is_active?: boolean;
          status?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          image_url?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Extended types for listings with joins
export interface ListingWithImages {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  condition: Condition;
  category_id: string;
  location: string | null;
  created_at: string;
  is_active: boolean;
  status: ListingStatus;
  collection_id?: string | null;
  listing_images: {
    id: string;
    listing_id: string;
    image_url: string;
    created_at: string;
  }[];
  profiles: {
    id: string;
    username: string;
    email: string;
    phone_number: string | null;
  };
  categories: {
    id: string;
    name: string;
    slug: string;
  };
  collections: {
    id: string;
    title: string;
  } | null;
}
