
"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { Student } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allClasses } from '@/lib/data';
import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';

export default function StudentsPage() {
  const { user, allUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const students = useMemo(() => {
    return allUsers.filter(u => u.role === 'student') as Student[];
  }, [allUsers]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => 
        selectedClass === 'all' || student.class === selectedClass
      )
      .filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rollNo && student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [students, searchTerm, selectedClass]);
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  if (user?.role !== 'staff') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Students</h1>
          <p className="text-muted-foreground">View and manage all students in the school.</p>
        </div>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search for students by name or roll no.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="Search by name or roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:max-w-xs"
          />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="md:max-w-xs">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {allClasses.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredStudents.map((student) => (
          <Link href={`/dashboard/students/${student.id}`} key={student.id} className="block">
            <Card className="h-full hover:shadow-md hover:border-primary transition-all duration-200">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="student avatar" />
                  <AvatarFallback className="text-xl">{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-headline">{student.name}</CardTitle>
                  <CardDescription>
                    Class: {student.class} | Roll No: {student.rollNo}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
        {filteredStudents.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
             <Users className="h-12 w-12 mx-auto mb-4" />
            <p>No students found matching your criteria.</p>
          </div>
        )}
    </div>
  );
}
