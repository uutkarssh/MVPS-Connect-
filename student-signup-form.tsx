
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { allClasses } from '@/lib/data';
import type { Student } from '@/lib/types';

interface StudentSignupFormProps {
  onBackToLogin: () => void;
}

export function StudentSignupForm({ onBackToLogin }: StudentSignupFormProps) {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [signupDetails, setSignupDetails] = useState({
    name: '',
    email: '',
    password: '',
    class: '',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { name, email, password, class: studentClass } = signupDetails;

    if (!name || !email || !password || !studentClass) {
        toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }
    
    const newUser: Omit<Student, 'id' | 'rollNo'> = {
        role: 'student',
        name,
        email,
        password,
        class: studentClass
    }
    
    const success = await signup(newUser as any); // The context handles the rest
    if (success) {
        toast({ 
            title: 'Account Created!', 
            description: 'You will be redirected to the dashboard.' 
        });
        // The auth context will redirect to dashboard on successful login, which signup does automatically for students
    } else {
        toast({ title: 'Signup Failed', description: 'An account with this email might already exist.', variant: 'destructive' });
    }

    setIsLoading(false);
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSignupDetails(prev => ({...prev, [id]: value}));
  }
  
  const handleSelectChange = (value: string) => {
    setSignupDetails(prev => ({...prev, class: value}));
  }
  
  return (
      <form onSubmit={handleSignup} className="space-y-4 pt-4">
          <div className="text-center mb-2">
            <h3 className="font-semibold text-lg">Student Signup</h3>
            <p className="text-sm text-muted-foreground">Create your student account.</p>
          </div>
          <div className="space-y-4 pt-2">
              <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" value={signupDetails.name} onChange={handleInputChange} required/>
              </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={signupDetails.email} onChange={handleInputChange} required/>
              </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                        id="password" 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password" 
                        value={signupDetails.password} 
                        onChange={handleInputChange} 
                        required
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowPassword(prev => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                   <Select onValueChange={handleSelectChange} value={signupDetails.class}>
                      <SelectTrigger id="class">
                          <SelectValue placeholder="Select your class" />
                      </SelectTrigger>
                      <SelectContent>
                        {allClasses.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
          </div>

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
        </Button>
        <Button variant="link" type="button" onClick={onBackToLogin} className="p-0 h-auto w-full flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Login
        </Button>
      </form>
  );
}
