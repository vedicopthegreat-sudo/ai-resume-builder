"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BriefcaseBusiness,
  Palette,
  Settings,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Clock3,
  Menu,
  X,
  Sparkles,
  ArrowUpRight,
  CircleUserRound,
  LogOut,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { getAllResumes, type ResumeRecord } from "@/lib/resume-service";
import {
  getJobApplications,
  type JobApplication,
} from "@/lib/job-application-service";

export default function DashboardPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobsError, setJobsError] = useState("");

  const [signingOut, setSigningOut] = useState(false);
  const [visibleResumeCount, setVisibleResumeCount] = useState(6);

  const [welcomeDate, setWelcomeDate] = useState("");
  const [currentYear, setCurrentYear] = useState("");

  // Set date values on the client.
  useEffect(() => {
    const now = new Date();

    setWelcomeDate(
      now
        .toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase()
    );

    setCurrentYear(String(now.getFullYear()));
  }, []);

  // Load the signed-in user, resumes, and job applications.
  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setJobsLoading(true);
      setError("");
      setJobsError("");

      try {
        const supabase = createClient();

        const { data, error: authError } =
          await supabase.auth.getUser();

        if (authError || !data.user) {
          router.replace("/register");
          return;
        }

        if (!active) return;

        const metadataName = data.user.user_metadata?.full_name;

        setUserName(
          typeof metadataName === "string" && metadataName.trim()
            ? metadataName
            : data.user.email?.split("@")[0] || "there"
        );

        setUserEmail(data.user.email || "");

        // Load resumes and applications independently.
        const [resumeResult, jobResult] = await Promise.allSettled([
          getAllResumes(),
          getJobApplications(),
        ]);

        if (!active) return;

        if (resumeResult.status === "fulfilled") {
          setResumes(resumeResult.value as ResumeRecord[]);
        } else {
          setError(
            resumeResult.reason instanceof Error
              ? resumeResult.reason.message
              : "Unable to load your resumes."
          );
        }

        if (jobResult.status === "fulfilled") {
          setApplications(jobResult.value);
        } else {
          setJobsError(
            jobResult.reason instanceof Error
              ? jobResult.reason.message
              : "Unable to load your job applications."
          );
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your dashboard."
        );
      } finally {
        if (active) {
          setLoading(false);
          setJobsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  // Search resumes by title or job role.
  const filteredResumes = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return resumes.filter((resume) => {
      const title = resume.title || "";
      const role = resume.resume_data?.personal?.jobTitle || "";

      return `${title} ${role}`.toLowerCase().includes(searchText);
    });
  }, [resumes, search]);

  // Show six resumes initially, then six more each time.
  const visibleResumes = filteredResumes.slice(0, visibleResumeCount);
  const hasMoreResumes =
    filteredResumes.length > visibleResumeCount;

  // Calculate job statistics.
  const totalApplications = applications.length;

  const interviewCount = applications.filter(
    (application) => application.status === "Interview"
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "Offer"
  ).length;

  const recentApplications = applications.slice(0, 3);

  // Sign out.
  const handleLogout = async () => {
    setSigningOut(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      router.replace("/register");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign out."
      );
      setSigningOut(false);
    }
  };

  // Format resume update date.
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return `Updated ${date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

  // Format application date.
  const formatApplicationDate = (dateString: string | null) => {
    if (!dateString) return "Date not added";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Sidebar navigation.
  const navigation = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      active: true,
    },
    {
      label: "My Resumes",
      icon: FileText,
      href: "#resumes",
      active: false,
    },
    {
      label: "Job Tracker",
      icon: BriefcaseBusiness,
      href: "#jobs",
      active: false,
    },
    {
      label: "Templates",
      icon: Palette,
      href: "/resume",
      active: false,
    },
  ];

  return (
    <main className="dashboard-shell" id="dashboard">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={21} />
          </div>

          <span>
            Career<span className="brand-highlight">Craft</span>
          </span>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            type="button"
          >
            <X size={21} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <a
                href={item.href}
                key={item.label}
                className={`nav-link ${item.active ? "nav-active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Sidebar promotion */}
        <div className="sidebar-promo">
          <div className="promo-icon">
            <Sparkles size={20} />
          </div>

          <h3>Build your next opportunity</h3>

          <p>
            Create a professional resume and prepare for your next career
            move.
          </p>

          <Link href="/resume" className="promo-link">
            Create a resume <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Sidebar bottom */}
        <div className="sidebar-bottom">
          <a href="#account" className="nav-link">
            <Settings size={19} />
            <span>Account</span>
          </a>

          <div className="profile">
            <div className="avatar">
              {userName ? (
                userName.charAt(0).toUpperCase()
              ) : (
                <CircleUserRound size={20} />
              )}
            </div>

            <div className="profile-info">
              <strong>{userName || "Your account"}</strong>
              <span>{userEmail}</span>
            </div>

            <button
              type="button"
              className="profile-more"
              onClick={handleLogout}
              disabled={signingOut}
              aria-label="Sign out"
              title="Sign out"
            >
              {signingOut ? (
                <LoaderCircle size={19} className="animate-spin" />
              ) : (
                <LogOut size={19} />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <section className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            type="button"
          >
            <Menu size={23} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Dashboard</strong>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={18} />

              <input
                type="search"
                name="resume-search"
                id="resume-search"
                placeholder="Search your resumes..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleResumeCount(6);
                }}
                aria-label="Search resumes"
              />
            </label>

            <div className="topbar-avatar">
              {userName ? (
                userName.charAt(0).toUpperCase()
              ) : (
                <CircleUserRound size={20} />
              )}
            </div>
          </div>
        </header>

        {/* Dashboard body */}
        <div className="content">
          {/* Welcome section */}
          <section className="welcome-section">
            <div>
              <div className="welcome-date">{welcomeDate}</div>

              <h1>
                Welcome, {userName || "there"} <span>👋</span>
              </h1>

              <p>
                Manage your resumes and keep your career journey organized.
              </p>
            </div>

            <Link href="/resume" className="primary-button">
              <Plus size={19} />
              Create New Resume
            </Link>
          </section>

          {/* Dashboard error */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Statistics */}
          <section
            className="stats-grid"
            aria-label="Dashboard statistics"
          >
            <article className="stat-card">
              <div className="stat-top">
                <span>Total Resumes</span>
                <div className="stat-icon purple">
                  <FileText size={20} />
                </div>
              </div>

              <div className="stat-value">
                {loading ? "—" : resumes.length}
              </div>

              <div className="stat-change">Your saved resumes</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Job Applications</span>
                <div className="stat-icon blue">
                  <BriefcaseBusiness size={20} />
                </div>
              </div>

              <div className="stat-value">
                {jobsLoading ? "—" : totalApplications}
              </div>

              <div className="stat-change">
                {jobsLoading
                  ? "Loading applications..."
                  : "Total tracked applications"}
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Interviews</span>
                <div className="stat-icon green">
                  <Clock3 size={20} />
                </div>
              </div>

              <div className="stat-value">
                {jobsLoading ? "—" : interviewCount}
              </div>

              <div className="stat-change">
                {jobsLoading
                  ? "Loading interviews..."
                  : "Applications at interview stage"}
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Offers</span>
                <div className="stat-icon orange">
                  <Sparkles size={20} />
                </div>
              </div>

              <div className="stat-value">
                {jobsLoading ? "—" : offerCount}
              </div>

              <div className="stat-change">Job offers received</div>
            </article>
          </section>

          {/* My Resumes */}
          <section className="section-block" id="resumes">
            <div className="section-heading">
              <div>
                <h2>My Resumes</h2>
                <p>Your resumes saved to your CareerCraft account.</p>
              </div>

              <Link href="/resume" className="text-link">
                Create resume <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="resume-content">
             {loading ? (
  <div
    className="resume-grid resume-skeleton-grid"
    aria-label="Loading resumes"
    aria-busy="true"
  >
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        className="resume-card resume-skeleton-card"
        key={`resume-skeleton-${index}`}
        aria-hidden="true"
      >
        <div className="skeleton-block skeleton-icon" />
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-role" />
        <div className="skeleton-block skeleton-date" />
        <div className="skeleton-actions">
          <div className="skeleton-block skeleton-button" />
          <div className="skeleton-block skeleton-button" />
        </div>
      </div>
    ))}

    <div
      className="new-resume-card resume-skeleton-new-card"
      aria-hidden="true"
    >
      <div className="skeleton-block skeleton-new-icon" />
      <div className="skeleton-block skeleton-new-title" />
      <div className="skeleton-block skeleton-new-description" />
    </div>
  </div>
) : filteredResumes.length > 0 ? (
                <>
                  <div className="resume-grid">
                    {visibleResumes.map((resume) => {
                      const role =
                        resume.resume_data?.personal?.jobTitle ||
                        "Professional Resume";

                      return (
                        <article className="resume-card" key={resume.id}>
                          <div className="resume-card-top">
                            <div className="document-icon purple">
                              <FileText size={23} />
                            </div>

                            <button
                              className="icon-button"
                              type="button"
                              aria-label={`Options for ${resume.title || "resume"}`}
                              title="Resume options"
                            >
                              <MoreHorizontal size={20} />
                            </button>
                          </div>

                          <h3>{resume.title || "Untitled Resume"}</h3>

                          <p className="resume-role">{role}</p>

                          <div className="resume-updated">
                            <Clock3 size={14} />
                            {formatDate(resume.updated_at)}
                          </div>

                          <div className="resume-actions">
                            <Link href="/resume" className="resume-edit">
                              <Pencil size={15} />
                              Edit
                            </Link>

                            <Link
                              href="/resume/preview"
                              className="resume-preview"
                            >
                              <Eye size={15} />
                              Preview
                            </Link>
                          </div>
                        </article>
                      );
                    })}

                    <Link href="/resume" className="new-resume-card">
                      <div className="new-resume-icon">
                        <Plus size={25} />
                      </div>

                      <strong>Create a new resume</strong>

                      <span>
                        Start building another professional resume
                      </span>
                    </Link>
                  </div>

                  {hasMoreResumes && (
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleResumeCount((current) => current + 6)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        Load more resumes
                        <span className="ml-2 text-slate-400">
                          ({filteredResumes.length - visibleResumeCount}{" "}
                          remaining)
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state resume-empty-state">
                  <div className="new-resume-icon mx-auto mb-4">
                    <FileText size={25} />
                  </div>

                  <h3 className="font-semibold text-lg">
                    {search ? "No matching resumes" : "No resumes yet"}
                  </h3>

                  <p className="mt-2">
                    {search
                      ? "Try another search term."
                      : "Your saved resumes will appear here after you create and save one."}
                  </p>

                  {!search && (
                    <Link href="/resume" className="primary-button mt-5">
                      <Plus size={18} />
                      Create your first resume
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Job Tracker */}
          <section className="section-block" id="jobs">
            <div className="section-heading">
              <div>
                <h2>Job Tracker</h2>
                <p>Track your job applications and interview progress.</p>
              </div>

              <Link href="/jobs" className="text-link">
                Open Job Tracker <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="applications-card p-5">
              {jobsLoading ? (
                <div
                  className="flex min-h-40 flex-col items-center justify-center text-center text-slate-500"
                  aria-live="polite"
                >
                  <LoaderCircle
                    size={25}
                    className="mb-3 animate-spin"
                  />
                  Loading your job applications...
                </div>
              ) : jobsError ? (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle size={19} className="shrink-0" />
                  <div>
                    <strong>Could not load Job Tracker</strong>
                    <p className="mt-1">{jobsError}</p>
                    <Link
                      href="/jobs"
                      className="mt-3 inline-flex font-semibold underline"
                    >
                      Open Job Tracker
                    </Link>
                  </div>
                </div>
              ) : applications.length === 0 ? (
                <div className="empty-state">
                  <div className="summary-icon blue mx-auto mb-4">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <h3 className="font-semibold text-lg">
                    Start tracking your job applications
                  </h3>

                  <p className="mt-2">
                    Add the jobs you are interested in and follow your
                    progress from application to offer.
                  </p>

                  <Link
                    href="/jobs"
                    className="primary-button mt-5"
                  >
                    <Plus size={18} />
                    Add your first application
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Recent applications
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Your latest updated job applications.
                      </p>
                    </div>

                    <Link
                      href="/jobs"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View all applications
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {recentApplications.map((application) => (
                      <article
                        key={application.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <BriefcaseBusiness size={20} />
                          </div>

                          <div className="min-w-0">
                            <h4 className="truncate font-semibold text-slate-900">
                              {application.job_title}
                            </h4>

                            <p className="truncate text-sm text-slate-500">
                              {application.company}
                              {application.location
                                ? ` · ${application.location}`
                                : ""}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Updated{" "}
                              {formatApplicationDate(
                                application.updated_at
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              application.status === "Offer"
                                ? "bg-green-100 text-green-700"
                                : application.status === "Interview"
                                  ? "bg-purple-100 text-purple-700"
                                  : application.status === "Rejected"
                                    ? "bg-red-100 text-red-700"
                                    : application.status === "Applied"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {application.status}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-5 text-center">
                    <Link
                      href="/jobs"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      Manage all applications
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Account */}
          <section className="section-block" id="account">
            <div className="section-heading">
              <div>
                <h2>Account</h2>
                <p>Your currently signed-in account.</p>
              </div>
            </div>

            <div className="applications-card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="avatar">
                  {userName ? (
                    userName.charAt(0).toUpperCase()
                  ) : (
                    <CircleUserRound size={20} />
                  )}
                </div>

                <div className="min-w-0">
                  <strong>{userName || "Your account"}</strong>
                  <p className="break-all text-sm text-slate-500">
                    {userEmail}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
                >
                  {signingOut ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <LogOut size={16} />
                  )}
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="dashboard-footer">
            <span>© {currentYear} CareerCraft.</span>
            <span>
              Built for your next opportunity <Sparkles size={13} />
            </span>
          </footer>
        </div>
      </section>
    </main>
  );
}