"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, Plus, Loader2, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { WishlistService } from "@/lib/wishlist-service";
import { useToast } from "@/hooks/use-toast";

export default function MyWishlistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadItems = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await WishlistService.getUserWishlistItems(user.id);
      if (mounted) {
        if (data) setItems(data);
        setLoading(false);
      }
    };

    loadItems();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        loadItems();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const { error } = await WishlistService.deleteWishlistItem(itemToDelete);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete wishlist item.",
      });
    } else {
      setItems(items.filter((item) => item.id !== itemToDelete));
      toast({
        title: "Deleted",
        description: "Wishlist item removed successfully.",
      });
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleMarkFulfilled = async (itemId: string) => {
    const { error } = await WishlistService.markAsFulfilled(itemId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update wishlist item.",
      });
    } else {
      setItems(items.map((item) => (item.id === itemId ? { ...item, is_active: false } : item)));
      toast({
        title: "Success!",
        description: "Item marked as fulfilled.",
      });
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">You need to be logged in to view your wishlist.</p>
              <Button asChild className="w-full">
                <a href="/login">Go to Login</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-extrabold font-headline text-primary mb-4 drop-shadow-lg flex items-center gap-3">
                <Heart className="h-10 w-10" />
                My Wishlist
              </h1>
              <p className="text-lg text-muted-foreground font-semibold">
                Manage items you're looking for
              </p>
            </div>
            <Button asChild size="lg" className="shadow-lg">
              <a href="/wishlist/new">
                <Plus className="mr-2 h-5 w-5" />
                Add New Item
              </a>
            </Button>
          </div>
        </section>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Wishlist Items Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start by posting items you're looking for!
              </p>
              <Button asChild>
                <a href="/wishlist/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Item
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className={`shadow-md hover:shadow-lg transition-shadow ${!item.is_active ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    {!item.is_active && (
                      <Badge variant="secondary" className="ml-2">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Fulfilled
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {item.categories?.name && (
                      <Badge variant="outline">{item.categories.name}</Badge>
                    )}
                    {item.condition && (
                      <Badge variant="secondary">{item.condition}</Badge>
                    )}
                  </div>

                  {item.budget && (
                    <p className="text-sm font-semibold">
                      Budget: {item.currency} {item.budget}
                    </p>
                  )}

                  {item.location && (
                    <p className="text-sm text-muted-foreground">📍 {item.location}</p>
                  )}

                  <div className="flex gap-2 pt-4">
                    {item.is_active && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkFulfilled(item.id)}
                          className="flex-1"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Mark Fulfilled
                        </Button>
                      </>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setItemToDelete(item.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this wishlist item. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
