import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { googleSignIn } from '@/lib/auth';

export function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn('student');
      if (result) {
        // The role and other info are now handled in googleSignIn and saved to profile
        toast.success(`Welcome, ${result.user.displayName}`);
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm relative overflow-hidden">
        {/* Subtle accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
        
        <CardHeader className="text-center space-y-6 pt-12">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl transform skew-x-3">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black tracking-tighter uppercase italic text-slate-900">GEN ACADEMY</CardTitle>
            <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Student Learning Portal</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-12">
          <Button 
            className="w-full h-14 gap-3 font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all uppercase tracking-widest text-xs"
            onClick={handleGoogleLogin}
          >
            <Mail className="w-4 h-4" />
            Continue with Google
          </Button>
          
          <div className="flex flex-col items-center gap-4">
             <div className="w-full h-[1px] bg-slate-100" />
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t border-slate-100 py-6">
          <p className="text-[10px] text-center w-full text-slate-400 font-bold uppercase tracking-widest leading-loose">
            By joining, you enter a commitment to continuous learning and excellence.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
