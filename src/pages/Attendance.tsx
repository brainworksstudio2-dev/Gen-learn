import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Percent, Loader2, CalendarPlus } from 'lucide-react';
import type { Attendance as AttendanceType } from '@/types';
import { getStudentAttendance, markStudentAttendance } from '@/services/dataService';
import { toast } from 'sonner';

export function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchAttendance = async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const data = await getStudentAttendance(user.id);
      setAttendance(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user.id]);

  const handleMarkAttendance = async () => {
    setMarking(true);
    try {
      await markStudentAttendance(user.gen);
      toast.success("Attendance marked successfully for today!");
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.message || "Failed to mark attendance.");
    } finally {
      setMarking(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const hasMarkedToday = attendance.some(a => a.date === todayStr);

  const presentCount = attendance.filter(a => a.status === 100).length;
  const lateCount = attendance.filter(a => a.status === 50).length;
  const absentCount = attendance.filter(a => a.status === 0).length;
  const percentage = attendance.length > 0 
    ? (attendance.reduce((acc, a) => acc + a.score, 0) / (attendance.length * 100)) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Daily Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-white rounded-4xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
             <CalendarPlus size={24} />
           </div>
           <div>
             <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Daily Sign-In</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mark your attendance for {todayStr}</p>
           </div>
        </div>
        
        {!hasMarkedToday ? (
          <Button 
            onClick={handleMarkAttendance} 
            disabled={marking}
            className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200"
          >
            {marking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Mark Present
          </Button>
        ) : (
          <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">You're marked present today!</span>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm rounded-3xl bg-emerald-500 text-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl"><Percent className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Overall</p>
              <h3 className="text-3xl font-black">{Math.round(percentage)}%</h3>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Present</p>
              <h3 className="text-3xl font-black text-slate-900">{presentCount}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Late</p>
              <h3 className="text-3xl font-black text-slate-900">{lateCount}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><XCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Absent</p>
              <h3 className="text-3xl font-black text-slate-900">{absentCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-slate-100">
          <CardTitle className="text-xl font-black text-slate-900 uppercase">Attendance History</CardTitle>
          <CardDescription className="text-slate-500 font-bold text-sm">Detailed record of your class participation</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[200px] font-bold text-slate-400 uppercase text-xs pl-8">Date</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase text-xs">Cohort</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase text-xs">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-400 uppercase text-xs pr-8">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50 transition-colors border-slate-100">
                    <TableCell className="font-bold text-slate-900 pl-8">{record.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg bg-slate-50 border-slate-200 font-bold px-2 py-0.5 text-[10px] uppercase">
                        {record.gen}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.status === 100 && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 font-bold">PRESENT</Badge>}
                      {record.status === 50 && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 font-bold">LATE</Badge>}
                      {record.status === 0 && <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 font-bold">ABSENT</Badge>}
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-900 pr-8">{record.score}%</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
