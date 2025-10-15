"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, DollarSign, MapPin, Package, Mail, Phone, User, Heart, ShoppingBag } from "lucide-react";
import { WishlistService, type WishlistItem } from "@/lib/wishlist-service";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Frown } from "lucide-react";

export default function WishlistPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadWishlistItems = async () => {
      try {
        const { data, error } = await WishlistService.getAllWishlistItems();
        if (!mounted) return;
        
        if (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load wishlist items.",
          });
        } else if (data) {
          setWishlistItems(data);
          setFilteredItems(data);
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

    loadWishlistItems();
    
    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    const results = wishlistItems.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredItems(results);
  }, [searchQuery, wishlistItems]);

  // Reload wishlist items when the tab regains focus (without showing loading state)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        (async () => {
          try {
            const { data, error } = await WishlistService.getAllWishlistItems();
            if (!error && data) {
              setWishlistItems(data);
              setFilteredItems(data);
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
        <section className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-extrabold font-headline text-primary mb-4 drop-shadow-lg flex items-center gap-3">
              <Heart className="h-12 w-12" />
              Wishlist
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground mb-6 font-semibold">
              Browse what students are looking for! Got what they need? Reach out and make a connection.
            </p>
            <div className="flex gap-4">
              <Link href="/wishlist/new">
                <Button className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition-transform">
                  Post Your Wishlist
                </Button>
              </Link>
              <Link href="/wishlist/my-wishlist">
                <Button variant="outline" className="px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                  My Wishlist
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block flex-1 text-center">
            <ShoppingBag className="w-64 h-64 mx-auto text-primary opacity-20" />
          </div>
        </section>

        {/* Search Bar */}
        <div className="bg-card p-4 rounded-lg border mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search wishlist items..." 
              className="pl-10 text-lg py-6" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Wishlist Items Grid */}
        {wishlistItems.length === 0 ? (
          <Alert>
            <Heart className="h-4 w-4" />
            <AlertTitle>No Wishlist Items Yet</AlertTitle>
            <AlertDescription>
              Be the first to post what you're looking for!
              <Link href="/wishlist/new">
                <Button variant="link" className="p-1 h-auto">Post a wishlist item</Button>
              </Link>
            </AlertDescription>
          </Alert>
        ) : filteredItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:scale-[1.02] transition-transform bg-gradient-to-br from-purple-50 to-white shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                      {item.categories && (
                        <Badge variant="secondary" className="mb-2">
                          {item.categories.name}
                        </Badge>
                      )}
                    </div>
                    <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
                  </div>
                  <CardDescription className="line-clamp-3">
                    {item.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {item.budget && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">Budget: {item.currency} {item.budget}</span>
                    </div>
                  )}
                  {item.condition && (
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span>Condition: {item.condition}</span>
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <User className="h-4 w-4" />
                    <span>Posted by: {item.profiles?.username || "Unknown"}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`mailto:${item.profiles?.email}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                  </Link>
                  {item.profiles?.phone_number && (
                    <Link href={`tel:${item.profiles.phone_number}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <Frown className="h-4 w-4" />
            <AlertTitle>No Results Found</AlertTitle>
            <AlertDescription>
              Your search for "{searchQuery}" did not match any wishlist items.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AppLayout>
  );
}
