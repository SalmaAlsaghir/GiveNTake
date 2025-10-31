# GiveNTake 🎓

**NYU Vibe Coding Hackathon 2025 - Launch Track**

A vibrant, student-friendly marketplace for NYU Abu Dhabi students. Buy, sell, and exchange items with fellow students, post wishlists for items you need, and organize your listings into collections. Built **entirely through AI-assisted development** using Next.js 15, Supabase, and AI-powered features.

> 🏆 **Built for Impact:** Solving real student needs through strategic AI prompting  
> 🤖 **AI-First Development:** GitHub Copilot + Google Gemini 2.0 Flash  
> ⚡ **Zero Manual Code:** All features created through prompt engineering

---

## 🌐 Live Demo

**🚀 [View Live Site](https://giventake3.me)**

> Built and deployed for NYU Vibe Coding Hackathon 2025 - Launch Track

---

## �🎯 Hackathon Highlights

- ✅ **Advanced AI Integration** - Image analysis, auto-generation, not just ChatGPT
- ✅ **Complete Feature Set** - Marketplace + Collections + Wishlist + Statistics
- ✅ **Production Ready** - Fully secure, optimized, deployable
- ✅ **Real Impact** - Addresses actual NYUAD student needs
- ✅ **Strategic Prompting** - Role-playing, chain-of-thought, iterative refinement

📄 **[View Hackathon Submission Package →](HACKATHON_SUBMISSION.md)**

---

## ✨ Features

### 🛍️ Marketplace
- 🔐 **Secure Authentication** - Sign up/login with Supabase
- 📝 **Listing Management** - Create, edit, and manage your listings
- 🖼️ **Multiple Images** - Upload up to 3 high-quality images per listing
- 🤖 **AI-Powered Generation** - Auto-generate titles, descriptions, and categories from images
- 🔍 **Smart Search** - Search and filter across all listings
- 📂 **Category Browsing** - Browse by Textbooks, Electronics, Dorm Essentials, Accessories
- 💬 **Status Tracking** - Track listings as Available, Negotiating, or Sold
- 📍 **Location-Based** - Show where items are located on campus

### ❤️ Wishlist (NEW!)
- � **Post Wanted Items** - Let others know what you're looking for
- 💰 **Budget Tracking** - Set your budget and preferred condition
- 📞 **Direct Contact** - Email or call people who have what you need
- ✅ **Fulfillment Status** - Mark items as found when completed

### 📚 Collections
- 🗂️ **Organize Listings** - Group related items into collections
- 🎨 **Custom Collections** - Create themed collections for easier browsing
- 🔗 **Quick Access** - Navigate between collection items seamlessly

### 📊 Platform Features
- 📈 **Statistics Dashboard** - View platform metrics including wishlist items
- 👥 **User Profiles** - View listings, collections, and wishlist per user
- 🛡️ **Safety Guidelines** - Learn how to transact safely
- 🎨 **Modern UI** - Beautiful, student-friendly design with vibrant colors
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works!)
- (Optional) Google AI API key for AI features

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/SalmaMansour23/GiveNTake.git
   cd GiveNTake
   npm install
   ```

2. **Set up Supabase Database**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run SQL from `SUPABASE_SETUP.md` in SQL Editor
   - Run SQL from `create_wishlist_table.sql` in SQL Editor
   - Get your API keys from Project Settings → API

3. **Configure Environment**
   
   Create `.env.local`:
   ```env
   # Required
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Optional (for AI features)
   NEXT_PUBLIC_GOOGLE_API_KEY=your-google-ai-key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) 🎉

📚 **For detailed setup**, see [QUICK_START.md](QUICK_START.md)

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run genkit:dev   # Start Genkit AI development server
```

## 🏗️ Project Structure

```
GiveNTake/
├── src/
│   ├── app/                      # Next.js app router pages
│   │   ├── page.tsx             # Homepage (browse)
│   │   ├── browse/              # Category browsing
│   │   ├── collections/         # Collections pages
│   │   ├── wishlist/            # Wishlist feature ⭐
│   │   ├── list/                # Create/edit listings
│   │   ├── listings/            # Listing detail pages
│   │   ├── my-listings/         # User's listings
│   │   ├── settings/            # User settings
│   │   ├── stats/               # Statistics dashboard
│   │   ├── safety/              # Transaction guidelines
│   │   └── api/                 # API routes
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── app-layout.tsx       # Main layout
│   │   └── listing-card.tsx     # Listing card component
│   ├── context/                 # React contexts
│   │   └── auth-context.tsx     # Authentication
│   ├── lib/                     # Services & utilities
│   │   ├── supabaseClient.ts
│   │   ├── listings-service.ts
│   │   ├── wishlist-service.ts  # Wishlist operations ⭐
│   │   └── types.ts
│   └── ai/                      # Genkit AI flows
│       └── flows/
├── public/                      # Static assets
├── docs/                        # Documentation
└── ...
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Custom Vibrant Theme
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Generative AI (Gemini via Genkit)
- **Form Validation**: Zod, React Hook Form
- **State Management**: React Context API
- **Icons**: Lucide React

