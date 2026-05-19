import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GraduationCap, Mail, ShieldCheck, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { googleSignIn, promoteCurrentUserToAdmin } from '@/lib/auth';

export function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'google' | 'pin'>('google');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const adminPin = '123456'; // Default 6-digit PIN

  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn('admin');
      if (result) {
        setStep('pin');
        toast.success("Identity verified. Please enter your secret PIN.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in as Admin");
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (pin === adminPin) {
      try {
        await promoteCurrentUserToAdmin();
        toast.success("Security clearance verified.");
        navigate('/admin');
      } catch (err) {
        toast.error("Failed to update role. Please try again.");
      }
    } else {
      toast.error("Invalid PIN. Access denied.");
      setPin('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      <Link to="/login" className="mb-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft size={14} /> Student Login
      </Link>
      
      <Card className="w-full max-w-sm shadow-2xl border-0 bg-slate-800 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
        
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            {step === 'google' ? <ShieldCheck className="text-slate-900 w-10 h-10" /> : <KeyRound className="text-slate-900 w-8 h-8" />}
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight uppercase">Admin Access</CardTitle>
            <CardDescription className="text-slate-400 font-medium italic">Instructors & Staff Portal</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pb-10">
          {step === 'google' ? (
            <Button 
              className="w-full h-14 gap-3 font-black bg-white text-slate-900 hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
              onClick={handleGoogleLogin}
            >
              <Mail className="w-4 h-4" />
              Sign in with Workspace
            </Button>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4">
               <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Enter 6-Digit Admin PIN</p>
                 <Input 
                   type="password"
                   maxLength={6}
                   className="h-16 text-center text-3xl font-black tracking-[0.5em] bg-slate-700 border-0 focus:ring-2 focus:ring-white/20 rounded-2xl"
                   value={pin}
                   onChange={(e) => setPin(e.target.value)}
                   autoFocus
                 />
               </div>
               <Button 
                type="submit"
                className="w-full h-14 font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl uppercase tracking-widest"
                disabled={pin.length < 6 || loading}
               >
                 {loading ? <Loader2 className="animate-spin" /> : "Verify PIN"}
               </Button>
               <button 
                 type="button"
                 onClick={() => setStep('google')}
                 className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
               >
                 Back to Identity
               </button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0 pb-8">
          <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
            Authorization required for administrative tools.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
