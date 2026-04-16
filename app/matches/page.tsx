import { Metadata } from "next"
import { MatchesSection } from "@/components/matches-section"

export const metadata: Metadata = {
  title: "Matches | kqMatches",
  description: "Oglądaj mecze piłki nożnej na żywo",
}

export default function MatchesPage() {
  return (
    <div className="pt-24 md:pt-32">
      <MatchesSection />
    </div>
  )
}
