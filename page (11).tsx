
"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { Staff } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageSquare, BookOpen, BadgeCheck, Trash2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function StaffProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { allUsers, loading: authLoading, user: currentUser, homework, deleteUser } = useAuth();
  
  const staffId = params.teacherId as string;
  const isDirector = currentUser?.role === 'staff' && currentUser.staffRole === 'director';
  const canViewProfile = currentUser?.role === 'staff' && ['director', 'principal', 'vp'].includes(currentUser.staffRole);
  const [showFinalDeleteDialog, setShowFinalDeleteDialog] = useState(false);

  const staffMember = useMemo(() => {
    if (authLoading) return null;
    const foundUser = allUsers.find(u => u.id === staffId);
    return (foundUser && foundUser.role === 'staff') ? foundUser as Staff : null;
  }, [staffId, allUsers, authLoading]);

  const teacherHomework = useMemo(() => {
    if (!staffMember || staffMember.staffRole !== 'teacher') return [];
    return homework.filter(hw => hw.teacherId === staffMember.id);
  }, [homework, staffMember]);
  
  const getInitials = (name: string) => {
    if (!name) return 'S';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
  };

  if (authLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!canViewProfile) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
    )
  }

  if (!staffMember) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center space-y-4">
        <p className="text-muted-foreground">Staff member not found.</p>
        <Button onClick={() => router.push('/dashboard/teachers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Staff List
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
            <h1 className="text-3xl font-bold font-headline">Staff Profile</h1>
            <p className="text-muted-foreground">Detailed view of {staffMember.name}.</p>
        </div>
      </div>
      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={staffMember.avatar} alt={staffMember.name} data-ai-hint="staff avatar" />
                        <AvatarFallback className="text-4xl">{getInitials(staffMember.name)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline">{staffMember.name}</CardTitle>
                    <CardDescription className="capitalize">{staffMember.staffRole}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" asChild>
                        <Link href={`/dashboard/chat?userId=${staffMember.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat with Staff
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            {staffMember.staffRole === 'teacher' && (
              <Card>
                  <CardHeader><CardTitle className="text-lg font-headline">Teaching Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4 text-sm">
                      <div>
                          <p className="font-semibold text-muted-foreground">Subjects Taught</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                              {staffMember.subjects?.length ? staffMember.subjects.map(s => <Badge key={s} variant="secondary">{s}</Badge>) : <p className="text-muted-foreground italic">No subjects assigned.</p>}
                          </div>
                      </div>
                      <div>
                          <p className="font-semibold text-muted-foreground">Classes Taught</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                              {staffMember.classesTaught?.length ? staffMember.classesTaught.map(c => <Badge key={c}>{c}</Badge>) : <p className="text-muted-foreground italic">No classes assigned.</p>}
                          </div>
                      </div>
                      {staffMember.isClassTeacher && staffMember.classTeacherOf && (
                          <div>
                              <p className="font-semibold text-muted-foreground">Class Teacher</p>
                              <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-green-500" /> Class {staffMember.classTeacherOf}</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
            )}
        </div>

        <div className="lg:col-span-2">
            {staffMember.staffRole === 'teacher' && (
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline">Teacher Progress</CardTitle>
                      <CardDescription>Overview of the teacher's activity.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <Card className="bg-muted/50">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-sm font-medium">Homework Assigned</CardTitle>
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold">{teacherHomework.length}</div>
                              <p className="text-xs text-muted-foreground">Total assignments created</p>
                          </CardContent>
                      </Card>

                      {teacherHomework.length > 0 ? (
                        <div>
                          <h3 className="font-semibold mb-2 text-base">Recent Assignments</h3>
                          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Title</TableHead>
                                      <TableHead>Class</TableHead>
                                      <TableHead>Due Date</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                              {teacherHomework.slice(0, 10).map(hw => (
                                <TableRow key={hw.id}>
                                    <TableCell className="font-medium">{hw.title}</TableCell>
                                    <TableCell>{hw.class}</TableCell>
                                    <TableCell>{new Date(hw.dueDate).toLocaleDateString()}</TableCell>
                                </TableRow>
                              ))}
                              </TableBody>
                          </Table>
                          </div>
                        </div>
                      ) : (
                          <div className="text-center py-10 text-muted-foreground">
                              <p>This teacher has not assigned any homework yet.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
            )}
        </div>
      </div>
      
      {isDirector && staffMember.id !== currentUser?.id && (
        <Card className="border-destructive mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              This action will permanently delete this staff member's account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Staff Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete {staffMember.name}'s account and all associated data. This cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => setShowFinalDeleteDialog(true)}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>

    {/* Final Confirmation Dialog */}
    <AlertDialog open={showFinalDeleteDialog} onOpenChange={setShowFinalDeleteDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                <AlertDialogDescription>
                    This is the final warning. This action is irreversible. Are you sure you want to permanently delete the account for {staffMember.name}?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      deleteUser(staffMember.id);
                      router.push('/dashboard/teachers');
                    }}
                >
                    Yes, permanently delete this account
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
