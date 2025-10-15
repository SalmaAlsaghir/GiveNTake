"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { ListingCard } from "@/components/listing-card";
import { useAuth } from "@/context/auth-context";
import type { ListingWithImages } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePlus, Loader2, Edit3 } from "lucide-react";
import { ListingsService } from "@/lib/listings-service";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function MyListingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myListings, setMyListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState<{ listingId: string; newStatus: string } | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    const loadMyListings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await ListingsService.getUserListings(user.id);
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load your listings.",
          });
        } else if (data) {
          setMyListings(data);
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

    loadMyListings();
  }, [user, toast]);

  const handleDelete = async (id: string) => {
    try {
      // Hard delete from database as requested
      const { error } = await ListingsService.hardDeleteListing(id);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete listing.",
        });
      } else {
        setMyListings((prev) => prev.filter((listing) => listing.id !== id));
        toast({
          title: "Listing Deleted",
          description: "Your listing has been removed.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  const handleStatusUpdate = async () => {
    if (!editingStatus) return;

    setStatusUpdateLoading(true);
    try {
      const { error } = await ListingsService.updateListingStatus(
        editingStatus.listingId,
        editingStatus.newStatus
      );

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update listing status.",
        });
      } else {
        // Update the local state
        setMyListings((prev) =>
          prev.map((listing) =>
            listing.id === editingStatus.listingId
              ? { ...listing, status: editingStatus.newStatus }
              : listing
          )
        );

        toast({
          title: "Status Updated",
          description: "Listing status has been updated successfully.",
        });

        setEditingStatus(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  if (!user) {
    return (
        <AppLayout>
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">You need to be logged in to view your listings.</p>
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        </AppLayout>
    );
  }

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
            <h1 className="text-4xl font-bold tracking-tight font-headline">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your posted items here.
            </p>
          </div>
        </div>

        {myListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myListings.map((listing) => (
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
                  status: listing.status as any,
                  collectionId: (listing as any).collections?.id,
                  collectionTitle: (listing as any).collections?.title,
                }}
                showDelete
                showEdit
                showStatus
                onDelete={handleDelete}
                onEditStatus={(listingId) => setEditingStatus({ listingId, newStatus: '' })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 h-96 text-center p-8">
            <h3 className="text-2xl font-bold tracking-tight">
              You haven't posted any items yet.
            </h3>
            <p className="text-muted-foreground mb-6">
              Click the button below to create your first listing!
            </p>
            <Button size="lg" asChild>
              <Link href="/list/new"><FilePlus className="mr-2 h-5 w-5" /> Post a Listing</Link>
            </Button>
          </div>
        )}

        {/* Status Edit Dialog */}
        <Dialog open={!!editingStatus} onOpenChange={() => setEditingStatus(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Listing Status</DialogTitle>
              <DialogDescription>
                Change the status of your listing to reflect its current state.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingStatus?.newStatus || ''}
                  onValueChange={(value) =>
                    setEditingStatus(prev => prev ? { ...prev, newStatus: value } : null)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="negotiating">Being Negotiated</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingStatus(null)}
                disabled={statusUpdateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={statusUpdateLoading || !editingStatus?.newStatus}
              >
                {statusUpdateLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Edit3 className="mr-2 h-4 w-4" />
                )}
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
