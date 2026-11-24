# AI Resume Builder & Job Tracker 🚀

An AI-powered resume builder and job application tracking platform designed to help job seekers create professional, ATS-friendly resumes, improve their resume content, and manage their job search in one place.

Built with **Next.js, React, TypeScript, Tailwind CSS, and Supabase**, this application combines AI-assisted resume writing, ATS analysis, PDF export, and job application management in a modern web experience.

## ✨ Features

### 📄 Resume Builder

- Create and edit professional resumes.
- Organize resume information into structured sections.
- Automatically save resume changes using Supabase.
- Undo and redo editing actions.
- Preview resumes before downloading.
- Export resumes as PDF documents.

### 🤖 AI-Powered Resume Assistance

- Generate professional resume summaries using AI.
- Improve resume content and wording.
- Get AI assistance while preparing resume content.
- Generate suggestions through an AI API integration.

### 🎯 ATS Resume Analyzer

- Analyze resume content for ATS compatibility.
- Identify important keywords and missing information.
- Get suggestions to improve resume quality.
- Make resumes more suitable for applicant tracking systems.

### 💼 Job Application Tracker

- Save job opportunities.
- Track application progress through different statuses:
  - Saved
  - Applied
  - Interview
  - Offer
  - Rejected
- Store company names, job titles, locations, salary details, job links, and notes.
- Update and manage job application records.

### 📊 Dashboard

- View your resumes in one place.
- Track recent job applications.
- View job search statistics.
- Search and browse saved resumes.
- Access resume creation and job tracking features.

### 🔐 Data Management

- Supabase integration for database operations.
- User-specific resume and job application data.
- Supabase authentication integration.
- Environment variables used for sensitive configuration.

---

## 🛠️ Technology Stack

| Technology      | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| Next.js 16      | React framework, routing, and server-side capabilities |
| React 19        | Building interactive user interfaces                   |
| TypeScript      | Type safety and maintainable code                      |
| Tailwind CSS 4  | Modern and responsive styling                          |
| Supabase        | Database and authentication                            |
| Zustand         | Resume editor state management                         |
| OpenRouter API  | AI-powered resume generation                           |
| React Hook Form | Form management                                        |
| Zod             | Data validation                                        |
| @dnd-kit        | Drag-and-drop functionality                            |
| React PDF       | Resume PDF generation                                  |
| jsPDF           | PDF document generation                                |
| Recharts        | Data visualization                                     |
| Lucide React    | Icons                                                  |

## 💡 Why This Technology Stack?

- **Next.js:** Provides a modern application architecture, routing, and optimized production builds.
- **React:** Makes it easier to build reusable and interactive components.
- **TypeScript:** Helps catch errors early and improves code reliability.
- **Tailwind CSS:** Enables responsive UI development with consistent styling.
- **Supabase:** Provides database and authentication infrastructure without needing to build everything from scratch.
- **Zustand:** Keeps resume editor state management lightweight and simple.
- **OpenRouter:** Provides access to AI models for resume assistance.
- **React PDF:** Supports generating downloadable professional resumes.

Together, these technologies create a maintainable, scalable, and performance-focused web application.

---

## ⚡ Performance Optimization

Performance was measured using **Google Lighthouse 13.5.0** in an emulated desktop environment.

The project was optimized to reduce layout shifts and improve the loading experience.

### Lighthouse Metrics: Before vs After

| Metric                         | Before |     After |
| ------------------------------ | -----: | --------: |
| First Contentful Paint (FCP)   |  0.5 s |     0.5 s |
| Largest Contentful Paint (LCP) |  0.6 s |     0.5 s |
| Total Blocking Time (TBT)      |   0 ms |      0 ms |
| Cumulative Layout Shift (CLS)  |  0.146 |     0.021 |
| Speed Index                    |  0.5 s |     0.5 s |

### Latest Lighthouse Scores

| Category         |   Score |
| ---------------- | ------: |
| Performance      | **100** |
| Best Practices   |     100 |
| SEO              |     100 |
| Agentic Browsing |     100 |

### What Improved?

- Reduced Cumulative Layout Shift from 0.146 to 0.021.
- Improved Largest Contentful Paint from 0.6 seconds to 0.5 seconds.
- Maintained 0 ms Total Blocking Time.
- Used loading skeletons to provide a more stable loading experience.
- Improved visual stability during dashboard content loading.

**Result:** The application achieved a Lighthouse Performance score of 100, with excellent loading speed and significantly improved layout stability.

---

## 🖥️ Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/vedicopthegreat-sudo/ai-resume-builder.git
```

### 2. Navigate to the project folder

```bash
cd ai-resume-builder
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root and add the required configuration for:

- Supabase project URL
- Supabase public/anonymous key
- OpenRouter API key

Use the exact environment variable names expected by the application code.

**Important:** Never commit `.env.local` or expose private API keys in your repository.

### 5. Start the development server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

### 6. Create a production build

```bash
npm run build
```

To run the production build locally:

```bash
npm start
```

---

## 📁 Project Structure

```text
ai-resume-builder/
│
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── generate/
│   ├── jobs/
│   ├── register/
│   ├── resume/
│   ├── globals.css
│   └── page.tsx
│
├── lib/
│   ├── supabase/
│   ├── ats-analyzer.ts
│   ├── job-application-service.ts
│   └── resume-service.ts
│
├── src/
│   ├── components/
│   ├── store/
│   └── app/
│
├── public/
├── .gitignore
├── package.json
└── README.md
```

---

## 🔒 Security

- Environment variables are excluded from Git using `.gitignore`.
- API keys should be stored securely in environment variables.
- Supabase Row Level Security (RLS) should be enabled and configured for user-specific data access.

---

## 🚀 Future Improvements

- More professional resume templates.
- Additional AI-powered resume suggestions.
- Job description and resume matching.
- Advanced ATS keyword analysis.
- More detailed job application analytics.
- Resume customization for specific job descriptions.
- Improved mobile experience.

---

## 👨‍💻 Author


GitHub: [https://github.com/vedicopthegreat-sudo](https://github.com/vedicopthegreat-sudo)

## 📜 License

This project is currently a personal project. A license can be added if you decide to distribute or open-source it.

---

⭐ If you find this project interesting, consider giving the repository a star!


The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
