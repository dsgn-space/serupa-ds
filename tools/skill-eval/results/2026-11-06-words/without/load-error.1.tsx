import { useCallback, useEffect, useState } from "react";
// Assumes serupa-ds exports `Button`; I couldn't inspect the package here, so check the name and props.
import { Button } from "serupa-ds";

type Project = { id: string | number; name: string };

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; projects: Project[] };

export default function ProjectsPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    fetch("/api/projects", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<Project[]>;
      })
      .then((projects) => setState({ status: "success", projects }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const handleAdd = () => {
    // Wire this up to your add-project flow (dialog, route, etc.).
  };

  return (
    <main>
      <header>
        <h1>Projects</h1>
        <Button onClick={handleAdd}>Add project</Button>
      </header>

      {state.status === "loading" && (
        <p role="status" aria-live="polite">
          Loading projects…
        </p>
      )}

      {state.status === "error" && (
        <div role="alert">
          <p>Couldn't load projects. Please try again.</p>
          <Button onClick={retry}>Try again</Button>
        </div>
      )}

      {state.status === "success" &&
        (state.projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul>
            {state.projects.map((project) => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
        ))}
    </main>
  );
}
