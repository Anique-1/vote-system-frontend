"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Vote, Shield, BarChart3, Users, CheckCircle, Clock, TrendingUp } from "lucide-react"

export default function HomePage() {
  const [voteCount, setVoteCount] = useState(0)
  const [voterCount, setVoterCount] = useState(0)
  const [activeVoters, setActiveVoters] = useState(0)

  // Animate counters on page load
  useEffect(() => {
    const animateCounter = (setter: (value: number) => void, target: number, duration = 2000) => {
      let start = 0
      const increment = target / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= target) {
          setter(target)
          clearInterval(timer)
        } else {
          setter(Math.floor(start))
        }
      }, 16)
    }

    animateCounter(setVoteCount, 1247856)
    animateCounter(setVoterCount, 2156789)
    animateCounter(setActiveVoters, 45623)
  }, [])

  const features = [
    {
      icon: Shield,
      title: "CNIC Verification",
      description: "Secure voter authentication using advanced CNIC processing and verification",
      color: "text-primary",
    },
    {
      icon: Vote,
      title: "Digital Voting",
      description: "Modern, intuitive voting interface with real-time confirmation",
      color: "text-secondary",
    },
    {
      icon: BarChart3,
      title: "Live Analytics",
      description: "Real-time vote tracking and comprehensive election analytics",
      color: "text-accent",
    },
    {
      icon: CheckCircle,
      title: "Vote Verification",
      description: "Transparent vote verification system for complete transparency",
      color: "text-primary",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Vote className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Pakistan Election System</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </a>
              <a href="/verify" className="text-muted-foreground hover:text-foreground transition-colors">
                Verify Vote
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Election 2025 - Live Now
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Secure Digital Voting for Pakistan
            </h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto mb-8">
              Experience the future of democratic participation with our advanced CNIC-verified voting system. Cast your
              vote securely and track results in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 animate-pulse" asChild>
                <a href="/vote">
                  <Vote className="w-5 h-5 mr-2" />
                  Cast Your Vote
                </a>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
                <a href="/dashboard">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Results
                </a>
              </Button>
              <Button variant="secondary" size="lg" className="text-lg px-8 py-6" asChild>
                <a href="/verify">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Verify Vote
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-primary">{voteCount.toLocaleString()}</CardTitle>
                <CardDescription>Total Votes Cast</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-3xl font-bold text-secondary">{voterCount.toLocaleString()}</CardTitle>
                <CardDescription>Registered Voters</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-3xl font-bold text-accent">{activeVoters.toLocaleString()}</CardTitle>
                <CardDescription>Active This Hour</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">Advanced Election Technology</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Built with cutting-edge security and transparency features to ensure every vote counts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-muted to-muted/50 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-pretty">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">Ready to Make Your Voice Heard?</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto mb-8">
            Join millions of Pakistanis in shaping the future of our nation through secure digital voting
          </p>
          <Button size="lg" className="text-lg px-12 py-6 animate-bounce" asChild>
            <a href="/vote">
              <Shield className="w-5 h-5 mr-2" />
              Start Voting Process
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Vote className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">Pakistan Election System</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Secure, transparent, and accessible digital voting for all Pakistani citizens.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/vote" className="hover:text-foreground transition-colors">
                    Cast Vote
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="hover:text-foreground transition-colors">
                    View Results
                  </a>
                </li>
                <li>
                  <a href="/verify" className="hover:text-foreground transition-colors">
                    Verify Vote
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Pakistan Election Commission. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
