import type { PortfolioContent } from '@/types/content'

/**
 * Initial portfolio content.
 *
 * This is the single place the public site reads its copy from until the
 * backend serves published content. Nothing here is hard-wired into a
 * component. Values that are not known yet (URLs, username, resume, public
 * email) are deliberately null rather than invented.
 */
export const defaultContent: PortfolioContent = {
  profile: {
    fullName: 'Paridarshan Sahoo',
    preferredName: 'Darshan',
    title: 'Software Developer | Java Backend Developer',
    location: 'India',
    photoUrl: '/images/profile-placeholder.svg',
    photoAlt: 'Placeholder portrait for Darshan',
    resumeUrl: null,
    email: null,
    availability: {
      available: true,
      label: 'Available for new opportunities',
    },
  },

  navigation: [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'journey', label: 'Journey' },
    { id: 'education', label: 'Education' },
    { id: 'github', label: 'GitHub' },
    { id: 'contact', label: 'Contact' },
  ],

  hero: {
    greeting: "Hi, I'm Darshan",
    role: 'Software Developer',
    tagline: 'Building scalable backend systems and meaningful digital experiences.',
    primaryCta: { label: 'Get in Touch', href: '#contact' },
    secondaryCta: { label: 'Explore Projects', href: '#projects' },
    resumeLabel: 'Download Resume',
    focusLabel: 'Focused on',
    focusAreas: [
      'Java Backend Development',
      'Spring Boot',
      'REST API Development',
      'Database Management',
      'Software Engineering',
      'Data Structures and Algorithms',
      'Distributed Systems',
    ],
  },

  about: {
    eyebrow: 'About Me',
    heading: 'A developer who enjoys the parts you rarely see',
    paragraphs: [
      "I'm Paridarshan Sahoo — Darshan to most people — a software developer based in India with a focus on Java backend development.",
      "I'm completing a B.Tech in Computer Science and Engineering (Data Science), graduating in 2026. My interests sit where careful software engineering meets systems that need to scale: Spring Boot services, REST APIs, database design, data structures and algorithms, and distributed systems.",
    ],
    facts: [
      { id: 'fact-location', label: 'Based in', value: 'India' },
      { id: 'fact-focus', label: 'Focus', value: 'Java Backend' },
      { id: 'fact-degree', label: 'Degree', value: 'B.Tech CSE (Data Science)' },
      { id: 'fact-graduation', label: 'Graduating', value: '2026' },
    ],
    approachHeading: "Here's how I work",
    approach: [
      {
        id: 'approach-1',
        step: '01',
        title: 'Understand',
        description: 'Start with the problem and the data behind it before writing any code.',
      },
      {
        id: 'approach-2',
        step: '02',
        title: 'Build',
        description: 'Shape clear APIs and a data model that stay easy to reason about.',
      },
      {
        id: 'approach-3',
        step: '03',
        title: 'Refine',
        description: 'Test, measure and tidy until the system is dependable.',
      },
    ],
  },

  skills: {
    eyebrow: 'Technical Skills',
    heading: 'The tools I reach for',
    intro: 'A backend-first toolkit, grounded in computer science fundamentals.',
    groups: [
      {
        id: 'skills-languages',
        title: 'Languages',
        icon: 'code',
        description: 'Where most of my work starts.',
        skills: [
          { id: 'skill-java', name: 'Java' },
          { id: 'skill-sql', name: 'SQL' },
        ],
        order: 1,
      },
      {
        id: 'skills-backend',
        title: 'Backend',
        icon: 'server',
        description: 'Services and APIs.',
        skills: [
          { id: 'skill-spring-boot', name: 'Spring Boot' },
          { id: 'skill-rest', name: 'REST API Development' },
        ],
        order: 2,
      },
      {
        id: 'skills-data',
        title: 'Data',
        icon: 'database',
        description: 'Storing and modelling information.',
        skills: [
          { id: 'skill-db', name: 'Database Management' },
          { id: 'skill-postgres', name: 'PostgreSQL' },
        ],
        order: 3,
      },
      {
        id: 'skills-foundations',
        title: 'Foundations',
        icon: 'network',
        description: 'The ideas underneath the frameworks.',
        skills: [
          { id: 'skill-dsa', name: 'Data Structures and Algorithms' },
          { id: 'skill-distributed', name: 'Distributed Systems' },
          { id: 'skill-se', name: 'Software Engineering' },
        ],
        order: 4,
      },
    ],
  },

  projects: {
    eyebrow: 'Featured Projects',
    heading: 'Selected Works',
    intro: 'Projects I am building to explore backend systems, data and real-world problems.',
    items: [
      {
        id: 'project-document-management',
        name: 'Secure Digital Document Management System',
        summary: 'Secure storage, controlled access and organised retrieval for digital documents.',
        description:
          'A document management system centred on keeping digital documents safe, organised and available only to the people who should see them.',
        highlights: [
          'Secure document storage and retrieval',
          'Access control for who can view and manage documents',
          'Organised structure for finding documents quickly',
        ],
        tags: ['Document Management', 'Access Control', 'Security'],
        imageUrl: '/images/projects/document-management.svg',
        imageAlt: 'Illustrative interface mock-up of a document management dashboard',
        status: 'in-development',
        repoUrl: null,
        demoUrl: null,
        featured: true,
        order: 1,
      },
      {
        id: 'project-transport-eta',
        name: 'Real-Time Public Transport ETA and Smart Ticketing System',
        summary: 'Live arrival estimates for public transport, paired with digital ticketing.',
        description:
          'A system that brings real-time arrival estimates and smart ticketing together, so a journey can be planned and paid for in one place.',
        highlights: [
          'Real-time estimated arrival times',
          'Digital, smart ticketing',
          'A single flow for planning and paying for a trip',
        ],
        tags: ['Real-Time Data', 'ETA', 'Smart Ticketing'],
        imageUrl: '/images/projects/transport-eta.svg',
        imageAlt: 'Illustrative interface mock-up of a transport arrival and ticketing app',
        status: 'in-development',
        repoUrl: null,
        demoUrl: null,
        featured: false,
        order: 2,
      },
      {
        id: 'project-ratha-yatra',
        name: 'Ratha Yatra Donation Management Application',
        summary: 'Recording and managing donations for the Ratha Yatra festival.',
        description:
          'An application for recording, tracking and managing donations made around the Ratha Yatra festival.',
        highlights: [
          'Recording of individual donations',
          'Tracking of donation totals',
          'Organised records for the people managing the festival',
        ],
        tags: ['Donations', 'Record Keeping', 'Management'],
        imageUrl: '/images/projects/ratha-yatra.svg',
        imageAlt: 'Illustrative interface mock-up of a donation management screen',
        status: 'in-development',
        repoUrl: null,
        demoUrl: null,
        featured: false,
        order: 3,
      },
      {
        id: 'project-reddit-sentiment',
        name: 'Reddit Sentiment Analysis',
        summary: 'Understanding the sentiment of Reddit discussions through data.',
        description:
          'A data project that analyses Reddit discussions and classifies the sentiment expressed in them.',
        highlights: [
          'Collection of Reddit discussion text',
          'Sentiment classification of posts and comments',
          'Summaries of how sentiment is distributed',
        ],
        tags: ['Sentiment Analysis', 'NLP', 'Data Science'],
        imageUrl: '/images/projects/reddit-sentiment.svg',
        imageAlt: 'Illustrative interface mock-up of a sentiment analysis chart',
        status: 'in-development',
        repoUrl: null,
        demoUrl: null,
        featured: false,
        order: 4,
      },
    ],
  },

  journey: {
    eyebrow: 'Professional Journey',
    heading: 'Where I am, and where I am heading',
    intro: 'An honest snapshot. Roles will be added here as the journey grows.',
    entries: [
      {
        id: 'journey-now',
        period: 'Now',
        title: 'Building backend projects',
        organisation: null,
        description:
          'Developing projects with Java and Spring Boot while completing my B.Tech in Computer Science and Engineering (Data Science).',
        order: 1,
      },
      {
        id: 'journey-next',
        period: 'Next',
        title: 'Software Developer / Java Backend Developer roles',
        organisation: null,
        description:
          'Looking for a team where I can contribute to backend systems and keep growing as an engineer.',
        order: 2,
      },
    ],
  },

  education: {
    eyebrow: 'Education',
    heading: 'Academic foundation',
    entries: [
      {
        id: 'education-btech',
        degree: 'Bachelor of Technology (B.Tech)',
        field: 'Computer Science and Engineering (Data Science)',
        institution: null,
        period: 'Graduating 2026',
        description:
          'Studying computer science with a specialisation in data science, alongside a personal focus on backend engineering.',
        order: 1,
      },
    ],
  },

  github: {
    eyebrow: 'GitHub Activity',
    heading: 'Code in the open',
    intro: 'Recent public repositories, straight from GitHub.',
    username: null,
    emptyMessage: 'My GitHub profile will be linked here soon.',
  },

  contact: {
    eyebrow: 'Contact',
    heading: "Let's Make It Happen",
    intro:
      'Always open to new opportunities, collaborations and interesting problems. Send a message and I will get back to you.',
    formHeading: 'Send a message',
    submitLabel: 'Send Message',
  },

  socialLinks: [
    { id: 'social-github', platform: 'github', label: 'GitHub', url: null },
    { id: 'social-linkedin', platform: 'linkedin', label: 'LinkedIn', url: null },
    { id: 'social-email', platform: 'email', label: 'Email', url: null },
  ],

  footer: {
    copyright: '© 2026 Paridarshan Sahoo. All rights reserved.',
    loginLabel: 'Login',
    loginHref: '/admin/login',
    note: 'Designed and built with care.',
  },
}
