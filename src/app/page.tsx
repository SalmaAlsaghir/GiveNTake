"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { ListingCard } from "@/components/listing-card";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ListingWithImages } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Frown } from "lucide-react";
import { ListingsService } from "@/lib/listings-service";
import { useToast } from "@/hooks/use-toast";

export default function BrowsePage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [filteredListings, setFilteredListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadListings = async () => {
      try {
        const { data, error } = await ListingsService.getAllListings();
        if (!mounted) return; // Don't update state if component unmounted
        
        if (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load listings.",
          });
        } else if (data) {
          setListings(data);
          setFilteredListings(data);
        }
      } catch (error) {
        if (!mounted) return;
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred.",
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadListings();
    
    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    const results = listings
      .filter((listing) => listing.status !== 'sold')
      .filter((listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (listing.description && listing.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    setFilteredListings(results);
  }, [searchQuery, listings]);

  // Reload listings when the tab regains focus (without showing loading state)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        // Reload data in background without setting loading state
        (async () => {
          try {
            const { data, error } = await ListingsService.getAllListings();
            if (!error && data) {
              setListings(data);
              setFilteredListings(data);
            }
          } catch (err) {
            // Silently ignore errors on background refresh
          }
        })();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/30 to-accent/40 rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-extrabold font-headline text-primary mb-4 drop-shadow-lg">
              Welcome to GiveNTake!
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground mb-6 font-semibold">
              The campus marketplace for students. Buy, sell, and swap textbooks, electronics, and more with your uni community!
            </p>
            <div className="flex gap-4">
              <a href="/list/new" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition-transform">Post a Listing</a>
              <a href="/collections" className="px-6 py-3 rounded-full bg-accent text-accent-foreground font-bold shadow-lg hover:scale-105 transition-transform">Browse Collections</a>
            </div>
          </div>
          <div className="hidden md:block flex-1 text-center">
            <img src="/campus-hero.svg" alt="Campus Vibe" className="w-72 mx-auto drop-shadow-xl rounded-2xl" />
          </div>
        </section>

        <div className="bg-card p-4 rounded-lg border mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for items..." 
              className="pl-10 text-lg py-6" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={{
                  id: listing.id,
                  title: listing.title,
                  description: listing.description || "",
                  price: listing.price,
                  currency: listing.currency,
                  condition: listing.condition,
                  category: listing.categories.name,
                  imageUrls: listing.listing_images.map(img => img.image_url),
                  userId: listing.user_id,
                  username: listing.profiles.username,
                  userEmail: listing.profiles.email,
                  userPhone: listing.profiles.phone_number || "",
                  location: listing.location || "",
                  createdAt: listing.created_at,
                  isActive: listing.is_active,
                  status: listing.status,
                  collectionId: listing.collections?.id,
                  collectionTitle: listing.collections?.title,
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="col-span-full">
            <Alert>
              <Frown className="h-4 w-4" />
              <AlertTitle>No Results Found</AlertTitle>
                <AlertDescription>
                  {searchQuery ? (
                    <>Your search for {searchQuery} did not match any listings. Try a different search term.</>
                  ) : (
                    <>No listings are currently available. Check back later!</>
                  )}
                </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
