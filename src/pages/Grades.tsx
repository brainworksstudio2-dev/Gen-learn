import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Award, Target, BookOpen, Activity, User, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { calculateGPA } from '@/utils/gpa';
import { getSubmissionsForUser, getStudentAttendance, getAssignments, getExpectedAttendanceDates, getExercises } from '@/services/dataService';

export function Grades() {
  const [loading, setLoading] = useState(true);
  const [gpaResult, setGpaResult] = useState<any>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        // Fetch student's earned points
        const [submissions, attendanceRecords] = await Promise.all([
          getSubmissionsForUser(user.uid || user.id),
          getStudentAttendance(user.uid || user.id)
        ]);

        // Fetch total expected points for cohort
        const [assignments, expectedAtt, exercises] = await Promise.all([
          getAssignments(user.gen),
          getExpectedAttendanceDates(user.gen),
          getExercises(user.gen)
        ]);

        const earnedAssignments = submissions.length; // Actually, submissions includes exercises! But in a 1-point system they are just combined.
        const expectedAssignments = assignments.length;
        
        // Exercises are now fetched from DB
        const earnedExercises = 0; // The submission length includes both, so this is just for breakdown display. We'll leave as 0 for visual breakdown or count.
        const expectedExercises = exercises.length;

        const earnedAttendance = attendanceRecords.filter(a => a.status === 100).length + (attendanceRecords.filter(a => a.status === 50).length * 0.5);
        
        const result = calculateGPA(
          earnedAssignments, expectedAssignments,
          earnedExercises, expectedExercises,
          earnedAttendance, expectedAtt
        );

        setGpaResult(result);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  if (loading || !gpaResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Calculating Grades...</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Assignments', earned: gpaResult.breakdown.assignments.earned, expected: gpaResult.breakdown.assignments.expected, color: '#4F46E5' },
    { name: 'Exercises', earned: gpaResult.breakdown.exercises.earned, expected: gpaResult.breakdown.exercises.expected, color: '#10B981' },
    { name: 'Attendance', earned: gpaResult.breakdown.attendance.earned, expected: gpaResult.breakdown.attendance.expected, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      {/* GPA Large Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-sm rounded-3xl bg-slate-900 text-white p-8 overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Current GPA</p>
            <h2 className="text-7xl font-black tracking-tight mb-4">{gpaResult.gpa.toFixed(1)}</h2>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
               Letter Grade: {gpaResult.grade}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Final Average</span>
                <span className="text-xl font-black">{gpaResult.finalScore.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Points Earned</span>
                <span className="text-xl font-black">{gpaResult.totalEarned} / {gpaResult.totalExpected}</span>
              </div>
            </div>
          </div>
          <Award className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 pointer-events-none" />
        </Card>

        {/* Weight Breakdown */}
        <Card className="lg:col-span-2 border-0 shadow-sm rounded-3xl bg-white p-8">
          <CardHeader className="px-0 pt-0">
             <CardTitle className="text-xl font-black text-slate-900 uppercase">Weight Breakdown</CardTitle>
             <CardDescription className="text-slate-500 font-bold text-sm uppercase tracking-wide">How your final grade is calculated</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value, name, props) => [`${props.payload.earned} / ${props.payload.expected} pts`, 'Score']}
                />
                <Bar dataKey="expected" fill="#e2e8f0" radius={[0, 8, 8, 0]} barSize={32} />
                <Bar dataKey="earned" radius={[0, 8, 8, 0]} barSize={32} style={{ transform: 'translateY(-32px)' }}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border-0 shadow-sm rounded-3xl bg-white p-8">
            <CardHeader className="px-0 pt-0">
               <CardTitle className="text-xl font-black text-slate-900 uppercase">Score History</CardTitle>
               <CardDescription className="text-slate-500 font-bold text-sm uppercase tracking-wide">Progress over weeks</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-6 h-64">
               <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                  <Activity className="w-12 h-12 text-slate-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">History graph coming soon</p>
               </div>
            </CardContent>
         </Card>

         <Card className="border-0 shadow-sm rounded-3xl bg-white p-8">
            <CardHeader className="px-0 pt-0">
               <CardTitle className="text-xl font-black text-slate-900 uppercase">Grade Scale</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-4">
              <div className="space-y-3">
                {[
                  { range: '80 - 100', grade: 'A', gpa: '4.0', color: 'bg-indigo-600' },
                  { range: '75 - 79', grade: 'B+', gpa: '3.5', color: 'bg-indigo-500' },
                  { range: '70 - 74', grade: 'B', gpa: '3.0', color: 'bg-indigo-400' },
                  { range: '65 - 69', grade: 'C+', gpa: '2.5', color: 'bg-slate-400' },
                  { range: '60 - 64', grade: 'C', gpa: '2.0', color: 'bg-slate-300' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-8 rounded-full", item.color)} />
                      <span className="font-bold text-slate-900">{item.range}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-slate-900">{item.grade}</span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{item.gpa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
