#!/usr/bin/env node
// Points the Vercel proxy (/api/* in vercel.json) at the deployed backend.
//
//   node scripts/set-api-origin.mjs https://abc123.execute-api.ap-south-1.amazonaws.com
//
// Use the "ApiUrl" output printed by `sam deploy`. Commit vercel.json afterwards.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const input = (process.argv[2] ?? '').trim().replace(/\/+$/, '')
let origin
try {
  origin = new URL(input)
} catch {
  console.error('Usage: node scripts/set-api-origin.mjs https://<api-id>.execute-api.<region>.amazonaws.com')
  process.exit(1)
}
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search) {
  console.error('Give only the https origin of the API, without a path, e.g. https://abc123.execute-api.ap-south-1.amazonaws.com')
  process.exit(1)
}

const file = fileURLToPath(new URL('../vercel.json', import.meta.url))
const config = JSON.parse(readFileSync(file, 'utf8'))
const rule = config.rewrites.find((r) => r.source === '/api/:path*')
if (!rule) {
  console.error('vercel.json has no /api/:path* rewrite')
  process.exit(1)
}
rule.destination = `${origin.origin}/api/:path*`
writeFileSync(file, JSON.stringify(config, null, 2) + '\n')
console.log(`vercel.json: /api/* -> ${rule.destination}`)
