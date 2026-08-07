"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  JobSummary,
  SkillSummary,
  CareerPathResponse,
  SkillGapResponse,
  SimilarPerson,
  CompanyRecommendation,
} from "@/lib/types";
import { LoadingState, EmptyState, ErrorState } from "@/components/StateViews";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body as T;
}

export default function ExplorePage() {
  const [jobs, setJobs] = useState<JobSummary[] | null>(null);
  const [skills, setSkills] = useState<SkillSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Load the reference lists once.
  useEffect(() => {
    Promise.all([
      fetchJson<{ jobs: JobSummary[] }>("/api/jobs"),
      fetchJson<{ skills: SkillSummary[] }>("/api/skills"),
    ])
      .then(([jobsRes, skillsRes]) => {
        setJobs(jobsRes.jobs);
        setSkills(skillsRes.skills);
      })
      .catch((err) => setListError(err.message));
  }, []);

  // When the current role changes, pre-fill the skill checklist with that
  // role's required skills (reusing the skill-gap query with an empty skill
  // list, which returns every skill the role requires). Still editable after.
  useEffect(() => {
    if (!currentTitle) return;
    fetchJson<SkillGapResponse>(
      `/api/skill-gap?targetJob=${encodeURIComponent(currentTitle)}`
    )
      .then((res) => setSelectedSkills(res.missingSkills.map((s) => s.name)))
      .catch(() => {
        /* Prefill is a convenience only — ignore failures here. */
      });
  }, [currentTitle]);

  const skillsByCategory = useMemo(() => {
    const groups: Record<string, SkillSummary[]> = {};
    for (const skill of skills ?? []) {
      groups[skill.category] ??= [];
      groups[skill.category].push(skill);
    }
    return groups;
  }, [skills]);

  // A person's target role can't be the same as their current role.
  const targetJobOptions = useMemo(
    () => (jobs ?? []).filter((j) => j.title !== currentTitle),
    [jobs, currentTitle]
  );

  // If the current role changes to match the already-selected target role,
  // clear the target role so the two never stay in sync.
  useEffect(() => {
    if (currentTitle && targetJob === currentTitle) {
      setTargetJob("");
    }
  }, [currentTitle, targetJob]);

  function toggleSkill(skillName: string) {
    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  }

  const profileReady = currentTitle !== "" && selectedSkills.length > 0;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Skill &amp; Career Path Navigator
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Tell us who you are, your current role and skills, and where
        you&apos;d like to go — we&apos;ll show the career path, the skills
        you&apos;re missing, people with a similar skill set, and companies
        worth exploring.
      </p>

      {listError && (
        <div className="mt-6">
          <ErrorState message={listError} />
        </div>
      )}

      {!listError && (jobs === null || skills === null) && (
        <LoadingState label="Loading roles and skills..." />
      )}

      {jobs && skills && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Your name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan"
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Your current role
              </span>
              <select
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
              >
                <option value="">Select your current role...</option>
                {jobs.map((j) => (
                  <option key={j.title} value={j.title}>
                    {j.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Desired profession
              </span>
              <select
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
              >
                <option value="">Select a target role...</option>
                {targetJobOptions.map((j) => (
                  <option key={j.title} value={j.title}>
                    {j.title}
                  </option>
                ))}
              </select>
              {currentTitle && (
                <p className="mt-1 text-xs text-neutral-500">
                  &quot;{currentTitle}&quot; is excluded since it&apos;s your current role.
                </p>
              )}
            </label>
          </div>

          {currentTitle && (
            <div className="mt-6">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Your skills
              </span>
              <p className="mt-1 text-xs text-neutral-500">
                Pre-filled from &quot;{currentTitle}&quot;&apos;s typical skills — feel free to adjust.
              </p>
              <div className="mt-3 grid gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2 dark:border-neutral-800">
                {Object.entries(skillsByCategory).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {category}
                    </p>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {items.map((skill) => (
                        <label
                          key={skill.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill.name)}
                            onChange={() => toggleSkill(skill.name)}
                          />
                          {skill.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!currentTitle && (
            <div className="mt-8">
              <EmptyState
                title="Choose your current role to get started"
                description="Select your current role above — we'll suggest your typical skills automatically."
              />
            </div>
          )}

          {profileReady && (
            <div className="mt-8 space-y-8">
              <CareerPathSection currentTitle={currentTitle} targetJob={targetJob} />
              <SkillGapSection skills={selectedSkills} targetJob={targetJob} />
              <SimilarPeopleSection skills={selectedSkills} />
              <CompanyRecommendationsSection skills={selectedSkills} />
            </div>
          )}
        </>
      )}
    </main>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CareerPathSection({
  currentTitle,
  targetJob,
}: {
  currentTitle: string;
  targetJob: string;
}) {
  const [data, setData] = useState<CareerPathResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetJob) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchJson<CareerPathResponse>(
      `/api/career-path?currentTitle=${encodeURIComponent(currentTitle)}&targetJob=${encodeURIComponent(targetJob)}`
    )
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentTitle, targetJob]);

  return (
    <SectionCard title="Career path">
      {!targetJob && (
        <EmptyState
          title="Pick a target role"
          description="Select a desired profession above to see the career-ladder path."
        />
      )}
      {targetJob && loading && <LoadingState label="Finding the path..." />}
      {targetJob && error && <ErrorState message={error} />}
      {targetJob && !loading && !error && data && !data.found && (
        <EmptyState
          title="No path found"
          description="There's no NEXT_ROLE chain connecting your current role to the target role within 6 hops."
        />
      )}
      {targetJob && !loading && !error && data?.found && (
        <div className="flex flex-wrap items-center gap-2">
          {data.path.map((step, i) => (
            <div key={step.title} className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800">
                {step.title}
              </span>
              {i < data.path.length - 1 && (
                <span className="text-neutral-400">→</span>
              )}
            </div>
          ))}
          <span className="ml-2 text-xs text-neutral-500">
            ({data.hops} {data.hops === 1 ? "hop" : "hops"})
          </span>
        </div>
      )}
    </SectionCard>
  );
}

function SkillGapSection({
  skills,
  targetJob,
}: {
  skills: string[];
  targetJob: string;
}) {
  const [data, setData] = useState<SkillGapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetJob) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchJson<SkillGapResponse>(
      `/api/skill-gap?skills=${encodeURIComponent(skills.join(","))}&targetJob=${encodeURIComponent(targetJob)}`
    )
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [skills, targetJob]);

  return (
    <SectionCard title="Skill gap">
      {!targetJob && (
        <EmptyState
          title="Pick a target role"
          description="Select a desired profession above to see missing skills."
        />
      )}
      {targetJob && loading && <LoadingState label="Analysing skill gap..." />}
      {targetJob && error && <ErrorState message={error} />}
      {targetJob && !loading && !error && data && (
        <>
          {data.missingSkills.length === 0 ? (
            <EmptyState
              title="No skill gap!"
              description="You already have every skill required for this role."
            />
          ) : (
            <ul className="space-y-2">
              {data.missingSkills.map((s) => (
                <li key={s.name} className="flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="text-xs text-neutral-500">
                    importance {s.importance}/5
                  </span>
                </li>
              ))}
            </ul>
          )}

          {data.suggestedNextSkills.length > 0 && (
            <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <p className="text-sm font-medium">Suggested next steps</p>
              <ul className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                {data.suggestedNextSkills.map((s) => (
                  <li key={`${s.from}-${s.to}`}>
                    {s.from} → {s.to}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}

function SimilarPeopleSection({ skills }: { skills: string[] }) {
  const [data, setData] = useState<SimilarPerson[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchJson<{ people: SimilarPerson[] }>(
      `/api/similar-people?skills=${encodeURIComponent(skills.join(","))}`
    )
      .then((res) => setData(res.people))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [skills]);

  return (
    <SectionCard title="People with a similar skill set">
      {loading && <LoadingState label="Looking for similar people..." />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          title="No close matches"
          description="Nobody in the graph shares 3 or more of your skills yet."
        />
      )}
      {!loading && !error && data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((p) => (
            <li key={p.name} className="text-sm">
              <span className="font-medium">{p.name}</span>{" "}
              <span className="text-neutral-500">— {p.currentTitle}</span>
              <div className="text-xs text-neutral-500">
                Shared: {p.sharedSkills.join(", ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function CompanyRecommendationsSection({ skills }: { skills: string[] }) {
  const [data, setData] = useState<CompanyRecommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchJson<{ companies: CompanyRecommendation[] }>(
      `/api/company-recommendations?skills=${encodeURIComponent(skills.join(","))}`
    )
      .then((res) => setData(res.companies))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [skills]);

  return (
    <SectionCard title="Companies worth exploring">
      {loading && <LoadingState label="Finding company connections..." />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          title="No recommendations yet"
          description="No companies found where a skill twin (someone sharing 2+ skills) works."
        />
      )}
      {!loading && !error && data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((c) => (
            <li key={c.company} className="text-sm">
              <span className="font-medium">{c.company}</span>{" "}
              <span className="text-neutral-500">— {c.industry}</span>
              <div className="text-xs text-neutral-500">
                Via: {c.connectedVia.join(", ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
