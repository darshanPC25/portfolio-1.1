-- =====================================================================
-- Initial draft content: the copy built into the frontend in Batch 1.
--
-- Only facts supplied by Darshan are used. Unknown values (URLs, GitHub
-- username, resume, public email, institution) are left NULL rather than
-- invented. Project status is IN_DEVELOPMENT for all four until confirmed.
-- =====================================================================

-- Placeholder images hosted by the frontend (replaceable through the CMS).
INSERT INTO portfolio_asset (id, kind, storage_type, url, original_filename, content_type, alt_text) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'IMAGE', 'EXTERNAL', '/images/profile-placeholder.svg', 'profile-placeholder.svg', 'image/svg+xml', 'Placeholder portrait for Darshan'),
  ('a0000000-0000-4000-8000-000000000002', 'IMAGE', 'EXTERNAL', '/images/projects/document-management.svg', 'document-management.svg', 'image/svg+xml', 'Illustrative interface mock-up of a document management dashboard'),
  ('a0000000-0000-4000-8000-000000000003', 'IMAGE', 'EXTERNAL', '/images/projects/transport-eta.svg', 'transport-eta.svg', 'image/svg+xml', 'Illustrative interface mock-up of a transport arrival and ticketing app'),
  ('a0000000-0000-4000-8000-000000000004', 'IMAGE', 'EXTERNAL', '/images/projects/ratha-yatra.svg', 'ratha-yatra.svg', 'image/svg+xml', 'Illustrative interface mock-up of a donation management screen'),
  ('a0000000-0000-4000-8000-000000000005', 'IMAGE', 'EXTERNAL', '/images/projects/reddit-sentiment.svg', 'reddit-sentiment.svg', 'image/svg+xml', 'Illustrative interface mock-up of a sentiment analysis chart');

-- Profile
INSERT INTO portfolio_profile (id, full_name, preferred_name, title, location, photo_asset_id, photo_alt,
                               resume_asset_id, public_email, available, availability_label, github_username,
                               copyright_text, footer_note) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'Paridarshan Sahoo', 'Darshan', 'Software Developer | Java Backend Developer',
   'India', 'a0000000-0000-4000-8000-000000000001', 'Placeholder portrait for Darshan',
   NULL, NULL, true, 'Available for new opportunities', NULL,
   '© 2026 Paridarshan Sahoo. All rights reserved.', 'Designed and built with care.');

-- Hero
INSERT INTO hero_content (id, greeting, role, tagline, primary_cta_label, primary_cta_href,
                          secondary_cta_label, secondary_cta_href, resume_label, focus_label) VALUES
  ('b0000000-0000-4000-8000-000000000002', 'Hi, I''m Darshan', 'Software Developer',
   'Building scalable backend systems and meaningful digital experiences.',
   'Get in Touch', '#contact', 'Explore Projects', '#projects', 'Download Resume', 'Focused on');

INSERT INTO hero_focus_area (hero_id, position, label) VALUES
  ('b0000000-0000-4000-8000-000000000002', 0, 'Java Backend Development'),
  ('b0000000-0000-4000-8000-000000000002', 1, 'Spring Boot'),
  ('b0000000-0000-4000-8000-000000000002', 2, 'REST API Development'),
  ('b0000000-0000-4000-8000-000000000002', 3, 'Database Management'),
  ('b0000000-0000-4000-8000-000000000002', 4, 'Software Engineering'),
  ('b0000000-0000-4000-8000-000000000002', 5, 'Data Structures and Algorithms'),
  ('b0000000-0000-4000-8000-000000000002', 6, 'Distributed Systems');

-- About
INSERT INTO about_content (id, approach_heading) VALUES
  ('b0000000-0000-4000-8000-000000000003', 'Here''s how I work');

INSERT INTO about_paragraph (about_id, position, body) VALUES
  ('b0000000-0000-4000-8000-000000000003', 0,
   'I''m Paridarshan Sahoo — Darshan to most people — a software developer based in India with a focus on Java backend development.'),
  ('b0000000-0000-4000-8000-000000000003', 1,
   'I''m completing a B.Tech in Computer Science and Engineering (Data Science), graduating in 2026. My interests sit where careful software engineering meets systems that need to scale: Spring Boot services, REST APIs, database design, data structures and algorithms, and distributed systems.');

INSERT INTO about_fact (about_id, position, label, value) VALUES
  ('b0000000-0000-4000-8000-000000000003', 0, 'Based in', 'India'),
  ('b0000000-0000-4000-8000-000000000003', 1, 'Focus', 'Java Backend'),
  ('b0000000-0000-4000-8000-000000000003', 2, 'Degree', 'B.Tech CSE (Data Science)'),
  ('b0000000-0000-4000-8000-000000000003', 3, 'Graduating', '2026');

