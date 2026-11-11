import { Project, BlogPost, ServiceStage, QuranReminder } from '@/types';
import chipsDataRaw from '@/replean/design/target-chips.json';

export const featuredProjects: Project[] = [
  {
    slug: 'unbraid',
    title: 'unbraid',
    description: 'An open source CLI and VS Code extension that untangles a messy working tree into clean, atomic commits with AI-written messages, and lets you review every group before anything is committed.',
    stacks: ['TypeScript', 'Node.js', 'Git', 'Claude'],
    color: '#3b82f6',
    year: 2026,
    client: 'Personal project',
    featured: true,
    services: ['Open Source', 'Developer Tooling', 'AI Integration'],
    deliverables: ['npm CLI', 'VS Code Extension', 'Open VSX Extension', 'Documentation'],
  },
  {
    slug: 'clawhome',
    title: 'ClawHome',
    description: 'A self-hosted, all-in-one personal dashboard running on a Mac Mini that brings together smart home control, personal finance tracking, system monitoring, AI-powered conversation, automation, and spiritual routines into a single, unified interface.',
    stacks: ['Next.js', 'React', 'TypeScript', 'Python'],
    color: '#8b5cf6',
    year: 2026,
    client: 'Personal project',
    featured: true,
  },
  {
    slug: 'workmates',
    title: 'WorkMates',
    description: 'WorkMates connects remote workers and digital nomads, helping you to find and create co-working sessions at cafes and public spaces. Build meaningful connections with like-minded professionals and grow your remote work community wherever you are.',
    stacks: ['Next.js', 'React.js', 'Firebase', 'NextAuth'],
    color: '#10b981',
    year: 2025,
    client: 'Personal project',
    featured: true,
  },
  {
    slug: 'aulianza-com',
    title: 'aulianza.com',
    description: 'Personal website built with Next.js 16 App Router, TypeScript and Tailwind CSS.',
    stacks: ['Next.js', 'React.js', 'TypeScript', 'TailwindCSS'],
    color: '#2f45ff',
    year: 2023,
    client: 'Personal project',
    featured: true,
  },
  {
    slug: 'pomoro',
    title: 'Pomoro',
    description: 'Simple Pomodoro and Todo List App built with Next.js, TS, Tailwind CSS and Zustand.',
    stacks: ['Next.js', 'React.js', 'TypeScript', 'TailwindCSS'],
    color: '#f59e0b',
    year: 2023,
    client: 'Personal project',
    featured: true,
  },
  {
    slug: 'aulianza-next-tailwind-starter',
    title: 'Next + Tailwind Starter Template',
    description: 'Next.js + TS + Tailwind CSS starter template packed with useful development features.',
    stacks: ['Next.js', 'React.js', 'TypeScript', 'TailwindCSS'],
    color: '#06b6d4',
    year: 2023,
    client: 'Personal project',
    featured: true,
  },
];

