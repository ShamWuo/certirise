import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, Shield, Upload } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">certirise</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Never Miss a License Renewal
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          AI-powered compliance tracking for salons, spas, barbershops, and tattoo shops. 
          Prevent expensive fines and shutdowns with automated reminders.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          $30/month per location • Setup in under 5 minutes
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Certirise?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card">
            <Upload className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Setup</h3>
            <p className="text-muted-foreground">
              Upload license photos and let AI extract expiration dates. Get set up in under 5 minutes.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <Clock className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Reminders</h3>
            <p className="text-muted-foreground">
              Automated email and SMS reminders at 90, 60, 30, 14, and 7 days before expiration.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Compliance Database</h3>
            <p className="text-muted-foreground">
              Built-in knowledge of state-specific requirements and renewal processes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary/10 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to protect your business?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of salons and spas who never miss a renewal deadline.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Certirise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


