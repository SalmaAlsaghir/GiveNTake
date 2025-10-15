"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { ListingsService } from "@/lib/listings-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2, Folder } from "lucide-react";

export default function CollectionsListPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      const { data } = await ListingsService.getAllCollections();
      if (mounted) {
        setCollections(data || []);
        setLoading(false);
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Reload collections when the tab regains focus (without showing loading state)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        // Reload data in background without setting loading state
        (async () => {
          const { data } = await ListingsService.getAllCollections();
          setCollections(data || []);
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
        <section className="bg-gradient-to-br from-secondary/40 to-accent/30 rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-extrabold font-headline text-secondary mb-4 drop-shadow-lg">
              Explore Collections
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground mb-6 font-semibold">
              Discover themed groups of listings curated by students. Find your next dorm essential, textbook, or gadget!
            </p>
            <div className="flex gap-4">
              <a href="/list/new" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition-transform">Post a Listing</a>
            </div>
          </div>
          <div className="hidden md:block flex-1 text-center">
            <img src="/collections-hero.svg" alt="Collections Vibe" className="w-72 mx-auto drop-shadow-xl rounded-2xl" />
          </div>
        </section>

        {collections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collections.map((c) => (
              <Link key={c.id} href={`/collections/${c.id}`} className="block">
                <Card className="hover:scale-[1.03] transition-transform bg-gradient-to-br from-accent/30 to-white shadow-md">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{c.description || "No description provided."}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground">No collections found.</div>
        )}
      </div>
    </AppLayout>
  );
}


