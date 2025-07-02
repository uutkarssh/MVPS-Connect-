"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { chatWithAssistant } from '@/ai/flows/assistant-flow';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            setTimeout(() => {
                scrollViewport.scrollTop = scrollViewport.scrollHeight;
            }, 0);
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    setTimeout(scrollToBottom, 100);

    try {
      const result = await chatWithAssistant({
        query: input,
        history: messages,
      });
      const assistantMessage: Message = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error with AI Assistant:", error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not get a response from the assistant. Please try again.',
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-20"
        size="icon"
      >
        <Sparkles className="h-7 w-7" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2 font-headline">
              <Bot className="text-primary" />
              Connect AI Assistant
            </DialogTitle>
            <DialogDescription>
              Your personal AI helper. Ask me anything about your studies or school topics!
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow min-h-0 relative">
            <ScrollArea className="absolute inset-0" ref={scrollAreaRef}>
              <div className="p-6 pt-0 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground pt-10">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      msg.role === 'user' && 'flex-row-reverse'
                    )}
                  >
                    {msg.role === 'model' ? (
                       <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex-shrink-0">
                            <AvatarFallback><Bot size={20}/></AvatarFallback>
                       </Avatar>
                    ) : (
                       user && (
                         <Avatar className="h-8 w-8 flex-shrink-0">
                           <AvatarImage src={user.avatar} alt={user.name} />
                           <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                         </Avatar>
                       )
                    )}
                    <div
                      className={cn(
                        "rounded-xl p-3 text-sm shadow-sm max-w-sm md:max-w-md",
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-card text-card-foreground rounded-bl-none'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex-shrink-0">
                            <AvatarFallback><Bot size={20}/></AvatarFallback>
                        </Avatar>
                        <div className="rounded-xl p-3 text-sm shadow-sm bg-card text-card-foreground rounded-bl-none flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin"/>
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
                className="bg-muted focus-visible:ring-primary"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
