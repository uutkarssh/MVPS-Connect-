
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { suggestHomework, type HomeworkSuggestionOutput } from '@/ai/flows/homework-suggestion-flow';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import type { User } from '@/lib/types';

interface GenerateHomeworkDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectIdea: (idea: { title: string; description: string; }) => void;
  classLevel: string;
  userRole?: User['role'];
}

export function GenerateHomeworkDialog({ isOpen, onOpenChange, onSelectIdea, classLevel, userRole }: GenerateHomeworkDialogProps) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<HomeworkSuggestionOutput['suggestions']>([]);
  
  const { toast } = useToast();

  const isStudent = userRole === 'student';
  const canAssignHomework = userRole === 'staff';

  const resetForm = () => {
    setTopic('');
    setSuggestions([]);
  }

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'Topic Required',
        description: 'Please enter a topic to generate ideas.',
      });
      return;
    }
    setIsGenerating(true);
    setSuggestions([]);
    try {
      const result = await suggestHomework({ topic, classLevel });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Error generating homework ideas:", error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate ideas at this time. Please try again later.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (idea: { title: string; description: string; }) => {
    onSelectIdea(idea);
    onOpenChange(false);
    // Reset form after a short delay to allow dialog to close
    setTimeout(resetForm, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-accent"/> 
            {isStudent ? 'AI Study Assistant' : 'AI Homework Assistant'}
            </DialogTitle>
          <DialogDescription>
            {isStudent 
              ? `Enter a topic and let AI generate some creative study ideas for ${classLevel}.`
              : `Enter a topic and let AI generate some creative homework ideas for ${classLevel}.`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="topic">Homework Topic</Label>
            <div className="flex gap-2">
                <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, The Cold War, Fractions"
                />
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate
                </Button>
            </div>
          </div>

          <div className="mt-4">
            {isGenerating && (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Generating ideas...</p>
                </div>
            )}
            {suggestions.length > 0 && (
                <ScrollArea className="h-72 pr-4">
                    <div className="grid gap-4">
                        {suggestions.map((idea, index) => (
                            <Card key={index}>
                                <CardHeader><CardTitle className="text-lg font-headline">{idea.title}</CardTitle></CardHeader>
                                <CardContent><p className="text-sm">{idea.description}</p></CardContent>
                                {canAssignHomework && (
                                  <CardFooter>
                                      <Button variant="outline" onClick={() => handleSelect(idea)}>Use this Idea</Button>
                                  </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            )}
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}
