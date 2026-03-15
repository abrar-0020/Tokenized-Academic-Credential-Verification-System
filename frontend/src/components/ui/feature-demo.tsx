import { FeatureSteps } from "@/components/ui/feature-section"

const features = [
  { 
    step: 'Step 1', 
    title: 'Institution Issues',
    content: 'Authorized institutions issue non-transferable digital credentials as Soulbound NFTs to students.', 
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop' 
  },
  { 
    step: 'Step 2',
    title: 'Student Owns',
    content: 'Students permanently own their credentials. Credentials cannot be transferred, ensuring authenticity.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop'
  },
  { 
    step: 'Step 3',
    title: 'Anyone Verifies',
    content: 'Employers and third parties can instantly verify credentials on-chain without intermediaries.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop'
  },
]

export function FeatureStepsDemo() {
  return (
      <FeatureSteps 
        features={features}
        title="How It Works"
        autoPlayInterval={4000}
        imageHeight="h-[500px]"
      />
  )
}
