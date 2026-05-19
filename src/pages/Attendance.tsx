import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Calendar, TrendingUp, Award, Target, Percent } from 'lucide-react';
import { motion } from "motion/react";
import type { Attendance as AttendanceType } from '@/types';

const mockAttendance: AttendanceType[] = [
  { id: '1', student_id: 's1', date: '2026-05-15', gen: 'GEN10C2', status: 100, score: 100 },
  { id: '2', student_id: 's1', date: '2026-05-13', gen: 'GEN10C2', status: 50, score: 50 },
  { id: '3', student_id: 's1', date: '2026-05-11', gen: 'GEN10C2', status: 100, score: 100 },
  { id: '4', student_id: 's1', date: '2026-05-08', gen: 'GEN10C2', status: 0, score: 0 },
];

export function Attendance() {
  const presentCount = mockAttendance.filter(a => a.status === 100).length;
  const lateCount = mockAttendance.filter(a => a.status === 50).length;
  const absentCount = mockAttendance.filter(a => a.status === 0).length;
  const percentage = (mockAttendance.reduce((acc, a) => acc + a.score, 0) / (mockAttendance.length * 100)) * 100;

  return (
    <div className="space-y-8">
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
              {mockAttendance.map((record, i) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
