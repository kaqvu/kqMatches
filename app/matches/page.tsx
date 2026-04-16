import { Metadata } from "next"
import { MatchesSection } from "@/components/matches-section"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Matches | kqMatches",
  description: "Oglądaj mecze piłki nożnej na żywo",
}

function MatchesSectionWrapper() {
  return <MatchesSection />
}

export default function MatchesPage() {
  return (
    <div className="pt-24 md:pt-32">
      <Suspense fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      }>
        <MatchesSectionWrapper />
      </Suspense>
    </div>
  )
}
