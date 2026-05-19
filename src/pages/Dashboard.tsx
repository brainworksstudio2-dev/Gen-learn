import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, FileText, Activity, TrendingUp, Calendar, Map, CheckCircle2, Clock, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { getRoadmap, getAssignments } from '@/services/dataService';
import { RoadmapItem, Assignment } from '@/types';

import { CalendarPanel } from '@/components/CalendarPanel';

export function Dashboard() {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      return localStorage.getItem('admin_selected_gen') || 'all';
    }
    return user.gen;
  });

  useEffect(() => {
    const handleGenChange = (e: any) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        setSelectedGen(e.detail);
      }
    };
    window.addEventListener('admin_gen_changed', handleGenChange);
    return () => window.removeEventListener('admin_gen_changed', handleGenChange);
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const genFilter = selectedGen === 'all' ? undefined : selectedGen;
        const [roadmapData, assignmentsData] = await Promise.all([
          getRoadmap(),
          getAssignments(genFilter)
        ]);
        
        let filteredRoadmap = roadmapData;
        if (genFilter) {
          filteredRoadmap = roadmapData.filter(r => r.gen === genFilter);
        }
        
        setRoadmap(filteredRoadmap.slice(0, 3)); 
        setAssignments(assignmentsData.slice(0, 2));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGen]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4 bg-white rounded-5xl border border-slate-100">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Syncing Your Progress...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-6 h-full min-h-[800px]">
      
      {/* GPA Card - The "Hero" of the Bento */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="col-span-12 lg:col-span-4 row-span-2 bg-indigo-600 rounded-5xl p-8 text-white flex flex-col justify-between shadow-2xl shadow-indigo-200 relative overflow-hidden"
      >
        <div className="relative z-10">
          <h3 className="text-indigo-100 text-sm font-bold uppercase tracking-widest">Cumulative GPA</h3>
          <p className="text-7xl font-black mt-4">3.84</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight backdrop-blur-md">
            Academic Status: <span className="text-white">A+</span>
          </div>
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Top 15% of Cohort</div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-400 flex items-center justify-center text-xl font-black shadow-lg">82%</div>
        </div>
        {/* Abstract background shapes */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-indigo-700/30 rounded-full blur-2xl"></div>
      </motion.div>

      {/* Google Calendar / Live Sessions Integration */}
      <CalendarPanel />

      {/* Roadmap Card */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-12 lg:col-span-7 row-span-4 bg-white border border-slate-200 rounded-5xl p-10 shadow-sm relative overflow-hidden group"
      >
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                <Map className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black text-2xl text-slate-900 uppercase italic tracking-tighter">Roadmap</h3>
            </div>
            <p className="text-sm text-slate-500 font-medium">Software Engineering Pathway • <span className="text-indigo-600 font-bold">{selectedGen === 'all' ? 'All Cohorts' : selectedGen}</span></p>
          </div>
          <Link to="/roadmap" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group-hover:translate-x-1">
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </Link>
        </div>

        <div className="space-y-8 relative">
          {roadmap.length > 0 ? roadmap.map((item, i) => (
            <div key={item.id} className="flex gap-6 relative">
              <div className="w-12 flex flex-col items-center shrink-0">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform duration-300",
                  item.week < 3 ? "bg-emerald-100 text-emerald-600" : 
                  item.week === 3 ? "bg-indigo-600 text-white scale-110 shadow-indigo-200" : 
                  "bg-slate-100 text-slate-400"
                )}>
                  0{i + 1}
                </div>
                {i < roadmap.length - 1 && <div className="w-1 h-12 bg-slate-100 mt-2 rounded-full" />}
              </div>
              <div className="flex-1 pt-1">
                <h4 className={cn(
                  "font-black text-lg tracking-tight",
                  item.week > 3 ? "text-slate-300" : "text-slate-900"
                )}>
                  {item.topic}
                </h4>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  item.week === 3 ? "text-indigo-600" : "text-slate-400"
                )}>
                  {item.topic}
                </p>
                {item.project && (
                   <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1 italic line-clamp-1">Deliverable: {item.project}</p>
                )}
              </div>
            </div>
          )) : (
            <div className="py-10 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Active Modules</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Assignments Card */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="col-span-12 lg:col-span-5 row-span-3 bg-white border border-slate-200 rounded-5xl p-8 shadow-sm flex flex-col"
      >
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange-50 rounded-xl"><FileText className="w-5 h-5 text-orange-500" /></div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight">Pending Work</h3>
        </div>
        <div className="space-y-4 flex-1">
          {assignments.length > 0 ? assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-4 rounded-[28px] bg-slate-50 border border-slate-100 group hover:border-slate-300 transition-all cursor-pointer">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <TrendingUp size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{assignment.title}</p>
                  <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-0.5">Due {new Date(assignment.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <Link to="/assignments" className="p-2 hover:bg-white rounded-xl transition-colors">
                 <ChevronRight size={18} />
              </Link>
            </div>
          )) : (
            <div className="py-10 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Pending Assignments</p>
            </div>
          )}
        </div>
        <Button asChild className="w-full mt-6 h-12 rounded-2xl bg-slate-900 hover:bg-black font-black uppercase tracking-tight shadow-xl shadow-slate-100">
           <Link to="/assignments">View All Tasks</Link>
        </Button>
      </motion.div>

      {/* Fast Stats Row */}
      <div className="col-span-12 lg:col-span-5 row-span-1 grid grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900 rounded-[32px] p-6 flex flex-col justify-between"
        >
           <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Attendance</p>
           <div className="flex items-center justify-between mt-2">
             <p className="text-2xl font-black text-white">94%</p>
             <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin-slow"></div>
           </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col justify-between group overflow-hidden relative"
        >
           <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest relative z-10">Exercises</p>
           <div className="flex items-center justify-between mt-2 relative z-10">
             <p className="text-2xl font-black text-slate-900">12/15</p>
             <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:scale-110 transition-transform">
               Active
             </div>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity size={80} />
           </div>
        </motion.div>
      </div>

    </div>
  );
}
