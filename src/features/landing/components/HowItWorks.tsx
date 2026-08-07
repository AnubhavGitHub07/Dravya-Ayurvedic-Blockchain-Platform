import React from 'react'
import { Leaf, FlaskConical, Factory, Package, Users, ArrowRight } from 'lucide-react'
import { FloatingLeaf } from '@/features/landing/components/FloatingLeaf'

export function HowItWorks() {
  const steps = [
    {
      icon: Leaf,
      title: '1. Harvest',
      description: 'Farmers create batches with crop details',
    },
    {
      icon: FlaskConical,
      title: '2. Verify',
      description: 'Labs & authorities verify quality',
    },
    {
      icon: Factory,
      title: '3. Process',
      description: 'Manufacturers process and add details',
    },
    {
      icon: Package,
      title: '4. Distribute',
      description: 'Distributors & retailers handle with transparency',
    },
    {
      icon: Users,
      title: '5. Consumer',
      description: 'Consumers scan QR & view full journey',
    },
  ]

  return (
    <section className="w-full bg-[#F4F7F5] py-20 relative z-10 rounded-t-[40px] shadow-[0_-10px_40px_rgb(0,0,0,0.02)]">
      <div className="absolute top-[5%] right-[10%] w-[110px] md:w-[135px] lg:w-[160px] pointer-events-none z-0 opacity-50 mix-blend-multiply">
        <FloatingLeaf className="w-full h-auto text-primary" rotate={40} />
      </div>
      <div className="absolute top-[40%] left-[7%] w-[110px] md:w-[100px] lg:w-[130px] pointer-events-none z-0 opacity-50 mix-blend-multiply">
        <FloatingLeaf className="w-full h-auto text-primary" rotate={-42} />
      </div>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <p className="text-[13px] font-bold text-primary tracking-[0.2em] uppercase">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1e293b] font-serif tracking-tight">
            Every Step. Every Time. Verified.
          </h2>
          <p className="text-[15px] md:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Dravya connects the entire supply chain on a unified platform to ensure authenticity and
            trust at every stage.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-0 mt-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.title}>
              {/* Step Item */}
              <div className="flex flex-col items-center text-center w-full lg:w-[220px] z-10 group">
                <div className="w-[88px] h-[88px] rounded-full bg-[#E8F0EA] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md border border-[#D5E2DB]">
                  <step.icon className="w-10 h-10 text-[#1a4a2c] stroke-[1.5]" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed px-2 lg:px-4">
                  {step.description}
                </p>
              </div>

              {/* Connector (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center flex-1 h-[88px] px-2 -mx-4">
                  <div className="w-full flex items-center">
                    <div className="h-[2px] w-full border-t-2 border-dashed border-[#B8D0C3]" />
                    <ArrowRight className="w-6 h-6 text-[#B8D0C3] -ml-2 shrink-0 stroke-[2.5]" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
