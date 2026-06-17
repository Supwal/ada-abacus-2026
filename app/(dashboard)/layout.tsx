
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { UserHeader } from "@/components/user-header";
import { IdleLogoutProvider } from "@/components/idle-logout-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <IdleLogoutProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 lg:ml-64 overflow-auto">
            {/* Espaço adicional no topo para mobile (botão de menu) */}
            <div className="pt-14 lg:pt-0">
              {/* User Header - Fixo no topo direito */}
              <div className="fixed top-4 right-4 z-30 hidden lg:block">
                <UserHeader />
              </div>
              
              {/* Mobile User Header */}
              <div className="lg:hidden fixed top-2 right-2 z-30">
                <UserHeader />
              </div>
              
              <div className="p-4 lg:p-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </IdleLogoutProvider>
    </AuthGuard>
  );
}
