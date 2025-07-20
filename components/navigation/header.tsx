
'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, LogOut, User, Settings, Shield } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      ?.map(n => n[0])
      ?.join('')
      ?.toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <div className="flex items-center space-x-4">
          <Link href={session?.user?.role === 'ADMIN' ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Business Sim</span>
          </Link>
          {title && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 font-medium">{title}</span>
            </>
          )}
        </div>

        {session?.user && (
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(session.user.name || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {session.user.role === 'ADMIN' ? (
                        <Shield className="w-3 h-3 text-orange-600" />
                      ) : (
                        <User className="w-3 h-3 text-blue-600" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {session.user.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {session.user.role === 'ADMIN' ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
