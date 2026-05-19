import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, MapPin, Search, Video, RefreshCw, ExternalLink } from 'lucide-react';
import { motion } from "motion/react";
import { ScheduleItem } from '@/types';
import { listEvents } from '@/services/googleService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface BigCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  meetUrl?: string;
}

export function Schedule() {
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Controlled Calendar State
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const fetchGoogleEvents = async () => {
    setLoading(true);
    try {
      const data = await listEvents();
      setGoogleEvents(data.items || []);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleEvents();
  }, []);

  // Map Google Events to BigCalendarEvents
  const processedEvents: BigCalendarEvent[] = googleEvents.map(event => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    
    return {
      id: event.id,
      title: event.summary,
      start,
      end,
      meetUrl: event.hangoutLink
    };
  });

  const handleSelectEvent = (event: BigCalendarEvent) => {
    if (event.meetUrl) {
      window.open(event.meetUrl, '_blank');
    } else {
      toast.info(`Event: ${event.title}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Your Schedule</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl font-bold gap-2 ml-4 flex"
          onClick={fetchGoogleEvents}
          disabled={loading}
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Sync Calendar
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden p-6 min-h-[700px] schedule-calendar-wrapper">
        <style>{`
          .schedule-calendar-wrapper .rbc-calendar {
            font-family: inherit;
          }
          .schedule-calendar-wrapper .rbc-event {
            background-color: #4f46e5; /* indigo-600 */
            border-radius: 8px;
            border: none;
            padding: 4px 8px;
          }
          .schedule-calendar-wrapper .rbc-today {
            background-color: #f8fafc; /* slate-50 */
          }
          .schedule-calendar-wrapper .rbc-toolbar button:active,
          .schedule-calendar-wrapper .rbc-toolbar button.rbc-active {
            background-color: #0f172a; /* slate-900 */
            color: white;
            border-color: #0f172a;
          }
          .schedule-calendar-wrapper .rbc-toolbar button {
            border-radius: 8px;
            font-weight: 600;
          }
        `}</style>
        <Calendar
          localizer={localizer}
          events={processedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 650 }}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'work_week', 'day', 'agenda']}
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          components={{
            event: (props: any) => (
              <div className="flex flex-col h-full overflow-hidden text-xs">
                <span className="font-bold truncate leading-tight">{props.title}</span>
                {props.event.meetUrl && (
                  <span className="opacity-80 flex items-center gap-1 mt-1 text-[10px]">
                    <Video size={10} /> Meet
                  </span>
                )}
              </div>
            )
          }}
        />
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
