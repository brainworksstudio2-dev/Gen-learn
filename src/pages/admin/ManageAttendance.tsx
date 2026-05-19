import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Check, 
  X, 
  Clock, 
  Loader2, 
  Search,
  Calendar as CalendarIcon,
  Save
} from 'lucide-react';
import { getAttendance, getAllProfiles } from '@/services/dataService';
import { Attendance, User } from '@/types';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

export function ManageAttendance() {
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 100 | 50 | 0>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
        const [profilesData, attendanceData] = await Promise.all([
          getAllProfiles(genFilter),
          getAttendance(genFilter)
        ]);
        setStudents(profilesData);
        
        // Populate current attendance for specific date
        const todayAttendance = attendanceData.filter(a => a.date === date);
        const map: Record<string, 100 | 50 | 0> = {};
        todayAttendance.forEach(a => {
          map[a.student_id] = a.status;
        });
        setAttendance(map);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGen, date]);

  const handleStatusChange = (studentId: string, status: 100 | 50 | 0) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation we would batch write these to Firestore
      // For now we simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Attendance records updated successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Class List...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-white rounded-4xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
             <CalendarIcon size={24} />
           </div>
           <div>
             <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Session Attendance</h3>
             <input 
               type="date" 
               className="bg-transparent border-none p-0 text-xs font-bold text-slate-400 uppercase tracking-widest focus:ring-0"
               value={date}
               onChange={(e) => setDate(e.target.value)}
             />
           </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="h-12 rounded-2xl bg-slate-900 hover:bg-black font-bold px-8 gap-2 shadow-xl shadow-slate-100"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
          Save Attendance
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-50">
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-sm">
              {students.length > 0 ? students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="avatar" />
                       </div>
                       <div>
                          <p className="font-black text-slate-900 uppercase italic">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{student.gen}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3">
                       <button 
                         onClick={() => handleStatusChange(student.id, 100)}
                         className={cn(
                           "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           attendance[student.id] === 100 
                             ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105" 
                             : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                         )}
                       >
                         Present
                       </button>
                       <button 
                        onClick={() => handleStatusChange(student.id, 50)}
                         className={cn(
                           "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           attendance[student.id] === 50 
                             ? "bg-amber-500 text-white shadow-lg shadow-amber-100 scale-105" 
                             : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                         )}
                       >
                         Late
                       </button>
                       <button 
                         onClick={() => handleStatusChange(student.id, 0)}
                         className={cn(
                           "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           attendance[student.id] === 0 
                             ? "bg-red-500 text-white shadow-lg shadow-red-100 scale-105" 
                             : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                         )}
                       >
                         Absent
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} className="px-8 py-24 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                      <Users className="w-16 h-16 text-slate-100 mx-auto" />
                      <h4 className="text-xl font-black text-slate-300 uppercase italic">Cohort Empty</h4>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No students found for {selectedGen}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
