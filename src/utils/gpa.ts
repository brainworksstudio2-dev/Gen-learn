import { Attendance, Submission } from '@/types';

export const GRADE_SCALE = [
  { min: 80, max: 100, grade: 'A', gpa: 4.0 },
  { min: 75, max: 79, grade: 'B+', gpa: 3.5 },
  { min: 70, max: 74, grade: 'B', gpa: 3.0 },
  { min: 65, max: 69, grade: 'C+', gpa: 2.5 },
  { min: 60, max: 64, grade: 'C', gpa: 2.0 },
  { min: 50, max: 59, grade: 'D', gpa: 1.0 },
  { min: 0, max: 49, grade: 'F', gpa: 0.0 },
];

export function calculateGPA(
  submissions: Submission[],
  exercises: Submission[],
  attendance: Attendance[]
) {
  // Assignments = 40%
  // Exercises = 30%
  // Attendance = 30%

  const avgSubmissions = submissions.length > 0
    ? (submissions.reduce((acc, s) => acc + (s.score || 0), 0) / (submissions.length * 100)) * 100
    : 0;
  
  const avgExercises = exercises.length > 0
    ? (exercises.reduce((acc, e) => acc + (e.score || 0), 0) / (exercises.length * 100)) * 100
    : 0;

  const avgAttendance = attendance.length > 0
    ? attendance.reduce((acc, a) => acc + a.score, 0) / attendance.length
    : 0;

  const finalScore = (avgSubmissions * 0.4) + (avgExercises * 0.3) + (avgAttendance * 0.3);

  const gradeInfo = GRADE_SCALE.find(g => Math.round(finalScore) >= g.min) || GRADE_SCALE[GRADE_SCALE.length - 1];

  return {
    finalScore: Math.round(finalScore * 10) / 10,
    grade: gradeInfo.grade,
    gpa: gradeInfo.gpa,
    breakdown: {
      assignments: Math.round(avgSubmissions * 10) / 10,
      exercises: Math.round(avgExercises * 10) / 10,
      attendance: Math.round(avgAttendance * 10) / 10
    }
  };
}
