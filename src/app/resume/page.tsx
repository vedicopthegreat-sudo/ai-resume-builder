
"use client";

import ATSAnalyzer from "@/src/components/ats-analyzer";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  GraduationCap,
  UserRound,
  FileText,
  Wrench,
  Plus,
  Trash2,
  Sparkles,
  Save,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Undo2,
  Redo2,
} from "lucide-react";

import { useResumeStore } from "@/src/store/resume-store";

const sections = [
  { id: "personal", label: "Personal Details", icon: UserRound },
  { id: "summary", label: "Professional Summary", icon: FileText },
  { id: "experience", label: "Work Experience", icon: BriefcaseBusiness },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
];

export default function ResumeEditorPage() {
  const [activeSection, setActiveSection] = useState("personal");

  const {
    personal,
    summary,
    experiences,
    educations,
    skills,

    resumeId,
    saveStatus,
    saveError,
    hasUnsavedChanges,

    canUndo,
    canRedo,
    undo,
    redo,

    updatePersonal,
    updateSummary,

    addExperience,
    updateExperience,
    removeExperience,

    addEducation,
    updateEducation,
    removeEducation,

    updateSkills,
    saveToDatabase,
  } = useResumeStore();

  // ----------------------------------
  // Autosave
  // ----------------------------------

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    // Wait until the user stops editing for 1.5 seconds.
    const timeout = window.setTimeout(() => {
      void saveToDatabase();
    }, 1500);

    // Restart the delay whenever the resume changes.
    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    personal,
    summary,
    experiences,
    educations,
    skills,
    hasUnsavedChanges,
    saveToDatabase,
  ]);

  // ----------------------------------
  // Navigation
  // ----------------------------------

  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ----------------------------------
  // Manual save
  // ----------------------------------

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveToDatabase();
  };

  const handleSaveClick = async () => {
    await saveToDatabase();
  };

  return (
    <main className="editor-page">
      {/* TOP NAVIGATION */}
      <header className="editor-topbar">
        <a href="/" className="editor-brand">
          <span className="editor-brand-icon">
            <Sparkles size={19} />
          </span>
          Career<span>Craft</span>
        </a>

        <div className="editor-topbar-center">
          <a href="/" className="back-dashboard">
            <ArrowLeft size={16} />
            Dashboard
          </a>

          <ChevronRight size={15} />
          <strong>Resume Editor</strong>
        </div>

        <div className="editor-topbar-actions">
          
<div className="history-actions">
  <button
    type="button"
    onClick={undo}
    disabled={!canUndo}
    className="history-button"
    title="Undo last change"
  >
    <Undo2 size={18} />
    <span>Undo</span>
  </button>

  <button
    type="button"
    onClick={redo}
    disabled={!canRedo}
    className="history-button"
    title="Redo last change"
  >
    <Redo2 size={18} />
    <span>Redo</span>
  </button>
</div>


          <span className="draft-indicator">
            <span />
            {resumeId ? "Saved Resume" : "Draft"}
          </span>

          <button
            type="button"
            className="editor-save-button"
            onClick={handleSaveClick}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}

            {saveStatus === "saving" ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </header>

      {/* PAGE HEADING */}
      <div className="editor-heading">
        <div>
          <div className="editor-eyebrow">RESUME BUILDER</div>
          <h1>Build your resume</h1>
          <p>
            Add your details to create a professional resume that stands out.
          </p>
        </div>

        <div className="editor-step">
          <span className="editor-step-number">01</span>
          <div>
            <strong>Resume details</strong>
            <span>Step 1 of 3</span>
          </div>
        </div>
      </div>

      {/* MAIN EDITOR LAYOUT */}
      <div className="editor-layout">
        {/* SIDEBAR */}
        <aside className="editor-sidebar">
          <div className="editor-sidebar-title">RESUME SECTIONS</div>

          <nav className="editor-section-nav">
            {sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <button
                  type="button"
                  key={section.id}
                  onClick={() => navigateToSection(section.id)}
                  className={`editor-nav-item ${
                    activeSection === section.id ? "editor-nav-active" : ""
                  }`}
                >
                  <span className="editor-nav-icon">
                    <Icon size={17} />
                  </span>

                  <span>{section.label}</span>

                  <span className="editor-nav-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="editor-tip">
            <div className="editor-tip-icon">
              <Sparkles size={18} />
            </div>

            <strong>Make your resume shine</strong>

            <p>
              Use clear, measurable achievements to help employers understand
              your impact.
            </p>
          </div>
        </aside>

        {/* RESUME FORM */}
        <section className="editor-form-area">
          <form onSubmit={handleSubmit}>
            {/* PERSONAL DETAILS */}
            <section className="editor-card" id="personal">
              <div className="editor-card-heading">
                <div className="editor-card-icon purple">
                  <UserRound size={20} />
                </div>

                <div>
                  <h2>Personal Details</h2>
                  <p>Start with your basic contact information.</p>
                </div>

                <span className="required-label">* Required fields</span>
              </div>

              <div className="editor-fields">
                <div className="editor-field">
                  <label htmlFor="fullName">Full name *</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={personal.fullName}
                    onChange={(event) =>
                      updatePersonal("fullName", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="editor-field">
                  <label htmlFor="jobTitle">Professional title *</label>
                  <input
                    id="jobTitle"
                    type="text"
                    placeholder="e.g. Frontend Developer"
                    value={personal.jobTitle}
                    onChange={(event) =>
                      updatePersonal("jobTitle", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="editor-field">
                  <label htmlFor="email">Email address *</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={personal.email}
                    onChange={(event) =>
                      updatePersonal("email", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="editor-field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={personal.phone}
                    onChange={(event) =>
                      updatePersonal("phone", event.target.value)
                    }
                  />
                </div>

                <div className="editor-field">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    placeholder="e.g. Mumbai, India"
                    value={personal.location}
                    onChange={(event) =>
                      updatePersonal("location", event.target.value)
                    }
                  />
                </div>

                <div className="editor-field">
                  <label htmlFor="linkedin">LinkedIn profile</label>
                  <input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={personal.linkedin}
                    onChange={(event) =>
                      updatePersonal("linkedin", event.target.value)
                    }
                  />
                </div>

                <div className="editor-field full-width">
                  <label htmlFor="website">
                    Portfolio or personal website
                  </label>
                  <input
                    id="website"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={personal.website}
                    onChange={(event) =>
                      updatePersonal("website", event.target.value)
                    }
                  />
                </div>
              </div>
            </section>

            {/* PROFESSIONAL SUMMARY */}
            <section className="editor-card" id="summary">
              <div className="editor-card-heading">
                <div className="editor-card-icon blue">
                  <FileText size={20} />
                </div>

                <div>
                  <h2>Professional Summary</h2>
                  <p>Write a short introduction about your career.</p>
                </div>
              </div>

              <div className="editor-field">
                <label htmlFor="summary">Your professional summary</label>

                <textarea
                  id="summary"
                  rows={6}
                  maxLength={1000}
                  placeholder="Write 2–4 sentences describing your experience, strengths, key achievements, and career goals..."
                  value={summary}
                  onChange={(event) => updateSummary(event.target.value)}
                />

                <div className="character-count">
                  {summary.length}/1000 characters
                </div>
              </div>

              <div className="editor-ai-note">
                <Sparkles size={17} />
                <span>
                  AI-powered summary suggestions will be available when we
                  connect Gemini.
                </span>
              </div>
            </section>

            {/* WORK EXPERIENCE */}
            <section className="editor-card" id="experience">
              <div className="editor-card-heading">
                <div className="editor-card-icon orange">
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <h2>Work Experience</h2>
                  <p>Add your previous and current professional roles.</p>
                </div>
              </div>

              {experiences.map((experience, index) => (
                <div className="editor-entry" key={experience.id}>
                  <div className="editor-entry-heading">
                    <strong>Experience {index + 1}</strong>

                    {experiences.length > 1 && (
                      <button
                        type="button"
                        className="remove-entry"
                        onClick={() => removeExperience(experience.id)}
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="editor-fields">
                    <div className="editor-field">
                      <label htmlFor={`position-${experience.id}`}>
                        Job title
                      </label>
                      <input
                        id={`position-${experience.id}`}
                        value={experience.position}
                        onChange={(event) =>
                          updateExperience(
                            experience.id,
                            "position",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Senior Frontend Developer"
                      />
                    </div>

                    <div className="editor-field">
                      <label htmlFor={`company-${experience.id}`}>
                        Company
                      </label>
                      <input
                        id={`company-${experience.id}`}
                        value={experience.company}
                        onChange={(event) =>
                          updateExperience(
                            experience.id,
                            "company",
                            event.target.value
                          )
                        }
                        placeholder="e.g. ABC Technologies"
                      />
                    </div>

                    <div className="editor-field">
                      <label htmlFor={`location-${experience.id}`}>
                        Location
                      </label>
                      <input
                        id={`location-${experience.id}`}
                        value={experience.location}
                        onChange={(event) =>
                          updateExperience(
                            experience.id,
                            "location",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Mumbai, India"
                      />
                    </div>

                    <div className="editor-field">
                      <label htmlFor={`start-${experience.id}`}>
                        Start date
                      </label>
                      <input
                        id={`start-${experience.id}`}
                        type="month"
                        value={experience.startDate}
                        onChange={(event) =>
                          updateExperience(
                            experience.id,
                            "startDate",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="editor-field">
                      <label htmlFor={`end-${experience.id}`}>
                        End date
                      </label>
                      <input
                        id={`end-${experience.id}`}
                        type="month"
                        value={experience.endDate}
                        onChange={(event) =>
                          updateExperience(
                            experience.id,
                            "endDate",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="editor-field full-width">
                      <label htmlFor={`description-${experience.id}`}>
                        Responsibilities and achievements
                      </label>
                      <textarea
                        id={`description-${experience.id}`}
                        rows={4}
                        value={experience.description}
                        onChange={(event) =>
                          updateExperience(
                            experience.id,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Describe your responsibilities, technologies used, and measurable achievements..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="add-entry-button"
                onClick={addExperience}
              >
                <Plus size={17} />
                Add another experience
              </button>
            </section>

            {/* EDUCATION */}
            <section className="editor-card" id="education">
              <div className="editor-card-heading">
                <div className="editor-card-icon green">
                  <GraduationCap size={20} />
                </div>

                <div>
                  <h2>Education</h2>
                  <p>Add your academic qualifications.</p>
                </div>
              </div>

              {educations.map((education, index) => (
                <div className="editor-entry" key={education.id}>
                  <div className="editor-entry-heading">
                    <strong>Education {index + 1}</strong>

                    {educations.length > 1 && (
                      <button
                        type="button"
                        className="remove-entry"
                        onClick={() => removeEducation(education.id)}
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="editor-fields">
                    <div className="editor-field">
                      <label htmlFor={`school-${education.id}`}>
                        Institution
                      </label>
                      <input
                        id={`school-${education.id}`}
                        value={education.school}
                        onChange={(event) =>
                          updateEducation(
                            education.id,
                            "school",
                            event.target.value
                          )
                        }
                        placeholder="e.g. University of Mumbai"
                      />
                    </div>

                    <div className="editor-field">
                      <label htmlFor={`degree-${education.id}`}>
                        Degree
                      </label>
                      <input
                        id={`degree-${education.id}`}
                        value={education.degree}
                        onChange={(event) =>
                          updateEducation(
                            education.id,
                            "degree",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Bachelor of Technology"
                      />
                    </div>

                    <div className="editor-field">
                      <label htmlFor={`field-${education.id}`}>
                        Field of study
                      </label>
                      <input
                        id={`field-${education.id}`}
                        value={education.field}
                        onChange={(event) =>
                          updateEducation(
                            education.id,
                            "field",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Computer Science"
                      />
                    </div>

                    <div className="editor-field">
                      <label htmlFor={`edu-start-${education.id}`}>
                        Start date
                      </label>
                      <input
                        id={`edu-start-${education.id}`}
                        type="month"
                        value={education.startDate}
                        onChange={(event) =>
                          updateEducation(
                            education.id,
                            "startDate",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="editor-field">
                      <label htmlFor={`edu-end-${education.id}`}>
                        End date
                      </label>
                      <input
                        id={`edu-end-${education.id}`}
                        type="month"
                        value={education.endDate}
                        onChange={(event) =>
                          updateEducation(
                            education.id,
                            "endDate",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="add-entry-button"
                onClick={addEducation}
              >
                <Plus size={17} />
                Add another education
              </button>
            </section>

            {/* SKILLS */}
            <section className="editor-card" id="skills">
              <div className="editor-card-heading">
                <div className="editor-card-icon purple">
                  <Wrench size={20} />
                </div>

                <div>
                  <h2>Skills</h2>
                  <p>Highlight your most relevant professional skills.</p>
                </div>
              </div>

              <div className="editor-field">
                <label htmlFor="skills">Your skills</label>
                <textarea
                  id="skills"
                  rows={4}
                  placeholder="e.g. React, Next.js, TypeScript, JavaScript, HTML, CSS, Node.js, Git..."
                  value={skills}
                  onChange={(event) => updateSkills(event.target.value)}
                />

                <span className="field-hint">
                  Separate each skill with a comma.
                </span>
              </div>
            </section>

            {/* SAVE STATUS */}
            {saveStatus === "saved" && !hasUnsavedChanges && (
              <div className="editor-status" role="status">
                <CheckCircle2 size={17} />
                All changes saved successfully!
              </div>
            )}

            {hasUnsavedChanges && saveStatus === "idle" && (
              <div className="editor-status" role="status">
                <Save size={17} />
                Changes pending. Autosave will start shortly...
              </div>
            )}

            {saveStatus === "saving" && (
              <div className="editor-status" role="status">
                <LoaderCircle size={17} className="animate-spin" />
                Saving your resume...
              </div>
            )}

            {saveStatus === "error" && (
              <div
                className="editor-status"
                role="alert"
                style={{ color: "#dc2626" }}
              >
                <AlertCircle size={17} />
                {saveError || "Unable to save your resume."}
              </div>
            )}

            {/* BOTTOM ACTIONS */}
            <div className="editor-bottom-actions">
              <a href="/" className="editor-cancel-button">
                Cancel
              </a>

              <button
                type="submit"
                className="editor-submit-button"
                disabled={saveStatus === "saving"}
              >
                {saveStatus === "saving" ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}

                {saveStatus === "saving"
                  ? "Saving..."
                  : "Save Resume Details"}
              </button>
            </div>
         
          </form>

           {/* ATS VISIBILITY TEST */}
          <div
            style={{
              padding: "30px",
              marginTop: "30px",
              background: "yellow",
              color: "black",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            ATS TEST — IF YOU CAN SEE THIS, THE LOCATION IS WORKING
          </div>

          {/* ATS ANALYZER PANEL */}
          <ATSAnalyzer />
        </section>
      </div>

    </main>
  );
}
