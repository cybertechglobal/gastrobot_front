import { AppSidebar } from '@/components/AppSidebar';
import Header from '@/components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // <>
    //   <AppSidebar />
    //   <main className="flex flex-1 flex-col relative w-full">
    //     <Header />
    //     {/* Main area */}
    //     <div className="overflow-auto">{children}</div>
    //   </main>
    // </>
    <div className="flex h-screen w-screen overflow-hidden">
      <AppSidebar />
      <main className="flex flex-1 flex-col min-w-0 overflow-auto">
        <Header />
        {/* Main content area with full scroll */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

// import { AppSidebar } from '@/components/AppSidebar';
// import Header from '@/components/Header';

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen w-screen overflow-hidden">
//       <div className="fixed">
//         <AppSidebar />
//       </div>
//       <main
//         style={{ marginLeft: '50px', overflow: 'auto' }}
//         className="flex flex-1 flex-col min-w-0 relative"
//       >
//         {/* Header se postavlja preko sadržaja */}
//         <Header />
//         {/* Content počinje odmah od vrha, header se overlay-uje preko */}
//         <div className="flex-1 mt-[68px]">{children}</div>
//       </main>
//     </div>
//   );
// }
