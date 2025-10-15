"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, User, MapPin, Calendar, Tag } from "lucide-react";
import { ListingsService } from "@/lib/listings-service";
import type { ListingWithImages } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Loader2, X, Edit3 } from "lucide-react";
import Image from "next/image";

const conditionTextMap: { [key: string]: string } = {
  "like-new": "Like-New",
  "good": "Good",
  "fair": "Fair",
};

const conditionVariantMap: { [key: string]: "default" | "secondary" | "outline" } = {
  "like-new": "default",
  "good": "outline",
  "fair": "outline",
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!listing) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => (prev + 1) % listing.listing_images.length);
      }
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev - 1 + listing.listing_images.length) % listing.listing_images.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, listing]);

  const listingId = params.id as string;

  useEffect(() => {
    const loadListing = async () => {
      if (!listingId) return;

      try {
        const { data, error } = await ListingsService.getListingById(listingId);
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load listing details.",
          });
          router.push("/");
        } else if (data) {
          setListing(data);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred.",
        });
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [listingId, toast, router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!listing) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
          <p className="text-muted-foreground mb-4">The listing you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  const images = listing.listing_images.map(img => img.image_url);
  const hasImages = images.length > 0;

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images Section */}
          <div className="space-y-4">
            {hasImages ? (
              <>
                {/* Main Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border" onClick={() => setLightboxOpen(true)}>
                  <Image
                    src={images[selectedImageIndex]}
                    alt={`${listing.title} - Image ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Thumbnail Grid */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                          index === selectedImageIndex
                            ? "border-primary"
                            : "border-muted hover:border-muted-foreground"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${listing.title} - Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square w-full rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">No images available</p>
              </div>
            )}
          </div>

          {/* Lightbox Overlay */}
          {lightboxOpen && (
            <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
              <button
                className="self-end m-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close image viewer"
              >
                <X className="h-6 w-6 text-white" />
              </button>
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="relative w-full max-w-5xl aspect-video">
                  <Image src={images[selectedImageIndex]} alt={listing.title} fill className="object-contain" />
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-4 bg-black/70">
                  <div className="mx-auto max-w-5xl grid grid-cols-5 md:grid-cols-8 gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                          idx === selectedImageIndex ? 'border-white' : 'border-white/30 hover:border-white/60'
                        }`}
                      >
                        <Image src={img} alt={`${listing.title} thumbnail ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-primary">
                  {listing.price} <span className="text-lg font-medium">{listing.currency}</span>
                </p>
                <Badge variant={conditionVariantMap[listing.condition] || "outline"}>
                  {conditionTextMap[listing.condition] || listing.condition}
                </Badge>
                {listing.status && (
                  <Badge variant={listing.status === 'available' ? 'default' : listing.status === 'negotiating' ? 'secondary' : 'outline'}>
                    {listing.status === 'available' ? 'Available' : listing.status === 'negotiating' ? 'Being Negotiated' : 'Sold'}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            {listing.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Category and Location */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="font-medium">{listing.categories.name}</span>
              </div>
              
              {listing.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="font-medium">{listing.location}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Username:</span>
                  <span className="font-medium">{listing.profiles.username}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-medium">{listing.profiles.email}</span>
                </div>
                
                {listing.profiles.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <span className="font-medium">{listing.profiles.phone_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Posted Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Posted on {new Date(listing.created_at).toLocaleDateString()}</span>
            </div>

            {/* Edit Button for Owner */}
            {user && listing.user_id === user.id && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => router.push(`/list/edit/${listing.id}`)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Listing
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
