-- ============================================
-- SkillMark Mock / Seed Data
-- File: 002_mock_data.sql
-- Run in Supabase SQL editor.
-- SAFE TO RE-RUN: cleans up previous seed data before inserting.
-- ============================================

-- ----------------------------------------
-- CLEANUP (removes only seed data, not real users/projects)
-- Order matters: child tables first to avoid FK violations
-- ----------------------------------------
DELETE FROM system_settings
  WHERE key IN ('ai_provider','ai_model','matching_weights','max_allocation_percentage','rfp_extraction_enabled','notification_email_enabled');

DELETE FROM notifications
  WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@skillmark.dev');

DELETE FROM wish_list
  WHERE added_by IN (SELECT id FROM users WHERE email LIKE '%@skillmark.dev')
     OR user_id  IN (SELECT id FROM users WHERE email LIKE '%@skillmark.dev');

DELETE FROM allocations
  WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@skillmark.dev');

DELETE FROM project_tags
  WHERE project_id IN (SELECT id FROM projects WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@skillmark.dev'));

DELETE FROM tags
  WHERE name IN ('AI/ML','Fintech','Healthcare','E-Commerce','Security','Cloud Native','Mobile First','Real-time','Compliance','Green Tech')
    AND is_predefined = true;

DELETE FROM project_required_skills
  WHERE project_id IN (SELECT id FROM projects WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@skillmark.dev'));

DELETE FROM projects
  WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@skillmark.dev');

DELETE FROM employee_skills
  WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@skillmark.dev');

-- Skills/categories/domains: delete by name to handle any UUID from prior runs
DELETE FROM skills
  WHERE name IN (
    'React','Vue.js','Angular','TypeScript','Next.js',
    'Tailwind CSS','CSS Modules','Sass / SCSS',
    'Vite','Webpack',
    'Python','Go','Java','Node.js','Rust',
    'FastAPI','Django','Express.js','Spring Boot',
    'PostgreSQL','MongoDB','Redis','Elasticsearch',
    'PyTorch','TensorFlow','Scikit-learn','LangChain',
    'Apache Spark','dbt','Airflow',
    'Tableau','Power BI',
    'AWS','GCP','Azure',
    'Docker','Kubernetes',
    'Terraform','GitHub Actions','Jenkins',
    'React Native','Flutter',
    'Swift','SwiftUI',
    'Kotlin','Jetpack Compose',
    'OWASP / AppSec','Penetration Testing','OAuth 2.0 / OIDC',
    'Zero Trust Architecture','SOC 2 Compliance',
    'User Interviews','Usability Testing',
    'Figma','Design Systems'
  );

DELETE FROM skill_categories
  WHERE name IN (
    'Frameworks & Libraries','Styling & CSS','Build & Tooling',
    'Languages','Frameworks','Databases',
    'Machine Learning','Data Engineering','Analytics & BI',
    'Cloud Platforms','Containers & Orchestration','CI/CD & IaC',
    'Cross-Platform','Native iOS','Native Android',
    'Application Security','Infrastructure Security',
    'UX Research','UI & Visual Design'
  );

DELETE FROM skill_domains
  WHERE name IN ('Frontend','Backend','Data & AI','Cloud & DevOps','Mobile','Security','Design');

DELETE FROM users WHERE email LIKE '%@skillmark.dev';

-- ----------------------------------------
-- USERS
-- ----------------------------------------
INSERT INTO users (id, email, username, full_name, role, department, job_title, phone, bio, is_active)
VALUES
  ('a1000001-0000-4000-8000-000000000001', 'alice.chen@skillmark.dev',   'alice.chen',   'Alice Chen',   'manager',  'Engineering', 'Engineering Manager',    '+1-555-0101', 'Passionate about building high-performance teams and shipping great products.', true),
  ('a1000001-0000-4000-8000-000000000002', 'bob.martinez@skillmark.dev', 'bob.martinez', 'Bob Martinez', 'employee', 'Engineering', 'Senior Backend Engineer', '+1-555-0102', '8 years of Python and distributed systems. Coffee-driven developer.',           true),
  ('a1000001-0000-4000-8000-000000000003', 'carol.nguyen@skillmark.dev', 'carol.nguyen', 'Carol Nguyen', 'employee', 'Engineering', 'Frontend Engineer',       '+1-555-0103', 'React and TypeScript specialist. UI/UX enthusiast.',                             true),
  ('a1000001-0000-4000-8000-000000000004', 'david.kim@skillmark.dev',    'david.kim',    'David Kim',    'employee', 'Data',        'Data Scientist',           '+1-555-0104', 'ML practitioner with focus on NLP and recommendation systems.',                  true),
  ('a1000001-0000-4000-8000-000000000005', 'elena.petrov@skillmark.dev', 'elena.petrov', 'Elena Petrov', 'employee', 'Engineering', 'DevOps Engineer',          '+1-555-0105', 'Kubernetes, Terraform, and everything cloud-native.',                            true),
  ('a1000001-0000-4000-8000-000000000006', 'frank.okafor@skillmark.dev', 'frank.okafor', 'Frank Okafor', 'employee', 'Mobile',      'Mobile Engineer',          '+1-555-0106', 'React Native and Swift. Building apps people love.',                             true),
  ('a1000001-0000-4000-8000-000000000007', 'grace.liu@skillmark.dev',    'grace.liu',    'Grace Liu',    'manager',  'Product',     'Product Manager',          '+1-555-0107', 'Bridging business and engineering. Ex-Google.',                                  true),
  ('a1000001-0000-4000-8000-000000000008', 'henry.walsh@skillmark.dev',  'henry.walsh',  'Henry Walsh',  'employee', 'Security',    'Security Engineer',        '+1-555-0108', 'Penetration testing, threat modeling, and secure-by-design systems.',            true),
  ('a1000001-0000-4000-8000-000000000009', 'iris.tanaka@skillmark.dev',  'iris.tanaka',  'Iris Tanaka',  'employee', 'Design',      'UX Designer',              '+1-555-0109', 'Human-centered design advocate. Figma power user.',                              true),
  ('a1000001-0000-4000-8000-000000000010', 'james.osei@skillmark.dev',   'james.osei',   'James Osei',   'employee', 'Engineering', 'Full-Stack Engineer',      '+1-555-0110', 'Node.js, React, PostgreSQL. Generalist who loves clean architecture.',           true),
  ('a1000001-0000-4000-8000-000000000011', 'kate.brennan@skillmark.dev', 'kate.brennan', 'Kate Brennan', 'employee', 'QA',          'QA Engineer',              '+1-555-0111', 'Test automation evangelist. Cypress, Playwright, and Selenium veteran.',         true),
  ('a1000001-0000-4000-8000-000000000012', 'leo.santos@skillmark.dev',   'leo.santos',   'Leo Santos',   'viewer',   'Sales',       'Sales Director',           '+1-555-0112', 'Reads skill data to match client needs. Not technical.',                         true);

-- ----------------------------------------
-- SKILL DOMAINS
-- ----------------------------------------
INSERT INTO skill_domains (id, name, description, icon, sort_order)
VALUES
  ('b2000001-0000-4000-8000-000000000001', 'Frontend',       'Web UI and browser technologies',            'monitor',    1),
  ('b2000001-0000-4000-8000-000000000002', 'Backend',        'Server-side development and APIs',           'server',     2),
  ('b2000001-0000-4000-8000-000000000003', 'Data & AI',      'Data engineering, ML, and AI',               'brain',      3),
  ('b2000001-0000-4000-8000-000000000004', 'Cloud & DevOps', 'Infrastructure, CI/CD, and cloud platforms', 'cloud',      4),
  ('b2000001-0000-4000-8000-000000000005', 'Mobile',         'iOS, Android, and cross-platform mobile',    'smartphone', 5),
  ('b2000001-0000-4000-8000-000000000006', 'Security',       'Application and infrastructure security',    'shield',     6),
  ('b2000001-0000-4000-8000-000000000007', 'Design',         'UX, UI, and product design',                 'pen-tool',   7);

-- ----------------------------------------
-- SKILL CATEGORIES
-- ----------------------------------------
INSERT INTO skill_categories (id, domain_id, name, sort_order)
VALUES
  ('c3000001-0000-4000-8000-000000000001', 'b2000001-0000-4000-8000-000000000001', 'Frameworks & Libraries',     1),
  ('c3000001-0000-4000-8000-000000000002', 'b2000001-0000-4000-8000-000000000001', 'Styling & CSS',              2),
  ('c3000001-0000-4000-8000-000000000003', 'b2000001-0000-4000-8000-000000000001', 'Build & Tooling',            3),
  ('c3000001-0000-4000-8000-000000000004', 'b2000001-0000-4000-8000-000000000002', 'Languages',                  1),
  ('c3000001-0000-4000-8000-000000000005', 'b2000001-0000-4000-8000-000000000002', 'Frameworks',                 2),
  ('c3000001-0000-4000-8000-000000000006', 'b2000001-0000-4000-8000-000000000002', 'Databases',                  3),
  ('c3000001-0000-4000-8000-000000000007', 'b2000001-0000-4000-8000-000000000003', 'Machine Learning',           1),
  ('c3000001-0000-4000-8000-000000000008', 'b2000001-0000-4000-8000-000000000003', 'Data Engineering',           2),
  ('c3000001-0000-4000-8000-000000000009', 'b2000001-0000-4000-8000-000000000003', 'Analytics & BI',             3),
  ('c3000001-0000-4000-8000-000000000010', 'b2000001-0000-4000-8000-000000000004', 'Cloud Platforms',            1),
  ('c3000001-0000-4000-8000-000000000011', 'b2000001-0000-4000-8000-000000000004', 'Containers & Orchestration', 2),
  ('c3000001-0000-4000-8000-000000000012', 'b2000001-0000-4000-8000-000000000004', 'CI/CD & IaC',                3),
  ('c3000001-0000-4000-8000-000000000013', 'b2000001-0000-4000-8000-000000000005', 'Cross-Platform',             1),
  ('c3000001-0000-4000-8000-000000000014', 'b2000001-0000-4000-8000-000000000005', 'Native iOS',                 2),
  ('c3000001-0000-4000-8000-000000000015', 'b2000001-0000-4000-8000-000000000005', 'Native Android',             3),
  ('c3000001-0000-4000-8000-000000000016', 'b2000001-0000-4000-8000-000000000006', 'Application Security',       1),
  ('c3000001-0000-4000-8000-000000000017', 'b2000001-0000-4000-8000-000000000006', 'Infrastructure Security',    2),
  ('c3000001-0000-4000-8000-000000000018', 'b2000001-0000-4000-8000-000000000007', 'UX Research',                1),
  ('c3000001-0000-4000-8000-000000000019', 'b2000001-0000-4000-8000-000000000007', 'UI & Visual Design',         2);

-- ----------------------------------------
-- SKILLS
-- ----------------------------------------
INSERT INTO skills (id, category_id, name, sort_order)
VALUES
  ('d4000001-0000-4000-8000-000000000001', 'c3000001-0000-4000-8000-000000000001', 'React',                   1),
  ('d4000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001', 'Vue.js',                  2),
  ('d4000001-0000-4000-8000-000000000003', 'c3000001-0000-4000-8000-000000000001', 'Angular',                 3),
  ('d4000001-0000-4000-8000-000000000004', 'c3000001-0000-4000-8000-000000000001', 'TypeScript',              4),
  ('d4000001-0000-4000-8000-000000000005', 'c3000001-0000-4000-8000-000000000001', 'Next.js',                 5),
  ('d4000001-0000-4000-8000-000000000006', 'c3000001-0000-4000-8000-000000000002', 'Tailwind CSS',            1),
  ('d4000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000002', 'CSS Modules',             2),
  ('d4000001-0000-4000-8000-000000000008', 'c3000001-0000-4000-8000-000000000002', 'Sass / SCSS',             3),
  ('d4000001-0000-4000-8000-000000000009', 'c3000001-0000-4000-8000-000000000003', 'Vite',                    1),
  ('d4000001-0000-4000-8000-000000000010', 'c3000001-0000-4000-8000-000000000003', 'Webpack',                 2),
  ('d4000001-0000-4000-8000-000000000011', 'c3000001-0000-4000-8000-000000000004', 'Python',                  1),
  ('d4000001-0000-4000-8000-000000000012', 'c3000001-0000-4000-8000-000000000004', 'Go',                      2),
  ('d4000001-0000-4000-8000-000000000013', 'c3000001-0000-4000-8000-000000000004', 'Java',                    3),
  ('d4000001-0000-4000-8000-000000000014', 'c3000001-0000-4000-8000-000000000004', 'Node.js',                 4),
  ('d4000001-0000-4000-8000-000000000015', 'c3000001-0000-4000-8000-000000000004', 'Rust',                    5),
  ('d4000001-0000-4000-8000-000000000016', 'c3000001-0000-4000-8000-000000000005', 'FastAPI',                 1),
  ('d4000001-0000-4000-8000-000000000017', 'c3000001-0000-4000-8000-000000000005', 'Django',                  2),
  ('d4000001-0000-4000-8000-000000000018', 'c3000001-0000-4000-8000-000000000005', 'Express.js',              3),
  ('d4000001-0000-4000-8000-000000000019', 'c3000001-0000-4000-8000-000000000005', 'Spring Boot',             4),
  ('d4000001-0000-4000-8000-000000000020', 'c3000001-0000-4000-8000-000000000006', 'PostgreSQL',              1),
  ('d4000001-0000-4000-8000-000000000021', 'c3000001-0000-4000-8000-000000000006', 'MongoDB',                 2),
  ('d4000001-0000-4000-8000-000000000022', 'c3000001-0000-4000-8000-000000000006', 'Redis',                   3),
  ('d4000001-0000-4000-8000-000000000023', 'c3000001-0000-4000-8000-000000000006', 'Elasticsearch',           4),
  ('d4000001-0000-4000-8000-000000000024', 'c3000001-0000-4000-8000-000000000007', 'PyTorch',                 1),
  ('d4000001-0000-4000-8000-000000000025', 'c3000001-0000-4000-8000-000000000007', 'TensorFlow',              2),
  ('d4000001-0000-4000-8000-000000000026', 'c3000001-0000-4000-8000-000000000007', 'Scikit-learn',            3),
  ('d4000001-0000-4000-8000-000000000027', 'c3000001-0000-4000-8000-000000000007', 'LangChain',               4),
  ('d4000001-0000-4000-8000-000000000028', 'c3000001-0000-4000-8000-000000000008', 'Apache Spark',            1),
  ('d4000001-0000-4000-8000-000000000029', 'c3000001-0000-4000-8000-000000000008', 'dbt',                     2),
  ('d4000001-0000-4000-8000-000000000030', 'c3000001-0000-4000-8000-000000000008', 'Airflow',                 3),
  ('d4000001-0000-4000-8000-000000000031', 'c3000001-0000-4000-8000-000000000009', 'Tableau',                 1),
  ('d4000001-0000-4000-8000-000000000032', 'c3000001-0000-4000-8000-000000000009', 'Power BI',                2),
  ('d4000001-0000-4000-8000-000000000033', 'c3000001-0000-4000-8000-000000000010', 'AWS',                     1),
  ('d4000001-0000-4000-8000-000000000034', 'c3000001-0000-4000-8000-000000000010', 'GCP',                     2),
  ('d4000001-0000-4000-8000-000000000035', 'c3000001-0000-4000-8000-000000000010', 'Azure',                   3),
  ('d4000001-0000-4000-8000-000000000036', 'c3000001-0000-4000-8000-000000000011', 'Docker',                  1),
  ('d4000001-0000-4000-8000-000000000037', 'c3000001-0000-4000-8000-000000000011', 'Kubernetes',              2),
  ('d4000001-0000-4000-8000-000000000038', 'c3000001-0000-4000-8000-000000000012', 'Terraform',               1),
  ('d4000001-0000-4000-8000-000000000039', 'c3000001-0000-4000-8000-000000000012', 'GitHub Actions',          2),
  ('d4000001-0000-4000-8000-000000000040', 'c3000001-0000-4000-8000-000000000012', 'Jenkins',                 3),
  ('d4000001-0000-4000-8000-000000000041', 'c3000001-0000-4000-8000-000000000013', 'React Native',            1),
  ('d4000001-0000-4000-8000-000000000042', 'c3000001-0000-4000-8000-000000000013', 'Flutter',                 2),
  ('d4000001-0000-4000-8000-000000000043', 'c3000001-0000-4000-8000-000000000014', 'Swift',                   1),
  ('d4000001-0000-4000-8000-000000000044', 'c3000001-0000-4000-8000-000000000014', 'SwiftUI',                 2),
  ('d4000001-0000-4000-8000-000000000045', 'c3000001-0000-4000-8000-000000000015', 'Kotlin',                  1),
  ('d4000001-0000-4000-8000-000000000046', 'c3000001-0000-4000-8000-000000000015', 'Jetpack Compose',         2),
  ('d4000001-0000-4000-8000-000000000047', 'c3000001-0000-4000-8000-000000000016', 'OWASP / AppSec',          1),
  ('d4000001-0000-4000-8000-000000000048', 'c3000001-0000-4000-8000-000000000016', 'Penetration Testing',     2),
  ('d4000001-0000-4000-8000-000000000049', 'c3000001-0000-4000-8000-000000000016', 'OAuth 2.0 / OIDC',        3),
  ('d4000001-0000-4000-8000-000000000050', 'c3000001-0000-4000-8000-000000000017', 'Zero Trust Architecture', 1),
  ('d4000001-0000-4000-8000-000000000051', 'c3000001-0000-4000-8000-000000000017', 'SOC 2 Compliance',        2),
  ('d4000001-0000-4000-8000-000000000052', 'c3000001-0000-4000-8000-000000000018', 'User Interviews',         1),
  ('d4000001-0000-4000-8000-000000000053', 'c3000001-0000-4000-8000-000000000018', 'Usability Testing',       2),
  ('d4000001-0000-4000-8000-000000000054', 'c3000001-0000-4000-8000-000000000019', 'Figma',                   1),
  ('d4000001-0000-4000-8000-000000000055', 'c3000001-0000-4000-8000-000000000019', 'Design Systems',          2);

-- ----------------------------------------
-- EMPLOYEE SKILLS
-- ----------------------------------------
INSERT INTO employee_skills (user_id, skill_id, level, years_experience)
VALUES
  -- Alice Chen (manager)
  ('a1000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000001', 4, 6.0),
  ('a1000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000004', 4, 5.5),
  ('a1000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000011', 3, 4.0),
  ('a1000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000020', 3, 5.0),
  -- Bob Martinez (backend)
  ('a1000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000011', 5, 8.0),
  ('a1000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000012', 4, 4.0),
  ('a1000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000016', 5, 5.0),
  ('a1000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000020', 5, 7.0),
  ('a1000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000022', 4, 4.0),
  ('a1000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000036', 3, 3.0),
  -- Carol Nguyen (frontend)
  ('a1000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000001', 5, 5.0),
  ('a1000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000004', 5, 5.0),
  ('a1000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000005', 4, 3.0),
  ('a1000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000006', 5, 4.0),
  ('a1000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000009', 4, 3.0),
  ('a1000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000014', 3, 2.0),
  -- David Kim (data scientist)
  ('a1000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000011', 5, 6.0),
  ('a1000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000024', 5, 4.0),
  ('a1000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000025', 4, 3.0),
  ('a1000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000026', 5, 5.0),
  ('a1000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000027', 3, 1.0),
  ('a1000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000028', 4, 3.0),
  ('a1000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000029', 3, 2.0),
  ('a1000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000020', 3, 4.0),
  -- Elena Petrov (devops)
  ('a1000001-0000-4000-8000-000000000005', 'd4000001-0000-4000-8000-000000000033', 5, 6.0),
  ('a1000001-0000-4000-8000-000000000005', 'd4000001-0000-4000-8000-000000000036', 5, 5.0),
  ('a1000001-0000-4000-8000-000000000005', 'd4000001-0000-4000-8000-000000000037', 5, 4.0),
  ('a1000001-0000-4000-8000-000000000005', 'd4000001-0000-4000-8000-000000000038', 5, 4.0),
  ('a1000001-0000-4000-8000-000000000005', 'd4000001-0000-4000-8000-000000000039', 4, 3.0),
  ('a1000001-0000-4000-8000-000000000005', 'd4000001-0000-4000-8000-000000000011', 3, 3.0),
  -- Frank Okafor (mobile)
  ('a1000001-0000-4000-8000-000000000006', 'd4000001-0000-4000-8000-000000000041', 5, 5.0),
  ('a1000001-0000-4000-8000-000000000006', 'd4000001-0000-4000-8000-000000000001', 4, 4.0),
  ('a1000001-0000-4000-8000-000000000006', 'd4000001-0000-4000-8000-000000000043', 3, 2.0),
  ('a1000001-0000-4000-8000-000000000006', 'd4000001-0000-4000-8000-000000000042', 3, 1.5),
  ('a1000001-0000-4000-8000-000000000006', 'd4000001-0000-4000-8000-000000000004', 4, 4.0),
  -- Grace Liu (PM)
  ('a1000001-0000-4000-8000-000000000007', 'd4000001-0000-4000-8000-000000000031', 3, 3.0),
  ('a1000001-0000-4000-8000-000000000007', 'd4000001-0000-4000-8000-000000000054', 2, 2.0),
  -- Henry Walsh (security)
  ('a1000001-0000-4000-8000-000000000008', 'd4000001-0000-4000-8000-000000000047', 5, 7.0),
  ('a1000001-0000-4000-8000-000000000008', 'd4000001-0000-4000-8000-000000000048', 5, 6.0),
  ('a1000001-0000-4000-8000-000000000008', 'd4000001-0000-4000-8000-000000000049', 4, 4.0),
  ('a1000001-0000-4000-8000-000000000008', 'd4000001-0000-4000-8000-000000000050', 4, 3.0),
  ('a1000001-0000-4000-8000-000000000008', 'd4000001-0000-4000-8000-000000000051', 3, 2.0),
  ('a1000001-0000-4000-8000-000000000008', 'd4000001-0000-4000-8000-000000000011', 3, 4.0),
  -- Iris Tanaka (designer)
  ('a1000001-0000-4000-8000-000000000009', 'd4000001-0000-4000-8000-000000000054', 5, 6.0),
  ('a1000001-0000-4000-8000-000000000009', 'd4000001-0000-4000-8000-000000000055', 5, 4.0),
  ('a1000001-0000-4000-8000-000000000009', 'd4000001-0000-4000-8000-000000000052', 4, 5.0),
  ('a1000001-0000-4000-8000-000000000009', 'd4000001-0000-4000-8000-000000000053', 4, 4.0),
  ('a1000001-0000-4000-8000-000000000009', 'd4000001-0000-4000-8000-000000000006', 3, 3.0),
  -- James Osei (full-stack)
  ('a1000001-0000-4000-8000-000000000010', 'd4000001-0000-4000-8000-000000000001', 4, 4.0),
  ('a1000001-0000-4000-8000-000000000010', 'd4000001-0000-4000-8000-000000000004', 4, 4.0),
  ('a1000001-0000-4000-8000-000000000010', 'd4000001-0000-4000-8000-000000000014', 4, 5.0),
  ('a1000001-0000-4000-8000-000000000010', 'd4000001-0000-4000-8000-000000000018', 4, 4.0),
  ('a1000001-0000-4000-8000-000000000010', 'd4000001-0000-4000-8000-000000000020', 4, 4.0),
  ('a1000001-0000-4000-8000-000000000010', 'd4000001-0000-4000-8000-000000000036', 3, 2.0),
  ('a1000001-0000-4000-8000-000000000010', 'd4000001-0000-4000-8000-000000000006', 3, 3.0),
  -- Kate Brennan (QA)
  ('a1000001-0000-4000-8000-000000000011', 'd4000001-0000-4000-8000-000000000004', 3, 3.0),
  ('a1000001-0000-4000-8000-000000000011', 'd4000001-0000-4000-8000-000000000001', 2, 2.0),
  ('a1000001-0000-4000-8000-000000000011', 'd4000001-0000-4000-8000-000000000039', 3, 3.0);

-- Vic Dang (vudnn.dl@gmail.com) — real OAuth user, looked up by email
-- ON CONFLICT DO NOTHING so this block is safe to re-run
INSERT INTO employee_skills (user_id, skill_id, level, years_experience)
SELECT u.id, s.skill_id, s.level, s.years_experience
FROM (VALUES
  ('d4000001-0000-4000-8000-000000000001', 5, 6.0),  -- React
  ('d4000001-0000-4000-8000-000000000004', 5, 6.0),  -- TypeScript
  ('d4000001-0000-4000-8000-000000000005', 4, 4.0),  -- Next.js
  ('d4000001-0000-4000-8000-000000000006', 4, 5.0),  -- Tailwind CSS
  ('d4000001-0000-4000-8000-000000000009', 4, 4.0),  -- Vite
  ('d4000001-0000-4000-8000-000000000011', 4, 5.0),  -- Python
  ('d4000001-0000-4000-8000-000000000014', 4, 5.0),  -- Node.js
  ('d4000001-0000-4000-8000-000000000016', 4, 3.0),  -- FastAPI
  ('d4000001-0000-4000-8000-000000000018', 3, 4.0),  -- Express.js
  ('d4000001-0000-4000-8000-000000000020', 4, 5.0),  -- PostgreSQL
  ('d4000001-0000-4000-8000-000000000022', 3, 3.0),  -- Redis
  ('d4000001-0000-4000-8000-000000000033', 3, 3.0),  -- AWS
  ('d4000001-0000-4000-8000-000000000036', 3, 3.0),  -- Docker
  ('d4000001-0000-4000-8000-000000000039', 3, 2.0)   -- GitHub Actions
) AS s(skill_id, level, years_experience)
CROSS JOIN (SELECT id FROM users WHERE email = 'vudnn.dl@gmail.com') AS u
ON CONFLICT (user_id, skill_id) DO NOTHING;

-- ----------------------------------------
-- PROJECTS
-- All created_by references use seed user IDs (alice=001, grace=007)
-- to avoid dependency on real auth users whose public.users row may not exist
-- ----------------------------------------
INSERT INTO projects (id, title, description, client_name, client_country, client_region, domain, project_type, status, kick_off_date, end_date, team_size_required, budget_range, tech_stack, created_by)
VALUES
  ('e5000001-0000-4000-8000-000000000001', 'FinTrack Mobile App',
   'Cross-platform mobile app for personal finance tracking with AI-powered spending insights.',
   'FinTrack Inc.', 'US', 'North America', 'Mobile', 'Fixed Price', 'in_progress',
   '2025-10-01', '2026-04-30', 6, '$150k–$250k',
   ARRAY['React Native','TypeScript','Node.js','PostgreSQL','AWS'],
   'a1000001-0000-4000-8000-000000000001'),

  ('e5000001-0000-4000-8000-000000000002', 'MediScan AI Diagnostic Platform',
   'AI-powered medical imaging analysis platform to assist radiologists with early detection of anomalies.',
   'HealthBridge GmbH', 'DE', 'Europe', 'Data & AI', 'Time & Material', 'in_progress',
   '2025-08-15', '2026-08-14', 8, '$400k–$600k',
   ARRAY['Python','PyTorch','FastAPI','PostgreSQL','AWS','Docker','Kubernetes'],
   'a1000001-0000-4000-8000-000000000007'),

  ('e5000001-0000-4000-8000-000000000003', 'SecureVault Enterprise Auth',
   'Zero-trust authentication and access management system for Fortune 500 enterprise clients.',
   'Nexus Financial', 'SG', 'Asia Pacific', 'Security', 'Fixed Price', 'approved',
   '2026-02-01', '2026-09-30', 5, '$200k–$350k',
   ARRAY['Go','PostgreSQL','Redis','Kubernetes','Terraform','AWS'],
   'a1000001-0000-4000-8000-000000000001'),

  ('e5000001-0000-4000-8000-000000000004', 'DataPulse Analytics Dashboard',
   'Real-time BI dashboard connecting 20+ data sources with custom visualization engine.',
   'RetailMax Corp', 'AU', 'Asia Pacific', 'Data & AI', 'Dedicated Team', 'in_progress',
   '2025-11-01', '2026-10-31', 7, '$500k–$800k',
   ARRAY['Python','Apache Spark','dbt','PostgreSQL','Tableau','AWS','Airflow'],
   'a1000001-0000-4000-8000-000000000007'),

  ('e5000001-0000-4000-8000-000000000005', 'CloudMigrate Infrastructure Modernization',
   'Lift-and-shift + re-architecture of legacy on-prem systems to AWS with full CI/CD pipeline.',
   'LogiTrans GmbH', 'DE', 'Europe', 'Cloud & DevOps', 'Time & Material', 'completed',
   '2025-01-15', '2025-09-30', 4, '$180k–$280k',
   ARRAY['AWS','Terraform','Docker','Kubernetes','GitHub Actions','Python'],
   'a1000001-0000-4000-8000-000000000001'),

  ('e5000001-0000-4000-8000-000000000006', 'ShopSpark E-Commerce Platform',
   'Greenfield e-commerce platform with headless CMS, real-time inventory, and AR product preview.',
   'StyleCo UK', 'GB', 'Europe', 'Web Development', 'Fixed Price', 'review',
   '2026-03-01', '2026-12-31', 9, '$300k–$500k',
   ARRAY['Next.js','TypeScript','React','Node.js','PostgreSQL','Redis','AWS'],
   'a1000001-0000-4000-8000-000000000007'),

  ('e5000001-0000-4000-8000-000000000007', 'EduLearn LMS Rebuild',
   'Complete rebuild of legacy LMS with modern UX, live collaboration, video streaming, and AI tutoring.',
   'EduLearn Foundation', 'CA', 'North America', 'Web Development', 'Time & Material', 'draft',
   NULL, NULL, 10, '$600k–$900k',
   ARRAY['React','TypeScript','Python','FastAPI','PostgreSQL','AWS','LangChain'],
   'a1000001-0000-4000-8000-000000000001'),

  ('e5000001-0000-4000-8000-000000000008', 'SmartHome IoT Gateway',
   'Edge computing gateway for smart home device orchestration with ML-based energy optimization.',
   'HomeTech Innovations', 'JP', 'Asia Pacific', 'Embedded', 'R&D', 'draft',
   NULL, NULL, 5, '$100k–$150k',
   ARRAY['Go','Python','Docker','Kubernetes','AWS'],
   'a1000001-0000-4000-8000-000000000007'),

  ('e5000001-0000-4000-8000-000000000009', 'Compliance Audit Automation',
   'SOC 2 and ISO 27001 compliance automation with evidence collection and report generation.',
   'AuditReady Ltd', 'IE', 'Europe', 'Security', 'Pilot', 'review',
   '2026-04-01', '2026-07-31', 4, '$80k–$130k',
   ARRAY['Python','FastAPI','PostgreSQL','React','TypeScript'],
   'a1000001-0000-4000-8000-000000000001'),

  ('e5000001-0000-4000-8000-000000000010', 'GreenRoute Logistics Optimizer',
   'AI-driven route optimization reducing carbon footprint for last-mile delivery operations.',
   'EcoLogistics SA', 'FR', 'Europe', 'Data & AI', 'Fixed Price', 'completed',
   '2024-06-01', '2025-03-31', 6, '$250k–$400k',
   ARRAY['Python','Scikit-learn','PyTorch','PostgreSQL','FastAPI','Docker'],
   'a1000001-0000-4000-8000-000000000007');

-- ----------------------------------------
-- PROJECT REQUIRED SKILLS
-- ----------------------------------------
INSERT INTO project_required_skills (project_id, skill_id, skill_name, min_level, quantity, is_mandatory)
VALUES
  ('e5000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000041', 'React Native',            4, 2, true),
  ('e5000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000004', 'TypeScript',              3, 2, true),
  ('e5000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000014', 'Node.js',                 3, 1, true),
  ('e5000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000020', 'PostgreSQL',              3, 1, false),
  ('e5000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000024', 'PyTorch',                 4, 2, true),
  ('e5000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000011', 'Python',                  4, 3, true),
  ('e5000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000037', 'Kubernetes',              3, 1, true),
  ('e5000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000016', 'FastAPI',                 3, 1, false),
  ('e5000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000047', 'OWASP / AppSec',          4, 1, true),
  ('e5000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000050', 'Zero Trust Architecture', 4, 1, true),
  ('e5000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000012', 'Go',                      4, 2, true),
  ('e5000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000037', 'Kubernetes',              3, 1, false),
  ('e5000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000028', 'Apache Spark',            4, 2, true),
  ('e5000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000029', 'dbt',                     3, 1, true),
  ('e5000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000031', 'Tableau',                 3, 2, true),
  ('e5000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000011', 'Python',                  4, 2, false),
  ('e5000001-0000-4000-8000-000000000006', 'd4000001-0000-4000-8000-000000000005', 'Next.js',                 4, 2, true),
  ('e5000001-0000-4000-8000-000000000006', 'd4000001-0000-4000-8000-000000000004', 'TypeScript',              3, 3, true),
  ('e5000001-0000-4000-8000-000000000006', 'd4000001-0000-4000-8000-000000000054', 'Figma',                   3, 1, false);

-- ----------------------------------------
-- TAGS
-- ----------------------------------------
INSERT INTO tags (id, name, category, color, is_predefined)
VALUES
  ('f6000001-0000-4000-8000-000000000001', 'AI/ML',        'technology', '#8b5cf6', true),
  ('f6000001-0000-4000-8000-000000000002', 'Fintech',      'industry',   '#10b981', true),
  ('f6000001-0000-4000-8000-000000000003', 'Healthcare',   'industry',   '#3b82f6', true),
  ('f6000001-0000-4000-8000-000000000004', 'E-Commerce',   'industry',   '#f59e0b', true),
  ('f6000001-0000-4000-8000-000000000005', 'Security',     'domain',     '#ef4444', true),
  ('f6000001-0000-4000-8000-000000000006', 'Cloud Native', 'technology', '#06b6d4', true),
  ('f6000001-0000-4000-8000-000000000007', 'Mobile First', 'approach',   '#f97316', true),
  ('f6000001-0000-4000-8000-000000000008', 'Real-time',    'technology', '#a78bfa', true),
  ('f6000001-0000-4000-8000-000000000009', 'Compliance',   'domain',     '#6b7280', true),
  ('f6000001-0000-4000-8000-000000000010', 'Green Tech',   'domain',     '#34d399', true);

INSERT INTO project_tags (project_id, tag_id)
VALUES
  ('e5000001-0000-4000-8000-000000000001', 'f6000001-0000-4000-8000-000000000002'),
  ('e5000001-0000-4000-8000-000000000001', 'f6000001-0000-4000-8000-000000000007'),
  ('e5000001-0000-4000-8000-000000000002', 'f6000001-0000-4000-8000-000000000001'),
  ('e5000001-0000-4000-8000-000000000002', 'f6000001-0000-4000-8000-000000000003'),
  ('e5000001-0000-4000-8000-000000000003', 'f6000001-0000-4000-8000-000000000005'),
  ('e5000001-0000-4000-8000-000000000003', 'f6000001-0000-4000-8000-000000000009'),
  ('e5000001-0000-4000-8000-000000000004', 'f6000001-0000-4000-8000-000000000001'),
  ('e5000001-0000-4000-8000-000000000004', 'f6000001-0000-4000-8000-000000000008'),
  ('e5000001-0000-4000-8000-000000000005', 'f6000001-0000-4000-8000-000000000006'),
  ('e5000001-0000-4000-8000-000000000006', 'f6000001-0000-4000-8000-000000000004'),
  ('e5000001-0000-4000-8000-000000000006', 'f6000001-0000-4000-8000-000000000008'),
  ('e5000001-0000-4000-8000-000000000009', 'f6000001-0000-4000-8000-000000000005'),
  ('e5000001-0000-4000-8000-000000000009', 'f6000001-0000-4000-8000-000000000009'),
  ('e5000001-0000-4000-8000-000000000010', 'f6000001-0000-4000-8000-000000000001'),
  ('e5000001-0000-4000-8000-000000000010', 'f6000001-0000-4000-8000-000000000010');

-- ----------------------------------------
-- ALLOCATIONS
-- ----------------------------------------
INSERT INTO allocations (user_id, project_id, allocation_percentage, month, status, allocated_by)
VALUES
  ('a1000001-0000-4000-8000-000000000006', 'e5000001-0000-4000-8000-000000000001', 80,  '2026-05-01', 'confirmed', 'a1000001-0000-4000-8000-000000000001'),
  ('a1000001-0000-4000-8000-000000000006', 'e5000001-0000-4000-8000-000000000001', 80,  '2026-06-01', 'confirmed', 'a1000001-0000-4000-8000-000000000001'),
  ('a1000001-0000-4000-8000-000000000010', 'e5000001-0000-4000-8000-000000000001', 50,  '2026-05-01', 'confirmed', 'a1000001-0000-4000-8000-000000000001'),
  ('a1000001-0000-4000-8000-000000000010', 'e5000001-0000-4000-8000-000000000001', 50,  '2026-06-01', 'pending',   'a1000001-0000-4000-8000-000000000001'),
  ('a1000001-0000-4000-8000-000000000003', 'e5000001-0000-4000-8000-000000000001', 30,  '2026-05-01', 'confirmed', 'a1000001-0000-4000-8000-000000000001'),
  ('a1000001-0000-4000-8000-000000000011', 'e5000001-0000-4000-8000-000000000001', 60,  '2026-05-01', 'pending',   'a1000001-0000-4000-8000-000000000001'),
  ('a1000001-0000-4000-8000-000000000004', 'e5000001-0000-4000-8000-000000000002', 100, '2026-05-01', 'confirmed', 'a1000001-0000-4000-8000-000000000007'),
  ('a1000001-0000-4000-8000-000000000004', 'e5000001-0000-4000-8000-000000000002', 100, '2026-06-01', 'confirmed', 'a1000001-0000-4000-8000-000000000007'),
  ('a1000001-0000-4000-8000-000000000002', 'e5000001-0000-4000-8000-000000000002', 70,  '2026-05-01', 'confirmed', 'a1000001-0000-4000-8000-000000000007'),
  ('a1000001-0000-4000-8000-000000000002', 'e5000001-0000-4000-8000-000000000002', 70,  '2026-06-01', 'pending',   'a1000001-0000-4000-8000-000000000007'),
  ('a1000001-0000-4000-8000-000000000005', 'e5000001-0000-4000-8000-000000000002', 40,  '2026-05-01', 'confirmed', 'a1000001-0000-4000-8000-000000000007'),
  ('a1000001-0000-4000-8000-000000000004', 'e5000001-0000-4000-8000-000000000004', 0,   '2026-05-01', 'rejected',  'a1000001-0000-4000-8000-000000000007'),
  ('a1000001-0000-4000-8000-000000000005', 'e5000001-0000-4000-8000-000000000004', 60,  '2026-05-01', 'confirmed', 'a1000001-0000-4000-8000-000000000007'),
  ('a1000001-0000-4000-8000-000000000005', 'e5000001-0000-4000-8000-000000000004', 60,  '2026-06-01', 'pending',   'a1000001-0000-4000-8000-000000000007');

-- ----------------------------------------
-- WISH LIST
-- ----------------------------------------
INSERT INTO wish_list (project_id, user_id, added_by, match_score, ai_explanation, note)
VALUES
  ('e5000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000008', 'a1000001-0000-4000-8000-000000000001',
   94.5, 'Henry has OWASP level 5 and Zero Trust level 4, directly matching both mandatory skills. Go level 4 exceeds requirement.', 'Top candidate for security lead role.'),
  ('e5000001-0000-4000-8000-000000000006', 'a1000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000007',
   88.0, 'Carol has Next.js level 4 and TypeScript level 5, both above required min levels. Strong frontend match.', NULL),
  ('e5000001-0000-4000-8000-000000000006', 'a1000001-0000-4000-8000-000000000009', 'a1000001-0000-4000-8000-000000000007',
   72.0, 'Iris covers Figma at level 5. Non-mandatory design requirement exceeded.', 'Good for UX track.'),
  ('e5000001-0000-4000-8000-000000000007', 'a1000001-0000-4000-8000-000000000010', 'a1000001-0000-4000-8000-000000000001',
   81.5, 'James covers React, TypeScript, Node.js, and PostgreSQL — all core stack items for this project.', NULL);

-- ----------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------
INSERT INTO notifications (user_id, type, title, message, link, is_read)
VALUES
  ('a1000001-0000-4000-8000-000000000001', 'allocation_request', 'New Allocation Request',         'Kate Brennan has been proposed for FinTrack Mobile App at 60%.', '/my-allocations', false),
  ('a1000001-0000-4000-8000-000000000001', 'project_update',     'Project Status Changed',         'ShopSpark E-Commerce Platform moved to Review status.', '/projects', false),
  ('a1000001-0000-4000-8000-000000000001', 'skill_update',       'Skill Matrix Updated',           'Henry Walsh updated his security skill ratings.', '/employees', true),
  ('a1000001-0000-4000-8000-000000000002', 'allocation_request', 'Allocation Pending Confirmation','You have been allocated to MediScan AI at 70% for June 2026.', '/my-allocations', false),
  ('a1000001-0000-4000-8000-000000000002', 'project_update',     'Project Kickoff Reminder',       'MediScan AI — sprint planning scheduled for next Monday.', '/projects', true),
  ('a1000001-0000-4000-8000-000000000003', 'wish_list',          'Added to Project Shortlist',     'You have been shortlisted for ShopSpark E-Commerce Platform (match score: 88%).', '/projects', false),
  ('a1000001-0000-4000-8000-000000000003', 'allocation_request', 'Allocation Confirmed',           'Your 30% allocation to FinTrack Mobile App for May 2026 is confirmed.', '/my-allocations', true),
  ('a1000001-0000-4000-8000-000000000004', 'allocation_request', 'Allocation Rejected',            'Your allocation to DataPulse Analytics for May 2026 was rejected — at capacity with MediScan.', '/my-allocations', false),
  ('a1000001-0000-4000-8000-000000000004', 'system',             'AI Model Update',                'The skill matching algorithm has been updated. Your profile match scores may change.', '/profile', true),
  ('a1000001-0000-4000-8000-000000000006', 'allocation_request', 'Allocation Confirmed',           'Your 80% allocation to FinTrack Mobile App for May 2026 has been confirmed.', '/my-allocations', true),
  ('a1000001-0000-4000-8000-000000000008', 'wish_list',          'Added to Project Shortlist',     'You have been shortlisted for SecureVault Enterprise Auth (match score: 94.5%).', '/projects', false),
  ('a1000001-0000-4000-8000-000000000010', 'wish_list',          'Added to Project Shortlist',     'You have been shortlisted for EduLearn LMS Rebuild (match score: 81.5%).', '/projects', false),
  ('a1000001-0000-4000-8000-000000000010', 'allocation_request', 'Allocation Pending',             'A 50% allocation to FinTrack Mobile App for June 2026 is awaiting your confirmation.', '/my-allocations', false);

-- ----------------------------------------
-- SYSTEM SETTINGS
-- ----------------------------------------
INSERT INTO system_settings (key, value, description)
VALUES
  ('ai_provider',               '"anthropic"',                                                         'Primary AI provider for RFP extraction and skill matching'),
  ('ai_model',                  '"claude-sonnet-4-6"',                                                'AI model ID used for analysis tasks'),
  ('matching_weights',          '{"skill_level": 0.5, "years_experience": 0.2, "availability": 0.3}', 'Weights for AI-powered employee-project matching score'),
  ('max_allocation_percentage', '100',                                                                 'Maximum total allocation percentage per employee per month'),
  ('rfp_extraction_enabled',    'true',                                                                'Enable AI-powered RFP data extraction on file upload'),
  ('notification_email_enabled','false',                                                               'Send email notifications for allocation changes')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
