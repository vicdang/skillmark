# SkillMark — Project Specification

> **Version:** 1.0.0 | **Date:** 2026-05-26 | **Author:** Vic (PM/Technical Lead)
> **Purpose:** Complete specification for Claude Code implementation handoff.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Database Schema](#4-database-schema)
5. [Skill Matrix System](#5-skill-matrix-system)
6. [Availability & Resource Management](#6-availability--resource-management)
7. [Project Management & RFP Processing](#7-project-management--rfp-processing)
8. [Resource Query & Matching Engine](#8-resource-query--matching-engine)
9. [Dashboard & Analytics](#9-dashboard--analytics)
10. [Comparison & Social Features](#10-comparison--social-features)
11. [Notifications](#11-notifications)
12. [Settings & Configuration](#12-settings--configuration)
13. [UI/UX Specifications](#13-uiux-specifications)
14. [Deployment & Distribution](#14-deployment--distribution)
15. [API Design](#15-api-design)
16. [Implementation Phases](#16-implementation-phases)
17. [Folder Structure](#17-folder-structure)
18. [Seed Data](#18-seed-data)
19. [Environment Configuration](#19-environment-configuration)

---

## 1. Project Overview

**SkillMark** is a web service for managing and querying employee skill matrices within an organization. It enables automated skill tracking, resource availability monitoring, AI-powered RFP analysis, and intelligent resource-to-project matching.

### Core Value Propositions

- **Skill Inventory:** Centralized, searchable skill matrix for every employee
- **Resource Matching:** AI-powered candidate recommendation for new projects based on RFP requirements
- **Availability Tracking:** Real-time effort allocation visibility across projects
- **Skill Gap Analysis:** Predictive analytics for workforce skill gaps based on current demand + historical trends
- **RFP Automation:** Upload RFP documents → AI extracts requirements → auto-create project records

### Distribution Model

- **SaaS Mode:** Cloud-hosted (Vercel + Koyeb), subscription-based, trial 30 days
- **Portable Mode:** Docker Compose bundle, license key activation, runs fully local

---

## 2. Tech Stack & Architecture

### Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Fast DX, ecosystem, consistent with team experience |
| UI Library | TailwindCSS + shadcn/ui | Customizable, accessible, dark mode built-in |
| Charts | Recharts + D3.js | Recharts for standard charts, D3 for Sankey/Heatmap |
| i18n | react-i18next | Ship EN + VI, extensible via JSON files |
| Backend | Python FastAPI | Async native, AI pipeline friendly, microservices ready |
| Database | Supabase PostgreSQL | Managed DB + Auth + Storage + Realtime in one platform |
| Auth | Supabase Auth | Google, GitHub, email/password OAuth built-in |
| File Storage | Supabase Storage OR Google Drive | User selects during setup (storage adapter pattern) |
| Real-time | Supabase Realtime (WebSocket) | Subscribe to notification/data changes, zero extra infra |
| AI/LLM | Anthropic API (primary) + configurable fallback (Gemini, GPT) | RFP extraction, skill matching explanation, report generation |
| Email | Resend or Supabase Edge Functions + SMTP | Notification emails |
| PDF/DOCX | pymupdf (PDF), python-docx (DOCX) | RFP file parsing |
| Export | reportlab (PDF export), openpyxl (Excel export) | Dashboard/report exports |

### Architecture Pattern

```
┌─────────────────────────────────────────────────┐
│                   Frontend (React)               │
│  Vercel (SaaS) / Docker nginx (Portable)         │
├─────────────────────────────────────────────────┤
│                 FastAPI Backend                   │
│  Koyeb (SaaS) / Docker uvicorn (Portable)        │
├──────────┬──────────┬───────────┬───────────────┤
│ Supabase │ Supabase │ Supabase  │ AI Service    │
│ Auth     │ DB (PG)  │ Storage/  │ (Anthropic/   │
│          │          │ GDrive    │  Gemini/GPT)  │
└──────────┴──────────┴───────────┴───────────────┘
```

### Monorepo Structure

Single repository containing both frontend and backend, with shared types and Docker Compose for portable deployment.

---

## 3. Authentication & Authorization

### Auth Providers

- Google OAuth 2.0
- GitHub OAuth
- Email + Password (with email verification)
- Username + Password (direct creation by Admin)

### Role Hierarchy (4 roles)

| Role | Description | Key Permissions |
|---|---|---|
| **Admin** | Full system access | CRUD all entities, manage users, system settings, bulk actions |
| **Manager** | Project & resource management | CRUD own projects, query resources, wish list, view all skills, bulk actions on own projects |
| **Employee** | Self-service skill management | CRUD own skills, view others' skills, view projects, compare, favorites |
| **Viewer** | Read-only external stakeholder | View dashboards, view project summaries, view skill overviews. No edit rights. |

### Permission Matrix

| Action | Admin | Manager | Employee | Viewer |
|---|---|---|---|---|
| CRUD all employees | ✅ | ❌ | ❌ | ❌ |
| CRUD own skill matrix | ✅ | ✅ | ✅ | ❌ |
| View others' skill matrix (full detail) | ✅ | ✅ | ✅ | ✅ |
| CRUD all projects | ✅ | ❌ | ❌ | ❌ |
| CRUD own projects | ✅ | ✅ | ❌ | ❌ |
| Upload RFP | ✅ | ✅ | ❌ | ❌ |
| Query resources for project | ✅ | ✅ | ❌ | ❌ |
| Manage wish list | ✅ | ✅ | ❌ | ❌ |
| Allocate employee effort | ✅ | ✅ | ❌ | ❌ |
| Confirm own allocation | ✅ | ✅ | ✅ | ❌ |
| View general dashboard | ✅ | ✅ | ✅ | ✅ |
| Export reports (PDF/Excel) | ✅ | ✅ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ |
| Compare employees | ✅ | ✅ | ✅ | ✅ |
| Favorite list (max 5) | ✅ | ✅ | ✅ | ❌ |
| Receive notifications | ✅ | ✅ | ✅ | ❌ |
| Bulk actions on projects | ✅ (all) | ✅ (own) | ❌ | ❌ |

### Multi-tenancy

- **MVP:** Single-tenant (1 company per instance)
- **Phase 2:** Multi-tenant with org-level isolation (if SaaS scales)

---

## 4. Database Schema

### Core Tables

```sql
-- ============================================
-- USERS & AUTH
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_auth_id UUID UNIQUE REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'employee'
    CHECK (role IN ('admin', 'manager', 'employee', 'viewer')),
  department VARCHAR(100),
  job_title VARCHAR(100),
  phone VARCHAR(20),
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SKILL TAXONOMY (3-level: Domain → Category → Skill)
-- ============================================

CREATE TABLE skill_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES skill_domains(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(domain_id, name)
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, name)
);

-- ============================================
-- EMPLOYEE SKILL MATRIX
-- ============================================

CREATE TABLE employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 5),
  -- 1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert
  years_experience DECIMAL(4,1),
  evidence_url TEXT, -- optional certificate/proof link
  evidence_note TEXT, -- optional description of evidence
  last_assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- ============================================
-- SKILL AUDIT LOG
-- ============================================

CREATE TABLE skill_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('add', 'update', 'remove')),
  old_level INT,
  new_level INT,
  changed_by UUID REFERENCES users(id), -- who made the change
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  client_name VARCHAR(255),
  client_country VARCHAR(100), -- e.g., 'US', 'UK', 'VN'
  client_region VARCHAR(50),   -- auto-mapped: 'Americas', 'EMEA', 'APAC'
  domain VARCHAR(100),         -- e.g., 'FinTech', 'HealthCare', 'E-commerce'
  project_type VARCHAR(50),    -- e.g., 'Web App', 'Mobile', 'Data Pipeline'
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'approved', 'in_progress', 'completed')),
  is_archived BOOLEAN DEFAULT false,
  kick_off_date DATE,
  end_date DATE,
  team_size_required INT,
  budget_range VARCHAR(100),
  tech_stack TEXT[],           -- array of tech requirements
  compliance_requirements TEXT,
  deliverables TEXT,
  milestones JSONB,            -- [{name, date, description}]
  rfp_file_url TEXT,           -- uploaded RFP file path
  rfp_extracted_data JSONB,    -- AI-extracted structured data from RFP
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROJECT REQUIRED SKILLS (extracted from RFP or manual)
-- ============================================

CREATE TABLE project_required_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id), -- nullable if skill not in catalog yet
  skill_name VARCHAR(100),             -- fallback if skill not in catalog
  min_level INT NOT NULL CHECK (min_level BETWEEN 1 AND 5),
  quantity INT DEFAULT 1,              -- how many people needed with this skill
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROJECT TAGS
-- ============================================

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  category VARCHAR(50), -- 'status', 'domain', 'priority', 'custom'
  color VARCHAR(7),     -- hex color
  is_predefined BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, category)
);

CREATE TABLE project_tags (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- ============================================
-- RESOURCE ALLOCATION (effort tracking)
-- ============================================

CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  allocation_percentage INT NOT NULL CHECK (allocation_percentage BETWEEN 0 AND 100),
  month DATE NOT NULL, -- first day of the month, e.g., '2026-06-01'
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'rejected')),
  allocated_by UUID REFERENCES users(id), -- Manager/Admin who allocated
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_id, month)
);

-- ============================================
-- WISH LIST (resource shortlisting)
-- ============================================

CREATE TABLE wish_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES users(id), -- Manager/Admin
  match_score DECIMAL(5,2), -- calculated matching score
  ai_explanation TEXT,       -- AI explanation of why matched
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- ============================================
-- FAVORITES (employee bookmarks, max 5)
-- ============================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, favorite_user_id)
);
-- Enforce max 5 via application logic or DB trigger

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  -- Types: 'project_created', 'added_to_wishlist', 'allocation_request',
  --        'allocation_confirmed', 'rfp_extraction_complete', 'skill_updated',
  --        'system_announcement'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link TEXT,                    -- deep link to relevant page
  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SYSTEM SETTINGS
-- ============================================

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Keys: 'ai_config', 'seniority_scale', 'email_templates',
--        'notification_preferences', 'storage_provider', 'license_key'

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_employee_skills_user ON employee_skills(user_id);
CREATE INDEX idx_employee_skills_skill ON employee_skills(skill_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_domain ON projects(domain);
CREATE INDEX idx_projects_client_country ON projects(client_country);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_allocations_user_month ON allocations(user_id, month);
CREATE INDEX idx_allocations_project ON allocations(project_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_skill_audit_log_user ON skill_audit_log(user_id);
CREATE INDEX idx_wish_list_project ON wish_list(project_id);
```

### Country → Region Auto-mapping

```python
COUNTRY_REGION_MAP = {
    "US": "Americas", "CA": "Americas", "BR": "Americas", "MX": "Americas",
    "UK": "EMEA", "DE": "EMEA", "FR": "EMEA", "NL": "EMEA", "SE": "EMEA",
    "AE": "EMEA", "SA": "EMEA", "IL": "EMEA",
    "VN": "APAC", "SG": "APAC", "JP": "APAC", "KR": "APAC", "AU": "APAC",
    "IN": "APAC", "CN": "APAC", "TH": "APAC", "PH": "APAC", "MY": "APAC",
}
```

### Seniority Level Mapping

```python
SENIORITY_LABELS = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert"
}
```

---

## 5. Skill Matrix System

### Taxonomy (3-level hierarchy)

```
Domain (e.g., Backend Development)
  └── Category (e.g., Python)
       └── Skill (e.g., FastAPI, Django, SQLAlchemy)
```

### Pre-defined Seed Catalog

The system ships with a comprehensive skill catalog covering:

- **Backend Development:** Python (FastAPI, Django, Flask), Node.js (Express, NestJS), Java (Spring Boot), Go, Rust
- **Frontend Development:** React, Angular, Vue, TypeScript, HTML/CSS, Next.js, Svelte
- **Mobile Development:** React Native, Flutter, Swift, Kotlin
- **DevOps & Cloud:** Docker, Kubernetes, AWS, GCP, Azure, CI/CD, Terraform
- **Data & AI:** Machine Learning, Data Engineering, NLP, Computer Vision, LLM/GenAI
- **QA & Testing:** Manual Testing, Automation (Selenium, Cypress, Playwright), Performance Testing, Contract Testing
- **Database:** PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch
- **Design:** UI/UX, Figma, Adobe Creative Suite
- **Management:** Project Management, Agile/Scrum, Business Analysis, Product Management
- **Soft Skills:** Communication, Leadership, Mentoring, Problem Solving

Admin can add/edit/delete domains, categories, and skills at any time.

### Skill CRUD Flow (Employee)

1. Employee navigates to "My Skills" page
2. Browse taxonomy tree or search skills
3. Select a skill → set level (1-5) → optionally add years of experience + evidence
4. Save → record created in `employee_skills` + audit log entry in `skill_audit_log`
5. Edit: change level → audit log captures old_level → new_level with timestamp
6. Delete: remove skill → audit log captures removal

### Audit Log

Every skill change is tracked:
- Action type: `add`, `update`, `remove`
- Old and new level
- Who made the change
- Timestamp
- Used for: trending analysis, skill growth tracking, dashboard analytics

---

## 6. Availability & Resource Management

### Effort Model

- Each employee has **100% total effort per month**
- Manager/Admin **allocates** a percentage per project per month
- Employee **confirms** or **rejects** the allocation
- Availability = `100% - SUM(confirmed allocations for that month)`

### Allocation Flow

1. Manager/Admin opens project → "Allocate Resources"
2. Select employee → set allocation % → set month(s)
3. Employee receives notification → confirms or rejects
4. Status: `pending` → `confirmed` / `rejected`
5. Dashboard reflects real-time availability

### Constraints

- Total allocation per employee per month cannot exceed 100%
- Validation on both backend and frontend
- Granularity: monthly (stored as first day of month)

### Availability Query

```
GET /api/v1/employees/{id}/availability?from=2026-06&to=2026-12

Response:
{
  "employee_id": "...",
  "availability": [
    {"month": "2026-06", "allocated": 80, "available": 20},
    {"month": "2026-07", "allocated": 60, "available": 40},
    ...
  ]
}
```

---

## 7. Project Management & RFP Processing

### Project CRUD

- **Admin:** CRUD all projects, bulk actions (archive, change status, delete)
- **Manager:** CRUD only projects they created, bulk actions on own projects
- **Employee/Viewer:** Read-only

### Project List View

- Filterable by: status, domain, project type, client country, client region, date range, tags
- Searchable by: title, client name, description
- Sortable by: created date, kick-off date, end date, status
- Displays: status badge, domain tag, client country flag, team size, date range

### RFP Upload & AI Extraction

**Supported formats:** PDF, DOCX

**Extraction Pipeline:**

```
Upload RFP file
  → Store in Supabase Storage / Google Drive
  → Send to AI Service (FastAPI background task)
  → AI extracts structured data:
      {
        "title": "...",
        "client_name": "...",
        "domain": "...",
        "project_type": "...",
        "required_skills": [
          {"skill": "React", "level": "Advanced", "quantity": 2},
          {"skill": "Python", "level": "Expert", "quantity": 1}
        ],
        "team_size": 5,
        "timeline": {"start": "2026-07-01", "end": "2026-12-31"},
        "budget_range": "$100K - $200K",
        "tech_stack": ["React", "Python", "PostgreSQL", "AWS"],
        "deliverables": "...",
        "milestones": [...],
        "compliance_requirements": "..."
      }
  → Populate project form with extracted data
  → Manager/Admin reviews → edits → approves
  → Project record created with status 'draft'
```

**AI Prompt Strategy:**
- System prompt defines extraction schema
- Use structured output (JSON mode)
- Primary agent: Anthropic Claude
- Fallback: configurable (Gemini, GPT)
- Retry logic with fallback on primary failure

### Project Lifecycle

```
Draft → Review → Approved → In Progress → Completed
                                              ↓
                                         (is_archived = true)
```

State transitions:
- `Draft → Review`: Manager/Admin submits for review
- `Review → Approved`: Admin approves (or Manager if own project)
- `Approved → In Progress`: Kick-off date reached or manual trigger
- `In Progress → Completed`: End date reached or manual trigger
- Any state → `is_archived = true`: Soft delete / archive

---

## 8. Resource Query & Matching Engine

### Matching Criteria (4 factors)

| Factor | Weight (configurable) | Description |
|---|---|---|
| Skill Match | 40% | How many required skills the employee has, at or above required level |
| Seniority Level | 25% | Average level delta (employee level - required level) |
| Availability | 20% | % effort available during project timeline |
| Domain Experience | 15% | Past project experience in same domain |

### Scoring Algorithm (Hybrid)

**Step 1 — Weighted Score Calculation:**

```python
def calculate_match_score(employee, project_requirements):
    skill_score = calculate_skill_match(employee.skills, project_requirements.skills)
    seniority_score = calculate_seniority_fit(employee.skills, project_requirements.skills)
    availability_score = calculate_availability(employee.id, project.start, project.end)
    domain_score = calculate_domain_experience(employee.id, project.domain)

    total = (
        skill_score * 0.40 +
        seniority_score * 0.25 +
        availability_score * 0.20 +
        domain_score * 0.15
    )
    return round(total, 2)  # 0-100 scale
```

**Step 2 — AI Explanation:**

After scoring and ranking, send top candidates + project requirements to AI to generate:
- Why this employee is a good match
- Skill gaps (if any)
- Risk factors (low availability, skill level below requirement)
- Recommendation summary

### Query Flow

1. Admin/Manager opens project → clicks "Query Resources"
2. System runs matching algorithm against all active employees
3. Results displayed: ranked list with match score, skill breakdown, availability
4. Each result has:
   - Match score (0-100)
   - Skill match breakdown (visual: matched ✅ / gap ⚠️)
   - Availability % for project timeline
   - "View Profile" button → employee skill dashboard
   - "Add to Wish List" button
5. Manager can adjust query parameters (min availability %, required skills) and re-run
6. Export query results as report (PDF/Excel)

### Wish List

- Per-project shortlist of preferred candidates
- Stores: match score, AI explanation, manager notes
- Adding to wish list triggers notification to the employee
- Wish list viewable on project detail page

---

## 9. Dashboard & Analytics

### General Dashboard (all roles)

**Widgets:**

1. **Project Overview:** Total projects by status (donut/pie chart), recent projects timeline
2. **Workforce Summary:** Total employees, employees by department, average skill level
3. **Skill Distribution:** Top 10 skills across org (bar chart), skills by domain (heatmap)
4. **Availability Overview:** Employees by availability range (0-25%, 25-50%, 50-75%, 75-100%)
5. **Skill Gap Analysis:** Skills in demand (from active projects) vs skills available — highlight gaps
6. **Trending Skills:** Skills with most growth (from audit log) over last 3/6/12 months
7. **Prediction Widget:** AI-generated forecast of skill needs based on current demand + historical RFP patterns

### Employee Skill Dashboard (personal)

- Radar chart: skill levels by domain
- Skill timeline: how skills evolved over time (from audit log)
- Comparison with team average
- Allocation calendar: monthly effort breakdown

### Charts Required

| Chart Type | Use Case |
|---|---|
| Radar | Skill comparison (self vs others, employee vs project requirements) |
| Bar | Skill distribution, top skills, department breakdown |
| Pie / Donut | Project status distribution, role distribution |
| Heatmap | Skill coverage matrix (domains × seniority levels) |
| Timeline / Gantt | Project timelines, employee allocation timeline |
| Sankey / Flow | Skill-to-project flow, resource allocation flow |
| Table | Data grids with sorting, filtering, pagination |
| Line | Skill growth trends over time |

### Export

- **PDF:** Dashboard snapshot + AI-generated executive summary
- **Excel:** Raw data tables with charts embedded
- Available for: general dashboard, query results, project reports

---

## 10. Comparison & Social Features

### Employee Skill Comparison

**Trigger:** Employee selects another employee → "Compare" button

**Views:**

1. **Split View:** Side-by-side skill cards, domain by domain
2. **Radar View:** Overlaid radar charts — default shows common skills only, toggle to show all
3. **Detail Table:** Row-by-row comparison with delta indicators (↑ higher, ↓ lower, = same)

**Scope:**
- Default: common skills (skills both employees have)
- Toggle: all skills (shows unique skills per person, marked as "N/A" for the other)

**Privacy:** Full transparency — any employee can see full detail (level, years of experience) of any other employee's skill matrix.

### Favorite List

- Each employee can bookmark up to **5** other employees
- Purpose: quick access + one-click compare
- UI: "My Favorites" sidebar widget, each entry has "Compare" button
- Enforced via application logic + DB constraint (check count before insert)

---

## 11. Notifications

### Channels

- **In-app:** Real-time via Supabase Realtime (WebSocket), bell icon with unread count badge
- **Email:** Async via background task, configurable in notification preferences

### Notification Events

| Event | Recipients | Channel |
|---|---|---|
| New project created | All Managers | In-app + Email |
| Added to wish list | Target Employee | In-app + Email |
| Allocation request | Target Employee | In-app + Email |
| Allocation confirmed/rejected | Requesting Manager | In-app |
| RFP extraction complete | Uploader (Manager/Admin) | In-app |
| Skill matrix updated (by employee) | Employee's Manager (if applicable) | In-app |
| System announcement | All users | In-app + Email |

### Notification Preferences (per user)

- Toggle email notifications per event type
- In-app notifications always enabled (read/dismiss)

### Real-time Implementation

```javascript
// Frontend: Subscribe to notifications
const channel = supabase
  .channel('notifications')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'notifications',
      filter: `user_id=eq.${currentUser.id}` },
    (payload) => { addNotification(payload.new) }
  )
  .subscribe()
```

---

## 12. Settings & Configuration

### Settings Page (Admin only)

#### AI Configuration

```json
{
  "primary_agent": {
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "api_key_ref": "ANTHROPIC_API_KEY"
  },
  "fallback_agent": {
    "provider": "google",
    "model": "gemini-2.0-flash",
    "api_key_ref": "GOOGLE_API_KEY"
  },
  "max_retries": 3,
  "timeout_seconds": 60
}
```

#### API Key Storage

- **Portable mode:** `.env` file (local filesystem)
- **SaaS mode:** Supabase vault (encrypted column in `system_settings`)
- Ship `.env.example` with all required keys documented

#### Configurable Settings

| Setting | Description |
|---|---|
| AI Agent Config | Provider, model, API key, fallback, retries |
| Skill Taxonomy | CRUD domains, categories, skills |
| Seniority Scale | Labels and numeric mapping (1-5) |
| Email Templates | Customizable notification email templates |
| Notification Preferences | System-wide defaults for notification routing |
| Storage Provider | Supabase Storage or Google Drive |
| License Key | Portable mode activation (read-only display in SaaS) |
| Matching Weights | Adjust weight percentages for resource matching algorithm |

---

## 13. UI/UX Specifications

### Theme

- **Dark mode + Light mode** toggle (persisted in localStorage)
- Use TailwindCSS dark mode class strategy
- shadcn/ui components with custom theme tokens

### Pages / Routes

| Route | Page | Access |
|---|---|---|
| `/login` | Login page (Google, GitHub, Email, Username) | Public |
| `/` | General Dashboard | All authenticated |
| `/profile` | Personal Profile | All authenticated |
| `/my-skills` | My Skill Matrix (CRUD) | Employee+ |
| `/employees` | Employee List & Management | Admin |
| `/employees/:id` | Employee Skill Dashboard | All authenticated |
| `/employees/:id/compare` | Comparison View (split + radar) | All authenticated |
| `/projects` | Project List (filterable, sortable) | All authenticated |
| `/projects/new` | Create Project (form or RFP upload) | Admin, Manager |
| `/projects/:id` | Project Detail | All authenticated |
| `/projects/:id/query` | Resource Query & Results | Admin, Manager |
| `/projects/:id/wishlist` | Wish List for Project | Admin, Manager |
| `/settings` | System Settings | Admin |
| `/settings/skills` | Skill Taxonomy Management | Admin |
| `/settings/ai` | AI Agent Configuration | Admin |
| `/settings/notifications` | Notification Preferences | Admin |
| `/notifications` | Notification Center | All authenticated (except Viewer) |

### Responsive & PWA

- Mobile-first responsive design
- PWA manifest + service worker for installability
- Offline: show cached dashboard data, queue skill updates for sync

### Key UI Components

- **Sidebar navigation** with role-based menu items
- **Top bar** with search, notification bell (unread badge), profile avatar, dark mode toggle
- **Data tables** with server-side pagination, sorting, filtering, bulk select
- **Skill tree browser** with expandable domain → category → skill hierarchy
- **Radar chart** component (reusable for comparison, profile, project requirements)
- **Kanban-style** project status board (optional, alongside list view)
- **Upload zone** with drag-and-drop for RFP files
- **Toast notifications** for real-time events

---

## 14. Deployment & Distribution

### SaaS Mode

```yaml
# Frontend: Vercel
- Framework: Vite React
- Build: npm run build
- Env: VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# Backend: Koyeb
- Runtime: Docker (Python 3.12 + FastAPI)
- Build: Dockerfile
- Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY, etc.
```

### Portable Mode (Docker Compose)

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:80"]
    environment:
      - VITE_API_URL=http://localhost:8000

  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [db]

  db:
    image: supabase/postgres:15
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d

volumes:
  pgdata:
```

### License System (Portable)

- License key stored in `.env` → `SKILLMARK_LICENSE_KEY`
- On startup, backend validates license key format + expiry
- Trial: 30-day grace period without key
- Validation: offline-capable (JWT-based license with embedded expiry)
- No phone-home required for portable mode

---

## 15. API Design

### Base URL

- SaaS: `https://api.skillmark.dev/api/v1`
- Portable: `http://localhost:8000/api/v1`

### Core Endpoints

```
# Auth
POST   /auth/login
POST   /auth/register
POST   /auth/logout
GET    /auth/me

# Users / Employees
GET    /users                        # list (Admin)
GET    /users/:id                    # detail
PUT    /users/:id                    # update
DELETE /users/:id                    # deactivate (Admin)
GET    /users/:id/skills             # skill matrix
GET    /users/:id/availability       # monthly availability
GET    /users/:id/allocations        # allocation history

# Skills (Employee self-service)
POST   /my/skills                    # add skill
PUT    /my/skills/:id                # update level
DELETE /my/skills/:id                # remove skill

# Skill Taxonomy (Admin)
GET    /skills/taxonomy              # full tree
POST   /skills/domains               # create domain
POST   /skills/categories            # create category
POST   /skills/items                 # create skill
PUT    /skills/{type}/:id            # update
DELETE /skills/{type}/:id            # delete

# Projects
GET    /projects                     # list (filterable)
POST   /projects                     # create
GET    /projects/:id                 # detail
PUT    /projects/:id                 # update
DELETE /projects/:id                 # delete/archive
POST   /projects/:id/upload-rfp      # upload RFP file
POST   /projects/:id/extract-rfp     # trigger AI extraction
POST   /projects/bulk-action         # bulk status change, archive, delete

# Resource Matching
POST   /projects/:id/query-resources  # run matching algorithm
GET    /projects/:id/query-results    # get cached results
POST   /projects/:id/wishlist         # add to wish list
GET    /projects/:id/wishlist         # get wish list
DELETE /projects/:id/wishlist/:uid    # remove from wish list

# Allocations
POST   /allocations                  # create allocation
PUT    /allocations/:id/confirm      # employee confirms
PUT    /allocations/:id/reject       # employee rejects

# Notifications
GET    /notifications                # list (paginated)
PUT    /notifications/:id/read       # mark as read
PUT    /notifications/read-all       # mark all as read

# Dashboard
GET    /dashboard/overview           # general stats
GET    /dashboard/skill-gaps         # skill gap analysis
GET    /dashboard/trends             # trending skills
GET    /dashboard/predictions        # AI predictions

# Comparison
GET    /compare/:id1/:id2            # compare two employees

# Favorites
GET    /my/favorites                 # list favorites
POST   /my/favorites/:userId         # add favorite
DELETE /my/favorites/:userId         # remove favorite

# Settings (Admin)
GET    /settings                     # all settings
PUT    /settings/:key                # update setting

# Export
POST   /export/dashboard             # export dashboard as PDF/Excel
POST   /export/query-results/:projectId  # export query results
```

---

## 16. Implementation Phases

### Phase 1 — Foundation (Week 1-2)

- [ ] Monorepo setup: Vite React + FastAPI + shared types
- [ ] Supabase project setup: Auth, DB, Storage, Realtime
- [ ] Database migrations: all tables, indexes, RLS policies
- [ ] Auth flow: Google, GitHub, Email login/register
- [ ] Role-based middleware (FastAPI dependency injection)
- [ ] Basic layout: sidebar, topbar, dark/light mode toggle
- [ ] Login/Register pages
- [ ] Profile page

### Phase 2 — Skill Matrix (Week 3-4)

- [ ] Skill taxonomy CRUD (Admin)
- [ ] Seed data: pre-defined skill catalog
- [ ] My Skills page: browse taxonomy, add/edit/remove skills
- [ ] Skill audit log (auto-tracking)
- [ ] Employee list page (Admin)
- [ ] Employee skill dashboard (view any employee)
- [ ] Skill comparison: split view + radar chart

### Phase 3 — Project Management (Week 5-6)

- [ ] Project CRUD (form-based)
- [ ] Project list with filters, tags, search, sort
- [ ] RFP upload (Supabase Storage / Google Drive adapter)
- [ ] AI extraction pipeline (FastAPI background task)
- [ ] Project detail page with extracted data review
- [ ] Bulk actions on projects

### Phase 4 — Resource Matching (Week 7-8)

- [ ] Matching algorithm implementation
- [ ] Query resources UI (per project)
- [ ] Results display: ranked list with score breakdown
- [ ] AI explanation generation
- [ ] Wish list CRUD + notifications
- [ ] Allocation CRUD (Manager allocate + Employee confirm)
- [ ] Availability calculation + display

### Phase 5 — Dashboard & Analytics (Week 9-10)

- [ ] General dashboard: all widgets
- [ ] Chart implementations: Radar, Bar, Pie, Heatmap, Gantt, Sankey
- [ ] Skill gap analysis (current demand + historical)
- [ ] AI prediction widget
- [ ] Export: PDF + Excel with AI summary

### Phase 6 — Notifications & Settings (Week 11)

- [ ] Notification system: Supabase Realtime + email
- [ ] Notification center UI
- [ ] Settings pages: AI config, skill taxonomy, email templates
- [ ] Notification preferences

### Phase 7 — Polish & Distribution (Week 12)

- [ ] PWA setup: manifest, service worker, offline caching
- [ ] Docker Compose portable bundle
- [ ] License key system
- [ ] i18n: EN + VI translations
- [ ] Responsive polish (mobile breakpoints)
- [ ] Storage adapter: Supabase ↔ Google Drive selection
- [ ] `.env.example` + documentation
- [ ] E2E testing (critical paths)

---

## 17. Folder Structure

```
skillmark/
├── frontend/
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   ├── sw.js                  # Service worker
│   │   └── locales/
│   │       ├── en/translation.json
│   │       └── vi/translation.json
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── routes/                # Route definitions
│   │   ├── pages/                 # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MySkills.tsx
│   │   │   ├── Employees.tsx
│   │   │   ├── EmployeeDetail.tsx
│   │   │   ├── Compare.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── ProjectCreate.tsx
│   │   │   ├── QueryResources.tsx
│   │   │   ├── WishList.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Notifications.tsx
│   │   │   └── Settings/
│   │   │       ├── SettingsLayout.tsx
│   │   │       ├── AIConfig.tsx
│   │   │       ├── SkillTaxonomy.tsx
│   │   │       ├── EmailTemplates.tsx
│   │   │       └── NotificationPrefs.tsx
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── layout/            # Sidebar, Topbar, Layout
│   │   │   ├── charts/            # Radar, Bar, Heatmap, Sankey, Gantt
│   │   │   ├── skills/            # SkillTree, SkillCard, SkillForm
│   │   │   ├── projects/          # ProjectCard, ProjectFilters, RFPUpload
│   │   │   └── shared/            # DataTable, SearchInput, TagBadge, etc.
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Supabase client, API client, utils
│   │   ├── stores/                # Zustand stores (auth, notifications, theme)
│   │   ├── types/                 # TypeScript interfaces (shared with backend)
│   │   └── styles/                # Global CSS, Tailwind config
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app entry
│   │   ├── config.py              # Settings, env loading
│   │   ├── dependencies.py        # Auth, role-check dependencies
│   │   ├── models/                # Pydantic models (request/response)
│   │   ├── routers/               # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── skills.py
│   │   │   ├── projects.py
│   │   │   ├── allocations.py
│   │   │   ├── matching.py
│   │   │   ├── notifications.py
│   │   │   ├── dashboard.py
│   │   │   ├── export.py
│   │   │   └── settings.py
│   │   ├── services/              # Business logic
│   │   │   ├── ai_service.py      # LLM orchestration (primary + fallback)
│   │   │   ├── rfp_extractor.py   # PDF/DOCX parsing + AI extraction
│   │   │   ├── matching_engine.py # Resource matching algorithm
│   │   │   ├── notification_service.py
│   │   │   ├── export_service.py  # PDF/Excel generation
│   │   │   └── storage_adapter.py # Supabase Storage / Google Drive
│   │   ├── db/                    # Supabase client, queries
│   │   └── utils/                 # Helpers, country mapping, etc.
│   ├── migrations/                # SQL migration files
│   ├── seed/                      # Seed data (skill catalog, tags, etc.)
│   ├── tests/                     # Pytest tests
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── docker-compose.yml             # Portable mode
├── docker-compose.dev.yml         # Local development
├── .env.example                   # Sample environment variables
├── LICENSE
├── README.md
└── CLAUDE.md                      # Claude Code project context
```

---

## 18. Seed Data

### Pre-defined Tags

**Status tags:** Urgent, High Priority, Normal, Low Priority
**Domain tags:** FinTech, HealthCare, E-commerce, EdTech, SaaS, IoT, AI/ML, Enterprise
**Type tags:** New Development, Maintenance, Migration, Consulting, POC

### Default Seniority Scale

| Level | Label | Description |
|---|---|---|
| 1 | Beginner | Basic awareness, needs guidance |
| 2 | Elementary | Can perform simple tasks with some guidance |
| 3 | Intermediate | Can work independently on standard tasks |
| 4 | Advanced | Can handle complex tasks, mentors others |
| 5 | Expert | Recognized authority, architects solutions |

### Default Admin Account

- Email: `admin@skillmark.local`
- Password: `changeme123` (force change on first login)
- Role: `admin`

---

## 19. Environment Configuration

### `.env.example`

```bash
# ============================================
# SkillMark Environment Configuration
# ============================================

# --- App ---
APP_ENV=development          # development | production
APP_PORT=8000
APP_SECRET_KEY=your-secret-key-here
FRONTEND_URL=http://localhost:3000

# --- Supabase ---
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# --- AI Agents ---
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=your-google-ai-key
OPENAI_API_KEY=sk-...

# --- OAuth (Supabase handles these, configure in Supabase Dashboard) ---
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GITHUB_CLIENT_ID=...
# GITHUB_CLIENT_SECRET=...

# --- Storage ---
STORAGE_PROVIDER=supabase     # supabase | google_drive
GOOGLE_DRIVE_CREDENTIALS=     # path to service account JSON (if google_drive)

# --- Email ---
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@skillmark.dev

# --- License (Portable mode only) ---
SKILLMARK_LICENSE_KEY=

# --- Misc ---
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
```

---

## Appendix: CLAUDE.md (for Claude Code context)

```markdown
# SkillMark — Claude Code Context

## Project
SkillMark is a skill matrix management web service with AI-powered RFP analysis and resource matching.

## Stack
- Frontend: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- Backend: Python FastAPI
- Database: Supabase (PostgreSQL + Auth + Storage + Realtime)
- AI: Anthropic Claude (primary), configurable fallback

## Monorepo
- `/frontend` — React app
- `/backend` — FastAPI app
- Root: docker-compose files, .env.example

## Key Commands
- Frontend dev: `cd frontend && npm run dev`
- Backend dev: `cd backend && uvicorn app.main:app --reload`
- Docker portable: `docker-compose up --build`

## Conventions
- TypeScript strict mode
- Pydantic v2 for all backend models
- Supabase client via `@supabase/supabase-js` (frontend) and `supabase-py` (backend)
- API versioning: `/api/v1/`
- i18n keys in `en/translation.json` and `vi/translation.json`
- All dates in ISO 8601, stored as TIMESTAMPTZ
- UUID for all primary keys

## Current Phase
See SKILLMARK_PROJECT_SPEC.md Section 16 for implementation phases.
```
