import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Calendar as CalendarIcon, Clock, Loader2, CheckCircle2, Users, Trash2, RefreshCw } from 'lucide-react';
import { createMeeting, listEvents, deleteEvent } from '@/services/googleService';
import { toast } from 'sonner';

export function ManageSchedule() {
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [loading, setLoading] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<any>(null);

  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handleGenChange = (e: any) => setSelectedGen(e.detail);
    window.addEventListener('admin_gen_changed', handleGenChange);
    return () => window.removeEventListener('admin_gen_changed', handleGenChange);
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await listEvents();
      // filter to future events and sort
      const events = data.items || [];
      const now = new Date().getTime();
      const upcoming = events.filter((e: any) => {
        const eventTime = new Date(e.start.dateTime || e.start.date).getTime();
        return eventTime >= now - 24 * 60 * 60 * 1000; // keep today's past events too
      }).sort((a: any, b: any) => {
        return new Date(a.start.dateTime || a.start.date).getTime() - new Date(b.start.dateTime || b.start.date).getTime();
      });
      setUpcomingSessions(upcoming);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const startTime = `${date}T${time}:00`;
      const result = await createMeeting(title, description, startTime, parseInt(duration));
      setCreatedMeeting(result);
      toast.success('Google Meet session created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    setDeletingId(eventId);
    try {
      await deleteEvent(eventId);
      toast.success('Session deleted successfully!');
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-black uppercase italic">Create Session</CardTitle>
          <CardDescription className="font-medium text-slate-500">
            Schedule a new class session with an automatic Google Meet link.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleCreateMeeting} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold text-slate-700 uppercase text-xs tracking-widest">Session Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Advanced React Architecture" 
                className="rounded-xl border-slate-100 bg-slate-50 px-4 py-6 font-medium focus:ring-slate-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold text-slate-700 uppercase text-xs tracking-widest">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Topics to be covered..." 
                className="rounded-xl border-slate-100 bg-slate-50 p-4 font-medium min-h-[100px] focus:ring-slate-200"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="font-bold text-slate-700 uppercase text-xs tracking-widest">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  className="rounded-xl border-slate-100 bg-slate-50 font-medium"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="font-bold text-slate-700 uppercase text-xs tracking-widest">Time</Label>
                <Input 
                  id="time" 
                  type="time" 
                  className="rounded-xl border-slate-100 bg-slate-50 font-medium"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="font-bold text-slate-700 uppercase text-xs tracking-widest">Duration (minutes)</Label>
              <Input 
                id="duration" 
                type="number" 
                className="rounded-xl border-slate-100 bg-slate-50 font-medium"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
               <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Target Cohort</p>
                    <p className="font-bold text-slate-900">{selectedGen === 'all' ? 'Select a specific GEN to target' : selectedGen}</p>
                  </div>
               </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-lg shadow-xl shadow-indigo-100 gap-3"
              disabled={loading || selectedGen === 'all'}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Video />}
              {selectedGen === 'all' ? 'Select a Cohort First' : 'Create Session for ' + selectedGen}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {createdMeeting && (
          <Card className="border-0 shadow-sm rounded-3xl bg-indigo-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 font-bold uppercase text-xs tracking-widest mb-6 bg-white/20 w-fit px-4 py-2 rounded-full">
                <CheckCircle2 size={16} />
                Successfully Created
              </div>
              <h3 className="text-3xl font-black mb-2">{createdMeeting.summary}</h3>
              <p className="text-indigo-100 font-medium mb-6 opacity-80">{createdMeeting.description}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-indigo-50 font-bold">
                  <CalendarIcon size={20} className="opacity-60" />
                  {new Date(createdMeeting.start.dateTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-3 text-indigo-50 font-bold">
                  <Clock size={20} className="opacity-60" />
                  {new Date(createdMeeting.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <a 
                href={createdMeeting.hangoutLink} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-lg"
              >
                <Video size={20} />
                Join Google Meet
              </a>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-sm rounded-3xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase">Upcoming Sessions</CardTitle>
              <CardDescription>Manage scheduled calendar events</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchSessions} disabled={loadingSessions}>
              <RefreshCw className={loadingSessions ? "animate-spin" : ""} size={18} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions.length === 0 && !loadingSessions && (
              <p className="text-slate-500 font-medium text-center py-4">No upcoming sessions found.</p>
            )}
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{session.summary}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                    <CalendarIcon size={12} />
                    {new Date(session.start.dateTime || session.start.date).toLocaleString([], {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteSession(session.id)}
                  disabled={deletingId === session.id}
                >
                  {deletingId === session.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

