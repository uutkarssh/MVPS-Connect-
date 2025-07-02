
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal, MessageSquare, ArrowLeft, Paperclip, X as CloseIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ChatPage() {
  const { user: currentUser, allUsers, messages, sendMessage } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && allUsers.length > 0 && !selectedUser) {
      const userToSelect = allUsers.find(u => u.id === userId);
      if (userToSelect) {
        setSelectedUser(userToSelect);
      }
    }
  }, [searchParams, allUsers, selectedUser]);

  const contacts = useMemo(() => {
    if (!currentUser) return [];

    let contactList: User[] = [];
    if (currentUser.role === 'staff') {
      contactList = allUsers.filter(u => u.role === 'student');
    } else if (currentUser.role === 'student') {
      contactList = allUsers.filter(u => u.role === 'staff');
    }

    const lastMessageTimestamps = new Map<string, number>();
    messages.forEach(msg => {
        const otherParticipantId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
        const isContact = contactList.some(c => c.id === otherParticipantId);
        if (isContact) {
            const timestamp = new Date(msg.timestamp).getTime();
            if (!lastMessageTimestamps.has(otherParticipantId) || timestamp > (lastMessageTimestamps.get(otherParticipantId) ?? 0)) {
                lastMessageTimestamps.set(otherParticipantId, timestamp);
            }
        }
    });

    return contactList.sort((a, b) => {
        const lastMsgA = lastMessageTimestamps.get(a.id) ?? 0;
        const lastMsgB = lastMessageTimestamps.get(b.id) ?? 0;
        return lastMsgB - lastMsgA;
    });
  }, [allUsers, currentUser, messages]);

  const conversationMessages = useMemo(() => {
    if (!currentUser || !selectedUser) return [];
    return messages
      .filter(
        (msg) =>
          (msg.senderId === currentUser.id && msg.receiverId === selectedUser.id) ||
          (msg.senderId === selectedUser.id && msg.receiverId === currentUser.id)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, currentUser, selectedUser]);
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({ variant: 'destructive', title: 'Image too large', description: 'Please select an image smaller than 2MB.' });
            if(fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            setImageFile(file);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() || imageFile) && currentUser && selectedUser) {
      sendMessage({
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        content: newMessage.trim(),
        imageUrl: imagePreview || undefined,
      });
      setNewMessage('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            setTimeout(() => {
                scrollViewport.scrollTop = scrollViewport.scrollHeight;
            }, 0);
        }
    }
  }, [conversationMessages, selectedUser]);


  return (
    <div className="flex flex-col h-full">
        <div className="flex-shrink-0 mb-4">
          <h1 className="text-3xl font-bold font-headline">Chat</h1>
          <p className="text-muted-foreground">Communicate directly with {currentUser?.role === 'staff' ? 'students' : 'staff'}.</p>
        </div>
        <div className="grid md:grid-cols-[320px_1fr] flex-1 border rounded-lg overflow-hidden">
            {/* Contacts Panel */}
            <div className={cn(
                "border-r flex-col bg-card h-full",
                selectedUser ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b">
                    <h2 className="font-headline text-lg font-semibold">Contacts</h2>
                </div>
                <ScrollArea className="flex-grow">
                    <div className="p-2">
                        {contacts.length > 0 ? contacts.map(contact => (
                            <button
                                key={contact.id}
                                className={cn(
                                    "w-full flex items-center gap-3 text-left p-2 rounded-lg transition-colors",
                                    selectedUser?.id === contact.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
                                )}
                                onClick={() => setSelectedUser(contact)}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={contact.avatar} alt={contact.name} />
                                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold text-sm truncate">{contact.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize truncate">
                                        {contact.role === 'student' ? `Class ${contact.class}` : contact.staffRole}
                                    </p>
                                </div>
                            </button>
                        )) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">No contacts available.</div>
                        )}
                    </div>
                </ScrollArea>
            </div>
            
            {/* Chat Panel */}
            <div className={cn(
                "flex-col bg-muted/20 h-full",
                selectedUser ? "flex" : "hidden md:flex"
            )}>
                {selectedUser ? (
                    <>
                    <div className="flex items-center gap-3 p-3 border-b bg-card">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUser(null)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Avatar>
                            <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                            <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{selectedUser.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {selectedUser.role === 'student' ? `Class ${selectedUser.class}` : selectedUser.staffRole}
                            </p>
                        </div>
                    </div>
                    <div className="flex-grow relative">
                        <ScrollArea className="absolute inset-0" ref={scrollAreaRef}>
                            <div className="p-6 space-y-4">
                                {conversationMessages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex items-end gap-2 max-w-lg",
                                            msg.senderId === currentUser?.id ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                            "rounded-xl shadow-sm text-sm",
                                            msg.senderId === currentUser?.id
                                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                                : 'bg-card rounded-bl-none'
                                            )}
                                        >
                                            {msg.imageUrl && (
                                                <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block p-1">
                                                    <Image
                                                        src={msg.imageUrl}
                                                        alt="Chat attachment"
                                                        width={300}
                                                        height={200}
                                                        className="max-h-[300px] w-auto rounded-md object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                                        data-ai-hint="student doubt"
                                                    />
                                                </a>
                                            )}
                                            {msg.content && <p className="px-3 py-2 whitespace-pre-wrap">{msg.content}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {imagePreview && (
                        <div className="p-3 border-t bg-card relative">
                            <p className="text-xs font-semibold mb-1 text-muted-foreground">Image Preview:</p>
                            <Image src={imagePreview} alt="Preview" width={60} height={60} className="rounded-md object-cover" data-ai-hint="image preview"/>
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6" 
                                onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                    if(fileInputRef.current) fileInputRef.current.value = '';
                                }}>
                                <CloseIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <div className="p-4 border-t bg-card">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                             <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="h-5 w-5" />
                                <span className="sr-only">Attach image</span>
                            </Button>
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                autoComplete="off"
                                className="bg-muted focus-visible:ring-primary"
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim() && !imageFile}>
                                <SendHorizonal className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                    </>
                ) : (
                    <div className="flex-col items-center justify-center h-full text-muted-foreground hidden md:flex">
                        <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
                        <h2 className="text-xl font-semibold">Your Messages</h2>
                        <p className="text-sm">Select a contact to start a conversation.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
