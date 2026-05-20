import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, GraduationCap, Calendar, Shield, Save, Loader2, Award } from 'lucide-react';
import { updateProfile, getStudentAttendance, getSubmissionsForUser } from '@/services/dataService';
import { auth } from '@/lib/auth';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function Profile() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [name, setName] = useState(user.name || '');
  const [saving, setSaving] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    submissionsCount: 0
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      const userId = user.uid || user.id;
      if (!userId) return;
      try {
        const [attendanceRecords, submissions] = await Promise.all([
          getStudentAttendance(userId),
          getSubmissionsForUser(userId)
        ]);

        const presentScore = attendanceRecords.filter(a => a.status === 100).length;
        const halfPresentScore = attendanceRecords.filter(a => a.status === 50).length * 0.5;
        const earned = presentScore + halfPresentScore;
        const total = attendanceRecords.length;

        setStats({
          attendanceRate: total > 0 ? Math.round((earned / total) * 100) : 100,
          submissionsCount: submissions.length
        });
      } catch (error) {
        console.error("Failed to load user statistics:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const userId = user.uid || user.id;
    if (!userId) return;

    setSaving(true);
    try {
      await updateProfile(userId, { name: name.trim() });
      const updatedUser = { ...user, name: name.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Notify navigation sidebar to refresh
      window.dispatchEvent(new Event('storage'));
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-slate-900 text-white rounded-5xl relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 overflow-hidden shadow-lg shrink-0">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'user'}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tight">{user.name}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {user.role === 'admin' ? 'Administrator' : `Cohort Student • ${user.gen}`}
            </p>
          </div>
        </div>
        <div className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl text-[10px] font-black uppercase tracking-widest shrink-0 relative z-10">
          Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
        </div>
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Info Form */}
        <Card className="border-0 shadow-sm rounded-4xl bg-white md:col-span-8 p-6 md:p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-black uppercase italic tracking-tight text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" /> Account Settings
            </CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Manage your student profile credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user.email} 
                  disabled 
                  className="rounded-xl border-slate-200 bg-slate-50 text-slate-500 font-medium h-12 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Display Name
                </Label>
                <Input 
                  id="name" 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your name" 
                  className="rounded-xl border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium h-12 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> User Role
                  </Label>
                  <div className="flex items-center gap-2 h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                    {user.role}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Cohort Generation
                  </Label>
                  <div className="flex items-center gap-2 h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                    {user.gen || 'Not set'}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={saving}
                className="w-full sm:w-auto rounded-xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Details
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Dynamic Bento Statistics */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-0 shadow-sm rounded-4xl bg-indigo-50 border-2 border-indigo-100 p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Attendance Rate</p>
              <h4 className="text-4xl font-black mt-2 text-indigo-900">
                {loadingStats ? "—" : `${stats.attendanceRate}%`}
              </h4>
            </div>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-wide mt-4 italic">
              Keep it above 85% for standard graduation
            </p>
            <Calendar className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-200/50 pointer-events-none group-hover:scale-105 transition-all" />
          </Card>

          <Card className="border-0 shadow-sm rounded-4xl bg-emerald-50 border-2 border-emerald-100 p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Tasks Submitted</p>
              <h4 className="text-4xl font-black mt-2 text-emerald-900">
                {loadingStats ? "—" : stats.submissionsCount}
              </h4>
            </div>
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wide mt-4 italic">
              assignments and exercises completed
            </p>
            <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-200/50 pointer-events-none group-hover:scale-105 transition-all" />
          </Card>
        </div>
      </div>
    </div>
  );
}
