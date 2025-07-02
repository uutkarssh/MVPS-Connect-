
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allSubjects, allClasses } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Homework } from '@/lib/types';

interface NewHomeworkDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onHomeworkPosted: (homework: Omit<Homework, 'id' | 'teacherId'>) => void;
}

export function NewHomeworkDialog({ isOpen, onOpenChange, onHomeworkPosted }: NewHomeworkDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [isPosting, setIsPosting] = useState(false);
  
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setClassName('');
    setDueDate(undefined);
  }

  const handleSubmit = () => {
    if (!title || !description || !subject || !className || !dueDate) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields.',
      });
      return;
    }
    setIsPosting(true);
    onHomeworkPosted({ title, description, subject, class: className, dueDate: dueDate.toISOString() });
    
    setTimeout(() => {
        resetForm();
        setIsPosting(false);
        onOpenChange(false);
        toast({
            title: 'Success',
            description: 'The homework has been assigned.',
        });
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign New Homework</DialogTitle>
          <DialogDescription>
            This assignment will be visible to students in the selected class.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 5 Exercise"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter assignment details here."
              className="min-h-[120px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger id="subject"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>{allSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="class">Class</Label>
                <Select value={className} onValueChange={setClassName}>
                    <SelectTrigger id="class"><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>{allClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="dueDate"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPosting}>
            {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Homework
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
