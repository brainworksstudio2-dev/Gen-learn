import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Video, FileText, ExternalLink, PlayCircle, BookOpen, Loader2 } from 'lucide-react';
import { motion } from "motion/react";
import { Material } from '@/types';
import { getMaterials } from '@/services/dataService';

export function Materials() {
  const [searchParams] = useSearchParams();
  const moduleFilter = searchParams.get('module');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'video' | 'slide'>('all');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userGen = user.gen;
        const data = await getMaterials(userGen);
        if (moduleFilter) {
          setMaterials(data.filter(m => m.module === moduleFilter));
        } else {
          setMaterials(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [moduleFilter]);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || m.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-white border border-slate-200 rounded-4xl shadow-sm">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Search resources..." 
            className="pl-12 h-14 rounded-2xl border-slate-100 focus:ring-slate-900 bg-slate-50 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100 shrink-0 self-start lg:self-auto">
          {['all', 'video', 'slide'].map((f) => (
            <Button 
              key={f}
              variant={filter === f ? 'secondary' : 'ghost'} 
              className={cn(
                "rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px]",
                filter === f ? "bg-white shadow-sm text-slate-900" : "text-slate-400"
              )}
              onClick={() => setFilter(f as any)}
            >
              {f === 'all' ? 'Everything' : f === 'video' ? 'Videos' : 'Slides'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMaterials.map((material, i) => (
          <motion.div
            key={material.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group border-0 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-5xl overflow-hidden bg-white flex flex-col h-full border-b-4 border-b-slate-50">
              <div className="relative h-56 bg-slate-100 overflow-hidden shrink-0">
                <img 
                  src={`https://images.unsplash.com/photo-${i === 0 ? '1587620962725-abab7fe55159' : i === 1 ? '1633356122544-f134324a6cee' : '1555066931-4365d14bab8c'}?q=80&w=800&auto=format&fit=crop`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={material.title}
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                  <div className="bg-white/95 backdrop-blur-md rounded-full w-14 h-14 flex items-center justify-center shadow-2xl">
                    <PlayCircle className="w-7 h-7 text-indigo-600" />
                  </div>
                </div>
                <div className="absolute top-6 left-6 flex gap-2">
                  <Badge className={cn(
                    "rounded-xl px-3 py-1.5 font-black uppercase tracking-widest text-[10px] shadow-lg border-0",
                    material.type === 'video' ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
                  )}>
                    {material.type}
                  </Badge>
                  <Badge className="bg-white/90 backdrop-blur-md text-slate-900 rounded-xl px-3 py-1.5 font-black uppercase tracking-widest text-[10px] border-0 shadow-lg">
                    Week {material.week}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{material.topic}</p>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 mb-3 leading-tight uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors">
                  {material.title}
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 font-medium line-clamp-2 mb-8 leading-relaxed italic">
                  "{material.description}"
                </CardDescription>
                <div className="mt-auto flex gap-3">
                   <Button 
                    asChild
                    className="flex-1 rounded-[20px] h-12 bg-slate-900 text-white hover:bg-black font-black uppercase tracking-tight shadow-lg shadow-slate-100 group/btn"
                  >
                    <a href={material.url} target="_blank" rel="noopener noreferrer">
                      Launch 
                      <ExternalLink className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[20px] bg-slate-50 hover:bg-slate-100 group-hover:rotate-12 transition-transform">
                     <BookOpen className="w-5 h-5 text-slate-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 rounded-5xl border-2 border-dashed border-slate-100"
        >
          <BookOpen className="w-20 h-20 text-slate-100 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-300 uppercase italic">Empty Stacks</h3>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-2">No matches for your current query</p>
          <Button 
            variant="ghost" 
            className="mt-6 text-indigo-600 font-black uppercase italic"
            onClick={() => {setSearchTerm(''); setFilter('all');}}
          >
            Reset Library
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
