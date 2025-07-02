
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import type { User } from '@/lib/types';
import { TeacherSetup } from './teacher-setup';
import { StudentSignupForm } from './student-signup-form';
import { StaffSignupForm } from './staff-signup-form';
import { ForgotPasswordForm } from './forgot-password-form';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showTeacherSetup, setShowTeacherSetup] = useState(false);
  const [loggedInTeacher, setLoggedInTeacher] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'student-signup' | 'staff-signup' | 'forgot-password'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!loginEmail || !loginPassword) {
      toast({ title: 'Error', description: 'Please enter email and password.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    const user = await login({ email: loginEmail, password: loginPassword });
    if (user) {
        if (user.role === 'staff' && user.staffRole === 'teacher' && !user.isSetupComplete) {
            setLoggedInTeacher(user);
            setShowTeacherSetup(true);
        } else {
            router.push('/dashboard');
        }
    } else {
      toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
    }
    setIsLoading(false);
  };
  
  const onSetupComplete = () => {
    setShowTeacherSetup(false);
    router.push('/dashboard');
  }

  if (showTeacherSetup && loggedInTeacher) {
      return <TeacherSetup isOpen={showTeacherSetup} onOpenChange={setShowTeacherSetup} teacher={loggedInTeacher as any} onSetupComplete={onSetupComplete} />;
  }

  if (view === 'student-signup') {
    return <StudentSignupForm onBackToLogin={() => setView('login')} />;
  }
  
  if (view === 'staff-signup') {
    return <StaffSignupForm onBackToLogin={() => setView('login')} />;
  }
  
  if (view === 'forgot-password') {
    return <ForgotPasswordForm onBackToLogin={() => setView('login')} />;
  }

  return (
    <div className="pt-4">
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                    <Input 
                        id="login-password" 
                        type={showLoginPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        value={loginPassword} 
                        onChange={(e) => setLoginPassword(e.target.value)} 
                        required 
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowLoginPassword(prev => !prev)}
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            <div className="text-right">
                <Button variant="link" type="button" onClick={() => setView('forgot-password')} className="p-0 h-auto text-sm">
                    Forgot Password?
                </Button>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
            </Button>
        </form>
        
        <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">OR</span>
        </div>

        <div className="space-y-2">
            <p className="text-center text-sm text-muted-foreground">
                Don't have an account?
            </p>
            <div className="grid grid-cols-2 gap-4">
                 <Button variant="outline" type="button" onClick={() => setView('student-signup')}>
                    Student Signup
                </Button>
                 <Button variant="outline" type="button" onClick={() => setView('staff-signup')}>
                    Staff Signup
                </Button>
            </div>
        </div>
    </div>
  );
}