INSERT INTO about_approach_step (about_id, position, step_label, title, description) VALUES
  ('b0000000-0000-4000-8000-000000000003', 0, '01', 'Understand', 'Start with the problem and the data behind it before writing any code.'),
  ('b0000000-0000-4000-8000-000000000003', 1, '02', 'Build', 'Shape clear APIs and a data model that stay easy to reason about.'),
  ('b0000000-0000-4000-8000-000000000003', 2, '03', 'Refine', 'Test, measure and tidy until the system is dependable.');

-- Sections (navigation order, headings, visibility)
INSERT INTO portfolio_section (id, section_key, nav_label, eyebrow, heading, intro, visible, display_order) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'ABOUT', 'About', 'About Me',
   'A developer who enjoys the parts you rarely see', NULL, true, 1),
  ('c0000000-0000-4000-8000-000000000002', 'SKILLS', 'Skills', 'Technical Skills',
   'The tools I reach for', 'A backend-first toolkit, grounded in computer science fundamentals.', true, 2),
  ('c0000000-0000-4000-8000-000000000003', 'PROJECTS', 'Projects', 'Featured Projects',
   'Selected Works', 'Projects I am building to explore backend systems, data and real-world problems.', true, 3),
  ('c0000000-0000-4000-8000-000000000004', 'JOURNEY', 'Journey', 'Professional Journey',
   'Where I am, and where I am heading', 'An honest snapshot. Roles will be added here as the journey grows.', true, 4),
  ('c0000000-0000-4000-8000-000000000005', 'EDUCATION', 'Education', 'Education',
   'Academic foundation', NULL, true, 5),
  ('c0000000-0000-4000-8000-000000000006', 'GITHUB', 'GitHub', 'GitHub Activity',
   'Code in the open', 'Recent public repositories, straight from GitHub.', true, 6),
  ('c0000000-0000-4000-8000-000000000007', 'CONTACT', 'Contact', 'Contact',
   'Let''s Make It Happen',
   'Always open to new opportunities, collaborations and interesting problems. Send a message and I will get back to you.',
   true, 7);

INSERT INTO portfolio_section_setting (section_id, setting_key, setting_value) VALUES
  ('c0000000-0000-4000-8000-000000000006', 'emptyMessage', 'My GitHub profile will be linked here soon.'),
  ('c0000000-0000-4000-8000-000000000007', 'formHeading', 'Send a message'),
  ('c0000000-0000-4000-8000-000000000007', 'submitLabel', 'Send Message');

-- Skills
INSERT INTO skill_category (id, title, icon, description, display_order) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'Languages', 'CODE', 'Where most of my work starts.', 1),
  ('d0000000-0000-4000-8000-000000000002', 'Backend', 'SERVER', 'Services and APIs.', 2),
  ('d0000000-0000-4000-8000-000000000003', 'Data', 'DATABASE', 'Storing and modelling information.', 3),
  ('d0000000-0000-4000-8000-000000000004', 'Foundations', 'NETWORK', 'The ideas underneath the frameworks.', 4);

INSERT INTO skill (id, category_id, name, display_order) VALUES
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000001', 'Java', 1),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000001', 'SQL', 2),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000002', 'Spring Boot', 1),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000002', 'REST API Development', 2),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000003', 'Database Management', 1),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000003', 'PostgreSQL', 2),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000004', 'Data Structures and Algorithms', 1),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000004', 'Distributed Systems', 2),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000004', 'Software Engineering', 3);

-- Projects
INSERT INTO project (id, slug, name, summary, description, image_asset_id, image_alt, status, featured, display_order) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'secure-digital-document-management-system',
   'Secure Digital Document Management System',
   'Secure storage, controlled access and organised retrieval for digital documents.',
   'A document management system centred on keeping digital documents safe, organised and available only to the people who should see them.',
   'a0000000-0000-4000-8000-000000000002', 'Illustrative interface mock-up of a document management dashboard',
   'IN_DEVELOPMENT', true, 1),
  ('e0000000-0000-4000-8000-000000000002', 'real-time-public-transport-eta-and-smart-ticketing-system',
   'Real-Time Public Transport ETA and Smart Ticketing System',
   'Live arrival estimates for public transport, paired with digital ticketing.',
   'A system that brings real-time arrival estimates and smart ticketing together, so a journey can be planned and paid for in one place.',
   'a0000000-0000-4000-8000-000000000003', 'Illustrative interface mock-up of a transport arrival and ticketing app',
   'IN_DEVELOPMENT', false, 2),
  ('e0000000-0000-4000-8000-000000000003', 'ratha-yatra-donation-management-application',
   'Ratha Yatra Donation Management Application',
   'Recording and managing donations for the Ratha Yatra festival.',
   'An application for recording, tracking and managing donations made around the Ratha Yatra festival.',
   'a0000000-0000-4000-8000-000000000004', 'Illustrative interface mock-up of a donation management screen',
   'IN_DEVELOPMENT', false, 3),
  ('e0000000-0000-4000-8000-000000000004', 'reddit-sentiment-analysis',
   'Reddit Sentiment Analysis',
   'Understanding the sentiment of Reddit discussions through data.',
   'A data project that analyses Reddit discussions and classifies the sentiment expressed in them.',
   'a0000000-0000-4000-8000-000000000005', 'Illustrative interface mock-up of a sentiment analysis chart',
   'IN_DEVELOPMENT', false, 4);

