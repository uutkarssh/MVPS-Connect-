"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
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
import { Loader2, Upload, File as FileIcon, X } from 'lucide-react';

interface NewNoticeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNoticePosted: (notice: { title: string; content: string; imageUrl?: string; fileUrl?: string; fileName?: string; fileType?: string; }) => void;
}

export function NewNoticeDialog({ isOpen, onOpenChange, onNoticePosted }: NewNoticeDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [fileUrl, setFileUrl] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileType, setFileType] = useState<string | undefined>();
  const [isPosting, setIsPosting] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl(undefined);
    setFileUrl(undefined);
    setFileName(undefined);
    setFileType(undefined);
    if(imageInputRef.current) imageInputRef.current.value = '';
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: 'Image too large', description: 'Please select an image smaller than 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ variant: 'destructive', title: 'File too large', description: 'Please select a file smaller than 10MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileUrl(reader.result as string);
        setFileName(file.name);
        setFileType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title || !content) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in both title and content.',
      });
      return;
    }
    setIsPosting(true);
    onNoticePosted({ title, content, imageUrl, fileUrl, fileName, fileType });
    
    setTimeout(() => {
        resetForm();
        setIsPosting(false);
        onOpenChange(false);
        toast({
            title: 'Success',
            description: 'Your notice has been posted.',
        });
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Post a New Notice</DialogTitle>
          <DialogDescription>
            This notice will be visible to all students and staff.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Sports Day"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the notice details here."
              className="min-h-[120px]"
            />
          </div>
          <div className="grid gap-2">
            <Label>Attachments</Label>
            <div className="flex gap-2">
              <Input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
              <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
              </Button>
              <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
              </Button>
            </div>
          </div>
          {imageUrl && (
            <div className="relative">
              <Label>Image Preview</Label>
              <Image src={imageUrl} alt="Notice image preview" width={450} height={200} className="rounded-md object-cover mt-2" data-ai-hint="image preview"/>
              <Button variant="destructive" size="icon" className="absolute top-8 right-2 h-6 w-6" onClick={() => setImageUrl(undefined)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {fileName && (
            <div className="relative flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">{fileName}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setFileUrl(undefined); setFileName(undefined); setFileType(undefined); }}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPosting}>
            {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Notice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
