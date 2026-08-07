import { Button } from '@/components/ui/button'
import { Smartphone, ChevronDown, Sprout } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function LandingNavbar() {
  return (
    <div className="w-full bg-[#184E48] backdrop-blur-xl border-b border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-all duration-300">
      <nav className="flex items-center justify-between px-6 py-2.5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-[66px] h-[66px] rounded-full overflow-hidden flex-shrink-0">
            <img
              src="/logo-out.png"
              alt="Dravya"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold leading-none text-white tracking-tight font-serif">
                Dravya
              </h1>
              <div className="w-[1.5px] h-4 bg-white/30 rounded-full" />
              <span className="text-lg font-medium text-[var(--accent)] leading-none mt-0.5">
                द्रव्य
              </span>
            </div>

            <p className="text-[10px] text-slate-300 font-bold tracking-[0.15em] uppercase mt-1">
              Trust in every herb
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-base font-bold text-white border-b-2 border-teal-200 pb-1">
            Home
          </Link>
          <Link
            href="#"
            className="text-base font-semibold text-slate-300 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="#"
            className="text-base font-semibold text-slate-300 hover:text-white transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#"
            className="text-base font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#"
            className="text-base font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="hidden lg:flex items-center gap-2 rounded-lg border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white px-5"
          >
            <Smartphone className="w-4 h-4 text-teal-200" />
            Download App
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-lg border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white px-4"
          >
            English
            <ChevronDown className="w-4 h-4 text-slate-300" />
          </Button>
        </div>
      </nav>
    </div>
  )
}
