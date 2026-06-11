"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Navbar } from "@/components/layout/Navbar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

import { FileUploadZone } from "@/components/setup/FileUploadZone"

// Zod Validation Schema
const formSchema = z.object({
  productDescription: z.string().min(10, "Please provide a detailed product description (min 10 chars)."),
  targetCustomer: z.string().min(3, "Please specify your target customer."),
  pricingModel: z.string().min(2, "Please provide your pricing model."),
  coreValueProposition: z.string().min(10, "Please provide your core value proposition (min 10 chars)."),
})

type FormValues = z.infer<typeof formSchema>

export default function SetupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [additionalContext, setAdditionalContext] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productDescription: "",
      targetCustomer: "",
      pricingModel: "",
      coreValueProposition: "",
    },
  })

  const handleExtraction = (text: string) => {
    setAdditionalContext((prev) => prev + "\n" + text)
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    const fullData = { ...data, additionalContext }
    sessionStorage.setItem("pitchContext", JSON.stringify(fullData))
    sessionStorage.removeItem("clientId")
    router.push("/pitch")
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="p-6 sm:p-8 border-border/60 shadow-sm">
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Set up Company Context
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Provide details about your offering to generate a tailored sales narrative.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                Product Description
              </label>
              <Textarea 
                placeholder="What does your product do?" 
                {...form.register("productDescription")}
                className={form.formState.errors.productDescription ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {form.formState.errors.productDescription && (
                <p className="text-sm text-red-500">{form.formState.errors.productDescription.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                Target Customer
              </label>
              <Input 
                placeholder="e.g. VPs of Sales at mid-market tech companies" 
                {...form.register("targetCustomer")}
                className={form.formState.errors.targetCustomer ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {form.formState.errors.targetCustomer && (
                <p className="text-sm text-red-500">{form.formState.errors.targetCustomer.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                Pricing Model
              </label>
              <Input 
                placeholder="e.g. $50/user/month" 
                {...form.register("pricingModel")}
                className={form.formState.errors.pricingModel ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {form.formState.errors.pricingModel && (
                <p className="text-sm text-red-500">{form.formState.errors.pricingModel.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                Core Value Proposition
              </label>
              <Textarea 
                placeholder="Why do they buy?" 
                {...form.register("coreValueProposition")}
                className={form.formState.errors.coreValueProposition ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {form.formState.errors.coreValueProposition && (
                <p className="text-sm text-red-500">{form.formState.errors.coreValueProposition.message}</p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-sm font-medium leading-none text-foreground block mb-4 mt-4">
                Additional Knowledge (Optional)
              </label>
              <FileUploadZone onExtractionComplete={handleExtraction} />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Generate Pitch"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
