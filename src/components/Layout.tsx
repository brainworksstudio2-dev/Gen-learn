import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Activity, 
  Calendar, 
  Map, 
  LogOut, 
  User,
  GraduationCap,
  Settings,
  Users,
  Menu,
  X,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
}

const studentNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Materials', href: '/materials', icon: BookOpen },
  { name: 'Assignments', href: '/assignments', icon: FileText },
  { name: 'Exercises', href: '/exercises', icon: Activity },
  { name: 'Grades & GPA', href: '/grades', icon: TrendingUp },
  { name: 'Attendance', href: '/attendance', icon: User },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
];

const adminNavItems: NavItem[] = [
  { name: 'Admin Hub', href: '/admin', icon: GraduationCap },
  { name: 'Materials', href: '/admin/materials', icon: BookOpen },
  { name: 'Assignments', href: '/admin/assignments', icon: FileText },
  { name: 'Exercises', href: '/admin/exercises', icon: Activity },
  { name: 'Attendance', href: '/admin/attendance', icon: Users },
  { name: 'Schedule', href: '/admin/schedule', icon: Calendar },
  { name: 'Roadmap', href: '/admin/roadmap', icon: Map },
  { name: 'Performance', href: '/admin/performance', icon: TrendingUp },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
];

export function Layout({ admin = false }: { admin?: boolean; key?: React.Key }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = admin ? adminNavItems : studentNavItems;
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    localStorage.setItem('admin_selected_gen', selectedGen);
    window.dispatchEvent(new CustomEvent('admin_gen_changed', { detail: selectedGen }));
  }, [selectedGen]);

  useEffect(() => {
    const checkUser = () => {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(currentUser);
    };
    checkUser();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden h-screen relative">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 ease-in-out h-full flex flex-col shrink-0",
          isMobile 
            ? "fixed inset-y-0 left-0 z-40 w-64 transform" + (isSidebarOpen ? " translate-x-0 shadow-2xl" : " -translate-x-full")
            : "z-20 static " + (isSidebarOpen ? "w-64" : "w-20")
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            {(isSidebarOpen || isMobile) && (
              <span className="font-black text-xl tracking-tight text-slate-900 uppercase italic">
                GEN LMS
              </span>
            )}
            {isMobile && (
              <Button variant="ghost" size="icon" className="ml-auto md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  location.pathname === item.href 
                    ? "bg-indigo-50 text-indigo-700 font-bold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 min-w-[20px]",
                  location.pathname === item.href ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {(isSidebarOpen || isMobile) && (
                  <span className="text-sm whitespace-nowrap">{item.name}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 space-y-2 border-t border-slate-100">
          {!admin && user?.role === 'admin' && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all font-bold text-xs uppercase tracking-wider",
                (!isSidebarOpen && !isMobile) && "justify-center px-0"
              )}
            >
              <Settings className="w-5 h-5" />
              {(isSidebarOpen || isMobile) && <span>Admin Hub</span>}
            </Link>
          )}
          {admin && (
            <Link
              to="/"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all font-bold text-xs uppercase tracking-wider",
                (!isSidebarOpen && !isMobile) && "justify-center px-0"
              )}
            >
              <Users className="w-5 h-5" />
              {(isSidebarOpen || isMobile) && <span>Student View</span>}
            </Link>
          )}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                />
             </div>
             {(isSidebarOpen || isMobile) && (
               <div className="min-w-0 flex-1">
                 <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{user?.gen}</p>
               </div>
             )}
             {(isSidebarOpen || isMobile) && (
               <button onClick={handleLogout} className="ml-auto text-slate-400 hover:text-red-500 transition-colors p-1">
                 <LogOut className="w-4 h-4 shrink-0" />
               </button>
             )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden w-full relative z-10">
        {/* Header */}
        <header className="px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4 bg-slate-50 z-10 sticky top-0 border-b md:border-none border-slate-200/50">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-indigo-600 bg-indigo-50/50" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase italic line-clamp-1">
                  {navItems.find(i => i.href === location.pathname)?.name || 'Dashboard'}
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium hidden sm:block">
                  Welcome back, <span className="text-indigo-600 font-bold">{user?.name}</span>. Here's your cohort update.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {admin && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm shrink-0">
                <Users className="w-4 h-4 text-slate-400" />
                <select 
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer p-0"
                  value={selectedGen}
                  onChange={(e) => setSelectedGen(e.target.value)}
                >
                  <option value="all">All Cohorts</option>
                  <option value="GEN30">GEN 30</option>
                  <option value="GEN31">GEN 31</option>
                  <option value="GEN32">GEN 32</option>
                </select>
              </div>
            )}
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-full flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0 ml-auto md:ml-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Live Session: SE104
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar pt-4 md:pt-0">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
