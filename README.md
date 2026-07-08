# Job Intel

An AI-powered job application assistant that analyzes job postings against your CV and generates match scores, suggestions, and cover letters — all via a REST API backed by a background job queue.

## Features

- **CV Upload & Parsing** — Upload a PDF resume; the system extracts and converts it to Markdown via an LLM.
- **Job Posting Analysis** — Submit one or more job posting URLs; the system fetches each page, extracts structured job data, and compares it against your CV.
- **AI Match Scoring** — Returns granular match scores across requirements, experience, education, salary expectations, skills, certifications, and languages.
- **Suggested Action** — Recommends one of: `STRONG_APPLY`, `APPLY`, `STRETCH`, `UNLIKELY`, or `SKIP`.
- **Auto-generated Cover Letter** — Drafts a tailored cover letter when the confidence score exceeds 0.7.
- **Background Processing** — Heavy AI tasks run asynchronously via BullMQ workers, keeping API responses fast.

## Tech Stack

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| HTTP Framework  | [Hono](https://hono.dev/) on Node.js            |
| Database        | PostgreSQL via [Prisma](https://www.prisma.io/) |
| Job Queue       | [BullMQ](https://docs.bullmq.io/) + Redis       |
| AI / LLM        | OpenAI GPT (`@anvia/openai`)                    |
| PDF Parsing     | `pdf-parse`                                     |
| HTML → Markdown | `turndown`                                      |
| Validation      | Zod                                             |
| Runtime         | Node.js (ESM) with `tsx` for development        |

## Prerequisites

- Node.js 18+
- pnpm 11+
- PostgreSQL database
- Redis instance
- OpenAI API key
- Tavily API key

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env-example .env
```

| Variable         | Description                  |
| ---------------- | ---------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string |
| `REDIS_HOST`     | Redis hostname               |
| `REDIS_PORT`     | Redis port                   |
| `REDIS_DB`       | Redis database index         |
| `OPENAI_API_KEY` | OpenAI API key               |
| `TAVILY_API_KEY` | Tavily API key               |

### 3. Run database migrations

```bash
pnpm prisma migrate dev
```

### 4. Start the API server

```bash
pnpm dev
```

The server starts at `http://localhost:8000`.

### 5. Start the background worker (separate terminal)

```bash
pnpm worker:dev
```

## API Reference

Base URL: `http://localhost:8000`

### CV

#### `POST /curiculum-vitae` — Upload CV

Accepts a PDF file and stores the parsed Markdown content in the database.

**Request** (`multipart/form-data`)

| Field  | Type     | Description                                 |
| ------ | -------- | ------------------------------------------- |
| `key`  | `string` | Unique identifier for this CV (e.g. `cv-1`) |
| `file` | `binary` | PDF resume file                             |

#### `GET /curiculum-vitae` — List CVs

Returns all stored CVs.

---

### Job Analyzer

#### `POST /job-analyzer/by-job-posting` — Analyze Job Postings

Queues an analysis job that fetches each URL, extracts structured job data via AI, and compares it against the specified CV.

**Request** (`application/json`)

```json
{
  "jobPostingUrls": [
    "https://remoteok.com/remote-jobs/remote-senior-ai-engineer-..."
  ],
  "cvId": 1,
  "userContext": {
    "preferences": {
      "minimumAnnualSalaryUSD": 100000,
      "targetAnnualSalaryUSD": { "min": 100000, "max": 150000 },
      "preferredLocations": ["Singapore", "Australia", "Malaysia"],
      "expectedEmploymentTypes": ["REMOTE_FULL_TIME"],
      "preferredTimezone": "GMT+7"
    },
    "careerGoals": ["..."],
    "strengths": ["..."]
  }
}
```

#### `GET /job-analyzer` — Get Analysis Results

Returns all job analysis results.

---

### Match Score Fields

Each analysis result includes the following scores (0.0 – 1.0):

| Field                    | Description               |
| ------------------------ | ------------------------- |
| `requirementMatch`       | Overall job requirements  |
| `experienceMatch`        | Work experience alignment |
| `educationMatch`         | Education background      |
| `salaryExpectationMatch` | Salary range fit          |
| `skillsMatch`            | Technical / soft skills   |
| `certificationsMatch`    | Certifications            |
| `languagesMatch`         | Language requirements     |
| `confidence`             | Overall fit confidence    |

### Suggestion Actions

| Value          | Meaning                                 |
| -------------- | --------------------------------------- |
| `STRONG_APPLY` | Excellent match — apply immediately     |
| `APPLY`        | Good match — worth applying             |
| `STRETCH`      | Partial match — possible with some gaps |
| `UNLIKELY`     | Poor match — low chance of success      |
| `SKIP`         | Not a fit — skip this role              |

## Project Structure

```
src/
├── index.ts                    # HTTP server entry point
├── worker.ts                   # BullMQ worker processes
├── modules/
│   ├── curiculum-vitae/        # CV upload & parsing
│   └── job-analyzer/           # Job analysis & CV matching
│       ├── router.ts
│       ├── services.ts         # AI extraction & comparison
│       ├── schema.ts           # Zod schemas
│       └── prompts.ts
├── utils/
│   ├── queue-config.ts         # BullMQ / Redis setup
│   ├── prisma.ts               # Prisma client
│   └── openai-config.ts        # OpenAI client
└── generated/
    └── prisma/                 # Auto-generated Prisma client
prisma/
└── schema.prisma               # Database schema
```

## Available Scripts

| Script            | Description                           |
| ----------------- | ------------------------------------- |
| `pnpm dev`        | Start API server in watch mode        |
| `pnpm worker:dev` | Start background worker in watch mode |
| `pnpm build`      | Compile TypeScript to `dist/`         |
| `pnpm start`      | Run compiled server                   |

## Future Improvement

- Add auto job searching from well known portal job then feed the url to job analyzer
