
'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backHref?: string;
  showLogo?: boolean;
}

export function PageHeader({ 
  title, 
  showBackButton = true, 
  backHref = "/dashboard",
  showLogo = false 
}: PageHeaderProps) {
  const router = useRouter();
  
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Sempre volta para o menu principal (dashboard)
    router.push('/dashboard');
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo pequeno para mobile quando sidebar não está visível */}
          {showLogo && (
            <div className="lg:hidden">
              <div className="w-8 h-8 relative">
                <Image
                  src="/logo-ada.png"
                  alt="A.D.A Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          
          <div>
            {showBackButton && (
              <a 
                href="#" 
                onClick={handleBackClick}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Menu
              </a>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
