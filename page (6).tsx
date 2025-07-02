
"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { User, Student, Staff } from '@/lib/types';
import { ImageCropperDialog } from '@/components/dashboard/image-cropper-dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { allSubjects, allClasses } from '@/lib/data';
import { Loader2, Save, Upload, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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

const MAX_UPDATES_PER_MONTH = 2;

export default function ProfilePage() {
  const { user, updateUser, loading, deleteUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  
  // Student specific
  const [studentClass, setStudentClass] = useState('');
  const [favouriteSubject, setFavouriteSubject] = useState('');
  const [bio, setBio] = useState('');
  
  // Staff specific
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classesTaught, setClassesTaught] = useState<string[]>([]);

  const [canUpdate, setCanUpdate] = useState(true);
  const [updatesLeft, setUpdatesLeft] = useState(MAX_UPDATES_PER_MONTH);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || '');
      
      const currentMonth = new Date().getMonth();
      const lastUpdate = user.lastUpdateMonth ?? currentMonth;
      const updateCount = user.profileUpdateCount ?? 0;

      if (currentMonth !== lastUpdate) {
        setCanUpdate(true);
        setUpdatesLeft(MAX_UPDATES_PER_MONTH);
      } else {
        if (updateCount >= MAX_UPDATES_PER_MONTH) {
          setCanUpdate(false);
        }
        setUpdatesLeft(MAX_UPDATES_PER_MONTH - updateCount);
      }
      
      if (user.role === 'student') {
        setStudentClass(user.class);
        setFavouriteSubject((user as Student).favouriteSubject || '');
        setBio((user as Student).bio || '');
      }
      if (user.role === 'staff' && user.staffRole === 'teacher') {
        setSubjects((user as Staff).subjects || []);
        setClassesTaught((user as Staff).classesTaught || []);
      }
    }
  }, [user]);

  const handleAvatarFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedDataUrl: string) => {
    setAvatar(croppedDataUrl);
    toast({
        title: 'Image Ready',
        description: 'Your new profile picture is ready. Click "Save Changes" to apply it.',
    });
  };

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

  const handleSave = () => {
    if (!user) return;
    if (!canUpdate) {
      toast({
        variant: 'destructive',
        title: 'Update Limit Reached',
        description: `You can only update your profile ${MAX_UPDATES_PER_MONTH} times per month.`,
      });
      return;
    }

    setIsSaving(true);
    const currentMonth = new Date().getMonth();
    let updatedUser: User = { ...user };
    
    const isNewMonth = (user.lastUpdateMonth ?? -1) !== currentMonth;
    const newUpdateCount = isNewMonth ? 1 : (user.profileUpdateCount ?? 0) + 1;
    
    updatedUser = {
      ...updatedUser,
      name,
      avatar,
      profileUpdateCount: newUpdateCount,
      lastUpdateMonth: currentMonth
    };

    if (updatedUser.role === 'student') {
      (updatedUser as Student).class = studentClass;
      (updatedUser as Student).favouriteSubject = favouriteSubject;
      (updatedUser as Student).bio = bio;
    }
    
    if (updatedUser.role === 'staff' && updatedUser.staffRole === 'teacher') {
      (updatedUser as Staff).subjects = subjects;
      (updatedUser as Staff).classesTaught = classesTaught;
    }
    
    updateUser(updatedUser);
    
    setTimeout(() => {
        setIsSaving(false);
        toast({
            title: 'Profile Updated',
            description: 'Your profile has been successfully updated.',
        });
    }, 500);
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };

  if (loading || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ImageCropperDialog
        isOpen={isCropperOpen}
        onOpenChange={setIsCropperOpen}
        imageSrc={imageToCrop}
        onCropComplete={onCropComplete}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">My Profile</h1>
            <p className="text-muted-foreground">View and edit your personal information.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving || !canUpdate}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          You can update your profile {updatesLeft} more time(s) this month.
        </p>
        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your name and profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                      <AvatarImage src={avatar} alt={name} data-ai-hint="user avatar" />
                      <AvatarFallback className="text-4xl">{getInitials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                      <Input
                          id="avatar-upload"
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarFileSelect}
                          className="hidden"
                          accept="image/png, image/jpeg, image/gif"
                      />
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">
                          You can crop your photo after uploading.
                      </p>
                  </div>
              </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {user.role === 'student' && (
           <Card>
              <CardHeader>
                <CardTitle>Academic &amp; Personal Details</CardTitle>
                <CardDescription>Update your class, favourite subject, and bio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select value={studentClass} onValueChange={setStudentClass}>
                      <SelectTrigger id="class">
                          <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                          {allClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="favouriteSubject">Favourite Subject</Label>
                      <Select value={favouriteSubject} onValueChange={setFavouriteSubject}>
                          <SelectTrigger id="favouriteSubject">
                              <SelectValue placeholder="Select your favourite subject" />
                          </SelectTrigger>
                          <SelectContent>
                              {allSubjects.map(subject => (
                                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                          id="bio"
                          value={bio}
                          onChange={e => {
                              if (e.target.value.length <= 100) {
                                  setBio(e.target.value)
                              }
                          }}
                          placeholder="Tell us a little about yourself..."
                          maxLength={100}
                          className="resize-none"
                      />
                      <p className="text-sm text-muted-foreground text-right">{bio.length}/100</p>
                  </div>
              </CardContent>
           </Card>
        )}

        {user.role === 'staff' && user.staffRole === 'teacher' && (
          <Card>
              <CardHeader>
                <CardTitle>Teaching Details</CardTitle>
                <CardDescription>Update the subjects and classes you teach.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label>Subject(s) Taught</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                      {allSubjects.map(subject => (
                          <div key={subject} className="flex items-center space-x-2">
                          <Checkbox
                              id={subject}
                              checked={subjects.includes(subject)}
                              onCheckedChange={() => handleSubjectChange(subject)}
                          />
                          <label htmlFor={subject} className="text-sm font-medium">{subject}</label>
                          </div>
                      ))}
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label>Class(es) Taught</Label>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                      {allClasses.map(c => (
                          <div key={c} className="flex items-center space-x-2">
                          <Checkbox
                              id={`class-${c}`}
                              checked={classesTaught.includes(c)}
                              onCheckedChange={() => handleClassTaughtChange(c)}
                          />
                          <label htmlFor={`class-${c}`} className="text-sm font-medium">{c}</label>
                          </div>
                      ))}
                      </div>
                  </div>
              </CardContent>
          </Card>
        )}

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              This action is permanent and cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from the application.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (user) {
                        deleteUser(user.id);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
