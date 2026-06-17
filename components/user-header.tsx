
'use client';

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function UserHeader() {
  const { data: session } = useSession() || {};
  
  if (!session?.user) return null;

  const user = session.user as any;
  const firstName = user.firstName || user.name?.split(' ')[0] || 'Usuário';
  const initials = firstName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 bg-white rounded-full shadow-md px-4 py-2 border border-gray-200">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.image || undefined} alt={firstName} />
        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900">{firstName}</span>
        <span className="text-xs text-gray-500">Profissional</span>
      </div>
    </div>
  );
}
