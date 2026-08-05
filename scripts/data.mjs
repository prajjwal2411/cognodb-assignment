/**
 * Seed data for the Skill & Career Path Navigator.
 *
 * Domain: Person, Skill, Job, Company nodes connected by:
 *   (Person)-[:HAS_SKILL {proficiency}]->(Skill)
 *   (Job)-[:REQUIRES_SKILL {importance}]->(Skill)
 *   (Person)-[:WORKED_AT {role, years}]->(Company)
 *   (Skill)-[:LEADS_TO {strength}]->(Skill)      -- natural skill progression
 *   (Job)-[:NEXT_ROLE]->(Job)                    -- typical career ladder step
 *
 * Kept intentionally small (a few dozen nodes) but realistic enough to
 * exercise multi-hop traversals and skill-gap style queries.
 */

export const skills = [
  { name: "JavaScript", category: "Programming Language" },
  { name: "TypeScript", category: "Programming Language" },
  { name: "Python", category: "Programming Language" },
  { name: "Go", category: "Programming Language" },
  { name: "SQL", category: "Data" },
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "CSS", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "Express", category: "Backend" },
  { name: "REST APIs", category: "Backend" },
  { name: "GraphQL", category: "Backend" },
  { name: "Docker", category: "Cloud & Infra" },
  { name: "Kubernetes", category: "Cloud & Infra" },
  { name: "AWS", category: "Cloud & Infra" },
  { name: "CI/CD", category: "Cloud & Infra" },
  { name: "System Design", category: "Architecture" },
  { name: "Data Modeling", category: "Data" },
  { name: "Cypher & Graph DBs", category: "Data" },
  { name: "Machine Learning", category: "Data" },
  { name: "Leadership", category: "Soft Skill" },
  { name: "Mentoring", category: "Soft Skill" },
  { name: "Communication", category: "Soft Skill" },
  { name: "Product Thinking", category: "Soft Skill" },
];

// (from, to, strength 1-5): a natural "what to learn next" progression.
export const skillProgressions = [
  ["JavaScript", "TypeScript", 5],
  ["JavaScript", "React", 5],
  ["TypeScript", "Node.js", 3],
  ["React", "Next.js", 5],
  ["Node.js", "Express", 5],
  ["Express", "REST APIs", 4],
  ["REST APIs", "GraphQL", 3],
  ["Node.js", "Docker", 3],
  ["Docker", "Kubernetes", 5],
  ["Kubernetes", "AWS", 4],
  ["SQL", "Data Modeling", 4],
  ["Data Modeling", "Cypher & Graph DBs", 4],
  ["Python", "Machine Learning", 5],
  ["System Design", "Leadership", 3],
  ["Communication", "Leadership", 4],
  ["Leadership", "Mentoring", 5],
  ["Mentoring", "Product Thinking", 2],
];

export const jobs = [
  { title: "Junior Frontend Engineer", level: "Junior" },
  { title: "Frontend Engineer", level: "Mid" },
  { title: "Senior Frontend Engineer", level: "Senior" },
  { title: "Junior Backend Engineer", level: "Junior" },
  { title: "Backend Engineer", level: "Mid" },
  { title: "Senior Backend Engineer", level: "Senior" },
  { title: "Staff Engineer", level: "Staff" },
  { title: "Engineering Manager", level: "Manager" },
  { title: "Data Engineer", level: "Mid" },
  { title: "Senior Data Engineer", level: "Senior" },
  { title: "DevOps Engineer", level: "Mid" },
  { title: "Senior DevOps Engineer", level: "Senior" },
  { title: "Machine Learning Engineer", level: "Senior" },
];

// Typical next step in the career ladder (multiple valid paths on purpose).
export const jobProgressions = [
  ["Junior Frontend Engineer", "Frontend Engineer"],
  ["Frontend Engineer", "Senior Frontend Engineer"],
  ["Senior Frontend Engineer", "Staff Engineer"],
  ["Junior Backend Engineer", "Backend Engineer"],
  ["Backend Engineer", "Senior Backend Engineer"],
  ["Senior Backend Engineer", "Staff Engineer"],
  ["Staff Engineer", "Engineering Manager"],
  ["Backend Engineer", "DevOps Engineer"],
  ["DevOps Engineer", "Senior DevOps Engineer"],
  ["Data Engineer", "Senior Data Engineer"],
  ["Senior Data Engineer", "Machine Learning Engineer"],
  ["Senior Backend Engineer", "Machine Learning Engineer"],
];

