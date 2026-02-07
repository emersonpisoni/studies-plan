export type TrackId = "frontend" | "backend";

export type Topic = {
  id: string;
  title: string;
  category: string;
  level: "fundamentos" | "intermediario" | "avancado";
  estimatedHours?: number;
  links?: { label: string; url: string }[];
};

export type Track = {
  id: TrackId;
  name: string;
  recommended: Topic[];
};

export const TRACKS: Track[] = [
  {
    id: "frontend",
    name: "Frontend",
    recommended: [
      {
        id: "fe-html",
        title: "HTML semântico e formulários",
        category: "Web",
        level: "fundamentos",
        estimatedHours: 6,
      },
      {
        id: "fe-css",
        title: "CSS (Flexbox, Grid, responsivo)",
        category: "Estilo",
        level: "fundamentos",
        estimatedHours: 10,
      },
      {
        id: "fe-js",
        title: "JavaScript moderno (ES6+, DOM, async/await)",
        category: "Linguagem",
        level: "fundamentos",
        estimatedHours: 20,
      },
      {
        id: "fe-git",
        title: "Git e GitHub (branching, PRs)",
        category: "Ferramentas",
        level: "fundamentos",
        estimatedHours: 8,
      },
      {
        id: "fe-http",
        title: "HTTP + APIs (REST, fetch, status codes)",
        category: "Web",
        level: "fundamentos",
        estimatedHours: 8,
      },
      {
        id: "fe-ts",
        title: "TypeScript (types, generics, narrowing)",
        category: "Linguagem",
        level: "intermediario",
        estimatedHours: 14,
      },
      {
        id: "fe-react",
        title: "React (componentes, props, state, hooks)",
        category: "Framework",
        level: "intermediario",
        estimatedHours: 24,
      },
      {
        id: "fe-testing",
        title: "Testes (Jest/Vitest + React Testing Library)",
        category: "Qualidade",
        level: "intermediario",
        estimatedHours: 12,
      },
      {
        id: "fe-a11y",
        title: "Acessibilidade (ARIA, navegação teclado)",
        category: "Qualidade",
        level: "intermediario",
        estimatedHours: 8,
      },
      {
        id: "fe-perf",
        title: "Performance (Lighthouse, bundle, memoization)",
        category: "Qualidade",
        level: "avancado",
        estimatedHours: 10,
      },
      {
        id: "fe-deploy",
        title: "Deploy (Vercel/Netlify, env vars)",
        category: "Entrega",
        level: "fundamentos",
        estimatedHours: 4,
      },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    recommended: [
      {
        id: "be-http",
        title: "HTTP + APIs (REST, status codes, auth básica)",
        category: "Web",
        level: "fundamentos",
        estimatedHours: 10,
      },
      {
        id: "be-db",
        title: "Banco de dados (modelagem, SQL básico)",
        category: "Dados",
        level: "fundamentos",
        estimatedHours: 18,
      },
      {
        id: "be-auth",
        title: "Autenticação (JWT, sessões, cookies)",
        category: "Segurança",
        level: "intermediario",
        estimatedHours: 12,
      },
    ],
  },
];

export function getTrack(trackId: TrackId): Track {
  const t = TRACKS.find((x) => x.id === trackId);
  if (!t) throw new Error(`Track not found: ${trackId}`);
  return t;
}
