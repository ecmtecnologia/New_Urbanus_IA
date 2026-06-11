CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL,
  resource VARCHAR(80) NOT NULL,
  resource_id VARCHAR(120),
  status VARCHAR(20) NOT NULL,
  ip_address VARCHAR(64),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at
  ON security_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action
  ON security_audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user
  ON security_audit_logs(user_id);
