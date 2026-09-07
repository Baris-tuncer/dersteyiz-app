import { supabase } from '../config/supabase';

interface ReportData {
  reporter_id: string;
  teacher_id: string;
  reason: string;
  description: string;
}

export async function submitReport(data: ReportData): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    reporter_id: data.reporter_id,
    teacher_id: data.teacher_id,
    reason: data.reason,
    description: data.description,
  });

  if (error) throw error;
}
