import { AppSidebar } from '@/components/AppSidebar';
import Header from '@/components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AppSidebar />
      <main className="flex flex-1 flex-col min-w-0 overflow-auto">
        <Header />
        {/* Main content area */}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