// (job, skill, importance 1-5)
export const jobSkillRequirements = [
  ["Junior Frontend Engineer", "JavaScript", 5],
  ["Junior Frontend Engineer", "CSS", 4],
  ["Junior Frontend Engineer", "React", 3],

  ["Frontend Engineer", "JavaScript", 5],
  ["Frontend Engineer", "React", 5],
  ["Frontend Engineer", "TypeScript", 4],
  ["Frontend Engineer", "CSS", 3],

  ["Senior Frontend Engineer", "React", 5],
  ["Senior Frontend Engineer", "TypeScript", 5],
  ["Senior Frontend Engineer", "Next.js", 4],
  ["Senior Frontend Engineer", "System Design", 3],
  ["Senior Frontend Engineer", "Mentoring", 3],

  ["Junior Backend Engineer", "JavaScript", 4],
  ["Junior Backend Engineer", "Node.js", 4],
  ["Junior Backend Engineer", "SQL", 3],

  ["Backend Engineer", "Node.js", 5],
  ["Backend Engineer", "Express", 4],
  ["Backend Engineer", "REST APIs", 4],
  ["Backend Engineer", "SQL", 4],

  ["Senior Backend Engineer", "Node.js", 5],
  ["Senior Backend Engineer", "System Design", 5],
  ["Senior Backend Engineer", "GraphQL", 3],
  ["Senior Backend Engineer", "Docker", 3],
  ["Senior Backend Engineer", "Mentoring", 3],

  ["Staff Engineer", "System Design", 5],
  ["Staff Engineer", "Leadership", 4],
  ["Staff Engineer", "Mentoring", 4],
  ["Staff Engineer", "Communication", 4],

  ["Engineering Manager", "Leadership", 5],
  ["Engineering Manager", "Communication", 5],
  ["Engineering Manager", "Mentoring", 5],
  ["Engineering Manager", "Product Thinking", 4],

  ["Data Engineer", "SQL", 5],
  ["Data Engineer", "Python", 4],
  ["Data Engineer", "Data Modeling", 4],

  ["Senior Data Engineer", "Data Modeling", 5],
  ["Senior Data Engineer", "Cypher & Graph DBs", 4],
  ["Senior Data Engineer", "Python", 4],
  ["Senior Data Engineer", "System Design", 3],

  ["DevOps Engineer", "Docker", 5],
  ["DevOps Engineer", "CI/CD", 4],
  ["DevOps Engineer", "AWS", 3],

  ["Senior DevOps Engineer", "Kubernetes", 5],
  ["Senior DevOps Engineer", "AWS", 5],
  ["Senior DevOps Engineer", "CI/CD", 4],
  ["Senior DevOps Engineer", "System Design", 3],

  ["Machine Learning Engineer", "Python", 5],
  ["Machine Learning Engineer", "Machine Learning", 5],
  ["Machine Learning Engineer", "Data Modeling", 3],
  ["Machine Learning Engineer", "SQL", 3],
];

export const companies = [
  { name: "TechNova", industry: "Software" },
  { name: "DataForge", industry: "Data & AI" },
  { name: "CloudSpan", industry: "Cloud Infrastructure" },
  { name: "PixelWorks", industry: "Product Design" },
  { name: "FinEdge", industry: "Fintech" },
  { name: "GreenGrid", industry: "Clean Energy" },
  { name: "Nimbus Systems", industry: "DevOps & Infra" },
  { name: "Quanta Labs", industry: "Machine Learning" },
];

