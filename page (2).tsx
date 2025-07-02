"use client";

import { useAuth } from '@/hooks/use-auth';
import { mockExams, mockResults } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ExamsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  const studentResults = user?.role === 'student' ? mockResults.filter(r => r.studentId === user.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Exams &amp; Results</h1>
          <p className="text-muted-foreground">Check exam schedules and view your results.</p>
        </div>
        {isStaff && <Button><Upload className="mr-2 h-4 w-4" /> Upload Results</Button>}
      </div>
      <Separator />

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Upcoming Examinations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockExams.map(exam => (
                <Card key={exam.id}>
                  <CardHeader>
                    <CardTitle className="text-lg font-headline">{exam.title} - Class {exam.class}</CardTitle>
                    <CardDescription>Starts on: {new Date(exam.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exam.subjects.map(subject => (
                          <TableRow key={subject.name}>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>{subject.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="results">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Your Results</CardTitle>
              <CardDescription>Marks obtained in recent examinations.</CardDescription>
            </CardHeader>
            <CardContent>
                {user?.role === 'student' && studentResults.length > 0 ? (
                    studentResults.map(result => {
                        const exam = mockExams.find(e => e.id === result.examId);
                        return (
                            <Card key={result.id} className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">{exam?.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Score</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                        {result.marks.map(mark => (
                                            <TableRow key={mark.subject}>
                                                <TableCell>{mark.subject}</TableCell>
                                                <TableCell>{mark.score} / {mark.max}</TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )
                    })
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                       {user?.role === 'student' ? 'Your results have not been published yet.' : 'Select a student to view results.'}
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
