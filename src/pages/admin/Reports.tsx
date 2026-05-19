import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Filter, Users, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getAllProfiles, getAssignments, getAllSubmissions } from '@/services/dataService';
import { User, Assignment, Submission } from '@/types';

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    students: User[];
    assignments: Assignment[];
    submissions: Submission[];
  }>({ students: [], assignments: [], submissions: [] });
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');

  useEffect(() => {
    const handleGenChange = (e: any) => setSelectedGen(e.detail);
    window.addEventListener('admin_gen_changed', handleGenChange);
    return () => window.removeEventListener('admin_gen_changed', handleGenChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const genFilter = selectedGen === 'all' ? undefined : selectedGen;
        const [profiles, assignments, submissions] = await Promise.all([
          getAllProfiles(genFilter),
          getAssignments(genFilter),
          getAllSubmissions()
        ]);
        setData({ students: profiles, assignments, submissions });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGen]);

  const stats = [
    { label: 'Completion Rate', value: '84%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg. Grade', value: 'A-', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'At Risk', value: '3 Students', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Generating Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
           <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Academic Reports</h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Cohort Performance & Student Progress</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-2xl border-slate-200 font-bold gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="h-12 rounded-2xl bg-slate-900 hover:bg-black font-bold gap-2 shadow-xl shadow-slate-100">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-0 shadow-sm rounded-4xl bg-white overflow-hidden border border-slate-50">
        <CardHeader className="p-8 border-b border-slate-50">
          <CardTitle className="text-xl font-black uppercase italic">Student Status Snapshot</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tracking progress for {selectedGen === 'all' ? 'All Cohorts' : selectedGen}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Gen</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tasks Completed</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {data.students.map((student) => {
                  const completed = data.submissions.filter(s => s.student_id === student.uid).length;
                  const total = data.assignments.length;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                  
                  return (
                    <tr key={student.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.uid}`} alt="avatar" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                          {student.gen}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                           <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${percent}%` }} />
                           </div>
                           <span className="text-xs font-bold text-slate-500">{completed}/{total}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-slate-900 font-bold">92%</td>
                      <td className="px-8 py-6">
                         <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                           percent > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                         }`}>
                           {percent > 10 ? 'Healthy' : 'At Risk'}
                         </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="p-8 rounded-4xl bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Ready for your specific template?</h3>
            <p className="text-indigo-100 font-bold text-sm opacity-80 uppercase tracking-widest">The basic reporting structure is ready. Once the template is provided, we'll implement it here.</p>
         </div>
         <Button className="h-16 px-10 rounded-3xl bg-white text-indigo-600 hover:bg-slate-50 font-black uppercase tracking-tight text-lg shadow-xl shadow-indigo-900/40">
            Link Template
         </Button>
      </div>
    </div>
  );
}
