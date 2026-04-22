import { z } from 'zod'

const url = z.string().max(500).refine(
  val => !val || val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Debe ser una URL válida (http:// o https://)' }
)

export const CreateAuditSchema = z.object({
  assistant_name: z.string().min(1, 'Requerido').max(100).trim(),
  company_name: z.string().max(150).trim().optional(),
  company_url: url.optional(),
  sector: z.string().min(1, 'Requerido').max(100).trim(),
  language: z.string().min(2).max(20).trim(),
  country: z.string().min(2).max(100).trim(),
  system_prompt: z.string().max(50_000).optional(),
  connection_type: z.enum(['system_prompt', 'api', 'manual']),
})

export const V1AuditSchema = z.object({
  assistant_name: z.string().min(1).max(100).trim(),
  sector: z.string().min(1).max(100).trim(),
  language: z.string().min(2).max(20).trim(),
  country: z.string().min(2).max(100).trim(),
  system_prompt: z.string().min(10, 'system_prompt is required and must be at least 10 characters').max(50_000),
  company_name: z.string().max(150).trim().optional(),
  company_url: url.optional(),
})

export type CreateAuditInput = z.infer<typeof CreateAuditSchema>
export type V1AuditInput = z.infer<typeof V1AuditSchema>
