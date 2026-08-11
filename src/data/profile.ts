/**
 * Single source of truth for every fact on this site.
 *
 * SYNC CONTRACT: these values must match `Desktop/Resume` (sections/*.tex).
 * If a number changes in one place it changes in both, same commit. A metric
 * that disagrees with the resume is worse than no metric at all — it is the
 * one thing an interviewer can catch you on without doing any work.
 *
 * WORDING CONSTRAINT: Varun did not hold the project-lead title on Talk to
 * Data. Use "own", "architect", "build", "engineer" — never "led", "project
 * lead", or any headcount claim. This is a reference-check risk, not a
 * stylistic preference.
 */

export const profile = {
  name: "Varun Malhotra",
  title: "Data Scientist · Generative AI & LLM Engineer",
  location: "Pune, India",
  email: "vama0259@gmail.com",
  // No phone number here. This repo is public, so anything in this file is
  // permanently searchable — including in history, which is why removing it
  // later would not help. The resume carries the number; the site does not
  // need it, and never rendered it.
  linkedin: "https://www.linkedin.com/in/vama0259",
  github: "https://github.com/vama0259",

  /** The one-line positioning. Problem-shaped, not technology-shaped. */
  positioning:
    "I build LLM systems that go to production and stay there — agent architectures, the evaluation stacks that prove they work, and the guardrails that keep them honest.",

  /** Headline numbers. Three, because four is a list and two is thin. */
  headline: [
    { label: "Analysts served", value: "50+", basis: "US and Europe, daily" },
    { label: "Accuracy", value: "95%", basis: "500-question benchmark" },
    { label: "Analyst-hours saved", value: "27/wk", basis: "stakeholder-reported" },
  ],

  education: {
    school: "SRM Institute of Science and Technology",
    place: "Chennai, India",
    degree: "B.Tech, Computer Science (Big Data Analytics)",
    dates: "Sep 2020 — Jun 2024",
    gpa: "9.25 / 10",
  },

  roles: [
    {
      company: "Michelin",
      title: "Associate Data Scientist",
      dates: "Mar 2026 — Present",
      current: true,
    },
    {
      company: "Michelin",
      title: "Assistant Data Scientist",
      dates: "Jun 2024 — Mar 2026",
      current: false,
    },
    {
      company: "Michelin",
      title: "AI Research Intern",
      dates: "Jun 2023 — May 2024",
      current: false,
    },
    {
      company: "Samsung R&D Institute India",
      title: "Research Intern — Samsung PRISM",
      dates: "Feb 2023 — Jun 2023",
      current: false,
    },
  ],

  publications: [
    {
      title: "Autonomous web agent for enterprise workflows",
      venue: "MLDS 2025",
      note: "First author · peer-reviewed",
      detail:
        "Visual grounding via semantic labels over page blocks, resolved to typed XPaths through the DOM tree. Lifted component identification from 30% to 59–68% on GPT-4-mini.",
    },
    {
      title: "VAE and GAN models for 3D reconstruction of mechanical parts",
      venue: "MLDS 2024",
      note: "Peer-reviewed",
      detail: "Reconstructed 18 part geometries from the Michelin parts catalogue.",
    },
  ],

  awards: [
    { title: "Employee of the Month — Michelin (twice)", date: "Sep 2024, Mar 2025" },
    { title: "Runner-up — IIM Bangalore Case-O-Nova, 450+ teams", date: "Mar 2024" },
    { title: "Excellence Award — Samsung, GAN-based research", date: "Aug 2023" },
  ],

  certifications: [
    "AWS Academy — Machine Learning Foundations",
    "AWS Academy — Cloud Security Foundations",
  ],

  skills: [
    {
      group: "Generative & Agentic AI",
      items: [
        "LangGraph",
        "LangChain",
        "ReAct agents",
        "Multi-agent systems",
        "MCP",
        "RAG",
        "Prompt engineering",
        "Fine-tuning (LoRA, QLoRA)",
      ],
    },
    {
      group: "Machine Learning & NLP",
      items: [
        "Python",
        "PyTorch",
        "TensorFlow",
        "Transformers",
        "LLMs",
        "Model evaluation",
        "Anomaly detection",
        "Forecasting",
      ],
    },
    {
      group: "ML Engineering",
      items: [
        "Azure ML",
        "MLflow",
        "Docker",
        "Kubernetes",
        "CI/CD",
        "REST APIs",
        "SQL",
        "Dremio",
        "React",
        "TypeScript",
      ],
    },
  ],
} as const;

export type Profile = typeof profile;
