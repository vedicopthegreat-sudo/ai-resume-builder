
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  FilePlus2,
  Loader2,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createJobApplication,
  deleteJobApplication,
  getJobApplications,
  updateJobApplication,
  updateJobApplicationStatus,
  type JobApplication,
  type JobApplicationInput,
  type JobApplicationStatus,
} from "@/lib/job-application-service";

const STATUSES: JobApplicationStatus[] = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

const EMPTY_FORM: JobApplicationInput = {
  company: "",
  job_title: "",
  location: "",
  job_url: "",
  salary: "",
  applied_date: "",
  status: "Saved",
  notes: "",
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string | null) {
  if (!value) return "Not specified";

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getStatusClass(status: JobApplicationStatus) {
  switch (status) {
    case "Saved":
      return "bg-slate-100 text-slate-700";
    case "Applied":
      return "bg-blue-100 text-blue-700";
    case "Interview":
      return "bg-amber-100 text-amber-800";
    case "Offer":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
  }
}

export default function JobTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<JobApplicationInput>({
    ...EMPTY_FORM,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getJobApplications();
      setApplications(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load job applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      saved: applications.filter((item) => item.status === "Saved").length,
      applied: applications.filter((item) => item.status === "Applied").length,
      interviews: applications.filter(
        (item) => item.status === "Interview"
      ).length,
      offers: applications.filter((item) => item.status === "Offer").length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return applications.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.company.toLowerCase().includes(searchTerm) ||
        item.job_title.toLowerCase().includes(searchTerm) ||
        (item.location ?? "").toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  function openNewForm() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      applied_date: getTodayDate(),
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(application: JobApplication) {
    setEditingId(application.id);
    setForm({
      company: application.company,
      job_title: application.job_title,
      location: application.location ?? "",
      job_url: application.job_url ?? "",
      salary: application.salary ?? "",
      applied_date: application.applied_date ?? "",
      status: application.status,
      notes: application.notes ?? "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }

  function updateField<K extends keyof JobApplicationInput>(
    field: K,
    value: JobApplicationInput[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.company.trim() || !form.job_title.trim()) {
      setError("Please enter both the company and job title.");
      return;
    }

    if (form.job_url?.trim()) {
      try {
        const parsedUrl = new URL(form.job_url.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        setError("Enter a valid job URL starting with http:// or https://.");
        return;
      }
    }

    setSaving(true);

    try {
      if (editingId) {
        const updated = await updateJobApplication(editingId, form);

        setApplications((current) =>
          current.map((item) =>
            item.id === editingId ? updated : item
          )
        );

        setSuccess("Application updated successfully.");
      } else {
        const created = await createJobApplication(form);

        setApplications((current) => [created, ...current]);
        setSuccess("Application added successfully.");
      }

      closeForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save this application."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    id: string,
    status: JobApplicationStatus
  ) {
    setError("");
    setSuccess("");

    try {
      const updated = await updateJobApplicationStatus(id, status);

      setApplications((current) =>
        current.map((item) => (item.id === id ? updated : item))
      );

      setSuccess("Application status updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update the status."
      );
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job application?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteJobApplication(id);

      setApplications((current) =>
        current.filter((item) => item.id !== id)
      );

      setSuccess("Application deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete this application."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Briefcase size={16} />
              CareerCraft
              <span>/</span>
              Job Tracker
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Job Application Tracker
            </h1>

            <p className="mt-2 text-slate-600">
              Keep track of the jobs you save, apply for, and interview with.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            <FilePlus2 size={18} />
            Add Application
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total applications" value={stats.total} />
          <StatCard label="Saved" value={stats.saved} />
          <StatCard label="Applied" value={stats.applied} />
          <StatCard label="Interviews" value={stats.interviews} />
          <StatCard label="Offers" value={stats.offers} />
        </section>

        {showForm && (
          <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingId ? "Edit Application" : "Add New Application"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Company *">
                  <input
                    required
                    value={form.company}
                    onChange={(event) =>
                      updateField("company", event.target.value)
                    }
                    placeholder="e.g. Google"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Job title *">
                  <input
                    required
                    value={form.job_title}
                    onChange={(event) =>
                      updateField("job_title", event.target.value)
                    }
                    placeholder="e.g. Frontend Developer"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Location">
                  <input
                    value={form.location ?? ""}
                    onChange={(event) =>
                      updateField("location", event.target.value)
                    }
                    placeholder="e.g. Mumbai / Remote"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Job posting URL">
                  <input
                    type="url"
                    value={form.job_url ?? ""}
                    onChange={(event) =>
                      updateField("job_url", event.target.value)
                    }
                    placeholder="https://..."
                    className="form-input"
                  />
                </FormField>

                <FormField label="Salary">
                  <input
                    value={form.salary ?? ""}
                    onChange={(event) =>
                      updateField("salary", event.target.value)
                    }
                    placeholder="e.g. ₹8–12 LPA"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Application date">
                  <input
                    type="date"
                    value={form.applied_date ?? ""}
                    onChange={(event) =>
                      updateField("applied_date", event.target.value)
                    }
                    className="form-input"
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value as JobApplicationStatus
                      )
                    }
                    className="form-input"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Notes">
                <textarea
                  rows={4}
                  value={form.notes ?? ""}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  placeholder="Recruiter details, interview preparation, follow-up reminders..."
                  className="form-input resize-y"
                />
              </FormField>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Application"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Your Applications
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search company or role"
                  className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Loading applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-16 text-center">
              <Building2
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />
              <h3 className="font-semibold text-slate-800">
                {applications.length === 0
                  ? "No applications yet"
                  : "No matching applications"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {applications.length === 0
                  ? "Add your first job application to start tracking your progress."
                  : "Try changing your search or status filter."}
              </p>

              {applications.length === 0 && (
                <button
                  type="button"
                  onClick={openNewForm}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add your first application
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {application.job_title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(application.status)}`}
                        >
                          {application.status}
                        </span>
                      </div>

                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Building2 size={15} />
                        {application.company}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        {application.location && (
                          <span>{application.location}</span>
                        )}

                        {application.salary && (
                          <span>{application.salary}</span>
                        )}

                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          {formatDate(application.applied_date)}
                        </span>
                      </div>

                      {application.notes && (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                          {application.notes}
                        </p>
                      )}

                      {application.job_url && (
                        <a
                          href={application.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View job posting
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <select
                        aria-label={`Change status for ${application.job_title} at ${application.company}`}
                        value={application.status}
                        onChange={(event) =>
                          void handleStatusChange(
                            application.id,
                            event.target.value as JobApplicationStatus
                          )
                        }
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => openEditForm(application)}
                        aria-label="Edit application"
                        className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(application.id)}
                        aria-label="Delete application"
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
