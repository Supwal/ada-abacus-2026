
'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  BarChart3,
  Calendar,
  DollarSign,
  Home,
  MapPin,
  Menu,
  Settings,
  ShoppingBag,
  TrendingDown,
  Users,
  X,
  LogOut,
  HelpCircle,
  Clock,
  Plus,
  CreditCard,
  Share2,
  Grid3X3,
  Package,
  Crown,
  Globe
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "Período",
    href: "/periodo",
    icon: Clock
  },
  {
    label: "Agendar",
    href: "/agenda/novo",
    icon: Plus
  },
  {
    label: "Consulta Agenda",
    href: "/agenda",
    icon: Calendar
  },
  {
    label: "Consulta Ganhos",
    href: "/ganhos",
    icon: DollarSign
  },
  {
    label: "Packs",
    href: "/packs",
    icon: Package
  },
  {
    label: "Assinatura",
    href: "/assinatura",
    icon: Crown
  },
  {
    label: "Locais/Clínicas",
    href: "/locais",
    icon: MapPin
  },
  {
    label: "Cidades & Estados",
    href: "/cidades",
    icon: Globe
  },
  {
    label: "Despesas",
    href: "/despesas",
    icon: CreditCard
  },
  {
    label: "Redes Sociais",
    href: "/configuracoes",
    icon: Share2
  },
  {
    label: "Dash-Board Regional",
    href: "/dashboard-regional",
    icon: Clock
  },
  {
    label: "Painel de Controle",
    href: "/dashboard",
    icon: Grid3X3
  }
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession() || {};

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-2 left-2 z-50 lg:hidden bg-white shadow-md hover:bg-gray-100 border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo-ada.png"
                  alt="A.D.A Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl text-gray-900">A.D.A</span>
            </div>
            {session?.user && (
              <div className="mt-4 text-sm text-gray-600">
                Olá, {(session.user as any)?.firstName || session.user.name?.split(' ')[0]}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
