import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Video, Clock, ChevronRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchUpcomingEvents, CalendarEvent } from '@/services/calendarService';
import { initAuth, googleSignIn, getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function CalendarPanel() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(true);

  useEffect(() => {
    initAuth(
      (_user, token) => {
        setNeedsAuth(false);
        loadEvents(token);
      },
      () => setNeedsAuth(true)
    );
  }, []);

  const loadEvents = async (token: string) => {
    setLoading(true);
    try {
      const data = await fetchUpcomingEvents(token);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
        loadEvents(result.accessToken);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  if (needsAuth) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-12 lg:col-span-8 row-span-2 bg-white border border-slate-200 rounded-5xl p-8 shadow-sm flex flex-col justify-center items-center text-center space-y-4"
      >
        <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
          <Calendar size={40} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic">Connect Your Calendar</h3>
          <p className="text-sm text-slate-500 font-medium">Sync your Google Calendar to see upcoming classes and Meet links.</p>
        </div>
        <Button onClick={handleSignIn} className="bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 rounded-2xl px-8 h-14 font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
          <LogIn size={20} className="mr-2" />
          Sign in with Google
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-12 lg:col-span-8 row-span-2 bg-white border border-slate-200 rounded-5xl p-8 shadow-sm flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl"><Calendar className="w-5 h-5 text-white" /></div>
          <h3 className="font-black text-slate-900 uppercase tracking-tight">Live Sessions & Classes</h3>
        </div>
        <Button variant="ghost" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50" onClick={() => {
          const token = getAccessToken();
          if (token) loadEvents(token);
        }}>
          Refresh Sync
        </Button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {events.slice(0, 3).map((event) => {
            const startDate = new Date(event.start.dateTime);
            const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dayStr = startDate.toLocaleDateString([], { weekday: 'short' });
            
            return (
              <div key={event.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 group hover:border-indigo-200 transition-all relative overflow-hidden">
                <p className="text-[10px] uppercase font-black text-slate-400 mb-2">{dayStr} {timeStr}</p>
                <h4 className="text-base font-black text-slate-900 leading-tight mb-2 line-clamp-1">{event.summary}</h4>
                {event.hangoutLink ? (
                  <Button asChild className="w-full mt-2 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-tight shadow-lg shadow-indigo-100">
                    <a href={event.hangoutLink} target="_blank" rel="noopener noreferrer">
                      <Video size={16} className="mr-2" />
                      Join Google Meet
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-slate-500 font-medium italic">No meeting link</p>
                )}
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Video size={80} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Calendar size={32} className="opacity-20" />
          <p className="font-black text-sm uppercase tracking-widest">No upcoming sessions</p>
        </div>
      )}
    </motion.div>
  );
}
