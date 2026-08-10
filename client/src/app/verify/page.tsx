'use client'

import { useState, useRef, useEffect } from 'react'
import { LandingNavbar } from '@/features/landing/components/LandingNavbar'
import { Footer } from '@/features/landing/components/Footer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BadgeCheck, ShieldCheck, ScanLine, Search, X, Sparkles } from 'lucide-react'
import { Smartphone, ChevronDown,ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LeafSprig } from '@/features/landing/components/LeafSprig'
import { FloatingLeaf } from '@/features/landing/components/FloatingLeaf'
import jsQR from 'jsqr'


export default function VerifyPage() {
  const [scanning, setScanning] = useState(false)
  const [batchId, setBatchId] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)

  const startScan = async () => {
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        tick()
      }
    } catch {
      setScanning(false)
      alert('Camera access denied or unavailable')
    }
  }

  const stopScan = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setScanning(false)
  }

  const tick = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code) {
          setBatchId(code.data)
          stopScan()
          return
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    return () => stopScan()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative font-sans overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(24,78,72,0.08),transparent_60%)] z-0" />

      <div className="absolute top-[12%] left-0 w-[200px] md:w-[300px] lg:w-[400px] pointer-events-none z-0 opacity-75 mix-blend-multiply transform -translate-x-[15%]">
        <LeafSprig className="w-full h-auto text-primary" />
      </div>

      <div className="absolute top-[25%] right-0 w-[200px] md:w-[300px] lg:w-[400px] pointer-events-none z-0 opacity-75 mix-blend-multiply transform translate-x-[15%]">
        <LeafSprig className="w-full h-auto text-primary" flip={true} />
      </div>

      <div className="absolute top-[45%] left-[17%] w-[110px] md:w-[122px] lg:w-[130px] pointer-events-none z-0 opacity-50 mix-blend-multiply">
        <FloatingLeaf className="w-full h-auto text-primary" rotate={-70} />
      </div>

      <div className="absolute top-[18%] right-[17%] w-[90px] md:w-[100px] lg:w-[120px] pointer-events-none z-0 opacity-45 mix-blend-multiply">
        <FloatingLeaf className="w-full h-auto text-primary" rotate={70} />
      </div>

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

  <div className="flex items-center gap-4">
<Link
  href="/"
  className="flex items-center gap-2 text-sm font-bold text-white bg-teal-800 hover:bg-teal-700 transition-colors rounded-lg py-2 px-4"
>
  <ArrowLeft className="w-4 h-4" />
  Back to Home
</Link>

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



      <div className="flex flex-col items-center justify-center px-6 py-24 relative z-10 max-w-2xl mx-auto text-center">

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#184E48] leading-[1.1] mb-4 font-serif">
          Verify Your Batch
        </h1>
        <p className="text-base md:text-lg text-gray-600 mb-10 max-w-md mx-auto">
          Enter a batch ID or scan the QR code on the product to trace its full journey from farm to shelf.
        </p>

        <div className="w-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_40px_rgb(0,0,0,0.08)] rounded-[24px] p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="Enter batch ID (e.g. DRV-2026-00123)"
                className="bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 rounded-xl shadow-sm focus-visible:ring-[#184E48]/20 focus-visible:border-[#184E48] text-base"
              />
              <Button className="h-12 px-8 bg-[#184E48] hover:bg-[#184E48]/90 text-white rounded-xl shadow-md transition-all active:scale-[0.98] font-semibold text-base shrink-0">
                <Search className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <Button
              onClick={startScan}
              variant="outline"
              className="h-12 w-full rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all active:scale-[0.98] font-semibold text-base"
            >
              <ScanLine className="h-5 w-5 mr-2 text-[#184E48]" />
              Scan QR Code
            </Button>
          </div>
        </div>

        <div className="w-full mt-10 p-6 bg-[#184E48] rounded-2xl text-left flex gap-4 shadow-xl border border-white/10">
          <div className="h-10 w-10 shrink-0 bg-white/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-teal-200" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm mb-1">How it works</h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              Every batch is recorded on-chain at each stage — collection, processing, distribution, and sale.
              Verifying a batch shows you its complete, tamper-proof history.
            </p>
          </div>
        </div>
      </div>
{scanning && (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 px-6">
    <div className="relative rounded-2xl overflow-hidden w-[90vw] max-w-sm aspect-square bg-black shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
        autoPlay
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan frame overlay */}
      <div className="pointer-events-none absolute inset-8 rounded-xl">
        <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
        <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
        <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
        <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
      </div>

      <button
        onClick={stopScan}
        aria-label="Close scanner"
        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
    <p className="mt-4 text-white text-sm">Point the camera at the QR code</p>
  </div>
)}

      <Footer />
    </div>
  )
}
