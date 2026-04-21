# TaskFlow — Project Management Tool
 A full-stack project management tool built with React 18, Supabase, and AI-powered features. Built solo in a 6-day sprint as part of a React internship program.

---

## 🔗 Live Demo

| | Link |
|---|---|
| **Frontend** | https://task-flow-wheat-seven.vercel.app |
| **AI Backend** | https://taskflow-rnsw.onrender.com |
| **GitHub** | [https://github.com/YOUR_USERNAME/taskflow](https://github.com/HimajahnaviKanagala/TaskFlow) |

---

## ✨ Features

### Core
- 🔐 **User authentication** — register, login, logout via Supabase Auth
- 📁 **Project management** — create, edit, delete projects with custom colors
- 📋 **Kanban board** — drag-and-drop tasks across Todo, In Progress, Done
- ✅ **Task management** — title, description, priority, due dates, comments
- 📊 **Dashboard** — project progress charts powered by Recharts
- 🌙 **Dark / light mode** — persists across sessions
- 📱 **Fully responsive** — works on mobile, tablet, and desktop

### AI Features (Groq — Llama 3.1)
- 🤖 **AI Chat assistant** — ask questions about your projects and tasks
- ⚡ **AI task generator** — describe a project, AI creates 6–8 tasks instantly
- ✍️ **AI description writer** — auto-generate task descriptions with one click

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI framework and build tool |
| Styling | Tailwind CSS v4 | Utility-first responsive design |
| Database | Supabase (PostgreSQL) | Data storage with Row Level Security |
| Auth | Supabase Auth | JWT-based authentication |
| State | React Context + useReducer | Global auth and project state |
| Routing | React Router v6 | Client-side routing + protected routes |
| Drag & Drop | @dnd-kit | Accessible Kanban drag-and-drop |
| Charts | Recharts | Dashboard data visualisation |
| Forms | React Hook Form | Form validation |
| Dates | date-fns | Date formatting and comparison |
| AI Model | Groq — Llama 3.1 8b | Free AI API (chat + generation) |
| AI Proxy | Express.js | Backend proxy to avoid CORS |
| Notifications | react-toastify | Toast notifications |
| Frontend Deploy | Vercel | Auto-deploy from GitHub |
| Backend Deploy | Render | Node.js hosting for AI proxy |

---

## 📁 Project Structure

```
taskflow/
├── server.js                  # Express AI proxy server
├── package.json
├── .env.example               # Environment variable template
├── vite.config.js
└── src/
    ├── components/
    │   ├── ai/                # AIButton.jsx, AIChat.jsx
    │   ├── common/            # Button, Input, Modal, Badge, Loader
    │   ├── kanban/            # KanbanBoard, KanbanColumn, TaskCard, TaskModal
    │   └── layout/            # Layout, Sidebar, Navbar
    ├── pages/                 # Landing, Login, Register, Dashboard,
    │                          # Projects, ProjectBoard, Settings, NotFound
    ├── context/               # AuthContext, ProjectsContext, ThemeContext
    ├── hooks/                 # useAuth, useProjects, useTasks
    ├── services/              # supabase.js, projectsApi.js, tasksApi.js, aiApi.js
    └── utils/                 # constants.js, helpers.js
```

---

## 🗄️ Database Schema

Supabase (PostgreSQL) — 4 tables with Row Level Security enabled:

```sql
profiles  (id, email, full_name, avatar_url, created_at)
projects  (id, user_id, name, description, color, created_at)
tasks     (id, project_id, title, description, status, priority, due_date, position, created_at)
comments  (id, task_id, user_id, content, created_at)
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- [Supabase](https://supabase.com) account (free)
- [Groq](https://console.groq.com) account (free)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema:

```sql
-- Profiles table
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text, full_name text, avatar_url text,
  created_at timestamptz default now()
);

-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null, description text, color text default '#3B82F6',
  created_at timestamptz default now()
);

-- Tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null, description text,
  status text default 'todo' check (status in ('todo','in_progress','done')),
  priority text default 'medium' check (priority in ('low','medium','high')),
  due_date date, position integer default 0,
  created_at timestamptz default now()
);

-- Comments table
create table comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null, created_at timestamptz default now()
);

-- Enable RLS
alter table profiles  enable row level security;
alter table projects  enable row level security;
alter table tasks     enable row level security;
alter table comments  enable row level security;

-- RLS Policies
create policy "own" on profiles for all using (auth.uid() = id);
create policy "own" on projects for all using (auth.uid() = user_id);
create policy "own" on tasks for all using (
  project_id in (select id from projects where user_id = auth.uid())
);
create policy "own" on comments for all using (
  task_id in (
    select t.id from tasks t
    join projects p on t.project_id = p.id
    where p.user_id = auth.uid()
  )
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_AI_PROXY_URL=http://localhost:3001/api/ai
```

### 5. Run the development servers

You need **two terminals**:

```bash
# Terminal 1 — React frontend (localhost:5173)
npm run dev

# Terminal 2 — Express AI proxy (localhost:3001)
npm run server
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔑 Environment Variables

| Variable | Where to find | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API | Frontend + Backend |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API | Frontend |
| `VITE_AI_PROXY_URL` | Your Render URL + `/api/ai` | Frontend |
| `VITE_AI_API_KEY` | [console.groq.com](https://console.groq.com) | Render only (never frontend) |
| `FRONTEND_URL` | Your Vercel URL | Render only (CORS) |

> ⚠️ Never commit `.env.local` to GitHub. It is listed in `.gitignore`.

---

## 🚀 Deployment

This project uses **two separate deployments** from one GitHub repository.

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add environment variables:
   - `VITE_AI_API_KEY` = your Groq API key
   - `FRONTEND_URL` = your Vercel URL (add after step below)
5. Deploy → copy your Render URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your GitHub repo
3. Framework: **Vite**, Output: **dist**
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_AI_PROXY_URL` = `https://your-render-url.onrender.com/api/ai`
5. Deploy → copy your Vercel URL

### Post-deployment

```
✅ Update Render  → FRONTEND_URL = your Vercel URL
✅ Update Supabase → Authentication → URL Configuration → your Vercel URL
```
---

## 📜 Available Scripts

```bash
npm run dev        # Start Vite development server (port 5173)
npm run server     # Start Express AI proxy server (port 3001)
npm run build      # Build production bundle to dist/
npm run preview    # Preview production build locally
```

---

## 🔒 Security

- All API keys stored in environment variables — never hardcoded
- Supabase Row Level Security (RLS) enabled on all tables — users can only access their own data
- AI API key lives only on the backend (Render) — never exposed to the browser
- CORS on the Express server restricts requests to the Vercel domain in production
- All form inputs validated with React Hook Form

---

<div align="center">
  Built with using React + Supabase + Groq AI
</div>
