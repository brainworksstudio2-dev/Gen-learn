import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, FileText, Activity, TrendingUp, UserPlus, FilePlus, Calendar, Map, Award, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CalendarPanel } from '@/components/CalendarPanel';
import { getAllProfiles, getMaterials, getAllSubmissions, getAssignments } from '@/services/dataService';
import { formatDistanceToNow } from 'date-fns';

export function AdminDashboard() {
  const [counts, setCounts] = useState({ students: 0, materials: 0, submissions: 0 });
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    const handleGenChange = (e: any) => setSelectedGen(e.detail);
    window.addEventListener('admin_gen_changed', handleGenChange);
    return () => window.removeEventListener('admin_gen_changed', handleGenChange);
  }, []);
  
  useEffect(() => {
    const fetchCounts = async () => {
      setLoadingSubs(true);
      try {
        const genFilter = selectedGen === 'all' ? undefined : selectedGen;
        const [profiles, materials, submissions, assignments] = await Promise.all([
          getAllProfiles(genFilter),
          getMaterials(genFilter),
          getAllSubmissions(),
          getAssignments(genFilter)
        ]);

        let filteredSubmissions = submissions;
        
        setCounts({
          students: profiles.length,
          materials: materials.length,
          submissions: filteredSubmissions.length
        });

        const mappedSubs = filteredSubmissions.slice(0, 5).map(sub => {
          const student = profiles.find(p => p.id === sub.student_id);
          const assignment = assignments.find(a => a.id === sub.assignment_id);
          return {
            id: sub.id,
            name: student ? student.name : 'Unknown Student',
            gen: student ? student.gen : 'Unknown',
            task: assignment ? assignment.title : 'Unknown Assignment',
            time: sub.submitted_at ? formatDistanceToNow(new Date(sub.submitted_at), { addSuffix: true }) : 'Unknown time',
            status: sub.status,
            link: sub.link
          };
        });
        setRecentSubmissions(mappedSubs);

      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSubs(false);
      }
    };
    fetchCounts();
  }, [selectedGen]);

  const stats = [
    { label: 'Total Students', value: counts.students.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Learning Assets', value: counts.materials.toString(), icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Work Submitted', value: counts.submissions.toString(), icon: FilePlus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg Performance', value: '88%', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic">Admin Overview</h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Manage your students and curriculum</p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-slate-900 hover:bg-black font-bold h-12 rounded-xl px-6">
            <UserPlus className="w-5 h-5 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-xl transition-all rounded-[32px] overflow-hidden group p-6 bg-white">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={cn("p-4 rounded-3xl transition-transform duration-300 group-hover:rotate-12", stat.bg)}>
                  <stat.icon className={cn("w-10 h-10", stat.color)} />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Calendar Panel Integrated */}
        <CalendarPanel />

        {/* Quick Actions moved to side or bottom */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
          {[
            { label: 'Upload Material', icon: BookOpen, color: 'bg-blue-500', href: '/admin/materials' },
            { label: 'New Assignment', icon: FileText, color: 'bg-emerald-500', href: '/admin/assignments' },
            { label: 'Performance', icon: TrendingUp, color: 'bg-indigo-500', href: '/admin/performance' },
            { label: 'Roadmap', icon: Map, color: 'bg-slate-900', href: '/admin/roadmap' },
          ].map((action, i) => (
            <Link key={i} to={action.href}>
              <Card className="border-0 shadow-sm hover:shadow-xl transition-all rounded-3xl h-full flex items-center justify-center p-4 bg-white group cursor-pointer text-center">
                <div className="space-y-2">
                  <div className={cn("mx-auto w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110", action.color)}>
                    <action.icon size={24} />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{action.label}</h4>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <Card className="border-0 shadow-sm rounded-[40px] p-8 bg-white">
          <CardHeader className="px-0 pt-0 mb-6">
             <CardTitle className="text-xl font-black text-slate-900 uppercase">Recent Submissions</CardTitle>
             <CardDescription className="text-slate-500 font-bold text-sm">Review recently submitted assignments</CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {loadingSubs ? (
               <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-600" /></div>
            ) : recentSubmissions.length === 0 ? (
               <p className="text-center text-slate-500 font-medium py-4">No recent submissions found.</p>
            ) : (
              recentSubmissions.map((sub, i) => (
                <div key={sub.id || i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.name}`} alt="avatar" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{sub.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{sub.task} • {sub.gen} • {sub.time}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-lg px-4 h-9"
                    onClick={() => {
                      if (sub.link) window.open(sub.link, '_blank');
                    }}
                  >
                    Review
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
