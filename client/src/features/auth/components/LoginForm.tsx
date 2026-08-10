'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, Lock, EyeOff, Eye, Users, ShieldCheck, Sprout } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
})

export function LoginForm() {
  const login = useAuthStore((state) => state.login)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = 'auth_token=mock_token; path=/'
    login({ id: '1', name: 'Demo User', email: values.email, role: 'admin' })
    toast.success('Successfully logged in!')
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-[440px] mx-auto">
      <div className="relative group">
        {/* Decorative background blur */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#184E48]/20 to-primary/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-70 transition duration-1000 group-hover:duration-300"></div>
        
        <Card className="relative bg-white/90 backdrop-blur-xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-[28px] overflow-hidden">
          
          <CardHeader className="pt-8 pb-4 flex flex-col items-center text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium text-sm mt-1.5">
              Login to access your secure dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-slate-700 font-semibold text-sm ml-1">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Enter your email"
                            className="pl-10 h-11 border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl focus-visible:ring-[#184E48]/20 focus-visible:border-[#184E48] transition-all text-base shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[13px] ml-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-slate-700 font-semibold text-sm ml-1">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 h-11 border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl focus-visible:ring-[#184E48]/20 focus-visible:border-[#184E48] transition-all text-base shadow-sm"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[13px] ml-1" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-1 pb-2">
                  <label className="flex items-center gap-2 text-[14px] font-medium text-slate-600 cursor-pointer hover:text-slate-900 transition-colors group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-4.5 h-4.5 border border-slate-300 rounded-[6px] bg-white checked:bg-[#184E48] checked:border-[#184E48] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#184E48]/20"
                      />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 peer-checked:animate-in peer-checked:zoom-in-50 pointer-events-none" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    Remember me
                  </label>
                  <a
                    href="#"
                    className="text-[14px] font-semibold text-[#184E48] hover:text-[#184E48]/80 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-[16px] font-semibold bg-[#184E48] hover:bg-[#184E48]/90 text-white shadow-[0_4px_14px_0_rgb(24,78,72,0.2)] hover:shadow-[0_6px_20px_rgb(24,78,72,0.23)] transition-all active:scale-[0.98]"
                >
                  Sign In
                </Button>

              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex-col gap-3 border-t border-slate-100 px-8 py-5 bg-slate-50/50">
            <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-[#1a4a2c] mb-2">
              <ShieldCheck className="w-4 h-4 text-[#184E48]" />
              <span>Secure, encrypted authentication</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-slate-500 font-medium">
              <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <a href="#" className="hover:text-slate-800 transition-colors">Help Center</a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
