export type Role = 'admin' | 'manager' | 'employee' | 'guest' | 'viewer'

export interface User {
  id: string
  supabase_auth_id: string
  email: string
  username?: string
  full_name: string
  avatar_url?: string
  role: Role
  department?: string
  job_title?: string
  phone?: string
  bio?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SkillDomain {
  id: string
  name: string
  description?: string
  icon?: string
  sort_order: number
  is_active: boolean
}

export interface SkillCategory {
  id: string
  domain_id: string
  name: string
  description?: string
  sort_order: number
  is_active: boolean
}

export interface Skill {
  id: string
  category_id: string
  name: string
  description?: string
  sort_order: number
  is_active: boolean
}

export interface EmployeeSkill {
  id: string
  user_id: string
  skill_id: string
  level: 1 | 2 | 3 | 4 | 5
  years_experience?: number
  evidence_url?: string
  evidence_note?: string
  last_assessed_at: string
  created_at: string
  updated_at: string
  skill?: Skill
}

export type ProjectStatus = 'draft' | 'review' | 'approved' | 'in_progress' | 'completed'

export interface Project {
  id: string
  title: string
  description?: string
  client_name?: string
  client_country?: string
  client_region?: string
  domain?: string
  project_type?: string
  status: ProjectStatus
  is_archived: boolean
  kick_off_date?: string
  end_date?: string
  team_size_required?: number
  budget_range?: string
  tech_stack?: string[]
  rfp_file_url?: string
  rfp_extracted_data?: Record<string, unknown>
  created_by: string
  created_at: string
  updated_at: string
}

export interface Allocation {
  id: string
  user_id: string
  project_id: string
  allocation_percentage: number
  month: string
  status: 'pending' | 'confirmed' | 'rejected'
  allocated_by?: string
  confirmed_at?: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message?: string
  link?: string
  is_read: boolean
  created_at: string
}

export const SENIORITY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
}
