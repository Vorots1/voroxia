import crypto from 'crypto'

const PREFIX = 'vx_live_'

export function generateApiKey(): { raw: string; hash: string } {
  const raw = PREFIX + crypto.randomBytes(32).toString('hex')
  const hash = hashApiKey(raw)
  return { raw, hash }
}

export function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export function isValidApiKeyFormat(raw: string): boolean {
  return raw.startsWith(PREFIX) && raw.length === PREFIX.length + 64
}
