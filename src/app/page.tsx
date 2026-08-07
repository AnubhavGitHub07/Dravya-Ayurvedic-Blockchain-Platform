import { LandingNavbar } from '@/features/landing/components/LandingNavbar'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { Footer } from '@/features/landing/components/Footer'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { LeafSprig } from '@/features/landing/components/LeafSprig'
import { FloatingLeaf } from '@/features/landing/components/FloatingLeaf'
import {
  ShieldCheck,
  FlaskConical,
  Link as LinkIcon,
  Tractor,
  TestTube2,
  Factory,
  Truck,
  Store,
  Users,
  Leaf,
} from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative font-sans overflow-x-hidden">
      <LandingNavbar />

      <div className="relative flex-1 flex flex-col w-full">
        {/* Logo Watermark Background */}
        <div
          className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-multiply flex items-center justify-center"
          style={{
            backgroundImage: 'url("/logo.png")',
            backgroundSize: 'min(70vw, 700px)',
            backgroundPosition: '15% 5%',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Decorative Tree Branch (Left Side) */}
        <div className="absolute top-[25%] left-0 w-[200px] md:w-[300px] lg:w-[400px] pointer-events-none z-0 opacity-75 mix-blend-multiply transform -translate-x-[15%]">
          <LeafSprig className="w-full h-auto text-primary" />
        </div>

        {/* Decorative Tree Branch (Right Side) */}
        <div className="absolute top-[45%] right-0 w-[200px] md:w-[300px] lg:w-[400px] pointer-events-none z-0 opacity-75 mix-blend-multiply transform translate-x-[15%]">
          <LeafSprig className="w-full h-auto text-primary" flip={true} />
        </div>

        {/* Floating Leaf 1 — top, just right of watermark */}
        <div className="absolute top-[5%] left-[54%] w-[110px] md:w-[135px] lg:w-[160px] pointer-events-none z-0 opacity-50 mix-blend-multiply">
          <FloatingLeaf className="w-full h-auto text-primary" rotate={-22} />
        </div>

        {/* Floating Leaf 2 — upper left edge, outside watermark left */}
        <div className="absolute top-[8%] left-[7%] w-[90px] md:w-[112px] lg:w-[138px] pointer-events-none z-0 opacity-45 mix-blend-multiply">
          <FloatingLeaf className="w-full h-auto text-primary" rotate={70} />
        </div>

        {/* Floating Leaf 5 — lower, right of watermark */}
        <div className="absolute top-[79%] left-[52%] w-[80px] md:w-[100px] lg:w-[122px] pointer-events-none z-0 opacity-37 mix-blend-multiply">
          <FloatingLeaf className="w-full h-auto text-primary" rotate={-60} />
        </div>

        {/* Floating Leaf 6 — bottom, left edge */}
        <div className="absolute top-[81%] left-[11%] w-[75px] md:w-[94px] lg:w-[115px] pointer-events-none z-0 opacity-33 mix-blend-multiply">
          <FloatingLeaf className="w-full h-auto text-primary" rotate={116} />
        </div>

        <main className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 py-12 gap-12 relative z-10 w-full max-w-[1600px] mx-auto">
          {/* Left Content */}
          <div className="flex-1 w-full max-w-3xl space-y-8">
            <div className="space-y-2">
              <h1 className="text-[3.5rem] lg:text-[4.5rem] font-bold tracking-tight text-[#1e293b] leading-[1.1] font-serif">
                Building Trust.
              </h1>
              <h2 className="text-[3.5rem] lg:text-[4.5rem] font-bold tracking-tight text-primary leading-[1.1] font-serif">
                From Root to Result.
              </h2>
            </div>

            <p className="text-[17px] text-slate-600 leading-relaxed font-medium max-w-2xl">
              Dravya is an AI-powered traceability platform that ensures authenticity, quality, and
              transparency in the Ayurvedic herb supply chain.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8">
              <div className="group flex flex-col bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden hover:border-[var(--accent)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 mb-4 relative z-10">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-slate-900 text-[15px] leading-tight mb-1">
                    Traceability
                  </h3>
                  <p className="text-[13px] text-slate-500 font-medium">End-to-End verified</p>
                </div>
              </div>

              <div className="group flex flex-col bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden hover:border-[var(--accent)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 mb-4 relative z-10">
                  <FlaskConical className="w-6 h-6 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-slate-900 text-[15px] leading-tight mb-1">
                    Quality
                  </h3>
                  <p className="text-[13px] text-slate-500 font-medium">100% lab assured</p>
                </div>
              </div>

              <div className="group flex flex-col bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden hover:border-[var(--accent)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 mb-4 relative z-10">
                  <LinkIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-slate-900 text-[15px] leading-tight mb-1">
                    Security
                  </h3>
                  <p className="text-[13px] text-slate-500 font-medium">Tamper-proof records</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content (Login Form) */}
          <div className="w-full lg:w-[450px] flex-shrink-0 py-6">
            <LoginForm />
          </div>
        </main>
      </div>

      {/* How It Works Section */}
      <HowItWorks />

      <Footer />
    </div>
  )
}
