-- Add is_test flag for logical deletion (soft delete)
-- Test data can be excluded from production results without actual deletion
ALTER TABLE survey_responses
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_survey_responses_is_test ON survey_responses(is_test) WHERE is_test = TRUE;
