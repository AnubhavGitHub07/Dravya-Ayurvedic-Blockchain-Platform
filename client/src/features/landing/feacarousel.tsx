"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  ShieldCheck,
  FlaskConical,
  Link as LinkIcon,
  Leaf,
  Sprout,
  ScanLine,
  Truck,
  FileCheck2,
  Users,
  BadgeCheck,
} from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Traceability", desc: "End-to-End verified" },
  { icon: FlaskConical, title: "Quality", desc: "100% lab assured" },
  { icon: LinkIcon, title: "Security", desc: "Tamper-proof records" },
  { icon: Leaf, title: "Sourcing", desc: "Farm-verified origin" },
  { icon: Sprout, title: "Sustainability", desc: "Wild-harvest compliant" },
  { icon: ScanLine, title: "Scan & Verify", desc: "Instant QR authentication" },
  { icon: Truck, title: "Logistics", desc: "Real-time shipment tracking" },
  { icon: FileCheck2, title: "Compliance", desc: "AYUSH standard aligned" },
  { icon: Users, title: "Community", desc: "Direct farmer network" },
  { icon: BadgeCheck, title: "Authenticity", desc: "Blockchain-certified" },
];

export function FeatureCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="pt-8 relative">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <CarouselItem
              key={title}
              className="pl-5 sm:basis-1/2 lg:basis-1/3"
            >
              <div className="group flex flex-col bg-[var(--ww)] rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden hover:border-[var(--accent)] h-full min-h-[220px]">
                <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110" />

                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(currentColor 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />

                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 mb-5 relative z-10 group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-primary" />
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">{desc}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-6 border-primary/20 text-primary hover:bg-primary hover:text-white" />
        <CarouselNext className="hidden sm:flex -right-4 lg:-right-6 border-primary/20 text-primary hover:bg-primary hover:text-white" />
      </Carousel>
    </div>
  );
}