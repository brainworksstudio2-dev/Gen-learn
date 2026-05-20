import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Download, TableProperties, ClipboardList, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getAllProfiles, getAttendance, getAssignments, getAllSubmissions } from '@/services/dataService';
import type { User, Attendance, Assignment, Submission } from '@/types';

type Tab = 'attendance' | 'assignments';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getStatusColor(status: 100 | 50 | 0 | undefined): string {
  if (status === 100) return 'bg-emerald-500 text-white';
  if (status === 50) return 'bg-amber-400 text-white';
  if (status === 0) return 'bg-red-400 text-white';
  return 'bg-slate-100 text-slate-300';
}

function getStatusLabel(status: 100 | 50 | 0 | undefined): string {
  if (status === 100) return '✓';
  if (status === 50) return '~';
  if (status === 0) return '✗';
  return '–';
}

function getStatusTooltip(status: 100 | 50 | 0 | undefined): string {
  if (status === 100) return 'Present';
  if (status === 50) return 'Late';
  if (status === 0) return 'Absent';
  return 'No record';
}

export function GradeRegister() {
  const [tab, setTab] = useState<Tab>('attendance');
  const [loading, setLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');

  const [students, setStudents] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Listen for cohort filter changes from admin sidebar
  useEffect(() => {
    const handler = (e: any) => setSelectedGen(e.detail);
    window.addEventListener('admin_gen_changed', handler);
    return () => window.removeEventListener('admin_gen_changed', handler);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const gen = selectedGen === 'all' ? undefined : selectedGen;
      const [profilesData, attendData, assignData, subsData] = await Promise.all([
        getAllProfiles(gen),
        getAttendance(gen),
        getAssignments(gen),
        getAllSubmissions(),
      ]);
      setStudents(profilesData);
      setAttendanceRecords(attendData);
      setAssignments(assignData);
      setSubmissions(subsData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load register data.');
    } finally {
      setLoading(false);
    }
  }, [selectedGen]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Attendance grid helpers ---
  // Unique sorted dates from attendance records, filter Mon-Sat only
  const attendanceDates: string[] = React.useMemo(() => {
    const dateSet = new Set<string>();
    attendanceRecords.forEach(r => dateSet.add(r.date));
    return Array.from(dateSet)
      .filter(d => {
        const day = new Date(d).getDay(); // 0=Sun, 6=Sat
        return day >= 1 && day <= 6; // Mon–Sat
      })
      .sort();
  }, [attendanceRecords]);

  // Build map: studentId -> date -> status
  const attendanceMap = React.useMemo(() => {
    const map: Record<string, Record<string, 100 | 50 | 0>> = {};
    attendanceRecords.forEach(r => {
      if (!map[r.student_id]) map[r.student_id] = {};
      map[r.student_id][r.date] = r.status;
    });
    return map;
  }, [attendanceRecords]);

  // Tally per student
  const attendanceTally = (studentId: string) => {
    const recs = attendanceMap[studentId] || {};
    let earned = 0, total = attendanceDates.length;
    attendanceDates.forEach(d => {
      const s = recs[d];
      if (s === 100) earned += 1;
      else if (s === 50) earned += 0.5;
    });
    return { earned, total, pct: total > 0 ? Math.round((earned / total) * 100) : 0 };
  };

  // Format date header nicely
  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const day = DAYS[d.getDay() - 1] ?? 'Sat';
    const dm = `${d.getDate()}/${d.getMonth() + 1}`;
    return { day, dm };
  };

  // --- Assignment grid helpers ---
  const submissionMap = React.useMemo(() => {
    const map: Record<string, Set<string>> = {}; // studentId -> Set<assignmentId>
    submissions.forEach(s => {
      if (!map[s.student_id]) map[s.student_id] = new Set();
      map[s.student_id].add(s.assignment_id);
    });
    return map;
  }, [submissions]);

  const hasSubmitted = (studentId: string, assignmentId: string) =>
    submissionMap[studentId]?.has(assignmentId) ?? false;

  const assignmentTally = (studentId: string) => {
    const submitted = assignments.filter(a => hasSubmitted(studentId, a.id)).length;
    const total = assignments.length;
    return { submitted, total, pct: total > 0 ? Math.round((submitted / total) * 100) : 0 };
  };

  // --- CSV Export ---
  const exportAttendanceCSV = () => {
    const header = ['Student Name', 'Gen', ...attendanceDates, 'Earned', 'Total', 'Rate %'];
    const rows = students.map(s => {
      const tally = attendanceTally(s.uid ?? s.id);
      const cells = attendanceDates.map(d => {
        const st = attendanceMap[s.uid ?? s.id]?.[d];
        return st === 100 ? 'Present' : st === 50 ? 'Late' : st === 0 ? 'Absent' : '';
      });
      return [s.name, s.gen, ...cells, tally.earned, tally.total, `${tally.pct}%`];
    });
    downloadCSV([header, ...rows], `attendance_register_${selectedGen}.csv`);
    toast.success('Attendance register exported!');
  };

  const exportAssignmentsCSV = () => {
    const header = ['Student Name', 'Gen', ...assignments.map(a => a.title), 'Submitted', 'Total', 'Rate %'];
    const rows = students.map(s => {
      const id = s.uid ?? s.id;
      const tally = assignmentTally(id);
      const cells = assignments.map(a => hasSubmitted(id, a.id) ? 'Submitted' : 'Not Submitted');
      return [s.name, s.gen, ...cells, tally.submitted, tally.total, `${tally.pct}%`];
    });
    downloadCSV([header, ...rows], `assignment_register_${selectedGen}.csv`);
    toast.success('Assignment register exported!');
  };

  function downloadCSV(rows: (string | number)[][], filename: string) {
    const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Grade Register...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Grade Register</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
            Live points spreadsheet · {selectedGen === 'all' ? 'All Cohorts' : selectedGen}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchData}
            className="h-10 rounded-xl border-slate-200 font-bold gap-2 text-xs"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button
            onClick={tab === 'attendance' ? exportAttendanceCSV : exportAssignmentsCSV}
            className="h-10 rounded-xl bg-slate-900 hover:bg-black font-bold gap-2 text-xs text-white shadow-xl shadow-slate-100"
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setTab('attendance')}
          className={cn(
            'px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
            tab === 'attendance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <TableProperties className="w-4 h-4" /> Attendance Register
        </button>
        <button
          onClick={() => setTab('assignments')}
          className={cn(
            'px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
            tab === 'assignments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <ClipboardList className="w-4 h-4" /> Assignment Register
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-400">Legend:</span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span> Present / Submitted</span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-amber-400 text-white flex items-center justify-center text-[10px]">~</span> Late</span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-red-400 text-white flex items-center justify-center text-[10px]">✗</span> Absent / Not Submitted</span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[10px]">–</span> No Record</span>
      </div>

      {/* ── ATTENDANCE REGISTER ── */}
      {tab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {attendanceDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-300">
              <TableProperties className="w-16 h-16" />
              <p className="font-black uppercase tracking-widest text-sm">No attendance records yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  {/* Day row */}
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="sticky left-0 z-10 bg-slate-50 px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[180px] border-r border-slate-100">
                      Student
                    </th>
                    {attendanceDates.map(d => {
                      const { day, dm } = formatDateHeader(d);
                      return (
                        <th key={d} className="px-2 py-3 text-center min-w-[64px] border-r border-slate-50">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">{day}</div>
                          <div className="text-[9px] font-bold text-slate-300">{dm}</div>
                        </th>
                      );
                    })}
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-indigo-50 min-w-[100px] border-l border-indigo-100">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={attendanceDates.length + 2} className="px-6 py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                        No students found for this cohort
                      </td>
                    </tr>
                  ) : (
                    students.map((student, idx) => {
                      const sid = student.uid ?? student.id;
                      const tally = attendanceTally(sid);
                      return (
                        <tr key={sid} className={cn('hover:bg-slate-50/60 transition-colors', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')}>
                          {/* Student name cell */}
                          <td className="sticky left-0 z-10 bg-inherit px-6 py-3 border-r border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="avatar" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-xs uppercase italic leading-none">{student.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{student.gen}</p>
                              </div>
                            </div>
                          </td>

                          {/* Date status boxes */}
                          {attendanceDates.map(d => {
                            const status = attendanceMap[sid]?.[d] as 100 | 50 | 0 | undefined;
                            return (
                              <td key={d} className="px-2 py-3 text-center border-r border-slate-50">
                                <div
                                  title={getStatusTooltip(status)}
                                  className={cn(
                                    'w-9 h-9 rounded-xl mx-auto flex items-center justify-center font-black text-sm cursor-default transition-all select-none',
                                    getStatusColor(status)
                                  )}
                                >
                                  {getStatusLabel(status)}
                                </div>
                              </td>
                            );
                          })}

                          {/* Tally */}
                          <td className="px-4 py-3 text-center bg-indigo-50/50 border-l border-indigo-100">
                            <div className="flex flex-col items-center">
                              <span className="text-indigo-600 font-black text-sm">{tally.pct}%</span>
                              <span className="text-[9px] text-slate-400 font-bold">{tally.earned}/{tally.total} pts</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ASSIGNMENT REGISTER ── */}
      {tab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-300">
              <ClipboardList className="w-16 h-16" />
              <p className="font-black uppercase tracking-widest text-sm">No assignments published yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="sticky left-0 z-10 bg-slate-50 px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[180px] border-r border-slate-100">
                      Student
                    </th>
                    {assignments.map(a => (
                      <th key={a.id} className="px-2 py-3 text-center min-w-[100px] border-r border-slate-50">
                        <div
                          title={a.title}
                          className="text-[9px] font-black uppercase tracking-wider text-slate-500 max-w-[90px] mx-auto truncate"
                        >
                          {a.title}
                        </div>
                        {a.deadline && (
                          <div className="text-[8px] font-bold text-slate-300 mt-0.5">
                            Due: {new Date(a.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-indigo-50 min-w-[100px] border-l border-indigo-100">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={assignments.length + 2} className="px-6 py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                        No students found for this cohort
                      </td>
                    </tr>
                  ) : (
                    students.map((student, idx) => {
                      const sid = student.uid ?? student.id;
                      const tally = assignmentTally(sid);
                      return (
                        <tr key={sid} className={cn('hover:bg-slate-50/60 transition-colors', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')}>
                          {/* Student name */}
                          <td className="sticky left-0 z-10 bg-inherit px-6 py-3 border-r border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="avatar" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-xs uppercase italic leading-none">{student.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{student.gen}</p>
                              </div>
                            </div>
                          </td>

                          {/* Assignment submission boxes */}
                          {assignments.map(a => {
                            const submitted = hasSubmitted(sid, a.id);
                            return (
                              <td key={a.id} className="px-2 py-3 text-center border-r border-slate-50">
                                <div
                                  title={submitted ? 'Submitted' : 'Not submitted'}
                                  className={cn(
                                    'w-9 h-9 rounded-xl mx-auto flex items-center justify-center font-black text-sm cursor-default transition-all select-none',
                                    submitted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'
                                  )}
                                >
                                  {submitted ? '✓' : '–'}
                                </div>
                              </td>
                            );
                          })}

                          {/* Tally */}
                          <td className="px-4 py-3 text-center bg-indigo-50/50 border-l border-indigo-100">
                            <div className="flex flex-col items-center">
                              <span className="text-indigo-600 font-black text-sm">{tally.pct}%</span>
                              <span className="text-[9px] text-slate-400 font-bold">{tally.submitted}/{tally.total}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Students</p>
          <p className="text-2xl font-black text-slate-900">{students.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            {tab === 'attendance' ? 'Class Sessions Tracked' : 'Assignments Released'}
          </p>
          <p className="text-2xl font-black text-slate-900">
            {tab === 'attendance' ? attendanceDates.length : assignments.length}
          </p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            {tab === 'attendance' ? 'Avg. Attendance Rate' : 'Avg. Submission Rate'}
          </p>
          <p className="text-2xl font-black text-slate-900">
            {students.length === 0 ? '—' : (() => {
              if (tab === 'attendance') {
                const avg = students.reduce((acc, s) => acc + attendanceTally(s.uid ?? s.id).pct, 0) / students.length;
                return `${Math.round(avg)}%`;
              } else {
                const avg = students.reduce((acc, s) => acc + assignmentTally(s.uid ?? s.id).pct, 0) / students.length;
                return `${Math.round(avg)}%`;
              }
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
