"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { Calendar, BookOpen, Shield, Bot, Heart, User, Upload, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton, Protect } from "@/components/auth";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// Animated Hamburger Icon component
const HamburgerIcon = ({ className, ...props }: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <header 
      ref={containerRef}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <nav className="container flex max-w-screen-xl mx-auto h-16 items-center justify-between px-4">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "group h-9 w-9 hover:bg-accent hover:text-accent-foreground",
              isMobile ? "flex" : "hidden"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
          >
            <HamburgerIcon />
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

          {/* Desktop Navigation */}
          {!isMobile && (
            <NavigationMenu className="flex">
              <NavigationMenuList className="flex items-center gap-1 [&>li>a]:flex [&>li>a]:items-center [&>li>a]:align-middle [&>li>button]:flex [&>li>button]:items-center [&>li>button]:align-middle [&>li>button]:h-9" >
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/calendar" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Events Calendar
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/scriptures" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Scriptures
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/chat" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1">
                      <Bot className="mr-2 h-4 w-4" />
                      AI Wisdom
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                {isAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/upload" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {/* About Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1">
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
        </div>

        {/* Right side actions */}

        <div className="flex items-center gap-4">

            <Protect plan="free_plan">
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
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">
                  Sign Up
                </Link>
              </Button>
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
      <div className={cn(
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        isMobileMenuOpen && isMobile 
          ? "max-h-[600px] opacity-100 translate-y-0" 
          : "max-h-0 opacity-0 -translate-y-4"
      )}>
        <div className="container mx-auto px-4 py-4 pb-8 space-y-2">
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
                  <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                      <Info className="mr-2 h-4 w-4" />
                      About Us
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

                <Protect plan="free_plan">
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
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" asChild>
                    <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
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
    </header>
  );
}
