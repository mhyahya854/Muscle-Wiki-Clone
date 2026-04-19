import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { Header } from "@/components/shared/Header";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse bg-primary/20 blur-3xl" />
        <h1 className="relative font-display text-9xl font-bold tracking-tighter text-foreground/20">
          404
        </h1>
      </div>
      <h2 className="font-display text-3xl font-bold">Lost in the gym?</h2>
      <p className="mt-4 max-w-sm text-lg text-muted-foreground">
        The exercise or page you&apos;re looking for has moved or doesn&apos;t exist.
      </p>
      <div className="mt-10">
        <Link
          to="/"
          className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: unknown }) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="font-display text-3xl font-bold">Something went wrong</h2>
      <p className="mt-4 max-w-sm text-muted-foreground">
        We encountered an error loading this section. Our team has been notified.
      </p>
      <div className="mt-10 flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="rounded-full border border-border bg-card px-8 py-3 text-sm font-bold text-foreground transition-all hover:bg-accent"
        >
          Try Again
        </button>
        <Link
          to="/"
          className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          Go Home
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-8 max-w-2xl overflow-auto rounded-xl bg-muted p-4 text-left text-xs font-mono text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      )}
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LiftMap - Train smarter, by muscle" },
      {
        name: "description",
        content:
          "An intelligent, athletic exercise library. Browse by muscle, training style, equipment, and condition-aware considerations.",
      },
      { name: "author", content: "LiftMap" },
      { property: "og:title", content: "LiftMap - Train smarter, by muscle" },
      {
        property: "og:description",
        content:
          "Browse exercises by muscle, style, equipment, and condition-aware training considerations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@LiftMap" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
}
