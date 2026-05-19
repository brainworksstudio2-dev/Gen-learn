import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Award, Clock, Loader2, Search, Filter, FileText, X } from 'lucide-react';
import { getAllProfiles, getAttendance, getAllSubmissions, getAssignments } from '@/services/dataService';
import { User, Attendance, Submission, Assignment } from '@/types';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function Performance() {
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  useEffect(() => {
    const handleGenChange = (e: any) => setSelectedGen(e.detail);
    window.addEventListener('admin_gen_changed', handleGenChange);
    return () => window.removeEventListener('admin_gen_changed', handleGenChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilesData, attendanceData, submissionsData, assignmentsData] = await Promise.all([
          getAllProfiles(),
          getAttendance(),
          getAllSubmissions(),
          getAssignments()
        ]);
        setStudents(profilesData);
        setAttendance(attendanceData);
        setSubmissions(submissionsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const gens = ['all', ...Array.from(new Set(students.map(s => s.gen))).filter(Boolean)];

  const getStudentMetrics = (studentId: string) => {
    const studentAttendance = attendance.filter(a => a.student_id === studentId);
    const avgAttendance = studentAttendance.length > 0 
      ? studentAttendance.reduce((acc, curr) => acc + curr.status, 0) / studentAttendance.length 
      : 0;

    const studentSubmissions = submissions.filter(s => s.student_id === studentId);
    const gradedSubmissions = studentSubmissions.filter(s => s.score !== undefined);
    const avgScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedSubmissions.length
      : 0;

    return {
      attendanceRate: Math.round(avgAttendance),
      averageScore: Math.round(avgScore),
      submissionCount: studentSubmissions.length,
      pendingCount: studentSubmissions.filter(s => s.score === undefined).length
    };
  };

  const filteredStudents = students.filter(s => {
    const matchesGen = selectedGen === 'all' || s.gen === selectedGen;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGen && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Analyzing Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="border-0 shadow-sm rounded-3xl bg-indigo-600 text-white">
            <CardContent className="p-6">
              <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest mb-1">Total Students</p>
              <h3 className="text-3xl font-black">{students.length}</h3>
              <Users className="absolute top-4 right-4 text-white/20 w-8 h-8" />
            </CardContent>
         </Card>
         <Card className="border-0 shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Active Cohorts</p>
              <h3 className="text-3xl font-black text-slate-900">{gens.length - 1}</h3>
            </CardContent>
         </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-white rounded-4xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search students..." 
               className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-100"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
           Filtering: <span className="text-indigo-600">{selectedGen === 'all' ? 'All Cohorts' : selectedGen}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, i) => {
            const metrics = getStudentMetrics(student.id);
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden group hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex items-center gap-4 min-w-[240px]">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                            alt={student.name}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 truncate uppercase italic group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{student.email}</p>
                          <Badge variant="secondary" className="mt-1 bg-slate-50 text-slate-600 text-[9px] font-black uppercase rounded-lg">
                            {student.gen}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Attendance
                          </p>
                          <div className="flex items-end gap-2">
                            <span className={cn(
                              "text-xl font-black",
                              metrics.attendanceRate >= 80 ? "text-emerald-600" : 
                              metrics.attendanceRate >= 50 ? "text-amber-600" : "text-red-600"
                            )}>{metrics.attendanceRate}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-50 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                metrics.attendanceRate >= 80 ? "bg-emerald-500" : 
                                metrics.attendanceRate >= 50 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${metrics.attendanceRate}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Award className="w-3 h-3" /> Average Score
                          </p>
                          <div className="flex items-end gap-2">
                             <span className="text-xl font-black text-slate-900">{metrics.averageScore}</span>
                             <span className="text-[10px] font-bold text-slate-400 mb-1">/ 100</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <FileText className="w-3 h-3" /> Tasks
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                             <div className="flex flex-col">
                               <span className="text-lg font-black text-slate-900">{metrics.submissionCount}</span>
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Done</span>
                             </div>
                             <div className="w-px h-6 bg-slate-100"></div>
                             <div className="flex flex-col">
                               <span className="text-lg font-black text-indigo-600">{metrics.pendingCount}</span>
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Wait</span>
                             </div>
                          </div>
                        </div>

                        <div className="flex items-center md:justify-end">
                           <TrendingUp className={cn(
                             "w-8 h-8 opacity-20",
                             metrics.averageScore > 80 ? "text-emerald-500" : "text-slate-400"
                           )} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-5xl border border-slate-100">
             <Search className="w-16 h-16 text-slate-100 mx-auto mb-4" />
             <h3 className="text-xl font-black text-slate-300 uppercase italic">No students found</h3>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] p-8 border-0 bg-white shadow-2xl">
          {selectedStudent && (() => {
            const metrics = getStudentMetrics(selectedStudent.id);
            const studentSubs = submissions.filter(s => s.student_id === selectedStudent.id);
            const studentAtts = attendance.filter(a => a.student_id === selectedStudent.id);

            return (
              <>
                <DialogHeader className="mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} alt="avatar" />
                    </div>
                    <div>
                      <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">{selectedStudent.name}</DialogTitle>
                      <DialogDescription className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedStudent.email}</DialogDescription>
                      <Badge className="mt-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0 font-bold">{selectedStudent.gen}</Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Attendance Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" /> Attendance History ({metrics.attendanceRate}%)
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                      {studentAtts.length === 0 && <p className="text-slate-500 text-sm font-medium">No attendance records found.</p>}
                      {studentAtts.map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                           <span className="font-bold text-slate-700">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                           {record.status === 100 && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Present</Badge>}
                           {record.status === 50 && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Late</Badge>}
                           {record.status === 0 && <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Absent</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" /> Submissions ({metrics.submissionCount})
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                      {studentSubs.length === 0 && <p className="text-slate-500 text-sm font-medium">No submissions found.</p>}
                      {studentSubs.map(sub => {
                        const assignment = assignments.find(a => a.id === sub.assignment_id);
                        return (
                          <div key={sub.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-900 line-clamp-1">{assignment ? assignment.title : 'Unknown Assignment'}</span>
                              <span className="text-xs font-bold text-slate-400">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                               {sub.score !== undefined ? (
                                 <Badge className="bg-slate-900 text-white">{sub.score} / 100</Badge>
                               ) : (
                                 <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Pending</Badge>
                               )}
                               <a href={sub.link} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">View Work</a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
