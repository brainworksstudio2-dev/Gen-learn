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
  earnedAssignments: number,
  expectedAssignments: number,
  earnedExercises: number,
  expectedExercises: number,
  earnedAttendance: number,
  expectedAttendance: number
) {
  // Simple 1-point system:
  // Final Score = (Total Earned Points) / (Total Expected Points) * 100
  
  const totalEarned = earnedAssignments + earnedExercises + earnedAttendance;
  const totalExpected = expectedAssignments + expectedExercises + expectedAttendance;

  let finalScore = 0;
  if (totalExpected > 0) {
    finalScore = (totalEarned / totalExpected) * 100;
  }

  const gradeInfo = GRADE_SCALE.find(g => Math.round(finalScore) >= g.min) || GRADE_SCALE[GRADE_SCALE.length - 1];

  return {
    finalScore: Math.round(finalScore * 10) / 10,
    grade: gradeInfo.grade,
    gpa: gradeInfo.gpa,
    totalEarned,
    totalExpected,
    breakdown: {
      assignments: { earned: earnedAssignments, expected: expectedAssignments },
      exercises: { earned: earnedExercises, expected: expectedExercises },
      attendance: { earned: earnedAttendance, expected: expectedAttendance }
    }
  };
}
