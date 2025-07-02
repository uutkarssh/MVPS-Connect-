"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import type { Notice } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { NewNoticeDialog } from '@/components/dashboard/new-notice-dialog';

export default function NoticeBoardPage() {
  const { user, notices, addNotice } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const isStaff = user?.role === 'staff';

  const handleNoticePosted = (notice: { title: string; content: string; imageUrl?: string; fileUrl?: string; fileName?: string; fileType?: string; }) => {
    addNotice(notice);
  };

  const sortedNotices = [...notices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <NewNoticeDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onNoticePosted={handleNoticePosted}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Notice Board</h1>
            <p className="text-muted-foreground">Latest announcements and updates from the school.</p>
          </div>
          {isStaff && <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Post New Notice</Button>}
        </div>
        <Separator />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedNotices.map((notice) => (
            <Card key={notice.id} className="flex flex-col">
              <CardHeader className="p-0">
                {notice.imageUrl && (
                  <div className="relative aspect-video mb-4">
                    <Image src={notice.imageUrl} alt={notice.title} fill className="rounded-t-lg object-cover" data-ai-hint="announcement illustration"/>
                  </div>
                )}
                <div className="p-6">
                    <CardTitle className="font-headline">{notice.title}</CardTitle>
                    <CardDescription>
                      Posted on {new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm whitespace-pre-wrap">{notice.content}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                 {notice.fileUrl && notice.fileName && (
                   <a href={notice.fileUrl} download={notice.fileName}>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4"/>
                        Download Attachment
                    </Button>
                   </a>
                )}
                <p className="text-xs text-muted-foreground w-full pt-2 border-t">By: {notice.author}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
        {sortedNotices.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
                <p>No notices have been posted yet.</p>
            </div>
        )}
      </div>
    </>
  );
}
