# MomAndMe

MomAndMe is a full-stack project with a Java Spring Boot backend and a React + TypeScript frontend, plus documentation and GitHub Copilot customization to standardize how work is planned and implemented.

## Project Structure

- `backend/` – Spring Boot (Java)
  - `pom.xml` – Maven configuration
  - `src/main/java/com/momandme/` – application source
  - `src/main/resources/` – application configuration
- `frontend/` – React + TypeScript, Vite-powered
  - `package.json` – frontend dependencies and scripts
  - `tsconfig.json` – TypeScript configuration
  - `vite.config.mts` – Vite config
  - `src/` – React app source (TypeScript)
- `docs/` – product and project documentation
- `guidelines/` – engineering and process guidelines (to be expanded)
- `.github/agents/` – GitHub Copilot custom agents (for planning and implementation)

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+ and npm

### Backend (Spring Boot)

From the project root:

```bash
cd backend
mvn spring-boot:run
```

By default, the application will start on port 8080 (configurable via `application.properties`).

### Frontend (React + TypeScript)

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Vite will start the dev server (default port 5173). Open the printed URL in your browser.

## GitHub Copilot Custom Agents

Custom agent profiles live under:

- `.github/agents/implementation.agent.md` – an "implementation mode" agent that:
  - Creates a high-level implementation plan
  - Writes detailed implementation plan files under `.github/stories-and-plans/implementation-plans/` (when present)
  - Implements focused code changes following your repository guidelines

You can manage and run agents via the Copilot "Agents" UI on GitHub, selecting this repository and branch.

## Next Steps

- Flesh out `docs/` with product and architectural documentation.
- Add concrete engineering guidelines under `guidelines/` and `.github/guidelines/` to match what the implementation agent expects.
- Add initial backend APIs and connect the frontend to them.
