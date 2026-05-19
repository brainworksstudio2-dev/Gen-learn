import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Search,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { getAssignments, getAllSubmissions, getRoadmap, addAssignment } from '@/services/dataService';
import { Assignment, Submission, RoadmapItem } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ManageAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');
  const [activeTab, setActiveTab] = useState<'list' | 'submissions'>('list');
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    deadline: '',
    gen: selectedGen === 'all' ? 'GEN30' : selectedGen,
    max_score: 100,
    moduleId: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewAssignment(prev => ({ ...prev, gen: selectedGen === 'all' ? 'GEN30' : selectedGen }));
  }, [selectedGen]);

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.deadline) {
      toast.error("Title and deadline are required");
      return;
    }
    
    setIsSaving(true);
    try {
      await addAssignment({
        ...newAssignment,
        status: 'published'
      } as any);
      toast.success("Assignment published!");
      setIsAddOpen(false);
      // Refresh list
      const genFilter = selectedGen === 'all' ? undefined : selectedGen;
      const data = await getAssignments(genFilter);
      setAssignments(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish assignment");
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
        const [assignmentsData, submissionsData, roadmapData] = await Promise.all([
          getAssignments(genFilter),
          getAllSubmissions(),
          getRoadmap()
        ]);
        setAssignments(assignmentsData);
        setSubmissions(submissionsData);
        setRoadmap(roadmapData.filter(r => selectedGen === 'all' || r.gen === selectedGen));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGen]);

  const modules = ['all', ...Array.from(new Set(roadmap.map(r => r.module))).filter(Boolean)];

  const filteredAssignments = assignments.filter(a => {
    if (selectedModule === 'all') return true;
    return a.module === selectedModule;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="list" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-white border border-slate-100 p-1 rounded-2xl h-auto shadow-sm">
            <TabsTrigger value="list" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all">
              Assignment List
            </TabsTrigger>
            <TabsTrigger value="submissions" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all">
              Student Submissions
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4">
            <select 
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-100 shadow-sm"
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
                <Button className="h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold group gap-2 shadow-lg shadow-indigo-100 px-6">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl rounded-3xl p-8 border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase italic">Create Assignment</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">Publish a new task to your students.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="space-y-2 col-span-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Assignment Title</Label>
                    <Input 
                      placeholder="e.g. Building an Express API" 
                      className="h-14 rounded-2xl bg-slate-50 border-0 font-bold"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Description</Label>
                    <Textarea 
                      placeholder="Provide detailed instructions..." 
                      className="min-h-[120px] rounded-2xl bg-slate-50 border-0 font-medium"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Deadline</Label>
                    <Input 
                      type="date" 
                      className="h-14 rounded-2xl bg-slate-50 border-0 font-bold"
                      value={newAssignment.deadline}
                      onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Max Score</Label>
                    <Input 
                      type="number" 
                      className="h-14 rounded-2xl bg-slate-50 border-0 font-bold"
                      value={newAssignment.max_score}
                      onChange={(e) => setNewAssignment({...newAssignment, max_score: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Target Generation</Label>
                    <select 
                      className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-0 font-bold text-sm"
                      value={newAssignment.gen}
                      onChange={(e) => setNewAssignment({...newAssignment, gen: e.target.value})}
                    >
                      <option value="all">Every Cohort (Announcement Style)</option>
                      <option value="GEN30">GEN 30</option>
                      <option value="GEN31">GEN 31</option>
                      <option value="GEN32">GEN 32</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Roadmap Module</Label>
                    <select 
                      className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-0 font-bold text-sm focus:ring-2 focus:ring-indigo-100"
                      value={newAssignment.moduleId}
                      onChange={(e) => {
                        const id = e.target.value;
                        const item = roadmap.find(r => r.id === id);
                        setNewAssignment({
                          ...newAssignment, 
                          moduleId: id,
                          title: item?.project || newAssignment.title,
                          description: item ? `Deliverable for ${item.module} - ${item.topic}. Goal: ${item.project}` : newAssignment.description
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
                    onClick={handleCreateAssignment} 
                    className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-lg font-black uppercase tracking-tighter gap-3 shadow-xl shadow-indigo-100"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Plus />}
                    Publish Assignment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.length > 0 ? filteredAssignments.map((assignment, i) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-0 shadow-sm rounded-3xl bg-white group hover:shadow-xl hover:shadow-slate-100/50 transition-all cursor-pointer overflow-hidden border border-slate-50">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div className="flex gap-2">
                        {(assignment.module || assignment.moduleId) && (
                          <Badge className="bg-indigo-50 text-indigo-600 font-black uppercase text-[9px] tracking-widest rounded-lg border-none shadow-none">
                            {assignment.module || roadmap.find(r => r.id === assignment.moduleId)?.module || 'Module'}
                          </Badge>
                        )}
                        <Badge className="bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest rounded-lg">
                          {assignment.gen}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-black uppercase italic tracking-tight">{assignment.title}</CardTitle>
                    {assignment.week && (
                      <CardDescription className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mt-1">
                        Week {assignment.week}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <p className="text-slate-500 font-medium text-sm line-clamp-2 mb-6 opacity-80">
                      {assignment.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <CalendarIcon size={14} />
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </div>
                      <div className="font-black text-slate-900 text-[10px] uppercase tracking-widest">
                        {submissions.filter(s => s.assignment_id === assignment.id).length} Submissions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center">
                 <Search className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                 <h3 className="text-xl font-black text-slate-300 uppercase italic">No Assignments Found</h3>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Selected: {selectedGen}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-4xl bg-white overflow-hidden border border-slate-50">
            <CardContent className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-sm">
                  {submissions.length > 0 ? submissions.map((sub) => {
                    const assignment = assignments.find(a => a.id === sub.assignment_id);
                    if (!assignment && selectedGen !== 'all') return null;
                    
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 overflow-hidden">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.student_id}`} alt="sub" referrerPolicy="no-referrer" />
                              </div>
                              <span className="font-bold text-slate-900">Student #{sub.student_id.slice(-4)}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-slate-900 font-bold">{assignment?.title || 'Unknown Assignment'}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{assignment?.gen}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                           {new Date(sub.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="sm" className="rounded-xl font-bold gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                              View Work <ChevronRight size={14} />
                           </Button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No submissions yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
