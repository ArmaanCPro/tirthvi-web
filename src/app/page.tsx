import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BookOpen, Bot, Heart, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Image
              src="/tirthvi-icon.svg"
              alt="Tirthvi logo"
              width={96}
              height={96}
              priority
              className="mx-auto mb-6 h-24 w-24"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Welcome to <span className="text-primary">Tirthvi</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your gateway to Hindu wisdom, sacred calendar, scriptures, and AI-powered spiritual guidance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/calendar">
                  <Calendar className="mr-2 h-5 w-5" />
                  Explore Calendar
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/chat">
                  <Bot className="mr-2 h-5 w-5" />
                  Ask AI Wisdom
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Discover Hindu Wisdom
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access ancient knowledge through modern technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Events Calendar</CardTitle>
                <CardDescription>
                  Track Hindu festivals, observances, and auspicious dates with our comprehensive calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/calendar">View Calendar</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Scripture Library</CardTitle>
                <CardDescription>
                  Access digital versions of sacred texts with translations and commentaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/scriptures">Browse Scriptures</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bot className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI Wisdom</CardTitle>
                <CardDescription>
                  Get personalized answers about Hindu philosophy using our AI-powered chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/chat">Start Chatting</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Sacred Events</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Scripture Texts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">AI Guidance</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">∞</div>
              <div className="text-muted-foreground">Wisdom</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/20 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Begin Your Spiritual Journey
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Join thousands discovering the depth of Hindu philosophy and tradition
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default" className="hover:brightness-110 transition-all" asChild>
              <Link href="/login">
                <Users className="mr-2 h-5 w-5" />
                Create Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary hover:brightness-110 transition-all" asChild>
              <Link href="/donate">
                <Heart className="mr-2 h-5 w-5" />
                Support Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
