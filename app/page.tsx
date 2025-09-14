"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Link } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, TrendingUp, Zap, Users, CheckCircle, ArrowRight, BarChart3, Lock, Globe, Star } from "lucide-react"
import { Navbar } from "@/components/Navbar";


export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cyan-50 via-white to-purple-50">
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl animate-float"></div>
          <div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-lg animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-2xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-slide-in-up">
            <div className="web3-badge mb-6">🚀 Next-Gen Credit Scoring</div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text text-balance">
              Onchain Credit
              <br />
              Revolution
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
              Unlock your financial potential with blockchain-powered credit scoring. Transparent, secure, and
              accessible to everyone in the decentralized economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="web3-button animate-glow">
                Get Your Score <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg bg-white/80 backdrop-blur-sm">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Why Choose Onchain Credit?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of credit scoring with blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Transparent & Secure",
                description: "All credit data is stored on-chain with cryptographic security and full transparency.",
                color: "from-cyan-500 to-blue-500",
              },
              {
                icon: TrendingUp,
                title: "Real-Time Updates",
                description: "Your credit score updates instantly as your onchain activity and reputation grow.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Globe,
                title: "Global Access",
                description: "Access your credit score anywhere in the world, no traditional banking required.",
                color: "from-cyan-500 to-purple-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-slide-in-up border-0 gradient-border"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8 relative z-10 bg-card">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "50K+", label: "Active Users", icon: Users },
              { number: "99.9%", label: "Uptime", icon: Zap },
              { number: "$2B+", label: "Credit Assessed", icon: BarChart3 },
              { number: "100%", label: "Transparent", icon: Lock },
            ].map((stat, index) => (
              <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="mb-4">
                  <stat.icon className="h-12 w-12 mx-auto text-primary" />
                </div>
                <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Our Products</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive onchain credit solutions for the decentralized world
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  title: "Credit Score API",
                  description: "Integrate onchain credit scores directly into your DeFi protocol or application.",
                  features: ["Real-time scoring", "RESTful API", "Multi-chain support"],
                },
                {
                  title: "Identity Verification",
                  description: "Verify user identity and reputation across multiple blockchain networks.",
                  features: ["Cross-chain identity", "Reputation tracking", "Privacy-first"],
                },
                {
                  title: "Risk Assessment",
                  description: "Advanced algorithms analyze onchain behavior to assess lending risk.",
                  features: ["ML-powered analysis", "Historical data", "Predictive modeling"],
                },
              ].map((product, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <h3 className="text-2xl font-bold mb-3 gradient-text">{product.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{product.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-gradient-to-r from-cyan-100 to-purple-100 text-foreground"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl p-8 text-white animate-float">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">Credit Dashboard</h3>
                    <Star className="h-8 w-8" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-sm opacity-80">Your Credit Score</div>
                      <div className="text-4xl font-bold">850</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-sm opacity-80">Transactions</div>
                        <div className="text-xl font-bold">1,247</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-sm opacity-80">Reputation</div>
                        <div className="text-xl font-bold">98%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Onchain Credit?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of users who are already building their decentralized credit history
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg">
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg bg-transparent"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
  </div>
    
  );
}