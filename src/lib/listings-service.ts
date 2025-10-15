/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO(tech-debt): Replace `any` occurrences in this file with proper types.
import { supabase } from './supabaseClient';
import type { ListingWithImages, Condition } from './types';

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: Condition;
  status: string;
  category_id: string;
  location: string;
  images: File[];
  collection_id?: string | null;
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  condition?: Condition;
  category_id?: string;
  location?: string;
  is_active?: boolean;
  status?: string;
  collection_id?: string | null;
}

export interface UpdateListingWithImagesData extends UpdateListingData {
  newImages?: File[];
  removedImageUrls?: string[];
}

export class ListingsService {
  // Get all active listings with images and user/category data
  static async getAllListings(): Promise<{ data: ListingWithImages[] | null; error: any }> {
    try {
      console.log('Fetching all listings...');
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images(*),
          profiles(id, username, email, phone_number),
          categories(id, name, slug),
          collections(id, title)
        `)
        .eq('is_active', true)
        .neq('status', 'sold')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
      } else {
        console.log('Listings fetched successfully:', data?.length || 0);
      }

      return { data, error };
    } catch (error) {
      console.error('Exception fetching listings:', error);
      return { data: null, error };
    }
  }

  // Get listings by category
  static async getListingsByCategory(categorySlug: string): Promise<{ data: ListingWithImages[] | null; error: any }> {
    try {
      console.log('Fetching listings for category:', categorySlug);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images(*),
          profiles(id, username, email, phone_number),
          categories!inner(id, name, slug),
          collections(id, title)
        `)
        .eq('is_active', true)
        .neq('status', 'sold')
        .eq('categories.slug', categorySlug)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching category listings:', error);
      } else {
        console.log('Category listings fetched successfully:', data?.length || 0);
      }

