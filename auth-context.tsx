
"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User, Notice, ChatMessage, Student, Staff, Homework, Notification } from '@/lib/types';
import { mockUsers, mockNotices, mockMessages, mockHomework, mockNotifications } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  notices: Notice[];
  allUsers: User[];
  messages: ChatMessage[];
  homework: Homework[];
  notifications: Notification[];
  login: (credentials: { email: string, password: string }) => Promise<User | null>;
  signup: (details: Omit<User, 'id'>) => Promise<User | null>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  addNotice: (notice: { title: string; content: string; imageUrl?: string; fileUrl?: string; fileName?: string; fileType?: string; }) => void;
  sendMessage: (message: { senderId: string; receiverId: string; content:string; imageUrl?: string; }) => void;
  deleteUser: (userId: string) => void;
  addHomework: (homeworkDetails: Omit<Homework, 'id'>) => void;
  markNotificationsAsRead: () => void;
  deleteAccountByEmail: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const USERS_STORAGE_KEY = 'mvps-all-users';
const CURRENT_USER_STORAGE_KEY = 'mvps-user';
const NOTICES_STORAGE_KEY = 'mvps-all-notices';
const MESSAGES_STORAGE_KEY = 'mvps-all-messages';
const HOMEWORK_STORAGE_KEY = 'mvps-all-homework';
const NOTIFICATIONS_STORAGE_KEY = 'mvps-all-notifications';
const AVATAR_STORAGE_PREFIX = 'mvps-avatar-';
const NOTICE_IMAGE_STORAGE_PREFIX = 'mvps-notice-image-';
const NOTICE_FILE_STORAGE_PREFIX = 'mvps-notice-file-';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Force a clear of localStorage if the mock data is empty, ensuring a clean slate.
      if (mockUsers.length === 0) {
        localStorage.removeItem(USERS_STORAGE_KEY);
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        localStorage.removeItem(NOTICES_STORAGE_KEY);
        localStorage.removeItem(MESSAGES_STORAGE_KEY);
        localStorage.removeItem(HOMEWORK_STORAGE_KEY);
        localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      }
      
      const storedUsersJSON = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsersJSON) {
        const storedUsers = JSON.parse(storedUsersJSON) as User[];
        const hydratedUsers = storedUsers.map(u => {
            const hydratedUser = {...u};
            const avatarKey = `${AVATAR_STORAGE_PREFIX}${hydratedUser.id}`;
            const avatarData = localStorage.getItem(avatarKey);
            if (avatarData) {
                hydratedUser.avatar = avatarData;
            } else if (typeof hydratedUser.avatar === 'string' && hydratedUser.avatar.startsWith(AVATAR_STORAGE_PREFIX)) {
                delete hydratedUser.avatar;
            }
            return hydratedUser;
        });
        setUsers(hydratedUsers);
      } else {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
        setUsers(mockUsers);
      }

      const storedNoticesJSON = localStorage.getItem(NOTICES_STORAGE_KEY);
      if (storedNoticesJSON) {
        const storedNotices = JSON.parse(storedNoticesJSON) as Notice[];
        const noticesWithData = storedNotices.map(notice => {
            const hydratedNotice = {...notice};
            if (hydratedNotice.imageUrl?.startsWith(NOTICE_IMAGE_STORAGE_PREFIX)) {
                const imageData = localStorage.getItem(hydratedNotice.imageUrl);
                if (imageData) hydratedNotice.imageUrl = imageData;
            }
            if (hydratedNotice.fileUrl?.startsWith(NOTICE_FILE_STORAGE_PREFIX)) {
                const fileData = localStorage.getItem(hydratedNotice.fileUrl);
                if (fileData) hydratedNotice.fileUrl = fileData;
            }
            return hydratedNotice;
        });
        setNotices(noticesWithData);
      } else {
        localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(mockNotices));
        setNotices(mockNotices);
      }

      const storedMessagesJSON = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (storedMessagesJSON) {
          setMessages(JSON.parse(storedMessagesJSON));
      } else {
          localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(mockMessages));
          setMessages(mockMessages);
      }
      
      const storedHomeworkJSON = localStorage.getItem(HOMEWORK_STORAGE_KEY);
      if (storedHomeworkJSON) {
          setHomework(JSON.parse(storedHomeworkJSON));
      } else {
          localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(mockHomework));
          setHomework(mockHomework);
      }

      const storedNotificationsJSON = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotificationsJSON) {
        setNotifications(JSON.parse(storedNotificationsJSON));
      } else {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(mockNotifications));
        setNotifications(mockNotifications);
      }

      const storedUserJSON = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (storedUserJSON) {
        const storedUser = JSON.parse(storedUserJSON);
        const avatarKey = `${AVATAR_STORAGE_PREFIX}${storedUser.id}`;
        const avatarData = localStorage.getItem(avatarKey);
        if (avatarData) {
            storedUser.avatar = avatarData;
        } else if (typeof storedUser.avatar === 'string' && storedUser.avatar.startsWith(AVATAR_STORAGE_PREFIX)) {
            delete storedUser.avatar;
        }
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      localStorage.removeItem(USERS_STORAGE_KEY);
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      localStorage.removeItem(NOTICES_STORAGE_KEY);
      localStorage.removeItem(MESSAGES_STORAGE_KEY);
      localStorage.removeItem(HOMEWORK_STORAGE_KEY);
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: { email: string, password: string }): Promise<User | null> => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));
    
    // Read fresh from localStorage to ensure we have the latest user list, bypassing potential state staleness.
    const storedUsersJSON = localStorage.getItem(USERS_STORAGE_KEY);
    const allKnownUsers: User[] = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];

    const foundUserInStorage = allKnownUsers.find(u => 
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );

    if (foundUserInStorage) {
      const userToSet = { ...foundUserInStorage };
      // Hydrate avatar if it exists as a key
      if (userToSet.avatar && userToSet.avatar.startsWith(AVATAR_STORAGE_PREFIX)) {
          const avatarData = localStorage.getItem(userToSet.avatar);
          if (avatarData) {
            userToSet.avatar = avatarData;
          }
      }

      setUser(userToSet);
      
      // The user object from storage already has the avatar as a key, so it's ready for session storage.
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(foundUserInStorage));

      setLoading(false);
      return userToSet;
    }
    
    setLoading(false);
    return null;
  }, []);
  
  const signup = useCallback(async (details: Omit<User, 'id'>): Promise<User | null> => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));
    
    const emailExists = users.some(u => u.email.toLowerCase() === details.email.toLowerCase());
    if (emailExists) {
        setLoading(false);
        return null; 
    }
    
    if (details.role === 'staff' && ['principal', 'vp', 'director'].includes(details.staffRole)) {
      const roleExists = users.some(u => u.role === 'staff' && u.staffRole === details.staffRole);
      if (roleExists) {
          console.warn(`Attempted to create a new ${details.staffRole}, but the role is already filled.`);
          setLoading(false);
          return null;
      }
    }

    const newUser: User = {
        ...details,
        id: `U${Date.now()}`,
        profileUpdateCount: 0,
        lastUpdateMonth: new Date().getMonth(),
    };
    
    if (newUser.role === 'student') {
      const uniqueRollNo = `MVPS${Date.now().toString().slice(-6)}`;
      (newUser as Student).rollNo = uniqueRollNo;
    }

    if (newUser.role === 'staff' && newUser.staffRole === 'teacher') {
        (newUser as Staff).isSetupComplete = false;
    }

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    const usersForStorage = updatedUsers.map(u => {
        const storableUser = {...u};
        if(storableUser.avatar && storableUser.avatar.startsWith('data:image')) {
            const avatarKey = `${AVATAR_STORAGE_PREFIX}${storableUser.id}`;
            try {
              localStorage.setItem(avatarKey, storableUser.avatar);
              storableUser.avatar = avatarKey;
            } catch(e) {
              console.error("Error saving avatar to localStorage", e);
              delete storableUser.avatar;
            }
        }
        return storableUser;
    });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersForStorage));
    
    if (newUser.role === 'student') {
        const userForStorage = { ...newUser };
        if (userForStorage.avatar && userForStorage.avatar.startsWith('data:image')) {
          const avatarKey = `${AVATAR_STORAGE_PREFIX}${userForStorage.id}`;
          try {
            localStorage.setItem(avatarKey, userForStorage.avatar);
            userForStorage.avatar = avatarKey;
          } catch(e) {
            console.error("Error saving avatar to localStorage, quota likely exceeded.", e);
            delete userForStorage.avatar;
          }
        }
        setUser(newUser);
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userForStorage));
    }
    
    setLoading(false);
    return newUser;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }, []);
  
  const deleteUser = useCallback((userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    
    const usersForStorage = updatedUsers.map(u => {
        const storableUser = {...u};
        if(storableUser.avatar?.startsWith('data:image')) {
            storableUser.avatar = `${AVATAR_STORAGE_PREFIX}${storableUser.id}`;
        }
        return storableUser;
    });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersForStorage));
    localStorage.removeItem(`${AVATAR_STORAGE_PREFIX}${userId}`);

    const updatedMessages = messages.filter(
      msg => msg.senderId !== userId && msg.receiverId !== userId
    );
    setMessages(updatedMessages);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));

    if(userToDelete?.role === 'staff') {
        const updatedHomework = homework.filter(hw => hw.teacherId !== userId);
        setHomework(updatedHomework);
        localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(updatedHomework));
    }
    
    if (user?.id === userId) {
      logout();
    }
  }, [users, messages, logout, user, homework]);

  const updateUser = useCallback((updatedUser: User) => {
    const userForStorage = { ...updatedUser };
    if (userForStorage.avatar && userForStorage.avatar.startsWith('data:image')) {
      const avatarKey = `${AVATAR_STORAGE_PREFIX}${userForStorage.id}`;
      try {
        localStorage.setItem(avatarKey, userForStorage.avatar);
        userForStorage.avatar = avatarKey;
      } catch (e) {
        console.error("Error saving avatar to localStorage, quota likely exceeded.", e);
        delete userForStorage.avatar;
      }
    }
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userForStorage));
    
    const newUsersState = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUsersState);

    const usersForStorage = newUsersState.map(u => {
        const storableUser = {...u};
        if(storableUser.avatar && !storableUser.avatar.startsWith('data:image') && !storableUser.avatar.startsWith(AVATAR_STORAGE_PREFIX)) {
           delete storableUser.avatar;
        }
        else if(storableUser.avatar && storableUser.avatar.startsWith('data:image')) {
            const avatarKey = `${AVATAR_STORAGE_PREFIX}${storableUser.id}`;
            try {
                localStorage.setItem(avatarKey, storableUser.avatar);
                storableUser.avatar = avatarKey;
            } catch (e) {
                 console.error("Error saving avatar to localStorage", e);
                 delete storableUser.avatar;
            }
        }
        return storableUser;
    });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersForStorage));
  }, [users]);

  const addNotice = useCallback((noticeDetails: { title: string; content: string; imageUrl?: string; fileUrl?: string; fileName?: string; fileType?: string; }) => {
    if (!user) return;
    
    const noticeId = `N${Date.now()}`;
    const newNotice: Notice = {
      id: noticeId,
      author: user.name,
      date: new Date().toISOString(),
      ...noticeDetails,
    };

    setNotices(prevNotices => [{...newNotice}, ...prevNotices]);

    const noticeForStorage = { ...newNotice };
    try {
        if (noticeForStorage.imageUrl?.startsWith('data:image')) {
            const imageKey = `${NOTICE_IMAGE_STORAGE_PREFIX}${noticeId}`;
            localStorage.setItem(imageKey, noticeForStorage.imageUrl);
            noticeForStorage.imageUrl = imageKey;
        }
        if (noticeForStorage.fileUrl?.startsWith('data:')) {
            const fileKey = `${NOTICE_FILE_STORAGE_PREFIX}${noticeId}`;
            localStorage.setItem(fileKey, noticeForStorage.fileUrl);
            noticeForStorage.fileUrl = fileKey;
        }
    } catch (e) {
        console.error("Error saving attachment to localStorage", e);
        delete noticeForStorage.imageUrl;
        delete noticeForStorage.fileUrl;
        delete noticeForStorage.fileName;
        delete noticeForStorage.fileType;
    }

    const storedNoticesRaw = localStorage.getItem(NOTICES_STORAGE_KEY) || '[]';
    const storedNotices = JSON.parse(storedNoticesRaw);
    const updatedNotices = [noticeForStorage, ...storedNotices];
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(updatedNotices));

    const newNotificationsForNotice: Notification[] = users
      .filter(u => u.id !== user.id) // Don't notify the user who created the notice
      .map(u => ({
        id: `NOTIF-N-${Date.now()}-${u.id}`,
        userId: u.id,
        type: 'new_notice',
        title: `New Notice: ${newNotice.title}`,
        message: `A new notice has been posted by ${newNotice.author}.`,
        link: '/dashboard/notice-board',
        timestamp: new Date().toISOString(),
        isRead: false,
    }));
    
    setNotifications(prev => [...newNotificationsForNotice, ...prev]);
    const allStoredNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]');
    const updatedNotificationsForStorage = [...newNotificationsForNotice, ...allStoredNotifications];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotificationsForStorage));

  }, [user, users]);

  const sendMessage = useCallback((messageDetails: { senderId: string; receiverId: string; content: string; imageUrl?: string; }) => {
    const newMessage: ChatMessage = {
      id: `M${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...messageDetails,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
  }, [messages]);

  const addHomework = useCallback((homeworkDetails: Omit<Homework, 'id'>) => {
    if (!user) return;
    
    const newHomework: Homework = {
      id: `HW${Date.now()}`,
      ...homeworkDetails,
    };

    const updatedHomework = [newHomework, ...homework];
    setHomework(updatedHomework);
    localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(updatedHomework));

    const studentsInClass = users.filter(u => u.role === 'student' && u.class === newHomework.class);
    const newNotificationsForHomework: Notification[] = studentsInClass.map(student => ({
        id: `NOTIF-HW-${Date.now()}-${student.id}`,
        userId: student.id,
        type: 'new_homework',
        title: `New Homework: ${homeworkDetails.subject}`,
        message: `Your teacher assigned new homework: "${homeworkDetails.title}". Due: ${new Date(homeworkDetails.dueDate).toLocaleDateString()}`,
        link: '/dashboard/homework',
        timestamp: new Date().toISOString(),
        isRead: false,
    }));

    setNotifications(prev => [...newNotificationsForHomework, ...prev]);
    const allStoredNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]');
    const updatedNotificationsForStorage = [...newNotificationsForHomework, ...allStoredNotifications];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotificationsForStorage));
  }, [user, homework, users]);

  const markNotificationsAsRead = useCallback(() => {
    if (!user) return;
    const updatedNotifications = notifications.map(n => 
        (n.userId === user.id && !n.isRead) ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);

    const allStoredNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]');
    const otherUserNotifications = allStoredNotifications.filter((n: Notification) => n.userId !== user.id);
    const updatedUserNotifications = allStoredNotifications
      .filter((n: Notification) => n.userId === user.id)
      .map((n: Notification) => ({ ...n, isRead: true }));
    
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([...otherUserNotifications, ...updatedUserNotifications]));
  }, [user, notifications]);

  const deleteAccountByEmail = useCallback(async (email: string) => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network latency

    const lowercasedEmail = email.toLowerCase();
    const userToDelete = users.find(u => u.email.toLowerCase() === lowercasedEmail);

    if (userToDelete) {
        deleteUser(userToDelete.id);
    }
  }, [users, deleteUser]);

  const value = { user, loading, login, signup, logout, updateUser, notices, addNotice, allUsers: users, messages, sendMessage, deleteUser, homework, addHomework, notifications, markNotificationsAsRead, deleteAccountByEmail };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
