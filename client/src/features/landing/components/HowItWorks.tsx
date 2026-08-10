"use client"

import React from "react"
import {
  Leaf,
  FlaskConical,
  Factory,
  Package,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { LeafSprig } from './LeafSprig'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

export function HowItWorks() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const directionRef = React.useRef<"forward" | "backward">("forward")

  const steps = [
    {
      icon: Leaf,
      number: "01",
      title: "Harvest",
      subtitle: "Origin & Batch Creation",
      description: "Farmers log raw herb origin, geo-location, and harvest batch data directly onto the platform.",
      badge: "Source",
    },
    {
      icon: FlaskConical,
      number: "02",
      title: "Verify",
      subtitle: "Lab & Quality Assurance",
      description: "Certified labs verify heavy metals, purity, moisture levels, and authenticity metrics.",
      badge: "Testing",
    },
    {
      icon: Factory,
      number: "03",
      title: "Process",
      subtitle: "Standardized Processing",
      description: "Manufacturers process herbs into formulations with full environmental and parameter logs.",
      badge: "Manufacturing",
    },
    {
      icon: Package,
      number: "04",
      title: "Distribute",
      subtitle: "Chain of Custody",
      description: "Distributors and retailers maintain temperature, custody, and real-time location logs.",
      badge: "Logistics",
    },
    {
      icon: Users,
      number: "05",
      title: "Consumer",
      subtitle: "QR Code Verification",
      description: "End consumers scan a QR code on packaging to view the complete lab & journey audit trail.",
      badge: "Trust",
    },
  ]

  React.useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })

    // Continuous Single Direction Autoplay (1 -> 2 -> 3 -> 4 -> 5 -> 1 -> 2)
    const interval = setInterval(() => {
      if (!api) return
      api.scrollNext()
    }, 3500)

    return () => clearInterval(interval)
  }, [api])

  return (
    <section className="relative overflow-hidden bg-[#E1E9E1]/35 border-t border-[#184E48]/10 py-24 lg:py-32">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[8%] -left-12 w-[280px] md:w-[380px] lg:w-[460px] pointer-events-none z-0 opacity-20 mix-blend-multiply">
        <LeafSprig className="w-full h-auto text-[#184E48]" />
      </div>

      <div className="absolute bottom-[4%] -right-12 w-[280px] md:w-[380px] lg:w-[460px] pointer-events-none z-0 opacity-20 mix-blend-multiply">
        <LeafSprig className="w-full h-auto text-[#184E48]" flip={true} />
      </div>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#184E48]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-[#184E48]/[0.04] rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        
        {/* Header Tag & Section Title */}
        <div className="mx-auto max-w-3xl text-center mb-12 lg:mb-16">
          

          <h2 className="text-4xl font-serif font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl mb-6 leading-[1.15]">
            Every Step.{" "}
            <span className="text-[#184E48] relative whitespace-nowrap">
              Every Time.
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#184E48]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
            <br className="hidden md:block" /> Verified.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-slate-600 font-medium">
            Swipe through the 5 stages of Dravya&apos;s Ayurvedic supply chain verification.
          </p>
        </div>

        {/* Carousel Container - Reduced width by ~10% (max-w-[1350px]) */}
        <div className="relative max-w-[1350px] mx-auto px-4 md:px-12">
          
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {steps.map((step, index) => {
                const Icon = step.icon

                return (
                  <CarouselItem
                    key={step.title}
                    className="pl-3 md:pl-4 basis-full md:basis-1/2 lg:basis-1/4"
                  >
                    <div
                      className="group relative flex flex-col justify-between h-full rounded-3xl bg-white p-7 shadow-md shadow-[#184E48]/[0.05] border border-[#184E48]/15 hover:border-[#184E48]/50 hover:shadow-2xl hover:shadow-[#184E48]/20 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#184E48] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="absolute -right-2 -top-4 text-[95px] font-black text-slate-900/[0.04] group-hover:text-[#184E48]/[0.08] transition-colors duration-500 pointer-events-none select-none z-0">
                        {step.number}
                      </div>

                      <div className="relative z-10 flex-1 flex flex-col">
                        
                        <div className="flex items-center justify-between mb-6">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#184E48]/10 text-[#184E48] border border-[#184E48]/20">
                            {step.badge}
                          </span>
                          <span className="text-xs font-extrabold text-[#184E48]/60">
                            0{index + 1} / 0{steps.length}
                          </span>
                        </div>

                        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#184E48] text-white shadow-lg shadow-[#184E48]/25 group-hover:bg-white group-hover:text-[#184E48] group-hover:border-2 group-hover:border-[#184E48] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          <Icon className="h-8 w-8 transition-colors duration-300" strokeWidth={1.75} />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#184E48] transition-colors duration-300 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-xs font-semibold text-[#184E48] mb-3 tracking-wide">
                          {step.subtitle}
                        </p>

                        <p className="text-xs md:text-sm leading-relaxed text-slate-600">
                          {step.description}
                        </p>
                      </div>

                      <div className="relative z-10 pt-5 mt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[12px] font-bold text-slate-400 group-hover:text-[#184E48] transition-colors duration-300">
                          Verified Stage {step.number}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-[#184E48] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-[#184E48]/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex -left-6 lg:-left-12 bg-white text-[#184E48] border-[#184E48]/30 hover:bg-[#184E48] hover:text-white shadow-lg w-11 h-11" />
            <CarouselNext className="hidden md:flex -right-6 lg:-right-12 bg-white text-[#184E48] border-[#184E48]/30 hover:bg-[#184E48] hover:text-white shadow-lg w-11 h-11" />
          </Carousel>

          {/* Carousel Custom Dots & Pagination (Set to exactly 3 dots) */}
         
        </div>

        {/* Bottom CTA Banner */}
       

      </div>
    </section>
  )
}
