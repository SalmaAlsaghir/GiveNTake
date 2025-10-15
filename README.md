# GiveNTake

A modern marketplace application for buying, selling, and exchanging items within your community. Built with Next.js 15, Supabase, and AI-powered features.

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login with Supabase
- 📝 **Listing Management** - Create, edit, and manage your listings
- 🖼️ **Image Upload** - Upload up to 3 images per listing
- 🤖 **AI-Powered Descriptions** - Generate enhanced listing details with AI
- 📚 **Collections** - Organize your listings into collections
- 🔍 **Category Browsing** - Browse items by category
- 💬 **Status Tracking** - Track listing status (available, negotiating, sold)
- 🎨 **Modern UI** - Beautiful interface with Radix UI and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account
- Google AI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SalmaMansour23/GiveNTake-alpha.git
   cd GiveNTake
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your credentials:
   - Supabase URL and keys
   - Google AI API key

4. **Set up Supabase**
   - Run the SQL scripts in `SUPABASE_SETUP.md`
   - Configure Row Level Security policies
   - Set up storage bucket for images

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:9002](http://localhost:9002) in your browser.

## 📦 Available Scripts

```bash
npm run dev          # Start development server (port 9002)
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
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── browse/       # Category browsing
│   │   ├── collections/  # Collections management
│   │   ├── list/         # Listing creation/editing
│   │   ├── listings/     # Individual listing pages
│   │   └── ...
│   ├── components/       # React components
│   │   ├── ui/           # Shadcn UI components
│   │   └── ...
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and services
│   │   ├── supabaseClient.ts
│   │   ├── listings-service.ts
│   │   └── types.ts
│   └── ai/               # Genkit AI flows
├── public/               # Static assets
├── docs/                 # Documentation
└── ...
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Generative AI (Genkit)
- **Form Validation**: Zod, React Hook Form
- **State Management**: React Context API

## 📚 Documentation

- [Blueprint](docs/blueprint.md) - Project architecture and design decisions
- [Supabase Setup](SUPABASE_SETUP.md) - Database schema and setup instructions
- [Project Review Report](PROJECT_REVIEW_REPORT.md) - Code quality assessment

## 🔧 Configuration

### Database Schema

The application uses the following main tables:
- `profiles` - User profiles
- `categories` - Item categories
- `listings` - Marketplace listings
- `collections` - User collections
- `listing_images` - Listing images

See `SUPABASE_SETUP.md` for detailed schema.

### Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GOOGLE_GENAI_API_KEY` - Google AI API key

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Salma Mansour - [@SalmaMansour23](https://github.com/SalmaMansour23)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Database by [Supabase](https://supabase.com/)
- AI powered by [Google Generative AI](https://ai.google.dev/)
 
