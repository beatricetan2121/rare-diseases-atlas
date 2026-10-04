CREATE TABLE public.research_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  condition_id text NOT NULL,
  title text NOT NULL,
  gene text NOT NULL DEFAULT '',
  institution text NOT NULL DEFAULT '',
  finding text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending_review',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.research_submissions TO authenticated;
GRANT ALL ON public.research_submissions TO service_role;
ALTER TABLE public.research_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own submissions" ON public.research_submissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Create own submissions" ON public.research_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending_review');
CREATE POLICY "Delete own submissions" ON public.research_submissions FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Upload own research files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'research-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Read own research files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'research-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Delete own research files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'research-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);