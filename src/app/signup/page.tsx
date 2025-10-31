"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, resendVerificationEmail } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Get redirect parameter from URL
  const redirectTo = searchParams.get('redirect') || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const email = (formData.email || "").trim().toLowerCase();
    const domain = email.split("@").pop();
    if (domain !== "nyu.edu") {
      toast({
        variant: "destructive",
        title: "NYU Email Required",
        description: "Please use your @nyu.edu email to sign up.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error, data } = await signUp(
        formData.email,
        formData.password,
        formData.username,
        formData.phone
      );
      
      if (error) {
        // Check if this is an email verification error
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as any).message === "string" &&
          (error as any).message.includes("verification")
        ) {
          setVerificationEmail(formData.email);
          setShowVerificationMessage(true);
          toast({
            title: "Check Your Email",
            description: "Please verify your email address to complete registration.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Signup Failed",
            description:
              (typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof (error as any).message === "string"
                ? (error as any).message
                : "Please check your information and try again."),
          });
        }
      } else {
        toast({
          title: "Account Created Successfully! 🎉",
          description: "Welcome to GiveNTake! You can now post listings and start trading.",
        });
        router.push(redirectTo);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setIsLoading(true);
    try {
      const { error } = await resendVerificationEmail(verificationEmail);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to resend verification email.",
        });
      } else {
        toast({
          title: "Email Sent",
          description: "Verification email has been resent.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-headline">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to {verificationEmail}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Click the link in your email to verify your account and start using GiveNTake.</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleResendVerification} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Button>
              <Button 
                onClick={() => setShowVerificationMessage(false)}
                variant="ghost"
                className="w-full"
              >
                Back to Sign Up
              </Button>
            </div>
            <div className="text-center text-sm">
              Already verified?{" "}
              <Link href="/login" className="underline">
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
             <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Use your NYU email (example: name@nyu.edu)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="Student123" 
                required 
                value={formData.username ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@nyu.edu"
                required
                value={formData.email ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+971 50 123 4567"
                required
                value={formData.phone ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={formData.password ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                required 
                value={formData.confirmPassword ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
