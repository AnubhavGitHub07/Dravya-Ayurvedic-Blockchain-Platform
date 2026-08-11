import React from "react"
import { BadgeCheck, BrainCircuit, Leaf, ScanSearch, ShieldCheck, Fingerprint, CheckCircle2 } from "lucide-react"
import { LeafSprig } from "./LeafSprig"
import { FloatingLeaf } from "./FloatingLeaf"

export function AIVerification() {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      <style>
        {`
          @keyframes scan {
            0% { top: 5%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 95%; opacity: 0; }
          }
          .animate-scan {
            animation: scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}
      </style>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[-5%] w-[300px] md:w-[450px] opacity-20 mix-blend-multiply">
          <LeafSprig className="w-full h-auto text-[#184E48]" />
        </div>
        <div className="absolute bottom-[5%] right-[-5%] w-[300px] md:w-[500px] opacity-20 mix-blend-multiply">
          <LeafSprig className="w-full h-auto text-[#184E48]" flip={true} />
        </div>

        {/* Subtle Floating Leaves */}
        <div className="absolute top-[20%] right-[48%] w-[80px] lg:w-[120px] opacity-30 mix-blend-multiply animate-[pulse_6s_ease-in-out_infinite]">
          <FloatingLeaf className="w-full h-auto text-[#184E48]" rotate={45} />
        </div>
        <div className="absolute bottom-[30%] left-[10%] w-[100px] lg:w-[140px] opacity-30 mix-blend-multiply animate-[bounce_8s_ease-in-out_infinite]">
          <FloatingLeaf className="w-full h-auto text-[#184E48]" rotate={-30} />
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24">

        {/* Left Side: Context & Content */}
        <div className="flex flex-col justify-center">


          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Identify. Analyze.
            <span className="text-[#1a4a2c] relative whitespace-nowrap block mt-2">
              {" "}Verify.
              <svg className="absolute -bottom-2 left-0 w-32 h-3 text-[#B8D0C3]/60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
          </h2>

          <p className="mt-8 max-w-lg text-lg leading-8 text-slate-600">
            Dravya replaces manual inspection with advanced computer vision. Our models instantly identify medicinal herbs, detect impurities, and cryptographically anchor the results to the blockchain.
          </p>

          <div className="mt-10 flex flex-col gap-8">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a4a2c] to-[#2a6a42] shadow-md shadow-[#1a4a2c]/20">
                <ScanSearch className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Intelligent Recognition</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  Scans biological markers to identify exact species and varieties with over 99.8% precision, ensuring authentic sourcing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a4a2c] to-[#2a6a42] shadow-md shadow-[#1a4a2c]/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Quality Assessment</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  Automatically flags visual defects, discoloration, or potential foreign contaminants in the batch before processing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a4a2c] to-[#2a6a42] shadow-md shadow-[#1a4a2c]/20">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Immutable Logging</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  Verification data is hashed and permanently stored, creating an unalterable proof of origin on the blockchain.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The "Alive" AI Scanner Image */}
        <div className="relative flex justify-center lg:justify-end mt-10 lg:mt-0">
          {/* Main Glowing Backdrop */}
          <div className="absolute inset-0 bg-[#D5E2DB]/40 blur-3xl rounded-full transform scale-90 pointer-events-none" />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border-[6px] border-white bg-slate-900 shadow-[0_20px_50px_rgba(26,74,44,0.15)] group">

            {/* Image Container with tech overlay */}
            <div className="relative h-[550px] w-full overflow-hidden bg-slate-900">
              {/* Subtle grid background */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0gMjAgMCBMMCAwIDAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] z-0" />

              <img
                src="/tul-ki-si.jpg"
                alt="AI verifying medicinal herb"
                className="absolute inset-0 h-full w-full object-cover transition-all duration-[2000ms] group-hover:scale-110 opacity-90 mix-blend-luminosity group-hover:mix-blend-normal z-10"
              />
            </div>

            {/* Simulated AI Scanner Line */}
            <div className="absolute left-0 right-0 h-[2px] bg-[#4ade80] shadow-[0_0_15px_4px_rgba(74,222,128,0.5)] z-20 animate-scan">
              {/* Scanner glow center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-[2px] bg-white rounded-full blur-[1px]" />
            </div>

            {/* Target Reticles (Corners) */}
            <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-[#4ade80]/70 rounded-tl-xl z-20 transition-all duration-500 group-hover:scale-110 group-hover:-translate-x-2 group-hover:-translate-y-2" />
            <div className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-[#4ade80]/70 rounded-tr-xl z-20 transition-all duration-500 group-hover:scale-110 group-hover:translate-x-2 group-hover:-translate-y-2" />
            <div className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-[#4ade80]/70 rounded-bl-xl z-20 transition-all duration-500 group-hover:scale-110 group-hover:-translate-x-2 group-hover:translate-y-2" />
            <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-[#4ade80]/70 rounded-br-xl z-20 transition-all duration-500 group-hover:scale-110 group-hover:translate-x-2 group-hover:translate-y-2" />

            {/* Top Badge: Live Status */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-md px-4 py-1.5 z-20 shadow-lg">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white">Live Processing</span>
            </div>

            {/* Bottom Left: Confidence Score Widget */}
            <div className="absolute bottom-32 left-8 z-20 flex w-48 flex-col gap-2 rounded-xl border border-white/20 bg-black/60 backdrop-blur-md p-3 text-white shadow-xl transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700 delay-100">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-slate-300">Match Confidence</span>
                <span className="text-xs font-bold text-[#4ade80]">99.8%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[99.8%] rounded-full bg-gradient-to-r from-[#22c55e] to-[#4ade80]" />
              </div>
            </div>

            {/* Bottom Right: Final Identification Card */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-2xl border border-white/50 bg-white/95 p-4 shadow-2xl backdrop-blur-xl z-30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-200">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a4a2c] to-[#2a6a42] shadow-inner">
                <Leaf className="h-7 w-7 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-slate-900 leading-tight">
                    Ocimum tenuiflorum
                  </p>
                  <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                </div>
                <p className="text-sm font-semibold text-slate-500 mt-0.5">
                  Common: Holy Basil (Tulsi)
                </p>
              </div>

              <div className="flex flex-col items-end justify-center border-l border-slate-200 pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</span>
                <span className="inline-flex items-center rounded bg-[#e8f5ed] px-2.5 py-1 text-xs font-extrabold text-[#1a4a2c]">
                  Verified
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}