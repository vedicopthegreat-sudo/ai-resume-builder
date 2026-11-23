// lib/resume-service.ts

import { createClient } from "@/lib/supabase/client";

// ----------------------------------
// Types
// ----------------------------------

export interface ResumeData {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };

  summary: string;

  experiences: {
    id: number;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];

  educations: {
    id: number;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[];

  skills: string;
}

export interface ResumeRecord {
  id: string;
  user_id: string;
  title: string;
  resume_data: ResumeData;
  created_at: string;
  updated_at: string;
}

// ----------------------------------
// Helper: get authenticated user
// ----------------------------------

async function getAuthenticatedUser() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("You must be logged in to access your resumes.");
  }

  return {
    supabase,
    user: data.user,
  };
}

// ----------------------------------
// 1. Save a new resume
// ----------------------------------

export async function saveResume(
  resumeData: ResumeData,
  title = "Untitled Resume"
) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title,
      resume_data: resumeData,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save resume: ${error.message}`);
  }

  return data;
}

// ----------------------------------
// 2. Get one resume by ID
// ----------------------------------

export async function getResume(resumeId: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch resume: ${error.message}`);
  }

  return data;
}

// ----------------------------------
// 3. Get all resumes for the user
// ----------------------------------

export async function getAllResumes() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch resumes: ${error.message}`);
  }

  return data;
}

// ----------------------------------
// 4. Update an existing resume
// ----------------------------------

export async function updateResume(
  resumeId: string,
  resumeData: ResumeData,
  title?: string
) {
  const { supabase, user } = await getAuthenticatedUser();

  const updates: {
    resume_data: ResumeData;
    updated_at: string;
    title?: string;
  } = {
    resume_data: resumeData,
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) {
    updates.title = title;
  }

  const { data, error } = await supabase
    .from("resumes")
    .update(updates)
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update resume: ${error.message}`);
  }

  return data;
}

// ----------------------------------
// 5. Delete a resume
// ----------------------------------

export async function deleteResume(resumeId: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to delete resume: ${error.message}`);
  }

  return { success: true };
}