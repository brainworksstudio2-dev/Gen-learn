import { RoadmapItem } from './types';

export const OFFICIAL_CURRICULUM: Omit<RoadmapItem, 'id'>[] = [
  // Phase 1: MERN Foundations (Months 1-6)
  { week: 1, module: 'Phase 1', topic: 'HTML5, CSS3, Flexbox, Grid', project: 'Responsive portfolio page', status: 'upcoming', gen: 'all' },
  { week: 3, module: 'Phase 1', topic: 'JavaScript ES6+, DOM, async/await', project: 'Interactive JS mini-app', status: 'upcoming', gen: 'all' },
  { week: 5, module: 'Phase 1', topic: 'React fundamentals, hooks, routing', project: 'Multi-page React app with API fetch', status: 'upcoming', gen: 'all' },
  { week: 8, module: 'Phase 1', topic: 'React forms, state patterns, Axios', project: 'React CRUD frontend', status: 'upcoming', gen: 'all' },
  { week: 11, module: 'Phase 1', topic: 'AI tools introduction - Cursor, Copilot', project: 'Refactor week 5-10 project using AI', status: 'upcoming', gen: 'all' },
  { week: 12, module: 'Phase 1', topic: 'Node.js, Express, REST APIs, JWT auth', project: 'Auth API with register/login', status: 'upcoming', gen: 'all' },
  { week: 15, module: 'Phase 1', topic: 'MongoDB, Mongoose, full MERN integration', project: 'Full MERN app', status: 'upcoming', gen: 'all' },
  { week: 16, module: 'Phase 1', topic: 'Data literacy: schema design critique', project: 'Redesign a broken schema', status: 'upcoming', gen: 'all' },
  { week: 18, module: 'Phase 1', topic: 'Deployment, environment config, error handling', project: 'Deploy full MERN app to production', status: 'upcoming', gen: 'all' },
  { week: 21, module: 'Phase 1', topic: 'Polish, testing basics, code quality', project: 'Milestone 1 project preparation', status: 'upcoming', gen: 'all' },
  { week: 24, module: 'Phase 1', topic: 'Milestone 1 assessment week', project: 'Live demo + Code Walkthrough', status: 'upcoming', gen: 'all' },

  // Phase 2: Advanced MERN + AI Engineering (Months 7-12)
  { week: 25, module: 'Phase 2', topic: 'TypeScript fundamentals, typed React', project: 'Refactor Phase 1 MERN app to TS', status: 'upcoming', gen: 'all' },
  { week: 28, module: 'Phase 2', topic: 'Backend architecture patterns, Jest testing', project: 'Secure Express API with service layer', status: 'upcoming', gen: 'all' },
  { week: 31, module: 'Phase 2', topic: 'LLM APIs, streaming, prompt engineering', project: 'Chatbot feature integrated into MERN', status: 'upcoming', gen: 'all' },
  { week: 33, module: 'Phase 2', topic: 'Python reading unit', project: 'Take a Python LangChain tutorial', status: 'upcoming', gen: 'all' },
  { week: 34, module: 'Phase 2', topic: 'Embeddings, vector DBs, RAG pipeline', project: 'Document Q&A system with real data', status: 'upcoming', gen: 'all' },
  { week: 37, module: 'Phase 2', topic: 'Agents, tool use, function calling', project: 'Agent with 2+ tool integrations', status: 'upcoming', gen: 'all' },
  { week: 40, module: 'Phase 2', topic: 'n8n/Make automation, workflow design', project: 'Automated business workflow', status: 'upcoming', gen: 'all' },
  { week: 43, module: 'Phase 2', topic: 'Milestone 2 project — team sprint', project: 'AI-powered product: design, build, deploy', status: 'upcoming', gen: 'all' },
  { week: 46, module: 'Phase 2', topic: 'Production hardening, monitoring', project: 'Milestone 2 project hardened', status: 'upcoming', gen: 'all' },
  { week: 48, module: 'Phase 2', topic: 'Milestone 2 assessment week', project: 'Pass: 70% overall', status: 'upcoming', gen: 'all' },

  // Phase 3: Advanced AI Systems + Production Readiness (Months 13-18)
  { week: 49, module: 'Phase 3', topic: 'Multi-agent orchestration, memory patterns', project: 'Multi-agent system design document', status: 'upcoming', gen: 'all' },
  { week: 53, module: 'Phase 3', topic: 'AI product design, UX for AI, ethics', project: 'AI product critique and redesign', status: 'upcoming', gen: 'all' },
  { week: 57, module: 'Phase 3', topic: 'Evals, monitoring, LangSmith', project: 'Eval suite for Phase 2 AI product', status: 'upcoming', gen: 'all' },
  { week: 58, module: 'Phase 3', topic: 'Data literacy: ground-truth datasets', project: 'Audit Phase 2 product for data quality', status: 'upcoming', gen: 'all' },
  { week: 61, module: 'Phase 3', topic: 'Production architecture, Redis, security', project: 'Harden Phase 2 product', status: 'upcoming', gen: 'all' },
  { week: 62, module: 'Phase 3', topic: 'Vibe coding: full system from architecture spec', project: 'Direct-to-instructor demo', status: 'upcoming', gen: 'all' },
  { week: 65, module: 'Phase 3', topic: 'Milestone 3 capstone', project: 'Production AI system (solo or pair)', status: 'upcoming', gen: 'all' },
  { week: 69, module: 'Phase 3', topic: 'Career preparation, GitHub polish', project: 'Portfolio review session', status: 'upcoming', gen: 'all' },
  { week: 71, module: 'Phase 3', topic: 'Mock technical interviews', project: 'Mock interview with external dev', status: 'upcoming', gen: 'all' },
  { week: 72, module: 'Phase 3', topic: 'Milestone 3 assessment week', project: 'Graduation Gate', status: 'upcoming', gen: 'all' },
];
