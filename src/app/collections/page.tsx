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
    (async () => {
      const { data } = await ListingsService.getAllCollections();
      setCollections(data || []);
      setLoading(false);
    })();
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        setLoading(true);
        (async () => {
          const { data } = await ListingsService.getAllCollections();
          setCollections(data || []);
          setLoading(false);
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
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Collections</h1>
          <p className="text-muted-foreground">Browse public collections from all users.</p>
        </div>

        {collections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collections.map((c) => (
              <Link key={c.id} href={`/collections/${c.id}`} className="block">
                <Card className="hover:shadow-md transition-shadow">
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


