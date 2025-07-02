
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { Student } from '@/lib/types';
import { mockHomework, mockExams, mockResults } from '@/lib/data';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageSquare, BookOpen, Target, CheckCircle, Percent, Trash2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';
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


export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { allUsers, loading: authLoading, user: currentUser, deleteUser } = useAuth();
  
  const studentId = params.studentId as string;
  const isStaff = currentUser?.role === 'staff';
  const [showFinalDeleteDialog, setShowFinalDeleteDialog] = useState(false);

  const student = useMemo(() => {
    if (authLoading) return null;
    const foundUser = allUsers.find(u => u.id === studentId);
    return (foundUser && foundUser.role === 'student') ? foundUser as Student : null;
  }, [studentId, allUsers, authLoading]);

  const academicData = useMemo(() => {
    if (!student) return null;
    
    const hwForClass = mockHomework.filter(hw => hw.class === student.class);
    // Mocking 80% completion for demonstration as we don't track submissions
    const completedHwCount = Math.floor(hwForClass.length * 0.8);

    const exTaken = mockResults.filter(r => r.studentId === studentId);
    const exForClass = mockExams.filter(e => e.class === student.class);

    let totalScore = 0;
    let totalMaxScore = 0;
    exTaken.forEach(exam => {
        exam.marks.forEach(mark => {
            totalScore += mark.score;
            totalMaxScore += mark.max;
        });
    });
    const avgScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

    return {
      homeworkForClass: hwForClass,
      completedHomeworkCount: completedHwCount,
      examsTaken: exTaken,
      totalExamsForClass: exForClass,
      averageScore: avgScore,
    };
  }, [student, studentId]);
  
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

  if (!student) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center space-y-4">
        <p className="text-muted-foreground">Student not found.</p>
        <Button onClick={() => router.push('/dashboard/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
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
            <h1 className="text-3xl font-bold font-headline">Student Profile</h1>
            <p className="text-muted-foreground">Detailed view of {student.name}.</p>
        </div>
      </div>
      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="student avatar" />
                        <AvatarFallback className="text-4xl">{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline">{student.name}</CardTitle>
                    <CardDescription>Class {student.class} | Roll No: {student.rollNo}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" asChild>
                        <Link href={`/dashboard/chat?userId=${student.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat with Student
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-lg">Personal Details</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {student.bio ? (
                        <div><p className="font-semibold text-muted-foreground">Bio</p><p className="italic">"{student.bio}"</p></div>
                    ) : <p className="text-muted-foreground italic">No bio provided.</p>}
                    {student.favouriteSubject && <div><p className="font-semibold text-muted-foreground">Favourite Subject</p><p>{student.favouriteSubject}</p></div>}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Academic Progress</CardTitle>
                    <CardDescription>Overview of the student's performance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base">Homework Completion</h3>
                        <div className="flex items-center gap-4">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <div className="flex-grow">
                                <Progress value={academicData?.homeworkForClass.length ? (academicData.completedHomeworkCount / academicData.homeworkForClass.length) * 100 : 0} />
                                <p className="text-xs text-muted-foreground mt-1">{academicData?.completedHomeworkCount} of {academicData?.homeworkForClass.length} assignments completed (mock data).</p>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base">Exams & Performance</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="bg-muted/50">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Exams Taken</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{academicData?.examsTaken.length} / {academicData?.totalExamsForClass.length}</div>
                                    <p className="text-xs text-muted-foreground">Total exams for Class {student.class}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/50">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{academicData?.averageScore}%</div>
                                    <p className="text-xs text-muted-foreground">Across all subjects</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    {academicData && academicData.examsTaken.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-base">Recent Exam Results</h3>
                        <div className="space-y-2">
                        {academicData.examsTaken.slice(0, 2).map(result => {
                            const exam = mockExams.find(e => e.id === result.examId);
                            return (
                                <div key={result.id} className="p-3 border rounded-lg bg-background">
                                    <p className="font-semibold text-sm">{exam?.title}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                    {result.marks.map(mark => (
                                        <span key={mark.subject}>{mark.subject}: <strong>{mark.score}/{mark.max}</strong></span>
                                    ))}
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                      </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      {isStaff && (
        <Card className="border-destructive mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              This action will permanently delete this student's account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Student Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete {student.name}'s account and all associated data. This cannot be undone. Are you sure you want to continue?
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
                    This is the final warning. This action is irreversible. Are you sure you want to permanently delete the account for {student.name}?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                        deleteUser(student.id);
                        router.push('/dashboard/students');
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
