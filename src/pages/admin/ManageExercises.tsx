import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { getExercises, getAllSubmissions, getRoadmap, addExercise } from '@/services/dataService';
import { Exercise, Submission, RoadmapItem } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ManageExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');
  const [activeTab, setActiveTab] = useState<'list' | 'submissions'>('list');
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({
    title: '',
    description: '',
    reference_link: '',
    deadline: '',
    gen: selectedGen === 'all' ? 'GEN30' : selectedGen,
    max_score: 100,
    moduleId: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewExercise(prev => ({ ...prev, gen: selectedGen === 'all' ? 'GEN30' : selectedGen }));
  }, [selectedGen]);

  const handleCreateExercise = async () => {
    if (!newExercise.title || !newExercise.deadline) {
      toast.error("Title and deadline are required");
      return;
    }

    setIsSaving(true);
    try {
      await addExercise({
        ...newExercise,
        status: 'published'
      } as any);
      toast.success("Exercise published!");
      setIsAddOpen(false);
      // Refresh list
      const genFilter = selectedGen === 'all' ? undefined : selectedGen;
      const data = await getExercises(genFilter);
      setExercises(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish exercise");
    } finally {
      setIsSaving(false);
    }
  };

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
        const [exercisesData, submissionsData, roadmapData] = await Promise.all([
          getExercises(genFilter),
          getAllSubmissions(), // Submissions for exercises might be stored here too, we would filter by assignment_id which is exercise id
          getRoadmap()
        ]);
        setExercises(exercisesData);
        setSubmissions(submissionsData);
        setRoadmap(roadmapData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGen]);

  const modules = ['all', ...Array.from(new Set(roadmap.map(r => r.module))).filter(Boolean)];

  const filteredExercises = exercises.filter((e: any) => {
    if (selectedModule === 'all') return true;
    return e.module === selectedModule;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Exercises...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="list" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-white border border-slate-100 p-1 rounded-2xl h-auto shadow-sm">
            <TabsTrigger value="list" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all">
              Exercise List
            </TabsTrigger>
            <TabsTrigger value="submissions" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all">
              Student Submissions
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <select
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-amber-100 shadow-sm"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="all">Every Module</option>
              {modules.filter(m => m !== 'all').map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 font-bold group gap-2 shadow-lg shadow-amber-100 px-6">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  New Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl rounded-3xl p-8 border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase italic">Create Exercise</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">Publish a new practice exercise to your students.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="space-y-2 col-span-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Exercise Title</Label>
                    <Input
                      placeholder="e.g. Array Methods Practice"
                      className="h-14 rounded-2xl bg-slate-50 border-0 font-bold"
                      value={newExercise.title}
                      onChange={(e) => setNewExercise({ ...newExercise, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Description</Label>
                    <Textarea
                      placeholder="Provide detailed instructions..."
                      className="min-h-[120px] rounded-2xl bg-slate-50 border-0 font-medium"
                      value={newExercise.description}
                      onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Reference URL (Optional)</Label>
                    <Input
                      placeholder="https://developer.mozilla.org/..."
                      className="h-14 rounded-2xl bg-slate-50 border-0 font-bold"
                      value={newExercise.reference_link}
                      onChange={(e) => setNewExercise({ ...newExercise, reference_link: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Deadline</Label>
                    <Input
                      type="date"
                      className="h-14 rounded-2xl bg-slate-50 border-0 font-bold"
                      value={newExercise.deadline}
                      onChange={(e) => setNewExercise({ ...newExercise, deadline: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Max Score</Label>
                    <Input
                      type="number"
                      className="h-14 rounded-2xl bg-slate-50 border-0 font-bold"
                      value={newExercise.max_score}
                      onChange={(e) => setNewExercise({ ...newExercise, max_score: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Target Generation</Label>
                    <select
                      className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-0 font-bold text-sm"
                      value={newExercise.gen}
                      onChange={(e) => setNewExercise({ ...newExercise, gen: e.target.value })}
                    >
                      <option value="all">Every Cohort</option>
                      <option value="GEN30">GEN 30</option>
                      <option value="GEN31">GEN 31</option>
                      <option value="GEN32">GEN 32</option>
                      <option value="GEN33">GEN 33</option>
                      <option value="GEN34">GEN 34</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Roadmap Module</Label>
                    <select
                      className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-0 font-bold text-sm focus:ring-2 focus:ring-amber-100"
                      value={newExercise.moduleId}
                      onChange={(e) => {
                        const id = e.target.value;
                        const item = roadmap.find(r => r.id === id);
                        setNewExercise({
                          ...newExercise,
                          moduleId: id,
                          title: item?.project || newExercise.title,
                          description: item ? `Practice for ${item.module} - ${item.topic}` : newExercise.description
                        });
                      }}
                    >
                      <option value="">None / General Task</option>
                      {roadmap.map(item => (
                        <option key={item.id} value={item.id}>{item.module} - Week {item.week}: {item.topic}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter className="pt-8 bg-white">
                  <Button
                    onClick={handleCreateExercise}
                    className="w-full h-16 rounded-3xl bg-amber-500 hover:bg-amber-600 text-lg font-black uppercase tracking-tighter gap-3 shadow-xl shadow-amber-100 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Plus />}
                    Publish Exercise
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.length > 0 ? filteredExercises.map((exercise, i) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-0 shadow-sm rounded-3xl bg-white group hover:shadow-xl hover:shadow-slate-100/50 transition-all cursor-pointer overflow-hidden border border-slate-50">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                        <Activity size={20} />
                      </div>
                      <div className="flex gap-2">
                        {((exercise as any).module || (exercise as any).moduleId) && (
                          <Badge className="bg-amber-50 text-amber-600 font-black uppercase text-[9px] tracking-widest rounded-lg border-none shadow-none">
                            {(exercise as any).module || roadmap.find(r => r.id === (exercise as any).moduleId)?.module || 'Module'}
                          </Badge>
                        )}
                        <Badge className="bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest rounded-lg">
                          {exercise.gen}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-black uppercase italic tracking-tight">{exercise.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <p className="text-slate-500 font-medium text-sm line-clamp-2 mb-6 opacity-80 whitespace-pre-wrap">
                      {exercise.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <CalendarIcon size={14} />
                        {new Date(exercise.deadline).toLocaleDateString()}
                      </div>
                      <div className="font-black text-slate-900 text-[10px] uppercase tracking-widest">
                        {submissions.filter(s => s.assignment_id === exercise.id).length} Submissions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">No Exercises Found</h3>
                <p className="text-slate-500 font-medium">Create the first exercise for this cohort to get started.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
             <div className="flex flex-col items-center justify-center h-64 text-center space-y-2 opacity-50">
                <Activity className="w-12 h-12 text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Submission review coming soon</p>
             </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
