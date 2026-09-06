import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap",
  },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#05070c" />
        <Meta />
        <Links />
      </head>
      <body className="bg-ink text-paper antialiased">
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Algo salió mal";
  let detail = "Ocurrió un error inesperado.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "404" : `Error ${error.status}`;
    detail =
      error.status === 404
        ? "Esta página no existe (o todavía no)."
        : error.statusText || detail;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    detail = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted">// error</p>
      <h1 className="font-display text-6xl md:text-8xl font-extrabold tracking-tight">{title}</h1>
      <p className="max-w-md text-muted">{detail}</p>
      <a href="/" className="btn-outline">Volver al inicio</a>
      {stack && (
        <pre className="w-full max-w-3xl overflow-x-auto text-left text-xs text-muted p-4 border border-line rounded-lg">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
