
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileUp, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Staff, Homework, Student } from '@/lib/types';
import { NewHomeworkDialog } from '@/components/dashboard/new-homework-dialog';
import { GenerateHomeworkDialog } from '@/components/dashboard/generate-homework-dialog';

export default function HomeworkPage() {
  const { user, homework, addHomework } = useAuth();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const isTeacher = user?.role === 'staff' && (user as Staff).staffRole === 'teacher';
  const isStudent = user?.role === 'student';

  const handleHomeworkPosted = (hw: Omit<Homework, 'id' | 'teacherId'>) => {
    if (user?.role === 'staff') {
        addHomework({ ...hw, teacherId: user.id });
    }
  };

  const relevantHomework = user?.role === 'student' 
    ? homework.filter(hw => hw.class === user.class)
    : (isTeacher ? homework.filter(hw => (user as Staff).classesTaught?.includes(hw.class)) : homework);

  const sortedHomework = [...relevantHomework].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  return (
    <>
      {isTeacher && (
        <NewHomeworkDialog 
          isOpen={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          onHomeworkPosted={handleHomeworkPosted}
        />
      )}
      {isStudent && user && (
         <GenerateHomeworkDialog 
            isOpen={isGeneratorOpen}
            onOpenChange={setIsGeneratorOpen}
            onSelectIdea={() => {}} // No action on select for students
            classLevel={(user as Student).class}
            userRole="student"
        />
      )}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Homework</h1>
            <p className="text-muted-foreground">View and manage homework assignments.</p>
          </div>
          <div className="flex gap-2">
            {isTeacher && (
              <Button onClick={() => setIsAssignDialogOpen(true)}>
                <FileUp className="mr-2 h-4 w-4" /> Assign Homework
              </Button>
            )}
             {isStudent && (
              <Button variant="outline" onClick={() => setIsGeneratorOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" /> Get Study Ideas with AI
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedHomework.map((hw) => (
            <Card key={hw.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline">{hw.title}</CardTitle>
                    <Badge variant="secondary">{hw.subject}</Badge>
                </div>
                <CardDescription>
                  Due by: {new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' | '}
                  For Class: {hw.class}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{hw.description}</p>
              </CardContent>
            </Card>
          ))}
          {sortedHomework.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No homework assigned yet. Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
