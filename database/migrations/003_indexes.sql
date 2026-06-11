CREATE INDEX IF NOT EXISTS idx_reurb_processes_type ON reurb_processes(reurb_type);
CREATE INDEX IF NOT EXISTS idx_reurb_processes_status ON reurb_processes(status);
CREATE INDEX IF NOT EXISTS idx_ged_documents_process ON ged_documents(process_id);
CREATE INDEX IF NOT EXISTS idx_aisha_logs_created_at ON aisha_analysis_logs(created_at DESC);
