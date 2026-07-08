import { readFileSync } from 'fs'
import path from 'path'

export const dynamic = 'force-static'

const html = readFileSync(path.join(process.cwd(), 'public', 'landing.html'), 'utf-8')

export async function GET() {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
