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
  GripVertical,
  CheckCircle2,
  Users
} from 'lucide-react';
import { getRoadmap, updateCohortProgress } from '@/services/dataService';
import { RoadmapItem } from '@/types';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

export function ManageRoadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState<string>('GEN30');
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRoadmap(selectedGen);
      setRoadmap(data.sort((a, b) => a.week - b.week));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGen]);

  const handleUpdateProgress = async (week: number) => {
    if (selectedGen === 'all') {
      toast.error("Please select a specific cohort to update progress.");
      return;
    }
    setUpdating(week);
    try {
      await updateCohortProgress(selectedGen, week);
      toast.success(`Updated ${selectedGen} progress to Week ${week}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update progress");
    } finally {
      setUpdating(null);
    }
  };

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

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm shrink-0 w-full md:w-auto">
            <Users className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer p-0 w-full"
              value={selectedGen}
              onChange={(e) => setSelectedGen(e.target.value)}
            >
              <option value="GEN30">GEN 30</option>
              <option value="GEN31">GEN 31</option>
              <option value="GEN32">GEN 32</option>
              <option value="GEN33">GEN 33</option>
              <option value="GEN34">GEN 34</option>
            </select>
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
                          {item.status === 'current' && (
                            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase rounded-lg">
                              Current Topic
                            </Badge>
                          )}
                          {item.status === 'completed' && (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[9px] font-black uppercase rounded-lg">
                              Completed
                            </Badge>
                          )}
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
                    
                    <div className="flex items-center">
                      <Button
                        variant={item.status === 'current' ? "default" : "outline"}
                        size="sm"
                        disabled={updating === item.week || item.status === 'current'}
                        onClick={() => handleUpdateProgress(item.week)}
                        className={cn(
                          "rounded-xl font-black uppercase tracking-widest text-[10px] h-8",
                          item.status === 'current' ? "bg-emerald-500 text-white opacity-100" : ""
                        )}
                      >
                        {updating === item.week ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : item.status === 'current' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                          </>
                        ) : (
                          "Set Current"
                        )}
                      </Button>
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
