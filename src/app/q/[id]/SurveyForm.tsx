"use client"

import LiquidGlassForm from "@/components/LiquidGlassForm"
import type { SurveyConfig } from "@/data/surveys"

type Props = {
  surveyId?: string
  config: SurveyConfig
  email?: string
}

export default function SurveyForm({ surveyId, config, email }: Props) {
  return <LiquidGlassForm formConfig={config} initialEmail={email} surveyLabel={surveyId} />
}
