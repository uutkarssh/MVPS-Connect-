
"use client";

import { useAuth } from '@/hooks/use-auth';
import { DashboardContent } from '@/components/dashboard/dashboard-cards';
import { useState, useEffect } from 'react';
import { motivationalQuotes } from '@/lib/data';

export default function DashboardPage() {
  const { user } = useAuth();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's your overview for today.</p>
        {quote && (
            <blockquote className="mt-4 border-l-2 pl-6 italic text-muted-foreground">
                "{quote}"
            </blockquote>
        )}
      </div>
      <DashboardContent user={user} />
    </div>
  );
}
