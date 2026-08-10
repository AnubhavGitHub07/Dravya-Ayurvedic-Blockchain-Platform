import Link from 'next/link'
import { LandingNavbar } from '@/features/landing/components/LandingNavbar'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { Footer } from '@/features/landing/components/Footer'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { LeafSprig } from '@/features/landing/components/LeafSprig'
import { FloatingLeaf } from '@/features/landing/components/FloatingLeaf'
import { Button } from '@/components/ui/button'
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
  ArrowRight,
  BadgeCheck,
} from 'lucide-react'
import { AIVerification } from '@/features/landing/components/aiverification'

import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white relative font-sans overflow-x-hidden">
      <LandingNavbar />

      <div className="relative flex-1 flex flex-col w-full">
        {/* Logo Watermark Background */}
        <div
          className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-multiply flex items-center justify-center"
          style={{
            backgroundImage: 'url("/logo.png")',
            backgroundSize: '800px',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        />


        {/* Floating Leaf 1 — lower, right of watermark */}
        <div className="absolute top-[79%] left-[52%] w-[80px] md:w-[100px] lg:w-[122px] pointer-events-none z-0 opacity-37 mix-blend-multiply">
          <FloatingLeaf className="w-full h-auto text-primary" rotate={-60} />
        </div>

        {/* Floating Leaf 2 — bottom, left edge */}
        <div className="absolute top-[79%] left-[11%] w-[75px] md:w-[94px] lg:w-[115px] pointer-events-none z-0 opacity-33 mix-blend-multiply">
          <FloatingLeaf className="w-full h-auto text-primary" rotate={116} />
        </div>

        <main className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 py-12 gap-16 lg:gap-12 relative z-10 w-full max-w-[1600px] mx-auto min-h-[calc(100vh-100px)]">
          {/* Left Content */}
          <div className="flex-1 w-full max-w-[640px] flex flex-col justify-center">

            {/* Typography Group */}
            <div className="mb-8">


              <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tight text-[#1e293b] leading-[1.05] font-serif mb-4">
                DRAVYA
                <span className="block text-4xl md:text-5xl lg:text-[4rem] text-[#184E48] mt-2">
                  From Root to Trust.
                </span>
              </h1>

              <p className="text-[17px] md:text-[19px] lg:text-[20px] text-slate-600 leading-relaxed font-medium mt-6 max-w-xl">
                AI-powered verification and blockchain traceability for a more transparent, secure, and authentic Ayurvedic supply chain.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Link href="/verify" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#184E48] hover:bg-[#184E48]/90 text-white hover:text-white rounded-xl px-8 py-6 text-[16px] font-semibold shadow-[0_8px_30px_rgb(24,78,72,0.2)] hover:shadow-[0_8px_30px_rgb(24,78,72,0.3)] hover:-translate-y-0.5 transition-all duration-300 group flex items-center justify-center gap-2"
                >
                  <BadgeCheck className="w-5 h-5" />
                  Start Verifying
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-[#184E48]/20 bg-white hover:bg-slate-50 text-[#184E48] rounded-xl px-8 py-6 text-[16px] font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Unified Feature Bar */}
            <div className="bg-[#184E48] rounded-2xl p-1 shadow-[0_20px_40px_rgb(24,78,72,0.15)] w-fit relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/10 relative z-10">

                {/* Feature 1 */}
                <div className="flex items-center gap-3 py-3 px-5 hover:bg-white/5 transition-colors duration-300 rounded-xl sm:rounded-none sm:rounded-l-xl">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="pr-2">
                    <h3 className="font-bold text-white text-[14px] leading-tight mb-0.5">
                      Traceability
                    </h3>
                    <p className="text-[12px] text-white/70 font-medium whitespace-nowrap">End-to-End verified</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-3 py-3 px-5 hover:bg-white/5 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <FlaskConical className="w-5 h-5 text-white" />
                  </div>
                  <div className="pr-2">
                    <h3 className="font-bold text-white text-[14px] leading-tight mb-0.5">
                      Quality
                    </h3>
                    <p className="text-[12px] text-white/70 font-medium whitespace-nowrap">100% lab assured</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-3 py-3 px-5 hover:bg-white/5 transition-colors duration-300 rounded-xl sm:rounded-none sm:rounded-r-xl">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <LinkIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="pr-2">
                    <h3 className="font-bold text-white text-[14px] leading-tight mb-0.5">
                      Security
                    </h3>
                    <p className="text-[12px] text-white/70 font-medium whitespace-nowrap">Tamper-proof records</p>
                  </div>
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




      {/* Video Demo Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-slate-50/50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Decorative Floating Leaves */}
          <div className="absolute -top-10 right-12 w-[120px] lg:w-[180px] pointer-events-none z-0 opacity-15 mix-blend-multiply animate-pulse">
            <FloatingLeaf className="w-full h-auto text-[#184E48]" rotate={45} />
          </div>
          <div className="absolute -bottom-10 left-12 w-[100px] lg:w-[150px] pointer-events-none z-0 opacity-15 mix-blend-multiply animate-pulse">
            <FloatingLeaf className="w-full h-auto text-[#184E48]" rotate={-120} />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <div className="max-w-2xl lg:col-span-5">

              <h2 className="text-4xl lg:text-[3.25rem] font-bold tracking-tight text-[#1e293b] leading-[1.1] mb-6 font-serif">
                Experience radical <br className="hidden lg:block" />
                <span className="text-[#184E48]">transparency.</span>
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">
                Watch how our platform creates an unbroken chain of trust from farm to pharmacy. Every step is verified, recorded, and easily accessible.
              </p>

              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="flex gap-5 p-4 -ml-4 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-[#184E48]/5 transition-all duration-300 cursor-pointer group/item">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#184E48]/5 group-hover/item:bg-[#184E48] group-hover/item:text-white flex items-center justify-center text-[#184E48] shadow-sm border border-[#184E48]/10 transition-colors duration-300">
                    <ShieldCheck className="w-7 h-7 group-hover/item:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1e293b] mb-2 group-hover/item:text-[#184E48] transition-colors duration-300">Immutable Records</h3>
                    <p className="text-slate-600 leading-relaxed">Every transaction and quality check is permanently recorded on the blockchain, eliminating the possibility of fraud.</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-5 p-4 -ml-4 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-[#184E48]/5 transition-all duration-300 cursor-pointer group/item">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#184E48]/5 group-hover/item:bg-[#184E48] group-hover/item:text-white flex items-center justify-center text-[#184E48] shadow-sm border border-[#184E48]/10 transition-colors duration-300">
                    <TestTube2 className="w-7 h-7 group-hover/item:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1e293b] mb-2 group-hover/item:text-[#184E48] transition-colors duration-300">Integrated Lab Reports</h3>
                    <p className="text-slate-600 leading-relaxed">Instantly access AI-verified quality certificates and lab test results for every batch of raw materials.</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-5 p-4 -ml-4 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-[#184E48]/5 transition-all duration-300 cursor-pointer group/item">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#184E48]/5 group-hover/item:bg-[#184E48] group-hover/item:text-white flex items-center justify-center text-[#184E48] shadow-sm border border-[#184E48]/10 transition-colors duration-300">
                    <Tractor className="w-7 h-7 group-hover/item:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1e293b] mb-2 group-hover/item:text-[#184E48] transition-colors duration-300">Farm to Consumer Tracking</h3>
                    <p className="text-slate-600 leading-relaxed">Empower consumers to trace the complete journey of their Ayurvedic products by simply scanning a QR code.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Video Container */}
            <div className="relative group w-full max-w-[850px] mx-auto lg:col-span-7 lg:ml-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-[#184E48]/30 to-primary/30 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-100 group-hover:animate-pulse transition duration-1000"></div>

              <div className="relative rounded-[2rem] border border-white/60 bg-white/40 p-4 shadow-[0_20px_60px_rgb(0,0,0,0.08)] backdrop-blur-xl transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_30px_80px_rgb(24,78,72,0.15)]">
                <div className="absolute top-8 left-8 flex gap-2 z-20">
                  <div className="w-3 h-3 rounded-full bg-red-400/80 border border-white/20 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/80 border border-white/20 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80 border border-white/20 shadow-sm"></div>
                </div>

                <div className="overflow-hidden rounded-[1.5rem] border border-slate-100/50 bg-[#1e293b] shadow-inner relative">
                  <img
                    src="/dravya_demo_slow.gif"
                    alt="Dravya platform demo"
                    className="w-full aspect-[16/9] object-cover object-center opacity-95 transition-opacity duration-500 hover:opacity-100"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* AI Verification Section */}
      <AIVerification />

      {/* How It Works Section */}
      <HowItWorks />

      <Footer />
    </div>
  )
}
