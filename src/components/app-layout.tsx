
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  PlusCircle,
  Package,
  Handshake,
  User,
  LogOut,
  LogIn,
  Loader2,
  Book,
  Laptop,
  Lamp,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Logo } from "@/components/logo";

function UserNav() {
  const { user, profile, isAuthenticated, signOut, loading } = useAuth();

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Button asChild>
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Link>
      </Button>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border">
            <AvatarImage
              src="/default-avatar.svg"
              alt={profile?.username || user.email || 'User'}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {(profile?.username || user.email || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.username || user.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavLinks() {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "Browse", icon: Home, auth: false },
      { href: "/collections", label: "Collections", icon: Package, auth: false },
        { href: "/list/new", label: "Post a Listing", icon: PlusCircle, auth: true },
        { href: "/my-listings", label: "My Listings", icon: Package, auth: true },
        { href: "/safety", label: "How to Transact", icon: Handshake, auth: false },
    ];

    const categoryItems = [
      { href: "/browse/textbooks", label: "Textbooks", icon: Book },
      { href: "/browse/electronics", label: "Electronics", icon: Laptop },
      { href: "/browse/dorm-essentials", label: "Dorm Essentials", icon: Lamp },
      { href: "/browse/accessories", label: "Accessories", icon: Sparkles },
    ];

    return (
      <SidebarMenu>
        {navItems.map((item) => {
          // Only show auth-required items if user is authenticated
          if (item.auth && !isAuthenticated) return null;
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
        <SidebarMenuItem>
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">Categories</div>
        </SidebarMenuItem>
        {categoryItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    >
                    <Icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Logo className="w-8 h-8 text-primary" />
            <span className="font-headline group-data-[collapsible=icon]:hidden">
              GiveNTake
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
            <NavLinks />
        </SidebarContent>
        <SidebarFooter className="p-4">
            {/* Can add footer content here if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
            <header className="flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden md:block font-headline text-lg font-bold">
                    Student Marketplace
                </div>
              </div>
              <div className="flex items-center gap-4">
                <UserNav />
              </div>
            </header>
            <main className="flex-1">
              {loading ? (
                 <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 </div>
              ) : (
                children
              )}
            </main>
            <footer className="p-4 border-t bg-background/80">
                <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground">
                    <p className="font-semibold">Disclaimer</p>
                    <p>
                        GiveNTake is a platform to connect buyers and sellers. We are not involved in the actual transaction and are not responsible for the quality, safety, or legality of items listed, nor for the conduct of users. All transactions are at your own risk.
                    </p>
                </div>
            </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
