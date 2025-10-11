"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Calendar, BookOpen, Bot, Heart, User, Menu, X, Upload } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true
    fetch('/api/auth/admin')
      .then((res) => res.json())
      .then((data) => {
        if (active) setIsAdmin(!!data?.isAdmin)
      })
      .catch(() => {
        if (active) setIsAdmin(false)
      })
    return () => { active = false }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex mx-auto h-16 items-center justify-between px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/tirthvi-icon.svg"
            alt="Tirthvi logo"
            width={28}
            height={28}
            priority
            className="h-7 w-7 rounded-md"
          />
          <span className="text-xl font-bold">Tirthvi</span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex items-center gap-1">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/calendar" className="inline-flex h-10 items-center gap-2 rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/80 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  <Calendar className="h-4 w-4" />
                  Events Calendar
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/scriptures" className="inline-flex h-10 items-center gap-2 rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/80 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  <BookOpen className="h-4 w-4" />
                  Scriptures
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/chat" className="inline-flex h-10 items-center gap-2 rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/80 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  <Bot className="h-4 w-4" />
                  AI Wisdom
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            {isAdmin && (
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/upload" className="inline-flex h-10 items-center gap-2 rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/80 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  <Upload className="h-4 w-4" />
                  Upload
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/donate">
              <Heart className="mr-2 h-4 w-4" />
              Donate
            </Link>
          </Button>
          
          {/* Clerk Authentication */}
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/calendar" onClick={() => setIsMobileMenuOpen(false)}>
                <Calendar className="mr-2 h-4 w-4" />
                Events Calendar
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/scriptures" onClick={() => setIsMobileMenuOpen(false)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Scriptures
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/chat" onClick={() => setIsMobileMenuOpen(false)}>
                <Bot className="mr-2 h-4 w-4" />
                AI Wisdom
              </Link>
            </Button>
            
            {isAdmin && (
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </Link>
            </Button>
            )}

            <div className="pt-2 border-t">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/donate" onClick={() => setIsMobileMenuOpen(false)}>
                  <Heart className="mr-2 h-4 w-4" />
                  Donate
                </Link>
              </Button>
              
              {/* Mobile Clerk Authentication */}
              <div className="pt-2 space-y-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="w-full justify-start">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </SignedOut>
                
                <SignedIn>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account</span>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8"
                        }
                      }}
                    />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
