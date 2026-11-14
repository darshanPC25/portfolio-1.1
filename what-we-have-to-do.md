# PROJECT MASTER SPECIFICATION
## DARSHAN — PERSONAL DEVELOPER PORTFOLIO + VISUAL CMS

Act as a senior full-stack architect, creative developer, UI/UX designer, 3D web developer, and software engineer.

Build a complete, production-ready personal developer portfolio with a private visual content management system.

The uploaded reference image is the mandatory primary visual reference.

## 1. PERSONAL INFORMATION

Name: Paridarshan Sahoo
Preferred name: Darshan
Professional title: Software Developer | Java Backend Developer
Location: India
Education: B.Tech in Computer Science and Engineering (Data Science)
Graduation: 2026

Professional interests:
- Java Backend Development
- Spring Boot
- REST API Development
- Database Management
- Software Engineering
- Data Structures and Algorithms
- Distributed Systems

Do not invent employment history, certifications, achievements, project URLs or professional experience.

Keep all profile information editable through the CMS.

## 2. TECHNOLOGY STACK

### Frontend — independent application

Directory: frontend/

- React
- TypeScript
- Vite
- Tailwind CSS
- Three.js
- React Three Fiber
- Drei
- GSAP
- Framer Motion
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod
- Lucide React

### Backend — independent application

Directory: backend/

- Java 21
- Spring Boot 3.x
- Maven
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- JWT or secure session-based authentication
- BCrypt
- Lombok
- Jakarta Validation
- Flyway
- Swagger / OpenAPI

### Database

PostgreSQL.

### Backend base package

Use this exact Java package:

com.darshanpc.portfolio

Main class:

com.darshanpc.portfolio.PortfolioApplication

Every Java class must belong to this package or one of its subpackages.

Never use com.darshan.portfolio.

## 3. STRICT PROJECT SEPARATION

Use this root structure:

darshan-portfolio/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── README.md
│
├── database/
├── docker-compose.yml
├── .gitignore
└── README.md

Frontend and backend must be independent applications.

Frontend:
- Independent package.json.
- Independent node_modules.
- Independent build process.
- Independent environment configuration.

Backend:
- Independent pom.xml.
- Independent Maven dependencies.
- Independent build process.
- Independent application configuration.

Never place React source code inside backend/.
Never place Java source code inside frontend/.

Frontend and backend communicate through REST APIs.

Development URLs:
Frontend: http://localhost:5173
Backend: http://localhost:8080
PostgreSQL: localhost:5432

## 4. MANDATORY VISUAL DESIGN REFERENCE

Use my uploaded reference image as the primary visual reference.

Analyze its layout, colors, composition, typography, spacing and 3D objects.

The website must follow its design language:

- Warm ivory and cream backgrounds.
- Soft sage green.
- Olive green.
- Forest green.
- Elegant serif typography.
- Modern sans-serif typography.
- Large expressive headlines.
- Organic floating 3D shapes.
- Sculptural blobs and spheres.
- Realistic soft shadows.
- Rounded project preview cards.
- Editorial-style layouts.
- Minimal navigation.
- Spacious compositions.
- Subtle transitions.

Do not use a generic dark developer portfolio.

Do not use excessive neon, purple or blue gradients.

Adapt the reference into a professional software developer portfolio.

The uploaded reference image takes priority over generic AI-generated design choices.

## 5. PUBLIC WEBSITE SECTIONS

Build:

1. Navigation.
2. Hero.
3. About Me.
4. Technical Skills.
5. Featured Projects.
6. Professional Journey.
7. Education.
8. GitHub Activity.
9. Contact.
10. Footer.

### Hero content

"Hi, I'm Darshan"

"Software Developer"

"Building scalable backend systems and meaningful digital experiences."

Include:
- Profile photograph.
- Organic 3D decorative objects.
- Contact CTA.
- Explore Projects CTA.
- Professional availability indicator.
- Resume download.

### Projects

Use configurable initial entries:

1. Secure Digital Document Management System.
2. Real-Time Public Transport ETA and Smart Ticketing System.
3. Ratha Yatra Donation Management Application.
4. Reddit Sentiment Analysis.

Do not claim incomplete projects are finished.

Do not invent repository URLs.

### Footer

Include:
- Navigation.
- Social links.
- Copyright.
- Small text link labelled exactly "Login".

Display:

© 2026 Paridarshan Sahoo. All rights reserved. · Login

Login must navigate to /admin/login.

Do not display the words "Admin Login" in the public footer.

## 6. PRIVATE PORTFOLIO STUDIO

Create a private CMS accessible at:

/admin/login
/admin

Only authorized administrators can access it.

Implement:
- Secure authentication.
- Dashboard.
- Profile editing.
- Hero editing.
- About editing.
- Skills management.
- Project management.
- Experience management.
- Education management.
- Social link management.
- Resume management.
- Appearance settings.
- SEO settings.
- Contact message management.

## 7. VISUAL CLICK-TO-EDIT CMS

I must be able to open the actual public portfolio inside the admin editor and click any editable element.

Examples:
- Click a heading to edit its text.
- Click a paragraph to edit its content.
- Click a photograph to replace it.
- Click a project to edit its details.
- Click a skill to rename or remove it.
- Click a button to change its label or destination.

Provide:
- Hover outlines.
- Edit indicators.
- Inline editing.
- Editing properties panel.
- Save and Cancel.
- Unsaved change indicators.
- Preview.
- Draft.
- Publish.
- Confirmation before publishing.

The visual editor must use the same React components as the public website.

Do not create a separate fake preview.

## 8. BACKEND AND SECURITY

Use modular monolithic architecture.

Implement:
- REST APIs.
- DTOs.
- Entities.
- Repositories.
- Services.
- Controllers.
- Global exception handling.
- Validation.
- Authentication.
- Authorization.
- Database migrations.
- Secure file upload.
- Audit timestamps.

Protect all admin APIs.

Do not hardcode administrator credentials.

Do not provide public registration.

Keep passwords hashed using BCrypt.

Use secure authentication and token/session handling.

## 9. CONTENT PERSISTENCE

All content updates must be stored in PostgreSQL.

Support:
- Draft content.
- Published content.
- Last updated timestamps.
- Display ordering.
- Publish/unpublish.
- Image replacement.
- Resume replacement.

Public visitors should only see published content.

Publishing changes must not require a frontend rebuild or redeployment.

## 10. DEVELOPMENT RULES

- Inspect existing files before modifying them.
- Preserve working code.
- Never duplicate existing implementations.
- Keep frontend and backend separate.
- Implement actual functionality.
- Do not use mock APIs as final implementations.
- Maintain consistent design.
- Keep code modular.
- Test each feature.
- Do not skip unfinished requirements silently.

After each development batch, report:
1. Completed work.
2. Files created.
3. Files modified.
4. Dependencies added.
5. Tests performed.
6. Outstanding work.
7. Known issues.
8. How to run the application.

Wait for my instruction before starting the next batch.

This master specification applies to all subsequent batches.

Do not begin implementation until I provide Batchs