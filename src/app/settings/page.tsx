"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Globe, Bell, Shield, Save } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone_number: "",
  });

  useEffect(() => {
    let mounted = true;
    if (profile && mounted) {
      setProfileData({
        username: profile.username || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
      });
    }
    
    return () => {
      mounted = false;
    };
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profileData.username,
          phone_number: profileData.phone_number,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-muted-foreground">Please log in to access settings.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/20 to-secondary/30 rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-5xl font-extrabold font-headline text-primary mb-4 drop-shadow-lg">
            Settings
          </h1>
          <p className="text-lg text-muted-foreground font-semibold">
            Manage your profile, preferences, and account settings.
          </p>
        </section>

        {/* Profile Settings */}
        <Card className="shadow-md hover:scale-[1.01] transition-transform">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profileData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone_number}
                onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-md hover:scale-[1.01] transition-transform">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">Email Notifications</span>
                <span className="text-sm text-muted-foreground">Receive updates via email</span>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="shadow-md hover:scale-[1.01] transition-transform">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Keep your account secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
