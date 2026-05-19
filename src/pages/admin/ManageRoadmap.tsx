import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Map, 
  Loader2, 
  BookOpen,
  Trophy,
  GripVertical
} from 'lucide-react';
import { getRoadmap } from '@/services/dataService';
import { RoadmapItem } from '@/types';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

export function ManageRoadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRoadmap();
      setRoadmap(data.sort((a, b) => a.week - b.week));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Curriculum...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-white rounded-4xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
             <Map size={24} />
           </div>
           <div>
             <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Standard Programme Roadmap</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{roadmap.length} Milestones defined</p>
           </div>
        </div>

        <div className="flex gap-3">
           <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-w-[140px]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Vibe Coding 2026 Ready</span>
              </div>
           </div>
        </div>
      </div>


      <div className="space-y-4">
        {roadmap.length > 0 ? (
          roadmap.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-0 shadow-sm rounded-3xl bg-white group hover:shadow-xl hover:shadow-indigo-50/30 transition-all border border-slate-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-8 flex items-center justify-center text-slate-200 group-hover:text-slate-300 transition-colors cursor-grab active:cursor-grabbing">
                       <GripVertical size={20} />
                    </div>
                    
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-900 italic border border-slate-100">
                       {item.week}
                    </div>

                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-black text-slate-900 uppercase italic truncate">{item.topic}</h4>
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-lg">
                            {item.module}
                          </Badge>
                       </div>
                       <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 text-slate-400">
                           <BookOpen size={12} className="shrink-0" />
                           <p className="text-[11px] font-bold uppercase tracking-tight truncate max-w-md">{item.topic}</p>
                         </div>
                         {item.project && (
                           <div className="flex items-center gap-1.5 text-indigo-500">
                             <Trophy size={12} className="shrink-0" />
                             <p className="text-[11px] font-black italic tracking-tight truncate max-w-md">{item.project}</p>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-[40px] border border-slate-100">
             <Map className="w-16 h-16 text-slate-100 mx-auto mb-4" />
             <h3 className="text-xl font-black text-slate-300 uppercase italic">Curriculum Syncing...</h3>
          </div>
        )}
      </div>
    </div>
  );
}
