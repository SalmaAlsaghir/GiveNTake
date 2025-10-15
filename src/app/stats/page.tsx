"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, List, Folder, BarChart2, TrendingUp, Heart } from "lucide-react";
import { ListingsService } from "@/lib/listings-service";
import { supabase } from "@/lib/supabaseClient";

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    profiles: 0,
    listings: 0,
    collections: 0,
    categories: 0,
    wishlistItems: 0,
  });

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      // Get profiles count
      const { count: profilesCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      // Get listings count
      const { count: listingsCount } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true });
      // Get collections count
      const { count: collectionsCount } = await supabase
        .from("collections")
        .select("id", { count: "exact", head: true });
      // Get categories count
      const { count: categoriesCount } = await supabase
        .from("categories")
        .select("id", { count: "exact", head: true });
      // Get wishlist items count
      const { count: wishlistCount } = await supabase
        .from("wishlist")
        .select("id", { count: "exact", head: true });
      if (mounted) {
        setStats({
          profiles: profilesCount ?? 0,
          listings: listingsCount ?? 0,
          collections: collectionsCount ?? 0,
          categories: categoriesCount ?? 0,
          wishlistItems: wishlistCount ?? 0,
        });
        setLoading(false);
      }
    }
    fetchStats();
    return () => { mounted = false; };
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

  // Simple chart data for interactivity
  const chartData = [
    { label: "Profiles", value: stats.profiles, color: "#6366f1" },
    { label: "Listings", value: stats.listings, color: "#22d3ee" },
    { label: "Collections", value: stats.collections, color: "#f59e42" },
    { label: "Wishlist", value: stats.wishlistItems, color: "#ec4899" },
    { label: "Categories", value: stats.categories, color: "#10b981" },
  ];

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight font-headline">Platform Statistics</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-gradient-to-br from-indigo-100 to-white shadow-md hover:scale-[1.03] transition-transform">
            <CardHeader className="flex flex-row items-center gap-2">
              <Users className="h-6 w-6 text-indigo-500" />
              <CardTitle>Profiles</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold flex items-center gap-2">
              {stats.profiles}
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-100 to-white shadow-md hover:scale-[1.03] transition-transform">
            <CardHeader className="flex flex-row items-center gap-2">
              <List className="h-6 w-6 text-cyan-500" />
              <CardTitle>Listings</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold flex items-center gap-2">
              {stats.listings}
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-100 to-white shadow-md hover:scale-[1.03] transition-transform">
            <CardHeader className="flex flex-row items-center gap-2">
              <Folder className="h-6 w-6 text-orange-500" />
              <CardTitle>Collections</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold flex items-center gap-2">
              {stats.collections}
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-100 to-white shadow-md hover:scale-[1.03] transition-transform">
            <CardHeader className="flex flex-row items-center gap-2">
              <Heart className="h-6 w-6 text-pink-500" />
              <CardTitle>Wishlist Items</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold flex items-center gap-2">
              {stats.wishlistItems}
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-100 to-white shadow-md hover:scale-[1.03] transition-transform">
            <CardHeader className="flex flex-row items-center gap-2">
              <BarChart2 className="h-6 w-6 text-emerald-500" />
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold flex items-center gap-2">
              {stats.categories}
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardContent>
          </Card>
        </div>
        {/* Simple interactive chart */}
        <div className="mt-10 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            Platform Overview
          </h2>
          <div className="flex items-end gap-6 h-40">
            {chartData.map((item) => (
              <div key={item.label} className="flex flex-col items-center w-20">
                <div
                  className="rounded-t-lg"
                  style={{
                    height: `${Math.max(item.value, 1) * 2}px`,
                    background: item.color,
                    width: "100%",
                    transition: "height 0.4s",
                  }}
                  title={item.value.toString()}
                />
                <span className="mt-2 text-sm font-semibold text-muted-foreground">{item.label}</span>
                <span className="text-lg font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
