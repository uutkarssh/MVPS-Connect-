
"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { Staff } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Briefcase } from 'lucide-react';

export default function StaffPage() {
  const { user, allUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const staffMembers = useMemo(() => {
    return allUsers.filter(u => u.role === 'staff' && u.id !== user?.id) as Staff[];
  }, [allUsers, user]);

  const filteredStaff = useMemo(() => {
    return staffMembers
      .filter(staff => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [staffMembers, searchTerm]);
  
  const getInitials = (name: string) => {
    if (!name) return 'S';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  if (user?.role !== 'staff' || !['director', 'principal', 'vp'].includes(user.staffRole)) {
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
          <h1 className="text-3xl font-bold font-headline">Staff</h1>
          <p className="text-muted-foreground">View and check progress of all staff members.</p>
        </div>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search for staff by name.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:max-w-xs"
          />
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredStaff.map((staff) => (
          <Link href={`/dashboard/teachers/${staff.id}`} key={staff.id} className="block">
            <Card className="h-full hover:shadow-md hover:border-primary transition-all duration-200">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={staff.avatar} alt={staff.name} data-ai-hint="staff avatar" />
                  <AvatarFallback className="text-xl">{getInitials(staff.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-headline">{staff.name}</CardTitle>
                  <CardDescription className="capitalize">
                    {staff.staffRole}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
        {filteredStaff.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
             <Briefcase className="h-12 w-12 mx-auto mb-4" />
            <p>No staff members found matching your criteria.</p>
          </div>
        )}
    </div>
  );
}
