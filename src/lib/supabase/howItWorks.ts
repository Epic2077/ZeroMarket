import { supabase } from "./client";

export interface HowItWorksStep {
  id: string;
  step_order: number;
  icon_name: string;
  icon_color: string;
  title: string;
  description: string;
}

export async function fetchHowItWorksSteps(): Promise<HowItWorksStep[]> {
  const { data, error } = await supabase
    .from("how_it_works_steps")
    .select("*")
    .order("step_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as HowItWorksStep[];
}