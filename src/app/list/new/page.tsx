"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Wand2, Loader2, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { ListingsService } from "@/lib/listings-service";
import { Label } from "@/components/ui/label";

const listingFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  price: z.coerce.number().positive("Price must be a positive number."),
  category_id: z.string().min(1, "Please select a category."),
  condition: z.enum(["like-new", "good", "fair"]),
  status: z.enum(["available", "negotiating", "sold"]),
  location: z.string().min(3, "Location is required."),
  images: z.custom<File[]>().refine((files) => files.length > 0, 'At least one image is required.'),
  collection_id: z.string().optional(),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NewListingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [generatingDetails, setGeneratingDetails] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<{ id: string; title: string }[]>([]);
  const [createNewCollection, setCreateNewCollection] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      condition: "good",
      status: "available",
      images: [],
      location: "",
      collection_id: "",
    },
  });

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      console.log('Loading categories...');
      const { data, error } = await ListingsService.getCategories();
      if (error) {
        console.error('Categories error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories. Please refresh the page.",
        });
      } else if (data) {
        console.log('Categories loaded:', data);
        setCategories(data);
      } else {
        console.log('No categories data returned');
        setCategories([]);
      }
    };
    loadCategories();
    // Load user's collections
    (async () => {
      if (!user) return;
      const { data, error } = await ListingsService.getUserCollections(user.id);
      if (!error && data) setCollections(data.map(c => ({ id: c.id, title: c.title })));
    })();
  }, [toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const currentFiles = form.getValues("images");
    const newFiles = [...currentFiles, ...files].slice(0, 3);

    form.setValue("images", newFiles, { shouldValidate: true });

    const newPreviews: Promise<string>[] = [];
    for (const file of newFiles) {
        if (file) {
            newPreviews.push(readFileAsDataURL(file));
        }
    }
    
    Promise.all(newPreviews).then(previews => {
        setImagePreviews(previews);
    });
  };

  const removeImage = (index: number) => {
    const currentFiles = form.getValues("images");
    const newFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue("images", newFiles, { shouldValidate: true });
    
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const handleGenerateDetails = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    
    if (!title || !description) {
      toast({ 
        variant: "destructive", 
        title: "Input Required", 
        description: "Please enter both a title and description first to generate AI suggestions." 
      });
      return;
    }

    setGeneratingDetails(true);
    try {
      // Convert images to base64 data URIs
      const imageFiles = form.getValues("images");
      const imageDataUris = await Promise.all(
        imageFiles.map(file => file ? readFileAsDataURL(file) : Promise.resolve(""))
      ).then(uris => uris.filter(Boolean));

      const response = await fetch('/api/ai/generate-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          images: imageDataUris,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI content');
      }

      const result = await response.json();
      
      console.log('AI Response:', result);
      console.log('Current form values before update:', form.getValues());
      
      // Update form with AI suggestions
      form.setValue("title", result.suggestedTitle);
      form.setValue("description", result.suggestedDescription);
      
      // Force a re-render
      setForceUpdate(prev => prev + 1);
      
      console.log('Form values after update:', form.getValues());
      
      toast({
        title: "AI Suggestions Generated!",
        description: "Your listing has been enhanced with AI-generated content.",
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({ 
        variant: "destructive", 
        title: "AI Generation Failed", 
        description: "Failed to generate AI suggestions. Please try again." 
      });
    } finally {
      setGeneratingDetails(false);
    }
  };

  async function onSubmit(data: ListingFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to create a listing.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await ListingsService.createListing({
        title: data.title,
        description: data.description,
        price: data.price,
        currency: "AED",
        condition: data.condition,
        status: data.status,
        category_id: data.category_id,
        location: data.location,
        images: data.images,
        collection_id: createNewCollection ? undefined : (form.watch('collection_id') || null),
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error Creating Listing",
          description: error.message || "Failed to create listing. Please try again.",
        });
      } else {
        toast({
          title: "Listing Created!",
          description: "Your item has been successfully listed for sale.",
        });
        router.push("/my-listings");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Please Login</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to post a new listing.</p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
       <div className="flex-1 space-y-8 p-4 md:p-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Post a New Listing</h1>
          <p className="text-muted-foreground">Fill in the details below to sell your item.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Listing Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title / Item Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 'Introduction to Algorithms, 3rd Edition'" 
                              value={form.watch('title')} 
                              onChange={(e) => form.setValue('title', e.target.value)}
                              key={forceUpdate}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the item's condition, features, and any other relevant details." 
                              value={form.watch('description')} 
                              onChange={(e) => form.setValue('description', e.target.value)}
                              rows={5} 
                              key={forceUpdate}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" onClick={handleGenerateDetails} disabled={generatingDetails}>
                      {generatingDetails ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                      Generate with AI
                    </Button>
                  </CardContent>
                </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Collection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormItem>
                    <FormLabel>Select a Collection</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value === '__new__') {
                          setCreateNewCollection(true);
                          form.setValue('collection_id', '');
                        } else if (value === 'none') {
                          setCreateNewCollection(false);
                          form.setValue('collection_id', '');
                        } else {
                          setCreateNewCollection(false);
                          form.setValue('collection_id', value);
                        }
                      }}
                      value={form.watch('collection_id') || (createNewCollection ? '__new__' : 'none')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {collections.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                        <SelectItem value="__new__">Create New Collection…</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>

                  {createNewCollection && (
                    <div className="space-y-3">
                      <div>
                        <FormLabel>New Collection Title</FormLabel>
                        <Input value={newCollectionTitle} onChange={(e) => setNewCollectionTitle(e.target.value)} placeholder="e.g., I'm moving out!" />
                      </div>
                      <div>
                        <FormLabel>Description (optional)</FormLabel>
                        <Textarea value={newCollectionDescription} onChange={(e) => setNewCollectionDescription(e.target.value)} placeholder="Describe what's in this collection." rows={3} />
                      </div>
                      <div>
                        <Button
                          type="button"
                          onClick={async () => {
                            if (!newCollectionTitle.trim()) return;
                            const { data, error } = await ListingsService.createCollection(newCollectionTitle.trim(), newCollectionDescription.trim() || undefined);
                            if (!error && data) {
                              setCollections((prev) => [{ id: data.id, title: data.title }, ...prev]);
                              setCreateNewCollection(false);
                              setNewCollectionTitle('');
                              setNewCollectionDescription('');
                              form.setValue('collection_id', data.id);
                            }
                          }}
                        >
                          Create Collection
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center justify-center w-full">
                              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <ImageIcon className="w-8 h-8 mb-4 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 3 images)</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} disabled={form.getValues("images").length >= 3} />
                              </label>
                            </div>
                          </FormControl>
                           {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mt-4">
                        {imagePreviews.map((src, index) => (
                          <div key={index} className="relative group">
                            <Image src={src} alt={`upload preview ${index}`} width={150} height={150} className="rounded-md object-cover w-full h-24" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <div className="flex items-center">
                            <Input type="number" placeholder="100" {...field} className="rounded-r-none" />
                            <Select defaultValue="AED" disabled>
                              <SelectTrigger className="w-[100px] rounded-l-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AED">AED</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="like-new">Like-New</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="negotiating">Being Negotiated</SelectItem>
                              <SelectItem value="sold">Sold</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exchange Location</FormLabel>
                          <FormControl><Input placeholder="e.g., University Campus" {...field} /></FormControl>
                          <FormDescription>
                            General area for pickup.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                form.reset();
                setImagePreviews([]);
              }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Listing
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
