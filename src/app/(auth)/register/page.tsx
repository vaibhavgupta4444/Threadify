"use client"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useDebounceCallback } from 'usehooks-ts'
import { Input } from '@/components/ui/input'
import { signUpSchema } from '@/schemas/signUpSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiClient } from '../../../../lib/app-client'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'

const Page = () => {

  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState('')
  const debouncedUsername = useDebounceCallback(setUsername, 300)

  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: '',
      contactNo: "",
      password: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    if (!username) return

    const checkUsernameUnique = async () => {
      setIsCheckingUsername(true)
      setUsernameMessage('')
      try {
        const response = await apiClient.checkUsername(username);
        setUsernameMessage(response.message!);
      } catch (error) {
        console.log(error);
        setUsernameMessage('Error checking username');
      } finally {
        setIsCheckingUsername(false)
      }
    }

    checkUsernameUnique()
  }, [username])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      const response = await apiClient.register({ username: data.username, email: data.email, contactNo: data.contactNo, password: data.password });
      if (response.success) {
        toast.success(response.message);
        router.push('/verify/' + data.username);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand Section */}
        <div className="text-center mb-8">
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Create your account
          </h1>
          <p className="text-muted-foreground">Join the community and start sharing your creativity</p>
        </div>

        {/* Form Container */}
        <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          debouncedUsername(e.target.value)
                        }}
                      />
                      {isCheckingUsername && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {usernameMessage && (
                    <p className={`text-sm ${usernameMessage === "Username is available" ? 'text-green-600' : 'text-destructive'}`}>
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Create a strong password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        </Card>
      </div>
    </div>
  )
}

export default Page
