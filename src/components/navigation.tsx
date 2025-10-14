"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { Calendar, BookOpen, Shield, Bot, Heart, User, Menu, X, Upload, Info } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, Protect } from "@clerk/nextjs";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

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

  // Check for mobile breakpoint
  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setIsMobile(width < 768); // 768px is md breakpoint
      }
    };

    checkWidth();

    const resizeObserver = new ResizeObserver(checkWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <header 
      ref={containerRef}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <nav className="container flex mx-auto h-16 items-center justify-between px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className={isMobile ? "flex" : "hidden"}
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

        {/* Desktop Navigation - Left Aligned */}
        {!isMobile && (
          <NavigationMenu className="flex">
            <NavigationMenuList className="flex items-center gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/calendar" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    <Calendar className="h-4 w-4" />
                    Events Calendar
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/scriptures" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    <BookOpen className="h-4 w-4" />
                    Scriptures
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/chat" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    <Bot className="h-4 w-4" />
                    AI Wisdom
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              {isAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/upload" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      <Upload className="h-4 w-4" />
                      Upload
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* About Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  <Info className="h-4 w-4" />
                  About
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4">
                    <NavigationMenuLink asChild>
                      <Link href="/privacy-policy" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-base font-medium leading-tight">Privacy Policy</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Learn about our privacy practices and data protection.
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/about" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Info className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-base font-medium leading-tight">About Us</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Learn more about Tirthvi and our mission.
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {/* Right side actions */}

        <div className="flex items-center gap-4">

            <Protect plan={"free_plan"}>
              <Button variant="default" size="sm" asChild className="hidden sm:flex">
                <Link href="/pricing">
                  <Heart className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Link>
              </Button>
            </Protect>
          
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
      {isMobileMenuOpen && isMobile && (
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

              <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/privacy-policy" onClick={() => setIsMobileMenuOpen(false)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Privacy Policy
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

                <Protect plan={"free_plan"}>
                  <Button variant="default" className="w-full justify-start" asChild>
                    <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                      <Heart className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Link>
                  </Button>
                </Protect>

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
