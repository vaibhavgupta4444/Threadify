"use client"

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
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiClient } from '../../../lib/app-client'
import { Camera } from 'lucide-react'
import { updateProfileSchema } from '@/schemas/updateProfileSchema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { upload } from '@imagekit/next'
import { useSession } from 'next-auth/react'

const Page = () => {
  const router = useRouter()
  const { data: userData } = useSession()

  const [file, setFile] = useState<File | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string>("")
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

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
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Update Profile
        </h1>

        {/* Avatar Upload Section */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <Avatar className="h-32 w-32 ring-2 ring-primary">
              <AvatarImage
                src={preview ?? profilePicUrl ?? undefined}
                alt="Profile preview"
              />
              <AvatarFallback>{"U"}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0">
              <label
                htmlFor="profilePic"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-primary"
              >
                <Camera />
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
        </div>

        {/* Form for names only */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-evenly py-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Joe" 
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
                        placeholder="Doe" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isUploading || isSubmitting}
              className="w-full bg-primary text-white hover:bg-primary/90"
              onClick={() => console.log("Button clicked")} // Debug
            >
              {isUploading
                ? "Uploading..."
                : isSubmitting
                ? "Updating..."
                : "Update"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Page