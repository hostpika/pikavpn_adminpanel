"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Globe, Lock, Zap, Users, Smartphone, Check, ArrowRight } from "lucide-react"

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>([])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.hasAttribute("data-feature-index")) {
            const index = Number.parseInt(entry.target.getAttribute("data-feature-index") || "0")
            setVisibleFeatures((prev) => {
              const updated = [...prev]
              updated[index] = true
              return updated
            })
          }
        })
      },
      { threshold: 0.2 },
    )

    const featureCards = document.querySelectorAll("[data-feature-index]")
    featureCards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3f] to-[#0f0f2a]"
      >
        {/* Animated gradient mesh background */}
        <div
          className="gradient-mesh absolute inset-0 opacity-60"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />

        {/* Animated Network Visualization with parallax */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0001})`,
          }}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.65 0.25 254)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="oklch(0.72 0.22 190)" stopOpacity="0.5" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <line
              x1="10%"
              y1="20%"
              x2="40%"
              y2="60%"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-pulse"
              filter="url(#glow)"
            />
            <line
              x1="40%"
              y1="60%"
              x2="70%"
              y2="40%"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: "0.5s" }}
              filter="url(#glow)"
            />
            <line
              x1="70%"
              y1="40%"
              x2="90%"
              y2="70%"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: "1s" }}
              filter="url(#glow)"
            />
            <line
              x1="30%"
              y1="80%"
              x2="60%"
              y2="30%"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: "1.5s" }}
              filter="url(#glow)"
            />
            <circle cx="10%" cy="20%" r="8" fill="oklch(0.65 0.25 254)" className="animate-pulse" filter="url(#glow)" />
            <circle
              cx="40%"
              cy="60%"
              r="8"
              fill="oklch(0.72 0.22 190)"
              className="animate-pulse"
              style={{ animationDelay: "0.3s" }}
              filter="url(#glow)"
            />
            <circle
              cx="70%"
              cy="40%"
              r="8"
              fill="oklch(0.75 0.28 305)"
              className="animate-pulse"
              style={{ animationDelay: "0.6s" }}
              filter="url(#glow)"
            />
            <circle
              cx="90%"
              cy="70%"
              r="8"
              fill="oklch(0.65 0.25 254)"
              className="animate-pulse"
              style={{ animationDelay: "0.9s" }}
              filter="url(#glow)"
            />
            <circle
              cx="30%"
              cy="80%"
              r="8"
              fill="oklch(0.72 0.22 190)"
              className="animate-pulse"
              style={{ animationDelay: "1.2s" }}
              filter="url(#glow)"
            />
            <circle
              cx="60%"
              cy="30%"
              r="8"
              fill="oklch(0.75 0.28 305)"
              className="animate-pulse"
              style={{ animationDelay: "1.5s" }}
              filter="url(#glow)"
            />
          </svg>
        </div>

        <div
          className="relative z-10 container mx-auto px-4 text-center text-white"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: 1 - scrollY * 0.002,
          }}
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-balance animate-fade-in-up">
              Secure Your <span className="gradient-text">Digital Freedom</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto text-balance animate-fade-in-up animation-delay-200">
              Enterprise-grade VPN protection with military-level encryption. Connect to 50+ countries instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in-up animation-delay-400">
              <Button
                size="lg"
                className="glass-effect text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 text-lg px-8 py-6 backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-primary/20"
              >
                Download App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-effect text-white border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105 text-lg px-8 py-6 bg-transparent backdrop-blur-xl hover:shadow-lg"
                >
                  Admin Login
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-gray-400 animate-fade-in-up animation-delay-600">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-secondary" />
                <span>No logs policy</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-secondary" />
                <span>500K+ downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-secondary" />
                <span>99.9% uptime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center backdrop-blur-sm">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Enterprise-Grade Security, <br />
              <span className="gradient-text">Consumer-Friendly Experience</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology that protects your privacy without compromising speed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Military-Grade Encryption",
                description:
                  "AES-256 encryption with secure protocols ensures your data stays private and protected from any threats.",
                gradient: "from-[#4c6ef5] to-[#5c7cfa]",
              },
              {
                icon: Globe,
                title: "Global Server Network",
                description:
                  "Access 150+ servers across 50+ countries with lightning-fast connections wherever you go.",
                gradient: "from-[#22b8cf] to-[#3bc9db]",
              },
              {
                icon: Lock,
                title: "Strict No-Logs Policy",
                description: "We never track, collect, or share your private data. Your activity is yours alone.",
                gradient: "from-[#be4bdb] to-[#cc5de8]",
              },
              {
                icon: Zap,
                title: "Unlimited Bandwidth",
                description: "Stream, download, and browse without limits. No data caps or throttling, ever.",
                gradient: "from-[#ff6b6b] to-[#fa5252]",
              },
              {
                icon: Users,
                title: "Multi-Device Support",
                description: "Protect up to 10 devices simultaneously with a single subscription.",
                gradient: "from-[#51cf66] to-[#40c057]",
              },
              {
                icon: Smartphone,
                title: "One-Tap Connect",
                description: "Connect to the fastest server instantly with our intelligent auto-select feature.",
                gradient: "from-[#ffd43b] to-[#fcc419]",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                data-feature-index={index}
                className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-card ${visibleFeatures[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <CardContent className="p-8 space-y-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Showcase Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Powerful Protection <br />
                <span className="gradient-text">At Your Fingertips</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our intuitive mobile app gives you complete control over your online security with a single tap.
              </p>

              <div className="space-y-6">
                {[
                  { label: "One-Tap Security", description: "Connect instantly to the best server" },
                  { label: "50+ Countries", description: "Global coverage at your command" },
                  { label: "Kill Switch", description: "Automatic protection if connection drops" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{item.label}</h4>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold">4.8/5 Rating</span>
                </div>
                <div className="text-sm font-semibold">500K+ Downloads</div>
                <div className="text-sm font-semibold">99.9% Uptime</div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 mx-auto w-full max-w-sm">
                <img
                  src="/modern-vpn-mobile-app-interface.jpg"
                  alt="SuperVPN Pro App"
                  className="rounded-3xl shadow-2xl"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="gradient-text">Protection Plan</span>
            </h2>
            <p className="text-xl text-muted-foreground">Simple pricing that scales with your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                features: ["10 free servers", "Basic speed", "1 device", "Standard support", "Ad-supported"],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Premium",
                price: "$9.99",
                period: "per month",
                features: [
                  "150+ premium servers",
                  "Unlimited speed",
                  "10 devices",
                  "Priority support",
                  "Ad-free experience",
                  "Kill switch",
                  "Split tunneling",
                ],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "contact us",
                features: [
                  "Dedicated servers",
                  "Custom integrations",
                  "Unlimited devices",
                  "24/7 VIP support",
                  "Advanced analytics",
                  "SLA guarantee",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? "border-primary border-2 shadow-xl scale-105" : "border"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a1f] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">SuperVPN Pro</h3>
              <p className="text-gray-400">Securing your digital freedom worldwide.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Download
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    System Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SuperVPN Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
