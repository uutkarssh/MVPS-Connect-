"use client";

import { useAuth } from '@/hooks/use-auth';
import { mockTimetable } from '@/lib/data';
import type { TimetableEntry, Staff } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function TimetablePage() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'staff' && (user as Staff).staffRole === 'teacher';

  let timetable: TimetableEntry[] = [];
  let displayClass = '';

  if (user?.role === 'student') {
    displayClass = user.class;
    timetable = mockTimetable[displayClass] || [];
  } else if (isTeacher && (user as Staff).isClassTeacher && (user as Staff).classTeacherOf) {
    displayClass = (user as Staff).classTeacherOf!;
    timetable = mockTimetable[displayClass] || [];
  } else {
    // Fallback for other staff or teachers who aren't class teachers
    displayClass = '10A'; // Default view
    timetable = mockTimetable[displayClass] || [];
  }

  const defaultTab = timetable.length > 0 ? timetable[0].day : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Timetable {displayClass && `- Class ${displayClass}`}</h1>
          <p className="text-muted-foreground">Your weekly class schedule.</p>
        </div>
        {isTeacher && <Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit Timetable</Button>}
      </div>
      <Separator />
    
      {timetable.length > 0 ? (
        <Card>
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {timetable.map((day) => (
                  <TabsTrigger key={day.day} value={day.day}>{day.day}</TabsTrigger>
                ))}
              </TabsList>
              {timetable.map((day) => (
                <TabsContent key={day.day} value={day.day}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-headline">{day.day}'s Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead>Subject</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {day.periods.map((period) => (
                            <TableRow key={period.time}>
                              <TableCell className="font-medium">{period.time}</TableCell>
                              <TableCell>{period.subject}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
                <p>No timetable available for your class yet.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
