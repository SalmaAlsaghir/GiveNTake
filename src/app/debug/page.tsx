"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingsService } from "@/lib/listings-service";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export default function DebugPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});

  const testCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await ListingsService.getCategories();
      setResults((prev: any) => ({ ...prev, categories: { data, error } }));
      if (error) {
        toast({
          variant: "destructive",
          title: "Categories Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Categories Success",
          description: `Found ${data?.length || 0} categories`,
        });
      }
    } catch (error) {
      setResults((prev: any) => ({ ...prev, categories: { data: null, error } }));
      toast({
        variant: "destructive",
        title: "Categories Exception",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await ListingsService.getAllListings();
      setResults((prev: any) => ({ ...prev, listings: { data, error } }));
      if (error) {
        toast({
          variant: "destructive",
          title: "Listings Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Listings Success",
          description: `Found ${data?.length || 0} listings`,
        });
      }
    } catch (error) {
      setResults((prev: any) => ({ ...prev, listings: { data: null, error } }));
      toast({
        variant: "destructive",
        title: "Listings Exception",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testStorage = async () => {
    setLoading(true);
    try {
      // Test storage bucket access
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('listing-images');
      
      if (bucketError) {
        setResults((prev: any) => ({ ...prev, storage: { error: bucketError } }));
        toast({
          variant: "destructive",
          title: "Storage Error",
          description: bucketError.message,
        });
      } else {
        setResults((prev: any) => ({ ...prev, storage: { data: bucketData } }));
        toast({
          title: "Storage Success",
          description: `Bucket '${bucketData.name}' is accessible`,
        });
      }
    } catch (error) {
      setResults((prev: any) => ({ ...prev, storage: { error } }));
      toast({
        variant: "destructive",
        title: "Storage Exception",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const listAllBuckets = async () => {
    setLoading(true);
    try {
      // List all available storage buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        setResults((prev: any) => ({ ...prev, allBuckets: { error: bucketsError } }));
        toast({
          variant: "destructive",
          title: "List Buckets Error",
          description: bucketsError.message,
        });
      } else {
        setResults((prev: any) => ({ ...prev, allBuckets: { data: buckets } }));
        toast({
          title: "List Buckets Success",
          description: `Found ${buckets?.length || 0} buckets`,
        });
      }
    } catch (error) {
      setResults((prev: any) => ({ ...prev, allBuckets: { error } }));
      toast({
        variant: "destructive",
        title: "List Buckets Exception",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testSimpleStorage = async () => {
    setLoading(true);
    try {
      // Test basic storage access with a simple operation
      const { data, error } = await supabase.storage.from('listing-images').list('', { limit: 1 });
      
      if (error) {
        setResults((prev: any) => ({ ...prev, simpleStorage: { error } }));
        toast({
          variant: "destructive",
          title: "Simple Storage Error",
          description: error.message,
        });
      } else {
        setResults((prev: any) => ({ ...prev, simpleStorage: { data } }));
        toast({
          title: "Simple Storage Success",
          description: "Basic storage access working",
        });
      }
    } catch (error) {
      setResults((prev: any) => ({ ...prev, simpleStorage: { error } }));
      toast({
        variant: "destructive",
        title: "Simple Storage Exception",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConfig = async () => {
    setLoading(true);
    try {
      // Test Supabase client configuration
      const config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Missing',
        hasClient: !!supabase
      };
      
      setResults((prev: any) => ({ ...prev, supabaseConfig: { data: config } }));
      toast({
        title: "Config Test Success",
        description: "Supabase configuration checked",
      });
    } catch (error) {
      setResults((prev: any) => ({ ...prev, supabaseConfig: { error } }));
      toast({
        variant: "destructive",
        title: "Config Test Error",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').limit(1);
      setResults((prev: any) => ({ ...prev, directSupabase: { data, error } }));
      if (error) {
        toast({
          variant: "destructive",
          title: "Direct Supabase Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Direct Supabase Success",
          description: "Direct connection working",
        });
      }
    } catch (error) {
      setResults((prev: any) => ({ ...prev, directSupabase: { data: null, error } }));
      toast({
        variant: "destructive",
        title: "Direct Supabase Exception",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testDeleteFunction = async () => {
    setLoading(true);
    try {
      // Test the delete function with a dummy ID to see what error we get
      const { data, error } = await ListingsService.deleteListing('test-id-123');
      setResults((prev: any) => ({ ...prev, deleteTest: { data, error } }));
      if (error) {
        toast({
          variant: "destructive",
          title: "Delete Test Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Delete Test Success",
          description: "Delete function working",
        });
      }
    } catch (error) {
      setResults((prev: any) => ({ ...prev, deleteTest: { data: null, error } }));
      toast({
        variant: "destructive",
        title: "Delete Test Exception",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Debug & Testing</h1>
          <p className="text-muted-foreground">
            Test various components and connections to diagnose issues.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
              </div>
              <div className="text-sm">
                <strong>SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
              </div>
              <div className="text-sm">
                <strong>GOOGLE_API_KEY:</strong> {process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? "✅ Set" : "❌ Missing"}
              </div>
              <div className="text-sm">
                <strong>GEMINI_API_KEY:</strong> {process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "✅ Set" : "❌ Missing"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Functions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testCategories} disabled={loading} className="w-full">
                Test Categories
              </Button>
              <Button onClick={testListings} disabled={loading} className="w-full">
                Test Listings
              </Button>
              <Button onClick={testStorage} disabled={loading} className="w-full">
                Test Storage
              </Button>
              <Button onClick={listAllBuckets} disabled={loading} className="w-full">
                List All Buckets
              </Button>
              <Button onClick={testSimpleStorage} disabled={loading} className="w-full">
                Test Simple Storage
              </Button>
              <Button onClick={testSupabaseConfig} disabled={loading} className="w-full">
                Test Supabase Config
              </Button>
              <Button onClick={testDirectSupabase} disabled={loading} className="w-full">
                Test Direct Supabase
              </Button>
              <Button onClick={testDeleteFunction} disabled={loading} className="w-full">
                Test Delete Function
              </Button>
            </CardContent>
          </Card>
        </div>

        {Object.keys(results).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
