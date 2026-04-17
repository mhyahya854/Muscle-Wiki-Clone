import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 4v16M18 4v16M4 8h4M4 16h4M16 8h4M16 16h4M9 12h6" />
        </svg>
      </div>
      <span className="font-display text-lg font-semibold tracking-tight">
        Lift<span className="gradient-text">Map</span>
      </span>
    </Link>
  );
}
