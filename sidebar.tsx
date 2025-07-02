
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SchoolLogo } from '@/components/shared/school-logo';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, BookCopy, Calendar, ClipboardList, GraduationCap, User as ProfileIcon, MessageSquare, Users, Briefcase } from 'lucide-react';

const studentNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/dashboard/profile', icon: ProfileIcon },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Notice Board', href: '/dashboard/notice-board', icon: BookCopy },
  { name: 'Timetable', href: '/dashboard/timetable', icon: Calendar },
  { name: 'Homework', href: '/dashboard/homework', icon: ClipboardList },
  { name: 'Exams & Results', href: '/dashboard/exams', icon: GraduationCap },
];

const staffNav = [
  ...studentNav,
  { name: 'Students', href: '/dashboard/students', icon: Users },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const navItems = user?.role === 'student' ? studentNav : staffNav;
  const canManageStaff = user?.role === 'staff' && ['director', 'principal', 'vp'].includes(user.staffRole);

  return (
    <>
      <SidebarHeader>
        <SchoolLogo showAppName={false} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.name}
                  asChild={false}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          {canManageStaff && (
            <SidebarMenuItem>
              <Link href="/dashboard/teachers" passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith('/dashboard/teachers')}
                  tooltip="Staff"
                  asChild={false}
                >
                  <Briefcase />
                  <span>Staff</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