export const servicesData: ServiceStage[] = [
  {
    id: 'services-01',
    stepNumber: '01',
    title: 'AI products and agents',
    badge: 'AGENTS',
    description: 'Agents that plan, call tools and finish real tasks. I build the agent loop, tool calling, RAG, the chat UI and the evals that keep it reliable.',
    builtWith: ['Claude', 'OpenAI', 'RAG'],
  },
  {
    id: 'services-02',
    stepNumber: '02',
    title: 'Full-stack AI apps',
    badge: 'STACK',
    description: 'The whole stack behind an AI feature: APIs, databases, auth, streaming responses, vector search and deploys.',
    builtWith: ['Node.js', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'services-03',
    stepNumber: '03',
    title: 'Web platforms',
    badge: 'WEB',
    description: 'Fast, accessible web apps and platforms, from marketing sites to complex dashboards. Clean state, quick loads and code the next engineer can read.',
    builtWith: ['React', 'Next.js', 'TypeScript'],
  },
  {
    id: 'services-04',
    stepNumber: '04',
    title: 'Mobile apps',
    badge: 'MOBILE',
    description: 'iOS and Android apps from one React Native codebase, with native feel, offline support and smooth gestures.',
    builtWith: ['React Native', 'Expo'],
  },
  {
    id: 'services-05',
    stepNumber: '05',
    title: 'Interfaces and motion',
    badge: 'MOTION',
    description: 'Design systems, reusable components and animation that make a product feel alive, without making it slow.',
    builtWith: ['Tailwind CSS', 'Framer Motion', 'GSAP'],
  },
  {
    id: 'services-06',
    stepNumber: '06',
    title: 'Integrations',
    badge: 'CONNECT',
    description: 'Connect products to the tools they need: payments, third-party APIs, webhooks, MCP servers and automated workflows.',
    builtWith: ['MCP', 'REST', 'GraphQL', 'n8n'],
  },
];

export const quranReminders: QuranReminder[] = [
  {
    id: 1,
    arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'So surely with hardship comes ease. Surely with hardship comes ease.',
    reference: 'Quran, Ash-Sharh 94:5–6',
    index: '01 / 10',
  },
  {
    id: 2,
    arabicText: 'وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا',
    translation: 'And put your trust in Allah; and sufficient is Allah as an Entruster of affairs.',
    reference: 'Quran, Al-Ahzab 33:3',
    index: '02 / 10',
  },
  {
    id: 3,
    arabicText: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not charge a soul except with that within its capacity.',
    reference: 'Quran, Al-Baqarah 2:286',
    index: '03 / 10',
  },
];

export const allBlogPosts: BlogPost[] = [
  {
    slug: 'how-i-set-up-9router-with-claude-code-for-seamless-ai-coding-across-devices',
    title: 'How I Set Up 9router with Claude Code for Seamless AI Coding Across Devices',
    excerpt: 'I code on multiple machines. A Mac Mini that sits at home running 24/7, a MacBook Pro that travels with me everywhere, and occasionally a Windows PC. Each one needs access to AI…',
    date: '11 Jun 2026',
    readTime: '5 min read',
    views: 110,
    topics: ['AI', 'Claude Code', '9router', 'DevOps'],
    coverImage: '/images/blog/how-i-set-up-9router-with-claude-code-for-seamless-ai-coding-across-devices.webp',
    featured: true,
  },
  {
    slug: 'how-to-get-markdown-response-from-wordpress-api',
    title: 'How to Get Markdown Response from WordPress API',
    excerpt: 'Integrating Markdown functionality into WordPress can significantly enhance your content creation experience, offering a more streamlined and efficient way to write and format…',
    date: '15 Mar 2024',
    readTime: '2 min read',
    views: 2069,
    topics: ['WordPress', 'API', 'Markdown'],
    coverImage: '/images/blog/how-to-get-markdown-response-from-wordpress-api.webp',
  },
  {
    slug: 'web-storage-localstorage-sessionstorage-and-cookies',
    title: 'Web Storage: localStorage, sessionStorage, and Cookies',
    excerpt: 'When it comes to building cool stuff on the web, managing data is like having superpowers. There are three cool tools - localStorage, sessionStorage, and cookies - that help web…',
    date: '13 Nov 2023',
    readTime: '2 min read',
    views: 1300,
    topics: ['Article', 'Web', 'Storage'],
    coverImage: '/images/blog/web-storage-localstorage-sessionstorage-and-cookies.webp',
  },
  {
    slug: 'react-with-typescript-10-pro-tips-to-supercharge-your-code',
    title: 'React with TypeScript: 10 Pro Tips to Supercharge Your Code',
    excerpt: 'React and TypeScript are a powerful combination for building robust and scalable web applications. While React provides a flexible and efficient UI development framework,…',
    date: '23 Jun 2023',
    readTime: '3 min read',
    views: 1089,
    topics: ['React', 'TypeScript', 'Tips & Tricks'],
    coverImage: '/images/blog/react-with-typescript-10-pro-tips-to-supercharge-your-code.webp',
  },
  {
    slug: '10-tricks-to-write-super-clean-code-in-typescript',
    title: '10 Tricks to Write Super Clean Code in TypeScript',
    excerpt: 'Writing clean and maintainable code is essential for any developer, regardless of their level of expertise. Clean code improves readability, enhances collaboration, and makes…',
    date: '22 Jun 2023',
    readTime: '1 min read',
    views: 887,
    topics: ['TypeScript', 'Clean Code', 'Tips & Tricks'],
    coverImage: '/images/blog/10-tricks-to-write-super-clean-code-in-typescript.webp',
  },
  {
    slug: 'data-fetching-in-nextjs-choosing-the-right-method-for-optimal-performance',
    title: 'Next.js Data Fetching: Optimize Performance with the Right Method',
    excerpt: 'Next.js, a popular React framework, provides powerful features for building server-rendered and statically generated web applications. One crucial aspect of web development is…',
    date: '6 Jun 2023',
    readTime: '3 min read',
    views: 474,
    topics: ['Next.js', 'Web'],
    coverImage: '/images/blog/data-fetching-in-nextjs-choosing-the-right-method-for-optimal-performance.webp',
  },
  {
    slug: 'introduction-to-nextjs-building-modern-web-applications',
    title: 'Introduction to Next.js: Building Modern Web App',
    excerpt: 'In recent years, web development has undergone a significant transformation, with a shift towards building dynamic and interactive applications. With the rise of Single-Page…',
    date: '5 Jun 2023',
    readTime: '3 min read',
    views: 376,
    topics: ['next.js', 'Web'],
    coverImage: '/images/blog/introduction-to-nextjs-building-modern-web-applications.webp',
  },
];

export const recentPosts: BlogPost[] = allBlogPosts.slice(0, 3);

const aiTools = new Set(['Claude', 'OpenAI', 'Gemini', 'LangChain', 'Hugging Face', 'Ollama', 'Vercel AI SDK', 'MCP', 'RAG', 'Cursor', 'Windsurf', 'Copilot', 'v0', 'Bolt', 'Replit']);
const feTools = new Set(['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Vue', 'Nuxt', 'Vite', 'Redux', 'Zustand', 'TanStack Query', 'SWR', 'Framer Motion', 'GSAP', 'Three.js', 'shadcn/ui', 'Radix UI', 'HTML5', 'CSS3', 'Sass']);
const mobileTools = new Set(['React Native', 'Expo', 'PWA', 'Flutter', 'Swift', 'Kotlin']);
const beTools = new Set(['Node.js', 'Bun', 'Express', 'NestJS', 'PostgreSQL', 'MySQL', 'Redis', 'Prisma', 'Drizzle', 'Supabase', 'Firebase', 'GraphQL', 'REST']);

export const techChipsAll = chipsDataRaw.map((chip, i) => {
  let category = 'Tooling';
  if (aiTools.has(chip.name)) category = 'AI';
  else if (feTools.has(chip.name)) category = 'Frontend';
  else if (mobileTools.has(chip.name)) category = 'Mobile';
  else if (beTools.has(chip.name)) category = 'Backend';

  return {
    id: i,
    name: chip.name,
    category,
    bg: chip.bg,
    color: chip.color,
  };
});

export const marqueeKeywords = [
  'AI Agents', 'React', 'Next.js', 'LLMs', 'TypeScript',
  'React Native', 'MCP', 'Tailwind CSS', 'Node.js', 'RAG',
  'GraphQL', 'PostgreSQL', 'Framer Motion', 'GSAP', 'Vue', 'Docker'
];