// Each person: name, currentTitle (matches a Job title), skills [{name, proficiency 1-5}],
// workHistory [{company, role, years}].
export const people = [
  {
    name: "Asha Rao",
    currentTitle: "Senior Frontend Engineer",
    skills: [
      { name: "JavaScript", proficiency: 5 },
      { name: "React", proficiency: 5 },
      { name: "TypeScript", proficiency: 4 },
      { name: "Next.js", proficiency: 4 },
      { name: "CSS", proficiency: 4 },
      { name: "Mentoring", proficiency: 3 },
    ],
    workHistory: [
      { company: "PixelWorks", role: "Frontend Engineer", years: 2 },
      { company: "TechNova", role: "Senior Frontend Engineer", years: 2 },
    ],
  },
  {
    name: "Marco Silva",
    currentTitle: "Frontend Engineer",
    skills: [
      { name: "JavaScript", proficiency: 4 },
      { name: "React", proficiency: 4 },
      { name: "CSS", proficiency: 4 },
      { name: "TypeScript", proficiency: 2 },
    ],
    workHistory: [{ company: "PixelWorks", role: "Frontend Engineer", years: 1 }],
  },
  {
    name: "Priya Nair",
    currentTitle: "Junior Frontend Engineer",
    skills: [
      { name: "JavaScript", proficiency: 3 },
      { name: "CSS", proficiency: 3 },
      { name: "React", proficiency: 2 },
    ],
    workHistory: [{ company: "TechNova", role: "Junior Frontend Engineer", years: 1 }],
  },
  {
    name: "Daniel Kim",
    currentTitle: "Senior Backend Engineer",
    skills: [
      { name: "Node.js", proficiency: 5 },
      { name: "Express", proficiency: 4 },
      { name: "REST APIs", proficiency: 4 },
      { name: "SQL", proficiency: 4 },
      { name: "System Design", proficiency: 4 },
      { name: "Docker", proficiency: 3 },
    ],
    workHistory: [
      { company: "TechNova", role: "Backend Engineer", years: 2 },
      { company: "FinEdge", role: "Senior Backend Engineer", years: 3 },
    ],
  },
  {
    name: "Fatima Al-Sayed",
    currentTitle: "Backend Engineer",
    skills: [
      { name: "Node.js", proficiency: 4 },
      { name: "Express", proficiency: 3 },
      { name: "SQL", proficiency: 3 },
      { name: "REST APIs", proficiency: 3 },
    ],
    workHistory: [{ company: "FinEdge", role: "Backend Engineer", years: 2 }],
  },
  {
    name: "Tom Becker",
    currentTitle: "Junior Backend Engineer",
    skills: [
      { name: "JavaScript", proficiency: 3 },
      { name: "Node.js", proficiency: 2 },
      { name: "SQL", proficiency: 2 },
    ],
    workHistory: [{ company: "GreenGrid", role: "Junior Backend Engineer", years: 1 }],
  },
  {
    name: "Wei Zhang",
    currentTitle: "Staff Engineer",
    skills: [
      { name: "System Design", proficiency: 5 },
      { name: "Leadership", proficiency: 4 },
      { name: "Mentoring", proficiency: 4 },
      { name: "Communication", proficiency: 4 },
      { name: "Node.js", proficiency: 4 },
    ],
    workHistory: [
      { company: "TechNova", role: "Senior Backend Engineer", years: 2 },
      { company: "TechNova", role: "Staff Engineer", years: 3 },
    ],
  },
  {
    name: "Lena Hoffman",
    currentTitle: "Engineering Manager",
    skills: [
      { name: "Leadership", proficiency: 5 },
      { name: "Communication", proficiency: 5 },
      { name: "Mentoring", proficiency: 5 },
      { name: "Product Thinking", proficiency: 4 },
      { name: "System Design", proficiency: 3 },
    ],
    workHistory: [
      { company: "CloudSpan", role: "Staff Engineer", years: 2 },
      { company: "CloudSpan", role: "Engineering Manager", years: 3 },
    ],
  },
  {
    name: "Omar Farouk",
    currentTitle: "Data Engineer",
    skills: [
      { name: "SQL", proficiency: 5 },
      { name: "Python", proficiency: 4 },
      { name: "Data Modeling", proficiency: 4 },
    ],
    workHistory: [{ company: "DataForge", role: "Data Engineer", years: 2 }],
  },
  {
    name: "Grace Liu",
    currentTitle: "Senior Data Engineer",
    skills: [
      { name: "SQL", proficiency: 5 },
      { name: "Python", proficiency: 4 },
      { name: "Data Modeling", proficiency: 5 },
      { name: "Cypher & Graph DBs", proficiency: 4 },
      { name: "System Design", proficiency: 3 },
    ],
    workHistory: [
      { company: "DataForge", role: "Data Engineer", years: 2 },
      { company: "DataForge", role: "Senior Data Engineer", years: 2 },
    ],
  },
  {
    name: "Ivan Petrov",
    currentTitle: "DevOps Engineer",
    skills: [
      { name: "Docker", proficiency: 5 },
      { name: "CI/CD", proficiency: 4 },
      { name: "AWS", proficiency: 3 },
    ],
    workHistory: [{ company: "Nimbus Systems", role: "DevOps Engineer", years: 2 }],
  },
  {
    name: "Sara Johansson",
    currentTitle: "Senior DevOps Engineer",
    skills: [
      { name: "Docker", proficiency: 5 },
      { name: "Kubernetes", proficiency: 5 },
      { name: "AWS", proficiency: 5 },
      { name: "CI/CD", proficiency: 4 },
      { name: "System Design", proficiency: 3 },
    ],
    workHistory: [
      { company: "Nimbus Systems", role: "DevOps Engineer", years: 2 },
      { company: "Nimbus Systems", role: "Senior DevOps Engineer", years: 3 },
    ],
  },
  {
    name: "Noah Williams",
    currentTitle: "Machine Learning Engineer",
    skills: [
      { name: "Python", proficiency: 5 },
      { name: "Machine Learning", proficiency: 5 },
      { name: "Data Modeling", proficiency: 3 },
      { name: "SQL", proficiency: 3 },
    ],
    workHistory: [{ company: "Quanta Labs", role: "Machine Learning Engineer", years: 3 }],
  },
  {
    name: "Chidi Okafor",
    currentTitle: "Backend Engineer",
    skills: [
      { name: "Node.js", proficiency: 4 },
      { name: "SQL", proficiency: 3 },
      { name: "REST APIs", proficiency: 4 },
      { name: "Docker", proficiency: 2 },
    ],
    workHistory: [{ company: "GreenGrid", role: "Backend Engineer", years: 2 }],
  },
  {
    name: "Elena Rossi",
    currentTitle: "Frontend Engineer",
    skills: [
      { name: "JavaScript", proficiency: 4 },
      { name: "React", proficiency: 4 },
      { name: "TypeScript", proficiency: 3 },
      { name: "Next.js", proficiency: 2 },
    ],
    workHistory: [{ company: "TechNova", role: "Frontend Engineer", years: 2 }],
  },
  {
    name: "Jonas Berg",
    currentTitle: "Junior Backend Engineer",
    skills: [
      { name: "JavaScript", proficiency: 2 },
      { name: "Node.js", proficiency: 2 },
    ],
    workHistory: [{ company: "CloudSpan", role: "Junior Backend Engineer", years: 1 }],
  },
];
