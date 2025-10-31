"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Trash2, User, Edit3, MessageCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface ListingCardProps {
  listing: Listing;
  showDelete?: boolean;
  showEdit?: boolean;
  showStatus?: boolean;
  onDelete?: (id: string) => void;
  onEditStatus?: (listingId: string) => void;
}

const conditionVariantMap: { [key in Listing['condition']]: "default" | "secondary" | "outline" } = {
  "like-new": "default",
  "good": "outline",
  "fair": "outline",
};

const conditionTextMap: { [key in Listing['condition']]: string } = {
    "like-new": "New",
    "good": "Good",
    "fair": "Fair",
};

const statusConfig = {
  available: {
    label: 'Available',
    variant: 'default' as const,
    color: 'text-green-600'
  },
  negotiating: {
    label: 'Being Negotiated',
    variant: 'secondary' as const,
    color: 'text-yellow-600'
  },
  sold: {
    label: 'Sold',
    variant: 'outline' as const,
    color: 'text-blue-600'
  }
};

export function ListingCard({
  listing,
  showDelete = false,
  showEdit = false,
  showStatus = true,
  onDelete,
  onEditStatus,
}: ListingCardProps) {
  // toast not used here; keep hook for future notifications
  useToast();
  const router = useRouter();

  const handleDelete = () => {
    if (onDelete) {
      onDelete(listing.id);
    }
  };

  const handleCardClick = () => {
    router.push(`/listings/${listing.id}`);
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking username
    router.push(`/users/${listing.userId}`);
  };

  const hasImages = listing.imageUrls && listing.imageUrls.length > 0;
  const firstImage = hasImages ? listing.imageUrls[0] : '/placeholder-image.svg';

  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 relative">
        <Image
          src={firstImage}
          alt={listing.title}
          width={600}
          height={400}
          data-ai-hint="book cover"
          className="aspect-video w-full object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.svg';
          }}
        />
        <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant={conditionVariantMap[listing.condition]} className="text-xs">
            {conditionTextMap[listing.condition]}
            </Badge>
            {showStatus && listing.status && (
              <Badge variant={statusConfig[listing.status as keyof typeof statusConfig]?.variant || "outline"} className="text-xs">
                {statusConfig[listing.status as keyof typeof statusConfig]?.label || listing.status}
              </Badge>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        {listing.collectionTitle && listing.collectionId && (
          <div className="mb-2 text-xs text-muted-foreground">
            Part of: <Link href={`/collections/${listing.collectionId}`} className="underline hover:text-primary">{listing.collectionTitle}</Link>
          </div>
        )}
        <CardTitle className="text-lg font-headline mb-2 leading-tight">
          {listing.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {listing.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 pt-0">
        <div className="w-full flex justify-between items-center mb-4">
            <p className="text-2xl font-bold text-primary">
                {listing.price} <span className="text-sm font-medium">{listing.currency}</span>
            </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-2 w-full">
            <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <button 
                  onClick={handleUsernameClick}
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {listing.username}
                </button>
            </div>
             <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>{listing.userEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{listing.userPhone}</span>
              {listing.userPhone && (
                <a
                  href={`https://wa.me/${String(listing.userPhone).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 text-green-600 hover:text-green-700 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Contact via WhatsApp"
                >
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp
                </a>
              )}
            </div>
        </div>
        
        {showEdit && (
          <Button 
            variant="outline" 
            className="w-full mb-2"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/list/edit/${listing.id}`);
            }}
          >
            <Edit3 className="mr-2 h-4 w-4" /> Edit Listing
          </Button>
        )}
        
        {onEditStatus && (
          <Button 
            variant="outline" 
            className="w-full mb-2"
            onClick={(e) => {
              e.stopPropagation();
              onEditStatus(listing.id);
            }}
          >
            <Edit3 className="mr-2 h-4 w-4" /> Edit Status
          </Button>
        )}
        
        {showDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full mt-4"
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking delete
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  listing for {listing.title}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