## 🎨 Design System

**Student-Friendly Color Palette:**
- 💜 Primary Purple: `#8b5cf6` - Main brand color
- 🩵 Secondary Aqua: `#67e8f9` - Interactive elements  
- 💛 Accent Yellow: `#fbbf24` - Call-to-actions

**Features:**
- Hero sections with animated gradients
- Smooth transitions and hover effects
- Fully responsive mobile-first design
- Loading states and skeleton loaders
- Toast notifications for feedback

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes ⚡
- **[PLATFORM_COMPLETE_SUMMARY.md](PLATFORM_COMPLETE_SUMMARY.md)** - Complete feature list
- **[PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md)** - Deployment checklist
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Database setup guide
- **[WISHLIST_SETUP.md](WISHLIST_SETUP.md)** - Wishlist feature guide
- **[AI_IMPLEMENTATION_SUMMARY.md](AI_IMPLEMENTATION_SUMMARY.md)** - AI features
- **[docs/blueprint.md](docs/blueprint.md)** - Project architecture
 - **[RUBRIC_ALIGNMENT.md](RUBRIC_ALIGNMENT.md)** - Evidence mapped to scoring categories
 - **[ACCESSIBILITY.md](ACCESSIBILITY.md)** - Accessibility and UX considerations

## 🤖 LLM Usage & Disclosure

This project was built through AI-assisted development from a blank Next.js starter.

- LLMs Used: GitHub Copilot (GPT-4), Google Gemini 2.0 Flash
- Methodology: Role prompts, iterative refinement, acceptance criteria, testing notes
- Reproducibility: See `HACKATHON_PROMPTS.md` for conversation-style prompts and export examples
- Safety & Guardrails: No PII requested, input validation via Zod, RLS on DB, minimal scopes for env keys
- Manual Tweaks: Limited to environment configuration and prompt iteration; no hand-written feature code outside AI assistance

## 🔧 Database Schema

### Main Tables
- `profiles` - User profiles (username, email, phone)
- `categories` - Item categories  
- `listings` - Marketplace listings
- `listing_images` - Multiple images per listing
- `collections` - User collections
- `wishlist` - Items users want to buy ⭐

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only edit their own content
- Public read access for active listings
- Secure authentication with Supabase Auth

See `SUPABASE_SETUP.md` for detailed schema and SQL migrations.

### Environment Variables

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_GOOGLE_API_KEY=your-google-ai-key (optional)
```

## ♿ Accessibility & UX

We follow accessible defaults and mobile-first patterns:

- Semantic HTML in pages and components
- Keyboard navigation and focus states (Radix UI primitives)
- Color contrast checked against WCAG 2.1 AA for primary surfaces
- Reduced motion respected via prefers-reduced-motion
- Touch targets at least 44px on mobile
- Clear empty states and non-blocking loaders

See `ACCESSIBILITY.md` for details.

## 🎯 What's New

### Version 2.0 (October 2025)
- ✨ **Wishlist Feature** - Post items you want, let others contact you
- 🎨 **UI Refresh** - Vibrant student-friendly color palette
- 📊 **Statistics Dashboard** - Platform analytics and metrics
- ⚙️ **Settings Page** - User profile management
- 🔄 **Performance** - Tab focus handlers and optimized data loading
- 💅 **Hero Sections** - Engaging visuals on all major pages

### Previous Updates
- 🤖 AI-powered listing generation from images
- 📚 Collections system for organizing items
- 🔐 Enhanced security with RLS policies
- 📱 Fully responsive mobile design

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Salma Mansour** - [@SalmaMansour23](https://github.com/SalmaMansour23)
- **Salma Alsaghir** - [@SalmaAlsaghir](https://github.com/SalmaAlsaghir)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) 15
- UI components from [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/)
- Database and Auth by [Supabase](https://supabase.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with 💜 for university students**

*Happy trading! 🎉*
 
