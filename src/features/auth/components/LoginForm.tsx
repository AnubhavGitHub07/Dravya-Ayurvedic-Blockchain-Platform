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
    <Card className="w-full max-w-[420px] mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 rounded-2xl bg-white/95 backdrop-blur-xl">
      <CardHeader className="pt-6 pb-2 flex flex-col items-center text-center">
        <Sprout className="w-12 h-12 text-primary mb-3 stroke-[1.5]" />
        <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium text-sm mt-1">
          Login to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-slate-700 font-semibold text-sm ml-1">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Enter your email"
                        className="pl-9 h-10 border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 rounded-lg focus-visible:ring-primary/40 focus-visible:border-primary transition-all text-base shadow-sm"
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
                <FormItem className="space-y-1">
                  <FormLabel className="text-slate-700 font-semibold text-sm ml-1">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-9 pr-9 h-10 border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 rounded-lg focus-visible:ring-primary/40 focus-visible:border-primary transition-all text-base shadow-sm"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
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

            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 text-[14px] font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                <input
                  type="checkbox"
                  className="rounded-[4px] border border-slate-300 bg-white text-primary focus:ring-primary/40 w-4 h-4 accent-primary"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-[14px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-lg text-[16px] font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              Sign In
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-2 text-slate-400 text-[12px] uppercase tracking-wider font-bold">
                or
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-lg text-[15px] font-semibold border-slate-200 text-slate-700 flex items-center gap-2 hover:bg-slate-50/80 transition-all active:scale-[0.98] shadow-sm"
            >
              <Users className="w-4 h-4 text-primary" />
              Create New Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center border-t border-slate-100 py-3 bg-slate-50/50 rounded-b-2xl">
        <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-semibold tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          Secure access for authorized users only
        </div>
      </CardFooter>
    </Card>
  )
}
