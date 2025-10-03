"use client"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiClient } from '../../../lib/app-client'
import { Camera, ArrowLeft, Loader2 } from 'lucide-react'
import { updateProfileSchema } from '@/schemas/updateProfileSchema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { upload } from '@imagekit/next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const Page = () => {
  const router = useRouter()
  const { data: userData } = useSession()

  const [file, setFile] = useState<File | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string>("")
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const isAuthenticated = !!userData?.user;

  // Upload auth
  async function authenticator() {
    try {
      return await apiClient.uploadAuth()
    } catch (err) {
      console.error(err)
      throw new Error("Internal server error")
    }
  }

  // Handle file pick
  const onPickFile = (file?: File) => {
    if (!file) {
      setPreview(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please select an image under 5MB.")
      return
    }

    setFile(file)
    setPreview(URL.createObjectURL(file))
  }

  // Auto upload when file changes
  useEffect(() => {
    const uploadFile = async () => {
      if (!file) return
      setIsUploading(true)

      try {
        const { signature, expire, token, publicKey } = await authenticator()

        const res = await upload({
          expire,
          token,
          signature,
          publicKey,
          folder: `/userProfileImage/${userData?.user.id}`,
          file,
          fileName: file.name,
        })

        setProfilePicUrl(res.filePath!)
        toast.success("Profile image uploaded successfully!")
      } catch (err) {
        console.error(err)
        toast.error("Failed to upload image")
      } finally {
        setIsUploading(false)
      }
    }

    uploadFile()
  }, [file, userData?.user.id])

  // Form setup with proper default values
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  })

  // Submit handler - FIXED
  const onSubmit = async (data: z.infer<typeof updateProfileSchema>) => {
    
    // Prevent submission if image is still uploading
    if (isUploading) {
      toast.error("Please wait for image upload to complete")
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await apiClient.updateProfile({
        userId: userData?.user.id,
        image: profilePicUrl,  
        firstName: data.firstName,
        lastName: data.lastName,
      })

      if (response.success) {
        toast.success("Profile updated successfully!")
        router.push("/")
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error: any) {
      console.error("Submission error:", error)
      toast.error(error.message || "Something went wrong!")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add debug logging to see if form submission is triggered
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form values:", value)
    })
    return () => subscription.unsubscribe()
  }, [form])

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Update Profile</h1>
              <p className="text-muted-foreground">Customize your profile information</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-6">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <Avatar className="h-32 w-32 ring-2 ring-border">
                <AvatarImage
                  src={preview ?? profilePicUrl ?? undefined}
                  alt="Profile preview"
                />
                <AvatarFallback className="text-2xl">
                  {userData?.user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <label
                  htmlFor="profilePic"
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </label>
                <input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onPickFile(e.target.files?.[0])}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Click the camera icon to upload a new profile picture
            </p>
            {isUploading && (
              <p className="text-sm text-primary mt-2">Uploading image...</p>
            )}
          </div>

          {/* Form for names only */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your first name" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your last name" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <Link href="/">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || isSubmitting}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default Page