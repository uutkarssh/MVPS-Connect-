
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const { toast } = useToast();
  const { deleteAccountByEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast({ title: 'Error', description: 'Please enter your email.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    
    await deleteAccountByEmail(email);
    
    toast({ 
        title: 'Account Deleted', 
        description: "Your account has been deleted. You may now sign up again." 
    });
    
    setIsLoading(false);
    onBackToLogin();
  }
  
  return (
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="text-center mb-2">
            <h3 className="font-semibold text-lg">Delete and Re-register</h3>
            <p className="text-sm text-muted-foreground">If you've forgotten your password, you must delete your account and sign up again. This action is irreversible.</p>
          </div>
          <div className="space-y-4 pt-2">
              <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
              </div>
          </div>

        <Button variant="destructive" type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete My Account
        </Button>
        <Button variant="link" type="button" onClick={onBackToLogin} className="p-0 h-auto w-full flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Login
        </Button>
      </form>
  );
}
