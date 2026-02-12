#!/usr/bin/env node
/**
 * R2602 サンプル招待メール送信
 * Usage: node scripts/send-r2602-sample.mjs [email]
 */

import { readFileSync } from 'fs'

// Load .env.local manually
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const GAS_URL = process.env.GAS_WEBAPP_URL
const TARGET_EMAIL = process.argv[2] || 'aki@aicu.ai'

const CAMPAIGN_ID = 'R2602-invitation'
const SUBJECT = '【AICU Research】生成AI時代の"つくる人"調査 2026.02（R2602）ご協力のお願い'

const CONTENT_HTML = `
<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans JP',sans-serif;color:#333;line-height:1.8;">

  <div style="text-align:center;padding:32px 0 24px;">
    <span style="font-family:'Outfit',sans-serif;font-size:28px;font-weight:800;color:#41C9B4;">AICU</span>
    <span style="font-size:18px;font-weight:600;color:#1a1a2e;margin-left:8px;">Research</span>
  </div>

  <p>{{last_name}} {{first_name}} さま</p>

  <p>いつもAICUをご利用いただきありがとうございます。</p>

  <p>AICUでは、生成AIクリエイターの実態を明らかにする調査<strong>「生成AI時代の"つくる人"調査 2026.02（R2602）」</strong>を実施しています。</p>

  <div style="background:#f0f7ff;border:1px solid #d0e3ff;border-radius:12px;padding:20px 24px;margin:24px 0;">
    <div style="font-size:15px;font-weight:700;color:#0031D8;margin-bottom:8px;">調査概要</div>
    <ul style="margin:0;padding-left:20px;font-size:14px;">
      <li>所要時間: 約5分</li>
      <li>謝礼: <strong>10,000 AICUポイント</strong>（回答完了後に自動付与）</li>
      <li>調査協力: <a href="https://www.dcaj.or.jp/" style="color:#0031D8;">一般財団法人デジタルコンテンツ協会</a>（DCAJ）</li>
    </ul>
  </div>

  <div style="text-align:center;margin:32px 0;">
    <a href="https://p.aicu.jp/q/R2602?email={{email}}"
       style="display:inline-block;background:#0031D8;color:#fff;padding:16px 48px;border-radius:12px;font-size:17px;font-weight:700;text-decoration:none;box-shadow:0 4px 20px rgba(0,49,216,0.25);">
      調査に回答する
    </a>
  </div>

  <div style="background:#fafafa;border-radius:8px;padding:16px;margin:24px 0;font-size:13px;color:#666;">
    <div style="margin-bottom:8px;">
      <strong>前回調査結果:</strong>
      <a href="https://u.aicu.jp/r/R2511" style="color:#0031D8;">R2511（2025年11月調査）</a>
    </div>
    <div>
      <strong>プライバシーポリシー:</strong>
      <a href="https://corp.aicu.ai/ja/privacy" style="color:#0031D8;">https://corp.aicu.ai/ja/privacy</a>
    </div>
  </div>

  <p style="font-size:14px;color:#666;">
    本調査の結果は、学術研究・政策提言・AICUサービス改善に活用されます。<br>
    ご回答いただいた個人情報は厳重に管理し、統計処理後に匿名化されます。
  </p>

  <p>ご多忙のところ恐れ入りますが、ご協力のほどよろしくお願いいたします。</p>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#888;">
    AICU Inc. / <a href="https://aicu.jp" style="color:#41C9B4;">aicu.jp</a>
  </div>
</div>
`

async function main() {
  if (!GAS_URL) {
    console.error('GAS_WEBAPP_URL not set in .env.local')
    process.exit(1)
  }

  console.log(`Sending R2602 sample invitation to: ${TARGET_EMAIL}`)
  console.log(`GAS endpoint: ${GAS_URL}`)

  // Step 1: Add campaign
  console.log('\n1. Adding campaign...')
  const addRes = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'addCampaign',
      id: CAMPAIGN_ID,
      name: 'R2602 調査招待',
      subject: SUBJECT,
      content_html: CONTENT_HTML,
      status: 'draft',
    }),
    redirect: 'follow',
  })
  const addData = await addRes.json()
  console.log('addCampaign result:', JSON.stringify(addData, null, 2))

  // Use the GAS-generated campaign ID
  const actualCampaignId = addData.data?.id || CAMPAIGN_ID

  // Step 2: Test send
  console.log(`\n2. Sending test email (campaign: ${actualCampaignId})...`)
  const sendRes = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'testSendTo',
      id: actualCampaignId,
      email: TARGET_EMAIL,
    }),
    redirect: 'follow',
  })
  const sendData = await sendRes.json()
  console.log('testSendTo result:', JSON.stringify(sendData, null, 2))

  if (sendData.success) {
    console.log(`\n✓ Sample invitation sent to ${TARGET_EMAIL}`)
  } else {
    console.error(`\n✗ Failed: ${sendData.error}`)
  }
}

main().catch(console.error)
