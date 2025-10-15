"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { ListingsService } from "@/lib/listings-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listing-card";
import { Loader2, ArrowLeft } from "lucide-react";

type Collection = {
  id: string;
  title?: string;
  description?: string | null;
};

export default function CollectionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: col }, { data: items }] = await Promise.all([
          ListingsService.getCollectionById(id as string),
          ListingsService.getListingsByCollection(id as string),
        ]);
        setCollection(col || null);
        setListings(items || []);
      } catch (e: unknown) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!collection) {
    return (
      <AppLayout>
        <div className="p-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>Collection not found.</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-headline">{collection.title}</h1>
            {collection.description && (
              <p className="text-muted-foreground">{collection.description}</p>
            )}
          </div>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{
                  id: listing.id,
                  title: listing.title,
                  description: listing.description || "",
                  price: listing.price,
                  currency: listing.currency,
                  condition: listing.condition,
                  category: listing.categories?.name || "",
                  imageUrls: (listing.listing_images || []).map((img: any) => img.image_url),
                  userId: listing.user_id,
                  username: listing.profiles?.username || "",
                  userEmail: listing.profiles?.email || "",
                  userPhone: listing.profiles?.phone_number || "",
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
          <Card>
            <CardHeader>
              <CardTitle>No Items</CardTitle>
            </CardHeader>
            <CardContent>This collection has no items yet.</CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}


