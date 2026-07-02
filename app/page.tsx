'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Clock, Wrench, Shield, ArrowRight, Star, Car, PhoneCall } from 'lucide-react'
import Link from 'next/link'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/30">
      <Header />
      
      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="max-w-4xl mx-auto space-y-8"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Mechanics available right now in your area
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Stuck on the road? <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Help is on the way.</span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                The fastest, most reliable on-demand vehicle breakdown assistance. Connect with top-rated mechanics near you instantly. No subscriptions, just help when you need it.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                    Request Assistance <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/register?role=mechanic">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                    Join as a Mechanic
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section className="py-12 border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-zinc-200 dark:divide-zinc-800">
              {[
                { label: "Average ETA", value: "15 min" },
                { label: "Verified Mechanics", value: "5,000+" },
                { label: "Successful Rescues", value: "120k+" },
                { label: "Customer Rating", value: "4.9/5" }
              ].map((stat, i) => (
                <div key={i} className="text-center px-4">
                  <h4 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">{stat.value}</h4>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-zinc-50 dark:bg-zinc-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get back on the road in 3 simple steps</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg">We designed the experience to be as simple as ordering a ride.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: MapPin, title: "1. Request Help", desc: "Share your location and vehicle issue with one tap." },
                { icon: Clock, title: "2. Get Matched", desc: "A nearby verified mechanic accepts your request instantly." },
                { icon: Wrench, title: "3. Back on Track", desc: "Track your mechanic's live location until they arrive and fix your vehicle." }
              ].map((step, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  key={i}
                  className="relative group"
                >
                  <Card className="border-none shadow-lg bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors h-full">
                    <CardContent className="pt-8 text-center px-6 pb-8 space-y-4">
                      <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                        <step.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">{step.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 bg-white dark:bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  Everything you need in an emergency
                </h2>
                <div className="space-y-6">
                  {[
                    { icon: Shield, title: "Verified Professionals", desc: "Every mechanic goes through a strict background check and skills verification." },
                    { icon: MapPin, title: "Live GPS Tracking", desc: "See exactly where your mechanic is and their estimated time of arrival." },
                    { icon: PhoneCall, title: "In-App Communication", desc: "Call or chat with your mechanic directly through our secure platform." },
                    { icon: Car, title: "All Vehicle Types", desc: "From sedans and SUVs to motorcycles. We have experts for every vehicle." }
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <feature.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-1">{feature.title}</h4>
                        <p className="text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full">
                {/* Mockup visualization - can use an image or CSS graphic */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 aspect-[4/5] md:aspect-square flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                    <div className="w-[70%] h-[80%] bg-white dark:bg-zinc-950 rounded-[2rem] shadow-xl border-4 border-zinc-300 dark:border-zinc-800 overflow-hidden relative">
                      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/20 to-transparent"></div>
                      <div className="p-6 space-y-6 mt-4">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                           <div className="space-y-2">
                             <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                             <div className="w-32 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                           </div>
                         </div>
                         <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl relative overflow-hidden">
                           <div className="absolute inset-0 flex items-center justify-center">
                              <MapPin className="w-8 h-8 text-primary absolute animate-bounce" />
                           </div>
                         </div>
                         <div className="space-y-3">
                            <div className="w-full h-10 bg-primary/20 rounded-lg"></div>
                            <div className="w-full h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg"></div>
                         </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-24 bg-zinc-50 dark:bg-zinc-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">Trusted by thousands of drivers</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Sarah Jenkins", role: "Daily Commuter", review: "My battery died in the middle of nowhere. Requested help and a mechanic was there in 15 minutes. Absolute lifesaver!" },
                { name: "Michael Chang", role: "Roadtrip Enthusiast", review: "Got a flat tire on the highway. The app showed me exactly where the mechanic was. Seamless experience." },
                { name: "David Roberts", role: "Mechanic", review: "As a mechanic, this platform has doubled my business. The routing and payment systems are flawless." }
              ].map((test, i) => (
                <Card key={i} className="bg-white dark:bg-zinc-950 text-left border-zinc-200 dark:border-zinc-800">
                  <CardContent className="pt-8">
                    <div className="flex gap-1 mb-4 text-amber-500">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6 italic">&quot;{test.review}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {test.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{test.name}</p>
                        <p className="text-xs text-muted-foreground">{test.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10"></div>
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to hit the road with peace of mind?</h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10">Sign up today and never worry about vehicle breakdowns again. It takes less than a minute.</p>
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-lg rounded-full">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
