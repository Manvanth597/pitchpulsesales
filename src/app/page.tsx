import { HeroSection } from "@/components/landing/HeroSection"
import { ProcessFlow } from "@/components/landing/ProcessFlow"
import { ProductPreview } from "@/components/landing/ProductPreview"
import { BenefitsGrid } from "@/components/landing/BenefitsGrid"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Footer } from "@/components/landing/Footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection />
        <ProcessFlow />
        <ProductPreview />
        <BenefitsGrid />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
