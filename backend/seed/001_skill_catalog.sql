-- ============================================
-- SkillMark Seed Data: Skill Catalog
-- ============================================

-- Domains
INSERT INTO skill_domains (name, description, icon, sort_order) VALUES
('Backend Development', 'Server-side programming and APIs', 'server', 1),
('Frontend Development', 'Client-side UI/UX development', 'monitor', 2),
('Mobile Development', 'iOS, Android, and cross-platform', 'smartphone', 3),
('DevOps & Cloud', 'Infrastructure, CI/CD, and cloud platforms', 'cloud', 4),
('Data & AI', 'Machine learning, data engineering, and AI', 'brain', 5),
('QA & Testing', 'Quality assurance and test automation', 'check-circle', 6),
('Database', 'SQL and NoSQL databases', 'database', 7),
('Design', 'UI/UX design and visual communication', 'palette', 8),
('Management', 'Project, product, and business management', 'briefcase', 9),
('Soft Skills', 'Interpersonal and leadership skills', 'users', 10)
ON CONFLICT (name) DO NOTHING;

-- Backend categories
WITH d AS (SELECT id FROM skill_domains WHERE name = 'Backend Development')
INSERT INTO skill_categories (domain_id, name, sort_order)
SELECT d.id, cat, idx FROM d,
  (VALUES ('Python', 1), ('Node.js', 2), ('Java', 3), ('Go', 4), ('Rust', 5), ('.NET', 6)) AS t(cat, idx)
ON CONFLICT DO NOTHING;

-- Python skills
WITH c AS (SELECT id FROM skill_categories WHERE name = 'Python')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('FastAPI', 1), ('Django', 2), ('Flask', 3), ('SQLAlchemy', 4), ('Celery', 5), ('Pydantic', 6)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- Node.js skills
WITH c AS (SELECT id FROM skill_categories WHERE name = 'Node.js')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('Express.js', 1), ('NestJS', 2), ('Fastify', 3), ('TypeScript', 4)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- Java skills
WITH c AS (SELECT id FROM skill_categories WHERE name = 'Java')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('Spring Boot', 1), ('Hibernate', 2), ('Maven', 3), ('Gradle', 4)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- Frontend categories
WITH d AS (SELECT id FROM skill_domains WHERE name = 'Frontend Development')
INSERT INTO skill_categories (domain_id, name, sort_order)
SELECT d.id, cat, idx FROM d,
  (VALUES ('React', 1), ('Vue.js', 2), ('Angular', 3), ('Web Technologies', 4)) AS t(cat, idx)
ON CONFLICT DO NOTHING;

-- React skills
WITH c AS (SELECT id FROM skill_categories WHERE name = 'React')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('React 18', 1), ('Next.js', 2), ('React Native', 3), ('Redux', 4), ('Zustand', 5), ('TailwindCSS', 6)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- Web Technologies
WITH c AS (SELECT id FROM skill_categories WHERE name = 'Web Technologies')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('HTML5', 1), ('CSS3', 2), ('TypeScript', 3), ('GraphQL', 4), ('REST API', 5)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- Mobile categories
WITH d AS (SELECT id FROM skill_domains WHERE name = 'Mobile Development')
INSERT INTO skill_categories (domain_id, name, sort_order)
SELECT d.id, cat, idx FROM d,
  (VALUES ('React Native', 1), ('Flutter', 2), ('iOS', 3), ('Android', 4)) AS t(cat, idx)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM skill_categories WHERE name = 'Flutter')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('Flutter', 1), ('Dart', 2)) AS t(s, idx)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM skill_categories WHERE name = 'iOS')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('Swift', 1), ('SwiftUI', 2), ('Objective-C', 3)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- DevOps categories
WITH d AS (SELECT id FROM skill_domains WHERE name = 'DevOps & Cloud')
INSERT INTO skill_categories (domain_id, name, sort_order)
SELECT d.id, cat, idx FROM d,
  (VALUES ('Containerization', 1), ('Cloud Platforms', 2), ('CI/CD', 3), ('Infrastructure as Code', 4)) AS t(cat, idx)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM skill_categories WHERE name = 'Containerization')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('Docker', 1), ('Kubernetes', 2), ('Helm', 3)) AS t(s, idx)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM skill_categories WHERE name = 'Cloud Platforms')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('AWS', 1), ('Google Cloud', 2), ('Azure', 3), ('Vercel', 4)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- Data & AI categories
