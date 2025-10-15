# **App Name**: GiveNTake

## Core Features:

- User Authentication: User signup and login with Firebase Authentication. Authentication context to manage user sessions and loading states, username and phone will be validated against the user's UID.
- Post a Listing: Post a listing page where users can fill title, description, multiple image uploads, price (with a currency selector defaulting to AED), condition, and location.
- Browse Listings: Display listings in a grid using ListingCard components.
- My Listings: Show a list of the user's listings, and enable deletion of the listings. Each card should show a "Delete" button.
- Listing Card: A card component that displays the item's primary image, title, price, condition, and seller's public contact information (username, userEmail, userPhone) with a prompt to contact them.
- AI Generate Listing Details: Genkit tool that will take a textbookName, a shortDescription, and an array of image data URIs as inputs and returns an AI-generated suggestedTitle and suggestedDescription. The flow has a button to initiate the process.
- AI Generate Safety Tips: Genkit tool to return tailored safety tips and suggested locations, when given an item description and location.

## Style Guidelines:

- Primary color: Dark blue (#3A72EB) for a reliable and trustworthy feel.
- Background color: Off-white (#F9FAFB) to provide a clean and modern backdrop.
- Accent color: Baby blue (#87CEEB) to highlight key elements and add a touch of vibrancy.
- Body and headline font: 'PT Sans' (sans-serif) for clear and accessible readability throughout the application.
- Main layout with a collapsible sidebar for navigation and a main content area. Cards to have rounded corners (radius: 0.5rem) and subtle shadows.
- lucide-react icons for a simple aesthetic.
- Subtle transitions and animations on button clicks and form submissions to enhance user experience.