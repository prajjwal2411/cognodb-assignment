"use client";

import { useEffect, useState } from "react";
import type {
  PersonSummary,
  JobSummary,
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
  const [people, setPeople] = useState<PersonSummary[] | null>(null);
  const [jobs, setJobs] = useState<JobSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  useEffect(() => {
    Promise.all([
      fetchJson<{ people: PersonSummary[] }>("/api/people"),
      fetchJson<{ jobs: JobSummary[] }>("/api/jobs"),
    ])
      .then(([peopleRes, jobsRes]) => {
        setPeople(peopleRes.people);
        setJobs(jobsRes.jobs);
      })
      .catch((err) => setListError(err.message));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Skill &amp; Career Path Navigator
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Pick a person and a target role to see the career path between them,
        the skills they&apos;re missing, people with a similar skill set, and
        companies worth exploring.
      </p>

      {listError && (
        <div className="mt-6">
          <ErrorState message={listError} />
        </div>
      )}

      {!listError && (people === null || jobs === null) && (
        <LoadingState label="Loading people and jobs..." />
      )}

      {people && jobs && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                You are
              </span>
              <select
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
              >
                <option value="">Select a person...</option>
                {people.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} — {p.currentTitle}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Target role
              </span>
              <select
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                <option value="">Select a role...</option>
                {jobs.map((j) => (
                  <option key={j.title} value={j.title}>
                    {j.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!selectedPerson && (
            <div className="mt-8">
              <EmptyState
                title="Choose a person to get started"
                description="Select yourself (or anyone) from the list above."
              />
            </div>
          )}

          {selectedPerson && (
            <div className="mt-8 space-y-8">
              <CareerPathSection person={selectedPerson} targetJob={selectedJob} />
              <SkillGapSection person={selectedPerson} targetJob={selectedJob} />
              <SimilarPeopleSection person={selectedPerson} />
              <CompanyRecommendationsSection person={selectedPerson} />
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
  person,
  targetJob,
}: {
  person: string;
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
      `/api/career-path?person=${encodeURIComponent(person)}&targetJob=${encodeURIComponent(targetJob)}`
    )
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [person, targetJob]);

  return (
    <SectionCard title="Career path">
      {!targetJob && (
        <EmptyState
          title="Pick a target role"
          description="Select a target role above to see the career-ladder path."
        />
      )}
      {targetJob && loading && <LoadingState label="Finding the path..." />}
      {targetJob && error && <ErrorState message={error} />}
      {targetJob && !loading && !error && data && !data.found && (
        <EmptyState
          title="No path found"
          description="There's no NEXT_ROLE chain connecting this person's current role to the target role within 6 hops."
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
  person,
  targetJob,
}: {
  person: string;
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
      `/api/skill-gap?person=${encodeURIComponent(person)}&targetJob=${encodeURIComponent(targetJob)}`
    )
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [person, targetJob]);

  return (
    <SectionCard title="Skill gap">
      {!targetJob && (
        <EmptyState
          title="Pick a target role"
          description="Select a target role above to see missing skills."
        />
      )}
      {targetJob && loading && <LoadingState label="Analysing skill gap..." />}
      {targetJob && error && <ErrorState message={error} />}
      {targetJob && !loading && !error && data && (
        <>
          {data.missingSkills.length === 0 ? (
            <EmptyState
              title="No skill gap!"
              description="This person already has every skill required for the role."
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

function SimilarPeopleSection({ person }: { person: string }) {
  const [data, setData] = useState<SimilarPerson[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchJson<{ people: SimilarPerson[] }>(
      `/api/similar-people?person=${encodeURIComponent(person)}`
    )
      .then((res) => setData(res.people))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [person]);

  return (
    <SectionCard title="People with a similar skill set">
      {loading && <LoadingState label="Looking for similar people..." />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          title="No close matches"
          description="Nobody else in the graph shares 3 or more skills with this person yet."
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

function CompanyRecommendationsSection({ person }: { person: string }) {
  const [data, setData] = useState<CompanyRecommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchJson<{ companies: CompanyRecommendation[] }>(
      `/api/company-recommendations?person=${encodeURIComponent(person)}`
    )
      .then((res) => setData(res.companies))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [person]);

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