      return { data, error };
    } catch (error) {
      console.error('Exception fetching category listings:', error);
      return { data: null, error };
    }
  }

  // Get a single listing by ID
  static async getListingById(id: string): Promise<{ data: ListingWithImages | null; error: any }> {
    try {
      console.log('Fetching listing by ID:', id);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images(*),
          profiles(id, username, email, phone_number),
          categories(id, name, slug),
          collections(id, title)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching listing:', error);
      } else {
        console.log('Listing fetched successfully:', data?.id);
      }

      return { data, error };
    } catch (error) {
      console.error('Exception fetching listing:', error);
      return { data: null, error };
    }
  }

  static async getCollectionById(id: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, title, description, created_at, user_id')
        .eq('id', id)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getListingsByCollection(collectionId: string): Promise<{ data: ListingWithImages[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images(*),
          profiles(id, username, email, phone_number),
          categories(id, name, slug),
          collections(id, title)
        `)
        .eq('collection_id', collectionId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get user's own listings
  static async getUserListings(userId: string): Promise<{ data: ListingWithImages[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images(*),
          profiles(id, username, email, phone_number),
          categories(id, name, slug)
          ,
          collections(id, title)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Create a new listing with images
  static async createListing(listingData: CreateListingData): Promise<{ data: any; error: any }> {
    try {
      // 1. Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: new Error('Not authenticated') };
      }

      // 1.5 Ensure profile exists via server API (uses service role)
      const ensureResp = await fetch('/api/profiles/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.user.id,
          email: userData.user.email,
          username: userData.user.user_metadata?.username,
          phone_number: userData.user.user_metadata?.phone_number,
        }),
      });
      if (!ensureResp.ok) {
        const { error } = await ensureResp.json();
        return { data: null, error: new Error(error || 'Failed to ensure profile') };
      }

      // 2. Insert listing (profile should already exist)
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert([
          {
            user_id: userData.user.id,
            title: listingData.title,
            description: listingData.description,
            price: listingData.price,
            currency: listingData.currency,
            condition: listingData.condition,
            status: listingData.status,
             category_id: listingData.category_id,
             collection_id: listingData.collection_id ?? null,
            location: listingData.location,
          },
        ])
        .select()
        .single();

      if (listingError) {
        console.error('Error creating listing:', listingError);
        return { data: null, error: listingError };
      }

      // 3. Upload images
      const imageUrls: string[] = [];
      if (listingData.images && listingData.images.length > 0) {
        console.log(`Uploading ${listingData.images.length} images for listing ${listing.id}`);
        console.log('Images to upload:', listingData.images.map(f => ({ name: f.name, size: f.size, type: f.type })));
        
        // Check if storage bucket exists and is accessible
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('listing-images');
        if (bucketError) {
          console.error('Storage bucket error:', bucketError);
          console.error('Unable to access image storage. Please check your Supabase storage configuration.');
        } else {
          console.log('Storage bucket accessible:', bucketData);
        }
        
        for (const file of listingData.images) {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `listings/${listing.id}/${fileName}`;

            console.log(`Uploading image: ${filePath} (${file.name}, ${file.size} bytes, ${file.type})`);

            // Upload to storage
            const { error: uploadError } = await supabase.storage
              .from('listing-images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              console.error('Upload error for file:', file.name, uploadError);
              continue; // Skip this image but continue with others
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('listing-images')
              .getPublicUrl(filePath);

            if (urlData.publicUrl) {
              imageUrls.push(urlData.publicUrl);
              console.log(`Image uploaded successfully: ${urlData.publicUrl}`);

              // Insert image record
              const { error: imageInsertError } = await supabase.from('listing_images').insert([
                {
                  listing_id: listing.id,
                  image_url: urlData.publicUrl,
                },
              ]);

              if (imageInsertError) {
                console.error('Error inserting image record:', imageInsertError);
              } else {
                console.log(`Image record inserted successfully for: ${urlData.publicUrl}`);
              }
            } else {
              console.error('Failed to get public URL for uploaded image');
            }
          } catch (imageError) {
            console.error('Error processing image:', file.name, imageError);
            continue;
          }
        }
      } else {
        console.log('No images to upload for this listing');
      }

      console.log(`Listing created successfully with ${imageUrls.length} images`);
      console.log('Final image URLs:', imageUrls);
      return { data: { ...listing, imageUrls }, error: null };
    } catch (error) {
      console.error('Exception in createListing:', error);
      return { data: null, error };
    }
  }

  // Update a listing
  static async updateListing(id: string, updates: UpdateListingData): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update a listing with image handling
  static async updateListingWithImages(id: string, updates: UpdateListingWithImagesData): Promise<{ data: any; error: any }> {
    try {
      // 1. Update listing metadata first
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .update({
          title: updates.title,
          description: updates.description,
          price: updates.price,
          currency: updates.currency,
          condition: updates.condition,
          category_id: updates.category_id,
          location: updates.location,
          is_active: updates.is_active,
          status: updates.status,
          collection_id: updates.collection_id,
        })
        .eq('id', id)
        .select()
        .single();

      if (listingError) {
        console.error('Error updating listing:', listingError);
        return { data: null, error: listingError };
      }

      // 2. Handle removed images
      if (updates.removedImageUrls && updates.removedImageUrls.length > 0) {
        console.log(`Removing ${updates.removedImageUrls.length} images from listing ${id}`);
        
        // Clean up images from storage
        await this.cleanupListingImagesFromStorage(id, updates.removedImageUrls);
        
        // Delete from listing_images table
        for (const imageUrl of updates.removedImageUrls) {
          const { error: deleteError } = await supabase
            .from('listing_images')
            .delete()
            .eq('listing_id', id)
            .eq('image_url', imageUrl);

          if (deleteError) {
            console.error('Error deleting image record:', deleteError);
          }
        }
      }

      // 3. Handle new images
      if (updates.newImages && updates.newImages.length > 0) {
        console.log(`Uploading ${updates.newImages.length} new images for listing ${id}`);
        
        for (const file of updates.newImages) {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `listings/${id}/${fileName}`;

            console.log(`Uploading new image: ${filePath} (${file.name}, ${file.size} bytes, ${file.type})`);

            // Upload to storage
            const { error: uploadError } = await supabase.storage
              .from('listing-images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              console.error('Upload error for new file:', file.name, uploadError);
              continue; // Skip this image but continue with others
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('listing-images')
              .getPublicUrl(filePath);

            if (urlData.publicUrl) {
              console.log(`New image uploaded successfully: ${urlData.publicUrl}`);

              // Insert image record
              const { error: imageInsertError } = await supabase.from('listing_images').insert([
                {
                  listing_id: id,
                  image_url: urlData.publicUrl,
                },
              ]);

              if (imageInsertError) {
                console.error('Error inserting new image record:', imageInsertError);
              } else {
                console.log(`New image record inserted successfully for: ${urlData.publicUrl}`);
              }
            } else {
              console.error('Failed to get public URL for new uploaded image');
            }
          } catch (imageError) {
            console.error('Error processing new image:', file.name, imageError);
            continue;
          }
        }
      }

      console.log(`Listing ${id} updated successfully with image changes`);
      return { data: listing, error: null };
    } catch (error) {
      console.error('Exception in updateListingWithImages:', error);
      return { data: null, error };
    }
  }

  // Update listing status specifically
  static async updateListingStatus(id: string, status: string): Promise<{ data: any; error: any }> {
    try {
      console.log('Updating listing status:', id, 'to:', status);
      
      // First check if listing exists and user owns it
      const { data: listing, error: checkError } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('Error checking listing ownership:', checkError);
        return { data: null, error: checkError };
      }

      if (!listing) {
        return { data: null, error: new Error('Listing not found') };
      }

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: new Error('Not authenticated') };
      }

      // Check if user owns the listing
      if (listing.user_id !== userData.user.id) {
        return { data: null, error: new Error('Not authorized to update this listing') };
      }

      // Update the status
      const { data, error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating listing status:', error);
        return { data: null, error };
      }

      console.log('Listing status updated successfully:', id, 'to:', status);
      return { data, error: null };
    } catch (error) {
      console.error('Exception in updateListingStatus:', error);
      return { data: null, error };
    }
  }

  // Soft delete a listing (set is_active to false)
  static async deleteListing(id: string): Promise<{ data: any; error: any }> {
    try {
      console.log('Attempting to delete listing:', id);
      
      // First check if listing exists and user owns it
      const { data: listing, error: checkError } = await supabase
        .from('listings')
        .select('user_id, listing_images(*)')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('Error checking listing ownership:', checkError);
        return { data: null, error: checkError };
      }

      if (!listing) {
        console.error('Listing not found for ID:', id);
        return { data: null, error: new Error('Listing not found') };
      }

      console.log('Found listing with user_id:', listing.user_id);

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error('User authentication error:', userError);
        return { data: null, error: new Error('Not authenticated') };
      }

      console.log('Current user ID:', userData.user.id);

      // Check if user owns the listing
      if (listing.user_id !== userData.user.id) {
        console.error('User ownership mismatch. Listing user_id:', listing.user_id, 'Current user_id:', userData.user.id);
        return { data: null, error: new Error('Not authorized to delete this listing') };
      }

      console.log('User authorized, proceeding with soft delete...');

      // Clean up images from storage before soft deleting
      if (listing.listing_images && listing.listing_images.length > 0) {
        const imageUrls = listing.listing_images.map((img: any) => img.image_url);
        await this.cleanupListingImagesFromStorage(id, imageUrls);
      }

      // Soft delete the listing
      const { data, error } = await supabase
        .from('listings')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error soft deleting listing:', error);
        return { data: null, error };
      }

      console.log('Listing soft deleted successfully:', id);
      return { data, error: null };
    } catch (error) {
      console.error('Exception in deleteListing:', error);
      return { data: null, error };
    }
  }

  // Hard delete a listing (removes from database)
  static async hardDeleteListing(id: string): Promise<{ data: any; error: any }> {
    try {
      console.log('Attempting hard delete of listing:', id);
      
      // First get the listing images to clean up storage
      const { data: listingImages, error: imagesQueryError } = await supabase
        .from('listing_images')
        .select('image_url')
        .eq('listing_id', id);

      if (imagesQueryError) {
        console.error('Error querying listing images:', imagesQueryError);
      } else if (listingImages && listingImages.length > 0) {
        const imageUrls = listingImages.map((img: any) => img.image_url);
        await this.cleanupListingImagesFromStorage(id, imageUrls);
      }

      // Delete associated listing_images records
      const { error: imagesError } = await supabase
        .from('listing_images')
        .delete()
        .eq('listing_id', id);
      if (imagesError) {
        console.error('Error deleting listing images:', imagesError);
      }

      // Delete the listing
      const { data, error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error hard deleting listing:', error);
        return { data: null, error };
      }

      console.log('Listing hard deleted successfully:', id);
      return { data, error: null };
    } catch (error) {
      console.error('Exception in hardDeleteListing:', error);
      return { data: null, error };
    }
  }

  // Helper method to clean up images from storage for a listing
  private static async cleanupListingImagesFromStorage(listingId: string, imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) return;

    console.log(`Cleaning up ${imageUrls.length} images from storage for listing ${listingId}`);
    
    for (const imageUrl of imageUrls) {
      try {
        // Extract file path from URL for storage deletion
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `listings/${listingId}/${fileName}`;
        
        console.log(`Deleting image from storage: ${filePath}`);
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('listing-images')
          .remove([filePath]);

        if (storageError) {
          console.error('Error deleting image from storage:', storageError);
        } else {
          console.log(`Successfully deleted image from storage: ${filePath}`);
        }
      } catch (pathError) {
        console.error('Error parsing image URL for deletion:', pathError);
      }
    }
  }

  // Clean up orphaned images in storage (images that exist in storage but not in database)
  static async cleanupOrphanedImages(): Promise<{ data: any; error: any }> {
    try {
      console.log('Starting cleanup of orphaned images...');
      
      // Get all images from storage
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('listing-images')
        .list('listings', { limit: 1000 });

      if (storageError) {
        console.error('Error listing storage files:', storageError);
        return { data: null, error: storageError };
      }

      if (!storageFiles || storageFiles.length === 0) {
        console.log('No files found in storage');
        return { data: { cleaned: 0 }, error: null };
      }

      let cleanedCount = 0;
      
      for (const file of storageFiles) {
        if (file.name) {
          // Extract listing ID from folder structure (listings/{listingId}/{filename})
          const listingId = file.name;
          
          // Check if this listing exists in the database
          const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('id')
            .eq('id', listingId)
            .single();

          if (listingError || !listing) {
            // Listing doesn't exist, clean up the entire folder
            console.log(`Listing ${listingId} not found, cleaning up folder from storage`);
            
            const { error: removeError } = await supabase.storage
              .from('listing-images')
              .remove([`listings/${listingId}`]);

            if (removeError) {
              console.error('Error removing orphaned folder:', removeError);
            } else {
              cleanedCount++;
              console.log(`Successfully cleaned up orphaned folder: listings/${listingId}`);
            }
          }
        }
      }

      console.log(`Cleanup completed. Cleaned ${cleanedCount} orphaned folders.`);
      return { data: { cleaned: cleanedCount }, error: null };
    } catch (error) {
      console.error('Exception in cleanupOrphanedImages:', error);
      return { data: null, error };
    }
  }

  // Get all categories
  static async getCategories(): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        console.log('Categories fetched successfully:', data?.length || 0);
        console.log('Categories data:', data);
      }

      return { data, error };
    } catch (error) {
      console.error('Exception fetching categories:', error);
      return { data: null, error };
    }
  }

  // Collections APIs
  static async getAllCollections(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, title, description, created_at, user_id, profiles:profiles!collections_user_id_fkey(id, username)')
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getUserCollections(userId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, title, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async createCollection(title: string, description?: string): Promise<{ data: any; error: any }> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return { data: null, error: new Error('Not authenticated') };
      const { data, error } = await supabase
        .from('collections')
        .insert([{ user_id: userData.user.id, title, description: description || null }])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateCollection(id: string, updates: { title?: string; description?: string | null }): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async deleteCollection(id: string): Promise<{ data: any; error: any }> {
    try {
      // Null out collection_id on associated listings
      const { error: clearError } = await supabase
        .from('listings')
        .update({ collection_id: null })
        .eq('collection_id', id);
      if (clearError) {
        console.error('Error clearing listing collection references:', clearError);
      }
      const { data, error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}
