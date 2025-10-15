
"use client";

import { useState, useEffect, use as reactUse } from "react";
import { AppLayout } from "@/components/app-layout";
import { ListingCard } from "@/components/listing-card";
import type { ListingWithImages } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search, Info, Frown, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListingsService } from "@/lib/listings-service";
import { useToast } from "@/hooks/use-toast";

interface BrowseCategoryPageProps {
    params: {
        category: string;
    };
}

const categoryDisplayNameMap: { [key: string]: string } = {
    'textbooks': 'Textbooks',
    'electronics': 'Electronics',
    'dorm-essentials': 'Dorm Essentials',
    'accessories': 'Accessories',
};

export default function BrowseCategoryPage({ params }: BrowseCategoryPageProps) {
    // Next.js 15+: params may be a Promise, unwrap with use()
    // See: https://nextjs.org/docs/messages/app-dir-client-component-params-promise
            const usableParams = typeof params === 'object' && params !== null && typeof (params as unknown as { then?: unknown }).then === 'function'
                ? reactUse(params as unknown as Promise<{ category: string }>)
                : params;
        const { category } = usableParams;
    const { toast } = useToast();
    const categoryDisplayName = categoryDisplayNameMap[category] || decodeURIComponent(category).replace(/-/g, ' ');

    const [searchQuery, setSearchQuery] = useState("");
    const [listings, setListings] = useState<ListingWithImages[]>([]);
    const [filteredListings, setFilteredListings] = useState<ListingWithImages[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategoryListings = async () => {
            try {
                const { data, error } = await ListingsService.getListingsByCategory(category);
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
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "An unexpected error occurred.",
                });
            } finally {
                setLoading(false);
            }
        };

        loadCategoryListings();
    }, [category, toast]);

    useEffect(() => {
        const results = listings
            .filter((listing) => listing.status !== 'sold')
            .filter((listing) =>
                listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (listing.description && listing.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        setFilteredListings(results);
    }, [searchQuery, listings]);

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
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight font-headline capitalize">
                            Browse {categoryDisplayName}
                        </h1>
                        <p className="text-muted-foreground">
                            Find great deals on {categoryDisplayName.toLowerCase()} from students near you.
                        </p>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-lg border mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder={`Search for ${categoryDisplayName.toLowerCase()}...`} 
                            className="pl-10 text-lg py-6" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {listings.length === 0 ? (
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>No Listings Found</AlertTitle>
                                    <AlertDescription>
                                        There are currently no listings in the {categoryDisplayName} category.
                                        <Button variant="link" asChild className="p-1 h-auto"><Link href="/">Browse all items</Link></Button>
                                    </AlertDescription>
                    </Alert>
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
                                Your search for {searchQuery} did not match any listings in this category.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
