#!/usr/bin/env node
/**
 * import-r2511.mjs — R2511 回答データを survey_responses にインポート
 *
 * Usage:
 *   node scripts/import-r2511.mjs [--dry-run]
 *
 * Data source: GAS API endpoint (R2511 回答スプレッドシート)
 * Target: Supabase survey_responses table
 *
 * Requires .env.local:
 *   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_KEY
 */

import { createClient } from "@supabase/supabase-js"
import { createHash } from "crypto"
import { config } from "dotenv"

// Load .env.local
config({ path: ".env.local" })

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local")
  process.exit(1)
}

const GAS_API_URL =
  "https://script.google.com/macros/s/AKfycbxqoIxooh5BCLhZy1unGH2ANO24GoGX4xSaPu0-Fe24yjwQPsCuHRltcMduWA_PEgLY/exec"

const DRY_RUN = process.argv.includes("--dry-run")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  console.log("Fetching R2511 data from GAS API...")

  const res = await fetch(`${GAS_API_URL}?action=responses`)
  if (!res.ok) {
    console.error(`GAS API error: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const data = await res.json()
  const responses = data.responses || []
  console.log(`Found ${responses.length} responses`)

  if (responses.length === 0) {
    console.log("No responses to import")
    return
  }

  // Check existing count
  const { count: existingCount } = await supabase
    .from("survey_responses")
    .select("id", { count: "exact", head: true })
    .eq("survey_id", "R2511")

  console.log(`Existing R2511 records in survey_responses: ${existingCount || 0}`)

  if (existingCount && existingCount > 0) {
    console.log("R2511 data already imported. Use --force to reimport (not implemented).")
    console.log("Skipping import.")
    return
  }

  // Transform GAS responses to survey_responses format
  const rows = responses.map((r) => {
    // Extract email from answers if available (look for email-like Q keys)
    let email = null
    const answers = {}

    for (const [key, value] of Object.entries(r)) {
      // Skip meta fields
      if (["uuid", "emoji_avatar", "submitted_at"].includes(key)) continue
      if (key.endsWith("_type") || key.endsWith("_length")) continue

      // Check for redacted email
      if (value === "[EMAIL]") {
        // Email was redacted by GAS — we can't recover it
        continue
      }
      if (value === "[REDACTED]" || value === "[FREE_TEXT]") {
        answers[key] = value
        continue
      }

      answers[key] = value
    }

    // Hash the UUID as a pseudo-IP for dedup
    const ipHash = createHash("sha256")
      .update(r.uuid || "unknown")
      .digest("hex")
      .slice(0, 16)

    return {
      survey_id: "R2511",
      answers,
      submitted_at: r.submitted_at || new Date().toISOString(),
      ip_hash: ipHash,
      user_agent: "import-r2511.mjs",
      email, // null since GAS redacts emails
    }
  })

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Would insert:")
    console.log(`  ${rows.length} rows into survey_responses`)
    console.log("\nSample row:")
    console.log(JSON.stringify(rows[0], null, 2))
    return
  }

  // Batch insert (Supabase supports up to 1000 rows per call)
  const batchSize = 500
  let inserted = 0

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from("survey_responses").insert(batch)

    if (error) {
      console.error(`Insert error at batch ${i}:`, error)
      process.exit(1)
    }

    inserted += batch.length
    console.log(`Inserted ${inserted}/${rows.length}`)
  }

  console.log(`\nDone! Imported ${inserted} R2511 responses.`)
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
