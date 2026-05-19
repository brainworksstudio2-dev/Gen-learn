import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Award, Target, BookOpen, Activity, User, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function Grades() {
  const gpaData = [
    { name: 'Assignments', value: 40, score: 92, color: '#4F46E5' },
    { name: 'Exercises', value: 30, score: 85, color: '#10B981' },
    { name: 'Attendance', value: 30, score: 100, color: '#F59E0B' },
  ];

  const historyData = [
    { name: 'W1', score: 85 },
    { name: 'W2', score: 88 },
    { name: 'W3', score: 92 },
    { name: 'W4', score: 90 },
    { name: 'W5', score: 95 },
  ];

  return (
    <div className="space-y-8">
      {/* GPA Large Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-sm rounded-3xl bg-slate-900 text-white p-8 overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Current GPA</p>
            <h2 className="text-7xl font-black tracking-tight mb-4">4.0</h2>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
              <ChevronUp size={14} /> 5% from last month
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Final Score</span>
                <span className="text-xl font-black">92.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Credits</span>
                <span className="text-xl font-black">12.0</span>
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
              <BarChart data={gpaData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={32}>
                  {gpaData.map((entry, index) => (
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
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Bar dataKey="score" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
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
