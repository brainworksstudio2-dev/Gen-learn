import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle2, ChevronRight, AlertCircle, Github, ExternalLink, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from "motion/react";
import { Assignment, RoadmapItem } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { getAssignments, submitAssignment, getRoadmap } from '@/services/dataService';
import { cn } from '@/lib/utils';

export function Assignments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleFilter = searchParams.get('module');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userGen = user.gen;
        
        const [assignmentsData, roadmapData] = await Promise.all([
          getAssignments(userGen),
          getRoadmap()
        ]);
        
        setRoadmap(roadmapData);
        
        if (moduleFilter) {
          setAssignments(assignmentsData.filter(a => a.module === moduleFilter));
        } else {
          setAssignments(assignmentsData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [moduleFilter]);

  const modules = ['all', ...Array.from(new Set(roadmap.map(r => r.module))).filter(Boolean)];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionLink || !selectedAssignment) return;
    
    setSubmitting(true);
    try {
      await submitAssignment(selectedAssignment.id, submissionLink);
      toast.success("Assignment submitted successfully!");
      setIsSubmitOpen(false);
      setSubmissionLink('');
    } catch (error: any) {
      toast.error("Failed to submit assignment: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
           <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Your Assignments</h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Complete your tasks to progress further</p>
        </div>
        <select 
          className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-100 shadow-sm"
          value={moduleFilter || 'all'}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'all') {
              setSearchParams({});
            } else {
              setSearchParams({ module: val });
            }
          }}
        >
          <option value="all">Every Module</option>
          {modules.filter(m => m !== 'all').map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {assignments.length > 0 ? assignments.map((assignment, i) => {
          const deadlineDate = new Date(assignment.deadline);
          const isOverdue = deadlineDate < new Date();
          
          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group border-0 shadow-lg shadow-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 rounded-5xl overflow-hidden bg-white">
                <CardContent className="p-0 flex flex-col lg:flex-row">
                  <div className="p-10 flex-1">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <Badge className="rounded-xl px-4 py-1.5 font-black uppercase tracking-widest text-[10px] bg-slate-900 text-white border-0 shadow-sm">
                        {assignment.gen}
                      </Badge>
                      <div className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm transition-colors",
                        isOverdue ? "bg-red-50 text-red-500 border-red-100" : "bg-orange-50 text-orange-500 border-orange-100"
                      )}>
                        <Clock className="w-3.5 h-3.5" />
                        Due {deadlineDate.toLocaleDateString()}
                      </div>
                      {(assignment.module || assignment.moduleId) && (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {assignment.module || roadmap.find(r => r.id === assignment.moduleId)?.module || 'Technical Unit'}
                          {assignment.week && <span className="opacity-70 ml-1">#W{assignment.week}</span>}
                        </div>
                      )}
                    </div>
                    
                    <CardTitle className="text-3xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors">
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-lg mb-8 leading-relaxed italic">
                      "{assignment.description}"
                    </CardDescription>

                    <div className="flex flex-wrap gap-4 mt-auto">
                      <Dialog open={isSubmitOpen && selectedAssignment?.id === assignment.id} onOpenChange={(open) => {
                        setIsSubmitOpen(open);
                        if (open) setSelectedAssignment(assignment);
                      }}>
                        <DialogTrigger asChild>
                          <Button className="rounded-[24px] h-14 px-10 bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase tracking-tight shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
                            Submit Work
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-5xl border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-10 bg-white">
                          <DialogHeader>
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-100">
                              <ExternalLink className="text-white w-6 h-6" />
                            </div>
                            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Submit Work</DialogTitle>
                            <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">
                              Paste your project link below to finish
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-8 pt-6">
                            <div className="space-y-3">
                              <Label htmlFor="link" className="font-black text-xs uppercase text-slate-900 tracking-widest ml-1">Platform URL</Label>
                              <div className="relative">
                                <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <Input 
                                  id="link" 
                                  placeholder="github.com/your-username/repo" 
                                  className="pl-12 h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-slate-900 transition-all text-base font-medium shadow-inner"
                                  value={submissionLink}
                                  onChange={(e) => setSubmissionLink(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" className="w-full h-16 rounded-3xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all active:scale-95">
                                Finalize Submission
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" className="rounded-[24px] h-14 px-8 border-2 border-slate-100 font-black uppercase tracking-tight text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all">
                        Instructions
                      </Button>
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-72 bg-slate-50 p-12 flex flex-col justify-center border-l border-slate-100 items-center text-center group-hover:bg-slate-100 transition-colors">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Unit Valuation</div>
                    <div className="text-6xl font-black text-slate-900 tracking-tighter">{assignment.max_score}</div>
                    <div className="mt-8 px-6 py-3 rounded-2xl bg-white border border-slate-200 w-full flex items-center justify-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest shadow-sm">
                      <Clock size={16} className="text-slate-300" /> Pending Review
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        }) : (
          <div className="text-center py-20">
            <TrendingUp className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 uppercase italic">No Assignments</h3>
            <p className="text-slate-500 font-medium">Sit tight, your mentor will post soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
