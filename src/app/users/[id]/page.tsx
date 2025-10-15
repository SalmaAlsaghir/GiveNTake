"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Calendar, Package, TrendingUp, CheckCircle, Clock, AlertCircle, Heart } from "lucide-react";
import { ListingsService } from "@/lib/listings-service";
import { WishlistService } from "@/lib/wishlist-service";
import { supabase } from "@/lib/supabaseClient";
import type { ListingWithImages } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ListingCard } from "@/components/listing-card";

const statusConfig = {
  available: {
    label: 'Available',
    icon: Package,
    variant: 'default' as const,
    color: 'text-green-600'
  },
  negotiating: {
    label: 'Being Negotiated',
    icon: Clock,
    variant: 'secondary' as const,
    color: 'text-yellow-600'
  },
  sold: {
    label: 'Sold',
    icon: CheckCircle,
    variant: 'outline' as const,
    color: 'text-blue-600'
  }
};

export default function UserProfilePage() {
  const params = useParams();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userListings, setUserListings] = useState<ListingWithImages[]>([]);
  const [userWishlist, setUserWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'negotiating' | 'sold' | 'collections' | 'wishlist'>('all');
  const [collections, setCollections] = useState<any[]>([]);

  const userId = params.id as string;

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;

      try {
        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load user profile.",
          });
          return;
        }

        setUserProfile(profileData);

        // Load user listings
        const { data: listingsData, error: listingsError } = await ListingsService.getUserListings(userId);
        if (listingsError) {
              console.error(listingsError);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load user listings.",
              });
        } else if (listingsData) {
          setUserListings(listingsData);
        }

        // Load user collections
        const { data: cols } = await ListingsService.getUserCollections(userId);
        setCollections(cols || []);

        // Load user wishlist
        const { data: wishlistData } = await WishlistService.getUserWishlistItems(userId);
        setUserWishlist(wishlistData || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, toast]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!userProfile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  const filteredListings = userListings.filter(listing => {
    if (activeTab === 'all') return true;
    return listing.status === activeTab;
  });

  const stats = {
    total: userListings.length,
    available: userListings.filter(l => l.status === 'available').length,
    negotiating: userListings.filter(l => l.status === 'negotiating').length,
    sold: userListings.filter(l => l.status === 'sold').length
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        {/* User Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-6 w-6" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Username:</span>
                  <span className="font-medium">{userProfile.username}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-medium">{userProfile.email}</span>
                </div>
                
                {userProfile.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <span className="font-medium">{userProfile.phone_number}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Member since:</span>
                  <span className="font-medium">
                    {new Date(userProfile.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total listings:</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.available}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.negotiating}</p>
                  <p className="text-sm text-muted-foreground">Negotiating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.sold}</p>
                  <p className="text-sm text-muted-foreground">Sold</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="text-2xl font-bold">{userWishlist.length}</p>
                  <p className="text-sm text-muted-foreground">Wishlist Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>User Content</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: 'All Listings', count: stats.total },
                { key: 'available', label: 'Available', count: stats.available },
                { key: 'negotiating', label: 'Negotiating', count: stats.negotiating },
                { key: 'sold', label: 'Sold', count: stats.sold },
                { key: 'collections', label: 'Collections', count: collections.length },
                { key: 'wishlist', label: 'Wishlist', count: userWishlist.length }
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  size="sm"
                >
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>

            {/* Content Display */}
            {activeTab === 'collections' ? (
              collections.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {collections.map((c) => (
                    <Link key={c.id} href={`/collections/${c.id}`} className="block">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{c.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{c.description || 'No description provided.'}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No collections yet.</div>
              )
            ) : activeTab === 'wishlist' ? (
              userWishlist.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {userWishlist.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          {!item.is_active && (
                            <Badge variant="secondary">Fulfilled</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                        )}
                        {item.budget && (
                          <p className="text-sm font-semibold">Budget: {item.currency} {item.budget}</p>
                        )}
                        {item.categories?.name && (
                          <Badge variant="outline">{item.categories.name}</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No wishlist items yet.</div>
              )
            ) : filteredListings.length > 0 ? (
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
                    }}
                    showStatus
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {activeTab === 'all' 
                    ? 'No listings found for this user.'
                    : `No ${activeTab} listings found.`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
