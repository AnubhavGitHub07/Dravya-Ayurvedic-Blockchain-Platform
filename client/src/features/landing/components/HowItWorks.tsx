import React from "react"
import {
  Leaf,
  FlaskConical,
  Factory,
  Package,
  Users,
  ArrowRight,
} from "lucide-react"
import { LeafSprig } from './LeafSprig'

export function HowItWorks() {
  const steps = [
    {
      icon: Leaf,
      number: "01",
      title: "Harvest",
      description: "Farmers create batches with crop and origin details.",
    },
    {
      icon: FlaskConical,
      number: "02",
      title: "Verify",
      description: "Labs and authorities verify quality and authenticity.",
    },
    {
      icon: Factory,
      number: "03",
      title: "Process",
      description: "Manufacturers process the herbs and record each stage.",
    },
    {
      icon: Package,
      number: "04",
      title: "Distribute",
      description: "Distributors and retailers maintain complete traceability.",
    },
    {
      icon: Users,
      number: "05",
      title: "Consumer",
      description: "Consumers scan a QR code to explore the complete journey.",
    },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F7FAF7] to-white py-24 md:py-32">
      
      {/* Decorative Tree Branch (Left Side) */}
      <div className="absolute top-[10%] left-[-5%] w-[250px] md:w-[350px] lg:w-[450px] pointer-events-none z-0 opacity-30 mix-blend-multiply">
        <LeafSprig className="w-full h-auto text-[#184E48]" />
      </div>

      {/* Decorative Tree Branch (Right Side) */}
      <div className="absolute bottom-[5%] right-[-5%] w-[250px] md:w-[350px] lg:w-[450px] pointer-events-none z-0 opacity-30 mix-blend-multiply">
        <LeafSprig className="w-full h-auto text-[#184E48]" flip={true} />
      </div>
      
      {/* Soft gradient blobs for depth */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#D5E2DB]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#D5E2DB]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-20">
          

          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl mb-6">
            Every Step.
            <span className="text-[#1a4a2c] relative whitespace-nowrap">
              {" "}Every Time.
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#B8D0C3]/60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
            <br className="hidden md:block" /> Verified.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Dravya connects every stage of the Ayurvedic supply chain on one
            transparent platform, creating unwavering trust from harvest to consumer.
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon

              return (
                <div
                  key={step.title}
                  className="group relative flex flex-col rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-[#1a4a2c]/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Watermark Number */}
                  <div className="absolute -right-4 -top-6 text-[100px] font-black text-slate-100 opacity-50 group-hover:text-[#1a4a2c]/5 transition-colors duration-500 pointer-events-none select-none z-0">
                    {step.number}
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a4a2c] to-[#2a6a42] shadow-lg shadow-[#1a4a2c]/20 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <Icon
                        className="h-8 w-8 text-white"
                        strokeWidth={1.5}
                      />
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-slate-900 group-hover:text-[#1a4a2c] transition-colors duration-300">
                      {step.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Subtle hover gradient at the bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a4a2c]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

  

