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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, ShieldCheck, UserRoundPen } from 'lucide-react'
import { useState } from 'react'


const formSchema = z.object({

  name: z.string().min(2,{
    message:"Name is required."
  }),
   

  email:z.string().email({
    message:"Please enter a valid email address."
  }),

  gstNumber:z.string().min(15, {
    message:"GST Number must be exactly 15 characters."
  }).max(15, {
    message:"GST Number must be exactly 15 characters."
  }),

  password:z.string().min(6,{
    message:"Password must be at least 6 characters."
  }),

  confirmPassword:z.string(),

  role:z.string({
    message:"Please select a role."
  })

}).refine((data)=>data.password===data.confirmPassword,{
  message:"Passwords don't match.",
  path:["confirmPassword"]
})



export function RegisterForm(){

const router = useRouter()

const [showPassword,setShowPassword] = useState(false)
const [showConfirmPassword,setShowConfirmPassword] = useState(false)



const form = useForm<z.infer<typeof formSchema>>({

resolver:zodResolver(formSchema),

defaultValues:{
  name:"",
  email:"",
  gstNumber:"",
  password:"",
  confirmPassword:"",
  role:"",
  
}

})



function onSubmit(values:z.infer<typeof formSchema>){

console.log(values)

    // eslint-disable-next-line react-hooks/immutability
    document.cookie="auth_token=mock_token; path=/"

toast.success("Account created successfully!")

router.push("/dashboard")

}

return (

<div className="w-full max-w-[640px] mx-auto relative group">
  {/* Decorative background blur */}
  <div className="absolute -inset-1 bg-gradient-to-r from-[#184E48]/20 to-primary/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-70 transition duration-1000 group-hover:duration-300"></div>

  <Card className="relative bg-white/90 backdrop-blur-xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-[24px] overflow-hidden p-6 sm:p-8">

        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 p-2 bg-[#184E48]/10 rounded-2xl text-[#184E48] mb-2 shadow-sm border border-[#184E48]/10 flex items-center justify-center">
            <UserRoundPen className='h-full w-full'/>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] leading-[1.15] font-serif">
            Set up your account
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Start tracing your batches with absolute trust.</p>
        </div><Form {...form}>

<form 
onSubmit={form.handleSubmit(onSubmit)}
className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3"
>



<FormField

control={form.control}

name="name"

render={({field})=>(

<FormItem>

<FormLabel className="text-slate-700 font-semibold text-sm ml-1">Full Name <span className="text-red-500">*</span></FormLabel>

<FormControl>

<Input
placeholder="Enter your name"
 style={{ caretColor: 'black', color: field.value ? 'black' : undefined }}
                        className="px-3.5 h-9 border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl focus-visible:ring-[#184E48]/20 focus-visible:border-[#184E48] transition-all text-sm shadow-sm"
{...field}
/>

</FormControl>

<FormMessage/>

</FormItem>

)}

/>



<FormField

control={form.control}

name="email"

render={({field})=>(

<FormItem>

<FormLabel className="text-slate-700 font-semibold text-sm ml-1">Email Address <span className="text-red-500">*</span></FormLabel>

<FormControl>

<Input
placeholder="Enter your email"
 style={{ caretColor: 'black', color: field.value ? 'black' : undefined }}
                        className="px-3.5 h-9 border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl focus-visible:ring-[#184E48]/20 focus-visible:border-[#184E48] transition-all text-sm shadow-sm"
{...field}
/>

</FormControl>

<FormMessage/>

</FormItem>

)}

/>





<FormField
  control={form.control}
  name="gstNumber"
  render={({field})=>(
    <FormItem>
      <FormLabel className="text-slate-700 font-semibold text-sm ml-1">GST Number <span className="text-red-500">*</span></FormLabel>
      <FormControl>
        <Input
          placeholder="Enter 15-digit GST number"
          style={{ caretColor: 'black', color: field.value ? 'black' : undefined }}
          className="px-3.5 h-9 border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl focus-visible:ring-[#184E48]/20 focus-visible:border-[#184E48] transition-all text-sm shadow-sm uppercase"
          maxLength={15}
          {...field}
        />
      </FormControl>
      <FormMessage/>
    </FormItem>
  )}
/>

<FormField

control={form.control}

name="role"

render={({field})=>(

<FormItem>

<FormLabel className="text-slate-700 font-semibold text-sm ml-1">Select Your Role <span className="text-red-500">*</span></FormLabel>


<Select

onValueChange={field.onChange}

defaultValue={field.value}

>

<FormControl>

<SelectTrigger className="w-full px-3.5 h-9 border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl focus:ring-[#184E48]/20 focus:border-[#184E48] transition-all text-sm shadow-sm">

<SelectValue placeholder="Select your role"/>

</SelectTrigger>

</FormControl>


<SelectContent>

<SelectItem value="admin">
Admin
</SelectItem>


<SelectItem value="processor">
Processor
</SelectItem>


<SelectItem value="manufacturer">
Manufacturer
</SelectItem>


<SelectItem value="lab">
Lab
</SelectItem>


</SelectContent>


</Select>


<FormMessage/>

</FormItem>

)}

/>




<FormField

control={form.control}

name="password"

render={({field})=>(

<FormItem>

<FormLabel className="text-slate-700 font-semibold text-sm ml-1">Password <span className="text-red-500">*</span></FormLabel>


<div className="relative">

<FormControl>

<Input

type={showPassword ? "text":"password"}

placeholder="Create password"

 style={{ caretColor: 'black', color: field.value ? 'black' : undefined }}
                        className="px-3.5 h-9 border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl focus-visible:ring-[#184E48]/20 focus-visible:border-[#184E48] transition-all text-sm shadow-sm"

{...field}

/>

</FormControl>


<button

type="button"

onClick={()=>setShowPassword(!showPassword)}

className="absolute right-3 top-2.5 text-slate-400"

>

{

showPassword ?

<EyeOff size={18}/>:

<Eye size={18}/>

}

</button>


</div>


<FormMessage/>

</FormItem>

)}

/>




<FormField

control={form.control}

name="confirmPassword"

render={({field})=>(

<FormItem>

<FormLabel className="text-slate-700 font-semibold text-sm ml-1">Confirm Password <span className="text-red-500">*</span></FormLabel>


<div className="relative">


<FormControl>

<Input

type={showConfirmPassword ? "text":"password"}

placeholder="Confirm password"

 style={{ caretColor: 'black', color: field.value ? 'black' : undefined }}
                        className="px-3.5 h-9 border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl focus-visible:ring-[#184E48]/20 focus-visible:border-[#184E48] transition-all text-sm shadow-sm"

{...field}

/>

</FormControl>


<button

type="button"

onClick={()=>setShowConfirmPassword(!showConfirmPassword)}

className="absolute right-3 top-2.5 text-slate-400"

>

{

showConfirmPassword ?

<EyeOff size={18}/>:

<Eye size={18}/>

}

</button>


</div>


<FormMessage/>

</FormItem>

)}

/>



<Button
type="submit"
className="col-span-1 sm:col-span-2 w-full h-10 rounded-xl text-[14px] font-semibold bg-[#184E48] hover:bg-[#184E48]/90 text-white shadow-[0_4px_14px_0_rgb(24,78,72,0.2)] hover:shadow-[0_6px_20px_rgb(24,78,72,0.23)] transition-all active:scale-[0.98] mt-2"
>
Create Account
</Button>



</form>

</Form>

  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1a4a2c]">
      <ShieldCheck className="w-4 h-4 text-[#184E48]" />
      <span>Secure, encrypted registration</span>
    </div>
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-slate-500 font-medium">
      <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
      <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
      <a href="#" className="hover:text-slate-800 transition-colors">Help Center</a>
    </div>
  </div>

</Card>
</div>


)

}