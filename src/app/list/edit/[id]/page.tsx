"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
import { Loader2, Image as ImageIcon, X, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { ListingsService, UpdateListingWithImagesData } from "@/lib/listings-service";
import { Label } from "@/components/ui/label";

const listingFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  price: z.coerce.number().positive("Price must be a positive number."),
  category_id: z.string().min(1, "Please select a category."),
  condition: z.enum(["like-new", "good", "fair"]),
  location: z.string().min(3, "Location is required."),
  images: z.custom<File[]>().optional(),
  collection_id: z.string().optional(),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

export default function EditListingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<{ id: string; title: string }[]>([]);
  const [createNewCollection, setCreateNewCollection] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [listing, setListing] = useState<any>(null);
  
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      condition: "good",
      images: undefined,
      location: "",
      collection_id: "",
    },
  });

  // Load listing data and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user || !listingId) {
        setLoading(false);
        return;
      }

      try {
        // Load categories
        const { data: categoriesData, error: categoriesError } = await ListingsService.getCategories();
        if (categoriesError) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load categories. Please refresh the page.",
          });
        } else if (categoriesData) {
          setCategories(categoriesData);
        }

        // Load user's collections
        const { data: collectionsData, error: collectionsError } = await ListingsService.getUserCollections(user.id);
        if (!collectionsError && collectionsData) {
          setCollections(collectionsData.map(c => ({ id: c.id, title: c.title })));
        }

        // Load listing data
        const { data: listingData, error: listingError } = await ListingsService.getListingById(listingId);
        if (listingError) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load listing data.",
          });
          router.push("/my-listings");
          return;
        }

        if (listingData) {
          // Check if user owns this listing
          if (listingData.user_id !== user.id) {
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "You can only edit your own listings.",
            });
            router.push("/my-listings");
            return;
          }

          setListing(listingData);
          
          // Set form values
          form.reset({
            title: listingData.title,
            description: listingData.description || "",
            price: listingData.price,
            category_id: listingData.category_id,
            condition: listingData.condition,
            location: listingData.location || "",
            images: undefined,
            collection_id: listingData.collection_id || "",
          });
          
          // Set existing images
          if (listingData.listing_images && listingData.listing_images.length > 0) {
            const imageUrls = listingData.listing_images.map((img: any) => img.image_url);
            setExistingImages(imageUrls);
            setImagePreviews(imageUrls);
          }
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

    loadData();
  }, [user, listingId, toast, router, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImages = form.getValues("images") || [];
    const totalImages = existingImages.length + currentImages.length;
    const newFiles = files.slice(0, 3 - totalImages); // Limit to 3 total images
    
    if (newFiles.length > 0) {
      form.setValue("images", [...currentImages, ...newFiles]);
      
      // Create previews for new images
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("images", newImages);
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const imageToRemove = existingImages[index];
    setRemovedImages(prev => [...prev, imageToRemove]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: ListingFormValues) {
    if (!user || !listingId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to edit a listing.",
      });
      return;
    }

    // Check if we have at least one image (either existing or new)
    const remainingExistingImages = existingImages.length;
    const newImagesCount = data.images ? data.images.length : 0;
    const hasImages = remainingExistingImages + newImagesCount > 0;
    
    if (!hasImages) {
      toast({
        variant: "destructive",
        title: "Images Required",
        description: "At least one image is required.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get new images from form
      const newImages = data.images || [];
      
      const { error } = await ListingsService.updateListingWithImages(listingId, {
        title: data.title,
        description: data.description,
        price: data.price,
        currency: "AED", // Default currency
        condition: data.condition,
        category_id: data.category_id,
        location: data.location,
        collection_id: createNewCollection ? undefined : (form.getValues('collection_id') || null),
        newImages: newImages,
        removedImageUrls: removedImages,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error Updating Listing",
          description: error.message || "Failed to update listing. Please try again.",
        });
      } else {
        const updateSummary = [];
        if (newImages.length > 0) updateSummary.push(`${newImages.length} new image(s) added`);
        if (removedImages.length > 0) updateSummary.push(`${removedImages.length} image(s) removed`);
        if (updateSummary.length > 0) {
          updateSummary.push("listing details updated");
        } else {
          updateSummary.push("listing updated");
        }
        
        toast({
          title: "Listing Updated!",
          description: `Your item has been successfully updated. ${updateSummary.join(", ")}.`,
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
          <p className="text-muted-foreground mb-4">You need to be logged in to edit a listing.</p>
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
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-headline">Edit Listing</h1>
            <p className="text-muted-foreground">
              Update your listing details below.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter item title" {...field} />
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
                              placeholder="Describe your item in detail..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                          <Input value={newCollectionTitle ?? ""} onChange={(e) => setNewCollectionTitle(e.target.value)} placeholder="e.g., I'm moving out!" />
                        </div>
                        <div>
                          <FormLabel>Description (optional)</FormLabel>
                          <Textarea value={newCollectionDescription ?? ""} onChange={(e) => setNewCollectionDescription(e.target.value)} placeholder="Describe what's in this collection." rows={3} />
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
                    <CardTitle>Images</CardTitle>
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
                                  <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 2 images total)</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} disabled={imagePreviews.length >= 2} />
                                <p className="text-xs text-muted-foreground mt-2">
                                  You have {existingImages.length} existing image(s) and {form.getValues("images")?.length || 0} new image(s). 
                                  You can add up to {2 - imagePreviews.length} more.
                                </p>
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
                              onClick={() => index < existingImages.length ? removeExistingImage(index) : removeImage(index - existingImages.length)}
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
                          <Select onValueChange={field.onChange} value={field.value}>
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

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Listing"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