WITH d AS (SELECT id FROM skill_domains WHERE name = 'Data & AI')
INSERT INTO skill_categories (domain_id, name, sort_order)
SELECT d.id, cat, idx FROM d,
  (VALUES ('Machine Learning', 1), ('Data Engineering', 2), ('LLM & GenAI', 3)) AS t(cat, idx)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM skill_categories WHERE name = 'LLM & GenAI')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('Prompt Engineering', 1), ('RAG', 2), ('LangChain', 3), ('OpenAI API', 4), ('Anthropic API', 5), ('Fine-tuning', 6)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- Database categories
WITH d AS (SELECT id FROM skill_domains WHERE name = 'Database')
INSERT INTO skill_categories (domain_id, name, sort_order)
SELECT d.id, cat, idx FROM d,
  (VALUES ('Relational', 1), ('NoSQL', 2), ('Search', 3), ('Cache', 4)) AS t(cat, idx)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM skill_categories WHERE name = 'Relational')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('PostgreSQL', 1), ('MySQL', 2), ('SQLite', 3), ('Supabase', 4)) AS t(s, idx)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM skill_categories WHERE name = 'NoSQL')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('MongoDB', 1), ('DynamoDB', 2), ('Firestore', 3)) AS t(s, idx)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM skill_categories WHERE name = 'Cache')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('Redis', 1), ('Memcached', 2)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- QA categories
WITH d AS (SELECT id FROM skill_domains WHERE name = 'QA & Testing')
INSERT INTO skill_categories (domain_id, name, sort_order)
SELECT d.id, cat, idx FROM d,
  (VALUES ('Test Automation', 1), ('Manual Testing', 2), ('Performance Testing', 3)) AS t(cat, idx)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM skill_categories WHERE name = 'Test Automation')
INSERT INTO skills (category_id, name, sort_order)
SELECT c.id, s, idx FROM c,
  (VALUES ('Playwright', 1), ('Cypress', 2), ('Selenium', 3), ('Jest', 4), ('Pytest', 5)) AS t(s, idx)
ON CONFLICT DO NOTHING;

-- Predefined Tags
INSERT INTO tags (name, category, color, is_predefined) VALUES
('Urgent', 'priority', '#ef4444', true),
('High Priority', 'priority', '#f97316', true),
('Normal', 'priority', '#3b82f6', true),
('Low Priority', 'priority', '#6b7280', true),
('FinTech', 'domain', '#10b981', true),
('HealthCare', 'domain', '#06b6d4', true),
('E-commerce', 'domain', '#8b5cf6', true),
('EdTech', 'domain', '#f59e0b', true),
('SaaS', 'domain', '#3b82f6', true),
('AI/ML', 'domain', '#ec4899', true),
('Enterprise', 'domain', '#6b7280', true),
('New Development', 'type', '#22c55e', true),
('Maintenance', 'type', '#64748b', true),
('Migration', 'type', '#f97316', true),
('Consulting', 'type', '#8b5cf6', true),
('POC', 'type', '#06b6d4', true)
ON CONFLICT (name, category) DO NOTHING;

-- System settings defaults
INSERT INTO system_settings (key, value, description) VALUES
('ai_config', '{"primary_agent": {"provider": "anthropic", "model": "claude-sonnet-4-20250514"}, "max_retries": 3, "timeout_seconds": 60}', 'AI agent configuration'),
('seniority_scale', '[{"level": 1, "label": "Beginner"}, {"level": 2, "label": "Elementary"}, {"level": 3, "label": "Intermediate"}, {"level": 4, "label": "Advanced"}, {"level": 5, "label": "Expert"}]', 'Seniority level labels'),
('matching_weights', '{"skill_match": 0.40, "seniority_level": 0.25, "availability": 0.20, "domain_experience": 0.15}', 'Resource matching algorithm weights'),
('notification_preferences', '{"email_enabled": true, "realtime_enabled": true}', 'Default notification preferences')
ON CONFLICT (key) DO NOTHING;
