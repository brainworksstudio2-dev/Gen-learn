import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Loader2, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, logout } from '@/lib/auth';
import { updateProfile } from '@/services/dataService';
import { toast } from 'sonner';

export function Onboarding() {
  const navigate = useNavigate();
  const [selectedGen, setSelectedGen] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    // If user already has a gen, they shouldn't be here
    if (user?.gen && user?.role === 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const cohorts = [
    { id: 'GEN30', name: 'Generation 30 • Software Engineering + AI', date: 'Started Jan 2026' },
    { id: 'GEN31', name: 'Generation 31 • Software Engineering + AI', date: 'Started March 2026' },
    { id: 'GEN32', name: 'Generation 32 • Software Engineering + AI', date: 'Upcoming June 2026' },
    { id: 'GEN33', name: 'Generation 33 • Software Engineering + AI', date: 'Upcoming August 2026' },
    { id: 'GEN34', name: 'Generation 34 • Software Engineering + AI', date: 'Upcoming October 2026' },
  ];

  const handleComplete = async () => {
    if (!selectedGen) return;
    setLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      await updateProfile(auth.currentUser.uid, {
        gen: selectedGen,
        role: 'student' // Default to student on onboarding
      });

      // Update local storage
      const updatedUser = { ...user, gen: selectedGen, role: 'student' };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success("Welcome aboard! Let's start learning.");
      // Fix: Use window.location to force refresh and App.tsx state update
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error("Setup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-100 rotate-3">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Choose Your Path</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Welcome, {user?.name}. Please select your assigned cohort to continue.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {cohorts.map((cohort) => (
            <button
              key={cohort.id}
              onClick={() => setSelectedGen(cohort.id)}
              className={`text-left p-6 rounded-[32px] border-2 transition-all group relative overflow-hidden ${selectedGen === cohort.id
                  ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-50'
                  : 'bg-white/50 border-white hover:border-slate-200 hover:bg-white'
                }`}
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className={`text-lg font-black uppercase italic ${selectedGen === cohort.id ? 'text-indigo-600' : 'text-slate-900'}`}>{cohort.id}</h3>
                  <p className="text-sm font-bold text-slate-400 mt-0.5">{cohort.name}</p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedGen === cohort.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'
                  }`}>
                  <ArrowRight size={18} className={selectedGen === cohort.id ? 'translate-x-0' : '-translate-x-2 opacity-0'} />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4">{cohort.date}</p>

              {selectedGen === cohort.id && (
                <motion.div
                  layoutId="active-bg"
                  className="absolute inset-0 bg-indigo-600/5 pointer-events-none"
                />
              )}
            </button>
          ))}
        </div>

        <div className="pt-4 space-y-4">
          <Button
            onClick={handleComplete}
            disabled={!selectedGen || loading}
            className="w-full h-16 rounded-[28px] bg-slate-900 hover:bg-black text-white font-black uppercase tracking-tight text-lg shadow-2xl shadow-slate-200 group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : 'Ready to Start'}
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <button
            onClick={() => logout()}
            className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Sign out and Try Another Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
