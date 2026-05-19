import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Map, ChevronRight, Loader2, BookOpen, FileText, Trophy } from 'lucide-react';
import { motion } from "motion/react";
import { RoadmapItem, Assignment } from '@/types';
import { getRoadmap, getAssignments } from '@/services/dataService';
import { cn } from '@/lib/utils';

export function Roadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roadmapData, assignmentsData] = await Promise.all([
          getRoadmap(user.gen),
          getAssignments()
        ]);
        setRoadmap(roadmapData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Failed to fetch journey data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const modules = Array.from(new Set(roadmap.map(item => item.module)));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Journey...</p>
      </div>
    );
  }

  if (roadmap.length === 0) {
    return (
      <div className="text-center py-32">
        <Map className="w-20 h-20 text-slate-100 mx-auto mb-6" />
        <h3 className="text-2xl font-black text-slate-300 uppercase italic">Journey Awaits</h3>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-2">No roadmap modules have been published yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-10 px-4">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-200 mb-8 rotate-3">
          <Map className="text-white w-10 h-10 -rotate-3" />
        </div>
        <h2 className="text-5xl font-black tracking-tight text-slate-900 uppercase italic">Learning Journey</h2>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.3em] max-w-lg mx-auto">
          The path to mastery starts here
        </p>
      </div>

      <div className="space-y-24">
        {modules.map((moduleName, moduleIdx) => (
          <section key={moduleName} className="relative">
            <div className="flex items-center gap-6 mb-12">
              <div className="h-px bg-slate-200 flex-1" />
              <div className="px-8 py-3 bg-white border-2 border-slate-900 rounded-[20px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  Module {moduleIdx + 1}: {moduleName}
                </h3>
              </div>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roadmap.filter(item => item.module === moduleName).map((item, i) => {
                const isCompleted = item.status === 'completed';
                const isCurrent = item.status === 'current';
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="h-full"
                  >
                    <Card className={cn(
                      "h-full border-0 shadow-lg p-8 rounded-[40px] transition-all duration-500 flex flex-col group relative overflow-hidden",
                      isCurrent 
                        ? "bg-slate-900 text-white shadow-2xl shadow-slate-200 -translate-y-2" 
                        : isCompleted 
                        ? "bg-white text-slate-900 border border-slate-100 opacity-80" 
                        : "bg-slate-50 text-slate-900 border border-slate-100"
                    )}>
                      {isCurrent && (
                        <div className="absolute top-0 right-0 p-4">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm",
                          isCurrent ? "bg-indigo-600 text-white" : isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-400"
                        )}>
                          W{item.week}
                        </div>
                        {isCompleted && (
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                             <CheckCircle2 className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <h4 className="text-xl font-black mb-4 uppercase tracking-tight italic">
                        {item.topic}
                      </h4>
                      
                      {item.project && (
                        <div className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2",
                          isCurrent ? "text-indigo-400" : "text-indigo-600"
                        )}>
                          <Trophy className="w-3.5 h-3.5" />
                          Deliverable: {item.project}
                        </div>
                      )}
                      
                      <p className={cn(
                        "text-sm font-medium leading-relaxed italic mt-auto mb-6",
                        isCurrent ? "text-slate-400" : "text-slate-500"
                      )}>
                        {item.topic}
                      </p>

                      <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                        <Link 
                          to={`/materials?module=${item.module}`}
                          className={cn(
                            "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors",
                            isCurrent ? "text-white" : "text-slate-400"
                          )}
                        >
                          <BookOpen className="w-4 h-4" />
                          Materials
                        </Link>
                        <Link 
                          to={`/assignments?module=${item.module}`}
                          className={cn(
                            "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors",
                            isCurrent ? "text-white" : "text-slate-400"
                          )}
                        >
                          <FileText className="w-4 h-4" />
                          {assignments.filter(a => a.moduleId === item.id || (a.module === item.module && a.gen === item.gen)).length > 0 
                            ? `${assignments.filter(a => a.moduleId === item.id || (a.module === item.module && a.gen === item.gen)).length} Tasks` 
                            : 'No Tasks'}
                        </Link>
                      </div>

                      {/* Subtle hover effect */}
                      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
