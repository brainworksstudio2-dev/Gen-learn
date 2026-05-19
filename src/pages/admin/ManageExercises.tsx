import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from 'lucide-react';

export function ManageExercises() {
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');

  useEffect(() => {
    const handleGenChange = (e: any) => setSelectedGen(e.detail);
    window.addEventListener('admin_gen_changed', handleGenChange);
    return () => window.removeEventListener('admin_gen_changed', handleGenChange);
  }, []);

  return (
    <Card className="border-0 shadow-sm rounded-3xl p-8 bg-white min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <Activity className="w-16 h-16 text-slate-100 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2">Manage Exercises</h2>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-4">Filtering: {selectedGen === 'all' ? 'All Cohorts' : selectedGen}</p>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic opacity-50">Feature coming soon</p>
      </div>
    </Card>
  );
}
