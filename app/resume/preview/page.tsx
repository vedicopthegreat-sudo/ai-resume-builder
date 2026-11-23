
"use client";

import { useState } from "react";
import Link from "next/link";
import { useResumeStore } from "@/src/store/resume-store";

type Template = "modern" | "minimal" | "professional";

const templateOptions: { id: Template; name: string; description: string }[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Blue accents and contemporary styling",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple black-and-white design",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate two-column layout",
  },
];

type ResumeData = {
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
};

function ResumeSections({ data }: { data: ResumeData }) {
  const { summary, experiences, educations } = data;

  const hasExperience = experiences.some(
    (item) =>
      item.company ||
      item.position ||
      item.description ||
      item.startDate ||
      item.endDate
  );

  const hasEducation = educations.some(
    (item) =>
      item.school ||
      item.degree ||
      item.field ||
      item.startDate ||
      item.endDate
  );

  return (
    <>
      {summary.trim() && (
        <section className="mt-7">
          <h3 className="mb-3 border-b border-current/20 pb-2 text-sm font-bold uppercase tracking-widest">
            Professional Summary
          </h3>
          <p className="whitespace-pre-line text-sm leading-7">
            {summary}
          </p>
        </section>
      )}

      {hasExperience && (
        <section className="mt-7">
          <h3 className="mb-4 border-b border-current/20 pb-2 text-sm font-bold uppercase tracking-widest">
            Work Experience
          </h3>

          <div className="space-y-6">
            {experiences.map((item) => {
              const hasContent =
                item.company ||
                item.position ||
                item.description ||
                item.startDate ||
                item.endDate;

              if (!hasContent) return null;

              return (
                <div key={item.id}>
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="break-words font-bold">
                        {item.position || "Position"}
                      </h4>
                      <p className="break-words text-sm opacity-75">
                        {item.company}
                        {item.location ? ` • ${item.location}` : ""}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm opacity-70">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : ""}
                    </p>
                  </div>

                  {item.description && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-6">
                      {item.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {hasEducation && (
        <section className="mt-7">
          <h3 className="mb-4 border-b border-current/20 pb-2 text-sm font-bold uppercase tracking-widest">
            Education
          </h3>

          <div className="space-y-5">
            {educations.map((item) => {
              const hasContent =
                item.school ||
                item.degree ||
                item.field ||
                item.startDate ||
                item.endDate;

              if (!hasContent) return null;

              return (
                <div key={item.id}>
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="break-words font-bold">
                        {item.school || "School or University"}
                      </h4>
                      <p className="text-sm opacity-75">
                        {[item.degree, item.field]
                          .filter(Boolean)
                          .join(" — ")}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm opacity-70">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function ModernTemplate({ data }: { data: ResumeData }) {
  const { personal, skills } = data;
  const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <article className="min-h-[900px] bg-white p-6 text-gray-800 shadow-lg sm:p-12">
      <header className="border-l-4 border-blue-600 pl-5">
        <h2 className="break-words text-3xl font-extrabold uppercase tracking-wide text-gray-900 sm:text-4xl">
          {personal.fullName || "Your Name"}
        </h2>
        <p className="mt-2 text-lg font-semibold text-blue-700">
          {personal.jobTitle || "Your Professional Title"}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
          {personal.website && <span>{personal.website}</span>}
        </div>
      </header>

      <div className="text-gray-700">
        <ResumeSections data={data} />
      </div>

      {skillList.length > 0 && (
        <section className="mt-7">
          <h3 className="mb-3 border-b border-gray-300 pb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skillList.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function MinimalTemplate({ data }: { data: ResumeData }) {
  const { personal, skills } = data;
  const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <article className="min-h-[900px] bg-white p-6 font-serif text-gray-900 shadow-lg sm:p-12">
      <header className="border-b-2 border-gray-900 pb-6 text-center">
        <h2 className="break-words text-3xl font-bold uppercase tracking-widest sm:text-4xl">
          {personal.fullName || "Your Name"}
        </h2>
        <p className="mt-3 text-base italic">
          {personal.jobTitle || "Your Professional Title"}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
          {personal.website && <span>{personal.website}</span>}
        </div>
      </header>

      <div className="text-gray-800">
        <ResumeSections data={data} />
      </div>

      {skillList.length > 0 && (
        <section className="mt-7">
          <h3 className="mb-3 border-b border-gray-300 pb-2 text-sm font-bold uppercase tracking-widest">
            Skills
          </h3>
          <p className="text-sm leading-7">{skillList.join(" • ")}</p>
        </section>
      )}
    </article>
  );
}

function ProfessionalTemplate({ data }: { data: ResumeData }) {
  const { personal, skills } = data;
  const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <article className="grid min-h-[900px] grid-cols-1 bg-white shadow-lg md:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
      <aside className="break-words bg-slate-800 p-6 text-white sm:p-8">
        <h2 className="text-2xl font-bold">
          {personal.fullName || "Your Name"}
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-300">
          {personal.jobTitle || "Your Professional Title"}
        </p>

        <section className="mt-8">
          <h3 className="mb-3 border-b border-slate-500 pb-2 text-xs font-bold uppercase tracking-widest">
            Contact
          </h3>
          <div className="space-y-3 text-sm text-slate-200">
            {personal.email && <p>{personal.email}</p>}
            {personal.phone && <p>{personal.phone}</p>}
            {personal.location && <p>{personal.location}</p>}
            {personal.linkedin && <p>{personal.linkedin}</p>}
            {personal.website && <p>{personal.website}</p>}
          </div>
        </section>

        {skillList.length > 0 && (
          <section className="mt-8">
            <h3 className="mb-3 border-b border-slate-500 pb-2 text-xs font-bold uppercase tracking-widest">
              Skills
            </h3>
            <ul className="space-y-2 text-sm text-slate-200">
              {skillList.map((skill, index) => (
                <li key={`${skill}-${index}`}>• {skill}</li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      <div className="min-w-0 p-6 text-gray-800 sm:p-8">
        <ResumeSections data={data} />
      </div>
    </article>
  );
}

export default function ResumePreviewPage() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<Template>("modern");

  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const educations = useResumeStore((state) => state.educations);
  const skills = useResumeStore((state) => state.skills);

  const data: ResumeData = {
    personal,
    summary,
    experiences,
    educations,
    skills,
  };

  return (
    <main className="min-h-screen bg-gray-100 px-3 py-6 text-gray-800 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Resume Templates</h1>
            <p className="mt-1 text-sm text-gray-500">
              Choose a design for your resume.
            </p>
          </div>

          <Link
            href="/resume"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Editor
          </Link>
        </div>

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Select a template
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {templateOptions.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                aria-pressed={selectedTemplate === template.id}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  selectedTemplate === template.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                <span className="flex items-center justify-between gap-2 font-semibold">
                  {template.name}
                  {selectedTemplate === template.id && (
                    <span className="text-xs font-bold text-blue-700">
                      Selected
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  {template.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-700">
            {templateOptions.find((item) => item.id === selectedTemplate)?.name}{" "}
            template preview
          </h2>
          <span className="text-xs text-gray-500">
            Preview adapts to your screen size
          </span>
        </div>

        {selectedTemplate === "modern" && <ModernTemplate data={data} />}
        {selectedTemplate === "minimal" && <MinimalTemplate data={data} />}
        {selectedTemplate === "professional" && (
          <ProfessionalTemplate data={data} />
        )}
      </div>
    </main>
  );
}
