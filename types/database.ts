export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          audits_remaining: number
          audits_used_this_month: number
          current_period_start: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          company_name?: string | null
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          audits_remaining?: number
          audits_used_this_month?: number
          current_period_start?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      audits: {
        Row: {
          id: string
          user_id: string
          assistant_name: string
          company_name: string | null
          company_url: string | null
          sector: string
          language: string
          country: string
          system_prompt: string | null
          api_endpoint: string | null
          connection_type: string
          status: string
          score_global: number | null
          score_linguistic: number | null
          score_functional: number | null
          score_guardrails: number | null
          score_security: number | null
          score_experience: number | null
          score_legal: number | null
          classification: string | null
          gap_formal_informal: number | null
          hallucination_rate: number | null
          containment_rate: number | null
          emotional_resilience: number | null
          linguistic_comprehension: number | null
          report_markdown: string | null
          legal_dossier_markdown: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['audits']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audits']['Insert']>
      }
      audit_questions: {
        Row: {
          id: string
          audit_id: string
          phase: number
          phase_name: string
          question_code: string
          linguistic_layer: string | null
          intention: string
          question_text: string
          evaluates: string
          criteria_10: string | null
          criteria_5: string | null
          criteria_0: string | null
          response_text: string | null
          score: number | null
          verdict: string | null
          explanation: string | null
          detail: string | null
          recommendation: string | null
          linguistic_comprehension: boolean | null
          order_index: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_questions']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_questions']['Insert']>
      }
      audit_legal_risks: {
        Row: {
          id: string
          audit_id: string
          finding: string
          regulation: string
          regulation_article: string | null
          max_fine: string
          real_case: string | null
          real_case_description: string | null
          severity: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_legal_risks']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_legal_risks']['Insert']>
      }
      audit_credits: {
        Row: {
          id: string
          user_id: string
          credits_purchased: number
          amount_paid: number
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_credits']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_credits']['Insert']>
      }
      audit_plan_cache: {
        Row: {
          id: string
          user_id: string
          system_prompt_hash: string
          sector: string
          language: string
          plan_json: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_plan_cache']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_plan_cache']['Insert']>
      }
    }
  }
}
