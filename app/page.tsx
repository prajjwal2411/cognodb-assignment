import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        Built on CognoDB
      </span>
      <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight">
        Skill &amp; Career Path Navigator
      </h1>
      <p className="mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">
        Explore how people, skills, jobs and companies connect in a graph:
        find the career path to a target role, spot the skills you&apos;re
        missing, and discover people and companies with related skill sets.
      </p>
      <Link
        href="/explore"
        className="mt-8 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        Start exploring
      </Link>
    </main>
  );
}
