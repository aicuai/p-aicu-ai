import { notFound } from "next/navigation"
import { getSurveyConfig } from "@/data/surveys"
import SurveyGate from "./SurveyGate"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const config = getSurveyConfig(id)
  if (!config) return { title: "Not Found" }
  const resolved = await config
  return {
    title: `${resolved.title} | AICU Research`,
    description: resolved.description,
  }
}

export default async function SurveyPage({ params, searchParams }: Props) {
  const { id } = await params
  const loader = getSurveyConfig(id)
  if (!loader) notFound()

  const config = await loader
  const { email } = await searchParams

  return <SurveyGate surveyId={id} config={config} email={email} />
}
