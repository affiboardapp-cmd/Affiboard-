import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AppLayout({ children, title = "Dashboard" }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#1BC1A1]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#005A52]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-1">
          {children}
        </main>
      </div>
    </div>
  );
}
