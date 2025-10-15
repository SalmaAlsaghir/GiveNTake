/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabaseClient';

export interface WishlistItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  budget: number | null;
  currency: string;
  condition: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    username: string;
    email: string;
    phone_number: string | null;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateWishlistData {
  title: string;
  description: string;
  category_id: string;
  budget?: number;
  currency: string;
  condition?: string;
  location: string;
}

export interface UpdateWishlistData {
  title?: string;
  description?: string;
  category_id?: string;
  budget?: number;
  currency?: string;
  condition?: string;
  location?: string;
  is_active?: boolean;
}

export class WishlistService {
  // Get all active wishlist items
  static async getAllWishlistItems(): Promise<{ data: WishlistItem[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          profiles(id, username, email, phone_number),
          categories(id, name, slug)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      return { data: null, error };
    }
  }

  // Get wishlist items by category
  static async getWishlistItemsByCategory(categorySlug: string): Promise<{ data: WishlistItem[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          profiles(id, username, email, phone_number),
          categories(id, name, slug)
        `)
        .eq('is_active', true)
        .eq('categories.slug', categorySlug)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching wishlist items by category:', error);
      return { data: null, error };
    }
  }

  // Get user's wishlist items
  static async getUserWishlistItems(userId: string): Promise<{ data: WishlistItem[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          profiles(id, username, email, phone_number),
          categories(id, name, slug)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user wishlist items:', error);
      return { data: null, error };
    }
  }

  // Get single wishlist item by ID
  static async getWishlistItemById(id: string): Promise<{ data: WishlistItem | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          profiles(id, username, email, phone_number),
          categories(id, name, slug)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching wishlist item:', error);
      return { data: null, error };
    }
  }

  // Create a new wishlist item
  static async createWishlistItem(userId: string, wishlistData: CreateWishlistData): Promise<{ data: WishlistItem | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          ...wishlistData,
        })
        .select(`
          *,
          profiles(id, username, email, phone_number),
          categories(id, name, slug)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating wishlist item:', error);
      return { data: null, error };
    }
  }

  // Update a wishlist item
  static async updateWishlistItem(id: string, updateData: UpdateWishlistData): Promise<{ data: WishlistItem | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          profiles(id, username, email, phone_number),
          categories(id, name, slug)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating wishlist item:', error);
      return { data: null, error };
    }
  }

  // Delete a wishlist item
  static async deleteWishlistItem(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
      return { error };
    }
  }

  // Mark wishlist item as fulfilled/inactive
  static async markAsFulfilled(id: string): Promise<{ data: WishlistItem | null; error: any }> {
    return this.updateWishlistItem(id, { is_active: false });
  }
}
