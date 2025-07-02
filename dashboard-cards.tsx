
"use client";

import Link from 'next/link';
import type { User, TimetableEntry } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookCopy, Calendar, ClipboardList, GraduationCap, PlusCircle, UserPlus, FileUp, Clock, Megaphone } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { mockTimetable } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const { notices, homework } = useAuth();
  const isStaff = user.role === 'staff';

  // --- Data processing for widgets ---

  // Today's Timetable
  const today = new Date().toLocaleString('en-us', { weekday: 'long' });
  let userTimetable: TimetableEntry | undefined;
  if (user.role === 'student') {
    userTimetable = mockTimetable[user.class]?.find(d => d.day === today);
  } else if (user.role === 'staff' && user.staffRole === 'teacher') {
    // A bit more complex for teachers, find all periods they teach today
    const teacherPeriods: {time: string, subject: string, class: string}[] = [];
    Object.entries(mockTimetable).forEach(([className, schedule]) => {
        const todaySchedule = schedule.find(d => d.day === today);
        todaySchedule?.periods.forEach(p => {
            if (p.teacher === user.name) {
                teacherPeriods.push({ ...p, class: className });
            }
        });
    });
    if (teacherPeriods.length > 0) {
        userTimetable = { day: today, periods: teacherPeriods.sort((a,b) => a.time.localeCompare(b.time)) as any };
    }
  }

  // Upcoming Homework
  const upcomingHomework = (user.role === 'student' ? homework.filter(hw => hw.class === user.class) : [])
    .filter(hw => new Date(hw.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Recent Notices
  const recentNotices = notices.slice(0, 2);

  // Quick Links
  const quickLinks = [
    { title: 'My Profile', description: 'View & edit your profile', href: '/dashboard/profile', icon: UserPlus },
    { title: 'Chat', description: 'Message students or staff', href: '/dashboard/chat', icon: Megaphone },
    { title: 'Exams & Results', description: 'Schedules and marks', href: '/dashboard/exams', icon: GraduationCap },
    ...(isStaff ? [{ title: 'Manage Students', description: 'View all student profiles', href: '/dashboard/students', icon: BookCopy }] : []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Main Content Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Today's Schedule Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><Clock className="h-6 w-6 text-primary" /> Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {userTimetable && userTimetable.periods.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead>Subject</TableHead>
                            {isStaff && <TableHead>Class</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userTimetable.periods.map((period: any, index) => (
                            <TableRow key={index}>
                                <TableCell>{period.time}</TableCell>
                                <TableCell>{period.subject}</TableCell>
                                {isStaff && <TableCell>{period.class}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-sm">You have no classes scheduled for today. Enjoy your day!</p>
            )}
          </CardContent>
        </Card>

        {user.role === 'student' && upcomingHomework.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><ClipboardList className="h-6 w-6 text-primary" /> Upcoming Homework</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {upcomingHomework.map(hw => (
                        <div key={hw.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <div>
                                <p className="font-semibold">{hw.title} <Badge variant="secondary" className="ml-2">{hw.subject}</Badge></p>
                                <p className="text-sm text-muted-foreground">Due: {new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/dashboard/homework">View</Link>
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}
      </div>

      {/* Side Content Column */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {quickLinks.map(link => (
                <Link href={link.href} key={link.title} className="block p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <link.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{link.title}</p>
                        <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </Link>
             ))}
          </CardContent>
        </Card>

        {recentNotices.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Notice Board</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recentNotices.map(notice => (
                        <div key={notice.id}>
                            <p className="font-semibold text-sm truncate">{notice.title}</p>
                            <p className="text-xs text-muted-foreground">
                                By {notice.author} - {new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/notice-board">View All Notices</Link>
                    </Button>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
