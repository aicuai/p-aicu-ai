-- Add reward tracking columns to survey_responses
ALTER TABLE survey_responses
  ADD COLUMN IF NOT EXISTS reward_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS reward_confirmed_at TIMESTAMPTZ;

-- Values: 'none' (no email), 'pending' (webhook sent), 'confirmed' (Wix callback received), 'failed'
COMMENT ON COLUMN survey_responses.reward_status IS 'none | pending | confirmed | failed';

CREATE INDEX idx_survey_responses_email ON survey_responses(email) WHERE email IS NOT NULL;
