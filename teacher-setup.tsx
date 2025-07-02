"use client";

import { useState } from "react";
import type { Staff } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { allSubjects, allClasses } from "@/lib/data";

interface TeacherSetupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  teacher: Staff;
  onSetupComplete: () => void;
}

export function TeacherSetup({ isOpen, onOpenChange, teacher, onSetupComplete }: TeacherSetupProps) {
  const { updateUser } = useAuth();
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [classTeacherOf, setClassTeacherOf] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classesTaught, setClassesTaught] = useState<string[]>([]);

  const handleSubjectChange = (subject: string) => {
    setSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };
  
  const handleClassTaughtChange = (className: string) => {
    setClassesTaught(prev =>
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const handleSubmit = () => {
    const updatedTeacher: Staff = {
      ...teacher,
      isSetupComplete: true,
      isClassTeacher,
      classTeacherOf: isClassTeacher ? classTeacherOf : undefined,
      subjects,
      classesTaught,
    };
    updateUser(updatedTeacher);
    onSetupComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Teacher Setup</DialogTitle>
          <DialogDescription>
            Welcome! Please complete this one-time setup.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="class-teacher-switch">Are you a Class Teacher?</Label>
            <Switch
              id="class-teacher-switch"
              checked={isClassTeacher}
              onCheckedChange={setIsClassTeacher}
            />
          </div>
          {isClassTeacher && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="class" className="text-right">
                Class
              </Label>
              <Select onValueChange={setClassTeacherOf}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                   {allClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Subject(s) Taught</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {allSubjects.map(subject => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={subject}
                    checked={subjects.includes(subject)}
                    onCheckedChange={() => handleSubjectChange(subject)}
                  />
                  <label
                    htmlFor={subject}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {subject}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Class(es) Taught</Label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {allClasses.map(c => (
                <div key={c} className="flex items-center space-x-2">
                  <Checkbox
                    id={`class-${c}`}
                    checked={classesTaught.includes(c)}
                    onCheckedChange={() => handleClassTaughtChange(c)}
                  />
                  <label
                    htmlFor={`class-${c}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {c}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">Save and Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
