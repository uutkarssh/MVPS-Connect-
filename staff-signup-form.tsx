
"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import type { StaffRole, Staff } from '@/lib/types';

interface StaffSignupFormProps {
  onBackToLogin: () => void;
}

export function StaffSignupForm({ onBackToLogin }: StaffSignupFormProps) {
  const { signup, allUsers } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [signupDetails, setSignupDetails] = useState({
    name: '',
    email: '',
    password: '',
    staffRole: '' as StaffRole | '',
  });
  
  const availableStaffRoles = useMemo(() => {
    const existingSingletonRoles = allUsers
      .filter(u => u.role === 'staff' && ['principal', 'vp', 'director'].includes(u.staffRole))
      .map(u => (u as Staff).staffRole);
    
    const allRoles: StaffRole[] = ['teacher', 'principal', 'vp', 'director'];
    
    return allRoles.filter(role => {
        if (role === 'teacher') return true;
        return !existingSingletonRoles.includes(role as StaffRole);
    });
  }, [allUsers]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { name, email, password, staffRole } = signupDetails;

    if (!name || !email || !password || !staffRole) {
        toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }
    
    const newUserDetails: Omit<Staff, 'id'> = {
        role: 'staff',
        name,
        email,
        password,
        staffRole: staffRole as StaffRole,
    };

    const success = await signup(newUserDetails);

    if (success) {
        toast({ 
            title: 'Account Created', 
            description: 'Your staff account has been created. Please log in.' 
        });
        onBackToLogin();
    } else {
        toast({ title: 'Signup Failed', description: 'An account with this email already exists, or the selected role (e.g. Director) is already filled.', variant: 'destructive' });
    }

    setIsLoading(false);
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSignupDetails(prev => ({...prev, [id]: value}));
  }
  
  const handleSelectChange = (value: string) => {
    setSignupDetails(prev => ({...prev, staffRole: value as StaffRole}));
  }

  return (
      <form onSubmit={handleSignup} className="space-y-4 pt-4">
          <div className="text-center mb-2">
            <h3 className="font-semibold text-lg">Staff Account Signup</h3>
            <p className="text-sm text-muted-foreground">Create your account to get started.</p>
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
                  <Label htmlFor="staffRole">Role</Label>
                  <Select onValueChange={handleSelectChange} value={signupDetails.staffRole}>
                      <SelectTrigger id="staffRole">
                          <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                      {availableStaffRoles.length > 0 ? availableStaffRoles.map(r => (
                          <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                      )) : (
                        <p className="p-2 text-sm text-muted-foreground">No roles available for signup.</p>
                      )}
                      </SelectContent>
                  </Select>
              </div>
          </div>

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || availableStaffRoles.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
        </Button>
        <Button variant="link" type="button" onClick={onBackToLogin} className="p-0 h-auto w-full flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Login
        </Button>
      </form>
  );
}
