
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type JobApplicationStatus =
  | "Saved"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected";

export type JobApplication = {
  id: string;
  user_id: string;
  company: string;
  job_title: string;
  location: string | null;
  job_url: string | null;
  salary: string | null;
  applied_date: string | null;
  status: JobApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type JobApplicationInput = {
  company: string;
  job_title: string;
  location?: string;
  job_url?: string;
  salary?: string;
  applied_date?: string;
  status: JobApplicationStatus;
  notes?: string;
};

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be logged in to manage job applications.");
  }

  return user.id;
}

function cleanInput(input: JobApplicationInput) {
  return {
    company: input.company.trim(),
    job_title: input.job_title.trim(),
    location: input.location?.trim() || null,
    job_url: input.job_url?.trim() || null,
    salary: input.salary?.trim() || null,
    applied_date: input.applied_date || null,
    status: input.status,
    notes: input.notes?.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

// Get all applications belonging to the signed-in user
export async function getJobApplications(): Promise<JobApplication[]> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as JobApplication[];
}

// Create a new application
export async function createJobApplication(
  input: JobApplicationInput
): Promise<JobApplication> {
  const userId = await getAuthenticatedUserId();

  if (!input.company.trim() || !input.job_title.trim()) {
    throw new Error("Company and job title are required.");
  }

  const { data, error } = await supabase
    .from("job_applications")
    .insert({
      ...cleanInput(input),
      user_id: userId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as JobApplication;
}

// Update an existing application
export async function updateJobApplication(
  id: string,
  input: JobApplicationInput
): Promise<JobApplication> {
  const userId = await getAuthenticatedUserId();

  if (!input.company.trim() || !input.job_title.trim()) {
    throw new Error("Company and job title are required.");
  }

  const { data, error } = await supabase
    .from("job_applications")
    .update(cleanInput(input))
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as JobApplication;
}

// Delete an application
export async function deleteJobApplication(
  id: string
): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

// Update only the status of an application
export async function updateJobApplicationStatus(
  id: string,
  status: JobApplicationStatus
): Promise<JobApplication> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("job_applications")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as JobApplication;
}
