export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gen: string;
  created_at: string;
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'slide';
  url: string;
  topic: string;
  week: number;
  gen: string;
  module?: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  deadline: string;
  gen: string;
  max_score: number;
  module?: string;
  moduleId?: string;
  week?: number;
}

export interface Submission {
  id: string;
  student_id: string;
  assignment_id: string;
  link: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  deadline: string;
  gen: string;
  max_score: number;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  gen: string;
  status: 100 | 50 | 0; // Present, Late, Absent
  score: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  day: string;
  time: string;
  gen: string;
  meetUrl?: string;
}

export interface RoadmapItem {
  id: string;
  week: number;
  module: string;
  topic: string;
  project?: string;
  status: 'completed' | 'current' | 'upcoming';
  gen: string;
}