INSERT INTO project_highlight (project_id, position, text) VALUES
  ('e0000000-0000-4000-8000-000000000001', 0, 'Secure document storage and retrieval'),
  ('e0000000-0000-4000-8000-000000000001', 1, 'Access control for who can view and manage documents'),
  ('e0000000-0000-4000-8000-000000000001', 2, 'Organised structure for finding documents quickly'),
  ('e0000000-0000-4000-8000-000000000002', 0, 'Real-time estimated arrival times'),
  ('e0000000-0000-4000-8000-000000000002', 1, 'Digital, smart ticketing'),
  ('e0000000-0000-4000-8000-000000000002', 2, 'A single flow for planning and paying for a trip'),
  ('e0000000-0000-4000-8000-000000000003', 0, 'Recording of individual donations'),
  ('e0000000-0000-4000-8000-000000000003', 1, 'Tracking of donation totals'),
  ('e0000000-0000-4000-8000-000000000003', 2, 'Organised records for the people managing the festival'),
  ('e0000000-0000-4000-8000-000000000004', 0, 'Collection of Reddit discussion text'),
  ('e0000000-0000-4000-8000-000000000004', 1, 'Sentiment classification of posts and comments'),
  ('e0000000-0000-4000-8000-000000000004', 2, 'Summaries of how sentiment is distributed');

INSERT INTO project_tag (project_id, position, tag) VALUES
  ('e0000000-0000-4000-8000-000000000001', 0, 'Document Management'),
  ('e0000000-0000-4000-8000-000000000001', 1, 'Access Control'),
  ('e0000000-0000-4000-8000-000000000001', 2, 'Security'),
  ('e0000000-0000-4000-8000-000000000002', 0, 'Real-Time Data'),
  ('e0000000-0000-4000-8000-000000000002', 1, 'ETA'),
  ('e0000000-0000-4000-8000-000000000002', 2, 'Smart Ticketing'),
  ('e0000000-0000-4000-8000-000000000003', 0, 'Donations'),
  ('e0000000-0000-4000-8000-000000000003', 1, 'Record Keeping'),
  ('e0000000-0000-4000-8000-000000000003', 2, 'Management'),
  ('e0000000-0000-4000-8000-000000000004', 0, 'Sentiment Analysis'),
  ('e0000000-0000-4000-8000-000000000004', 1, 'NLP'),
  ('e0000000-0000-4000-8000-000000000004', 2, 'Data Science');

-- Journey (no invented employment)
INSERT INTO experience (id, period_label, title, organisation, description, display_order) VALUES
  ('f0000000-0000-4000-8000-000000000001', 'Now', 'Building backend projects', NULL,
   'Developing projects with Java and Spring Boot while completing my B.Tech in Computer Science and Engineering (Data Science).', 1),
  ('f0000000-0000-4000-8000-000000000002', 'Next', 'Software Developer / Java Backend Developer roles', NULL,
   'Looking for a team where I can contribute to backend systems and keep growing as an engineer.', 2);

-- Education
INSERT INTO education (id, degree, field_of_study, institution, period_label, description, display_order) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'Bachelor of Technology (B.Tech)',
   'Computer Science and Engineering (Data Science)', NULL, 'Graduating 2026',
   'Studying computer science with a specialisation in data science, alongside a personal focus on backend engineering.', 1);

-- Social links (URLs unknown: stored but not shown until filled in)
INSERT INTO social_link (id, platform, label, url, display_order) VALUES
  (gen_random_uuid(), 'GITHUB', 'GitHub', NULL, 1),
  (gen_random_uuid(), 'LINKEDIN', 'LinkedIn', NULL, 2),
  (gen_random_uuid(), 'EMAIL', 'Email', NULL, 3);

-- Appearance and SEO
INSERT INTO portfolio_appearance (id, hero_scene_enabled, motion_enabled) VALUES
  ('b0000000-0000-4000-8000-000000000004', true, true);

INSERT INTO seo_settings (id, meta_title, meta_description, canonical_url, allow_indexing) VALUES
  ('b0000000-0000-4000-8000-000000000005', 'Darshan — Software Developer',
   'Paridarshan Sahoo (Darshan) — Software Developer and Java Backend Developer building scalable backend systems and meaningful digital experiences.',
   NULL, true);
