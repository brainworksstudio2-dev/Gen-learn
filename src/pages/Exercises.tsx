import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle2, ChevronRight, Github } from 'lucide-react';
import { motion } from "motion/react";
import { Exercise } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Array Methods Practice',
    description: 'Solve 5 problems using map, filter, and reduce.',
    deadline: '2026-05-19T23:59:59Z',
    gen: 'GEN10C2',
    max_score: 100,
    reference_link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'
  },
  {
    id: '2',
    title: 'TypeScript Interface Logic',
    description: 'Define complex interfaces for a hypothetical library system.',
    deadline: '2026-05-21T23:59:59Z',
    gen: 'GEN10C2',
    max_score: 100
  }
];

export function Exercises() {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionLink) return;
    toast.success("Exercise submitted!");
    setIsSubmitOpen(false);
    setSubmissionLink('');
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockExercises.map((exercise, i) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group border-0 shadow-lg shadow-slate-100 hover:shadow-2xl transition-all duration-500 rounded-5xl overflow-hidden bg-white hover:-translate-y-2">
              <CardContent className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner group-hover:bg-amber-100 transition-colors">
                    <Activity size={28} />
                  </div>
                  <Badge className="bg-slate-50 text-slate-400 rounded-xl px-4 py-1.5 font-black uppercase tracking-widest text-[10px] border border-slate-100">
                    Week 2 Units
                  </Badge>
                </div>
                
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 ml-1">Practice Unit</p>
                <CardTitle className="text-2xl font-black text-slate-900 mb-3 leading-tight uppercase italic tracking-tighter group-hover:text-amber-600 transition-colors">
                  {exercise.title}
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium mb-4 leading-relaxed italic whitespace-pre-wrap">
                  "{exercise.description}"
                </CardDescription>

                {exercise.reference_link && (
                  <div className="mb-8">
                    <a 
                      href={exercise.reference_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition-colors"
                    >
                      <Activity size={16} /> Open Reference Material
                    </a>
                  </div>
                )}

                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Value</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{exercise.max_score} pts</p>
                  </div>
                  
                  <Dialog open={isSubmitOpen && selectedExercise?.id === exercise.id} onOpenChange={(open) => {
                    setIsSubmitOpen(open);
                    if (open) setSelectedExercise(exercise);
                  }}>
                    <DialogTrigger asChild>
                      <Button className="rounded-[20px] h-12 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-tight px-8 shadow-xl shadow-slate-100 group/btn">
                        Submit 
                        <ChevronRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-5xl border-0 p-10 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                      <DialogHeader>
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-100">
                          <Github className="text-white w-6 h-6" />
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Submit Practice</DialogTitle>
                        <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">
                          Share your gist or repository link
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-8 pt-6">
                        <div className="space-y-3">
                          <Label htmlFor="link" className="font-black text-xs uppercase text-slate-900 tracking-widest ml-1">Practice URL</Label>
                          <Input 
                            id="link" 
                            placeholder="gist.github.com/your-code" 
                            className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-amber-500 transition-all font-medium shadow-inner" 
                            required 
                            value={submissionLink}
                            onChange={(e) => setSubmissionLink(e.target.value)}
                          />
                        </div>
                        <Button type="submit" className="w-full h-16 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-amber-100 transition-all active:scale-95">
                          Finalize Practice
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
