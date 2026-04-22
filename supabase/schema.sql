-- Tabla de usuarios (sincronizada con auth.users via trigger)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  audits_remaining INTEGER DEFAULT 1,
  audits_used_this_month INTEGER DEFAULT 0,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de auditorías
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assistant_name TEXT NOT NULL,
  company_name TEXT,
  company_url TEXT,
  sector TEXT NOT NULL,
  language TEXT DEFAULT 'es',
  country TEXT DEFAULT 'ES',
  system_prompt TEXT,
  api_endpoint TEXT,
  connection_type TEXT CHECK (connection_type IN ('system_prompt', 'api', 'manual')),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'planning', 'executing', 'evaluating', 'completed', 'failed'
  )),
  score_global INTEGER,
  score_linguistic INTEGER,
  score_functional INTEGER,
  score_guardrails INTEGER,
  score_security INTEGER,
  score_experience INTEGER,
  score_legal INTEGER,
  classification TEXT CHECK (classification IN (
    'excellent', 'good', 'regular', 'deficient', 'critical'
  )),
  gap_formal_informal DECIMAL,
  hallucination_rate DECIMAL,
  containment_rate DECIMAL,
  emotional_resilience INTEGER,
  linguistic_comprehension INTEGER,
  report_markdown TEXT,
  legal_dossier_markdown TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Tabla de preguntas y respuestas
CREATE TABLE audit_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  question_code TEXT NOT NULL,
  linguistic_layer TEXT,
  intention TEXT,
  question_text TEXT NOT NULL,
  evaluates TEXT NOT NULL,
  criteria_10 TEXT,
  criteria_5 TEXT,
  criteria_0 TEXT,
  response_text TEXT,
  score INTEGER,
  verdict TEXT CHECK (verdict IN ('PASS', 'IMPROVABLE', 'FAIL')),
  explanation TEXT,
  detail TEXT,
  recommendation TEXT,
  linguistic_comprehension BOOLEAN,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de riesgos legales
CREATE TABLE audit_legal_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  finding TEXT NOT NULL,
  regulation TEXT NOT NULL,
  regulation_article TEXT,
  max_fine TEXT NOT NULL,
  real_case TEXT,
  real_case_description TEXT,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de créditos adicionales
CREATE TABLE audit_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credits_purchased INTEGER NOT NULL,
  amount_paid DECIMAL NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cache de planes de auditoría
CREATE TABLE audit_plan_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  system_prompt_hash TEXT NOT NULL,
  sector TEXT NOT NULL,
  language TEXT NOT NULL,
  plan_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, system_prompt_hash, sector, language)
);

-- Índices
CREATE INDEX idx_audits_user ON audits(user_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_questions_audit ON audit_questions(audit_id);
CREATE INDEX idx_legal_risks_audit ON audit_legal_risks(audit_id);
CREATE INDEX idx_credits_user ON audit_credits(user_id);
CREATE INDEX idx_cache_lookup ON audit_plan_cache(user_id, system_prompt_hash);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_legal_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_plan_cache ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own audits" ON audits
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create audits" ON audits
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own audits" ON audits
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can read own questions" ON audit_questions
  FOR SELECT USING (
    audit_id IN (SELECT id FROM audits WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert own questions" ON audit_questions
  FOR INSERT WITH CHECK (
    audit_id IN (SELECT id FROM audits WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own questions" ON audit_questions
  FOR UPDATE USING (
    audit_id IN (SELECT id FROM audits WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can read own legal risks" ON audit_legal_risks
  FOR SELECT USING (
    audit_id IN (SELECT id FROM audits WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can read own credits" ON audit_credits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can read own cache" ON audit_plan_cache
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own cache" ON audit_plan_cache
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trigger: crear fila en users cuando se registra en auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: actualizar updated_at en users
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
