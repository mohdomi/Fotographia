// import DashboardNav from '../components/DashboardNav';
// import { LayoutDashboard } from 'lucide-react';
// import NewProjectForm from '../components/NewProjectForm';
// export default function NewProject() {
//   return (
//     <div className="min-h-screen bg-white">
      
//       {/* Fixed Top Navbar */}
//       <DashboardNav />

//       {/* Offset height from navbar (which is approx 56px => py-2 + font size) */}
//       <div className="pt-[42px] flex h-[calc(100vh-40px)]">
        
//         {/* Sidebar (fixed) */}
//         <div className="w-1/6 bg-white shadow h-[calc(100vh-40px)] fixed top-[40px] left-0 px-4 py-10 overflow-y-auto">
//           <ul className="space-y-2">
//             <div className='flex flex-col px-2 justify-center gap-4'>
                 
//                  <div className='flex justify-center items-center gap-4'>
// <LayoutDashboard className="w-5 h-5 font-extrabold text-black" />
// <li className="text-gray-700 w-full hover:text-indigo-600 cursor-pointer">Dashboard</li>
//                  </div>
//                  <div className='flex justify-center items-center gap-4'>
// <LayoutDashboard className="w-5 h-5 font-extrabold text-black" />
// <li className="text-gray-700 w-full hover:text-indigo-600 cursor-pointer">Settings</li>
//                  </div>
//                  <div className='flex justify-center items-center gap-4 '>
// <LayoutDashboard className="w-5 h-5 font-extrabold text-black" />
// <li className="text-gray-700 w-full hover:text-indigo-600 cursor-pointer">Profile</li>
//                  </div>
//                  <div className='flex justify-center items-center gap-4'>
// <LayoutDashboard className="w-5 h-5 font-extrabold text-black" />
// <li className="text-gray-700 w-full  hover:text-indigo-600 cursor-pointer">Logout</li>
//                  </div>
            
            
//             </div>
            
//           </ul>
//         </div>

//         {/* Main Content Area */}
//         <NewProjectForm/>
//       </div>
//     </div>
//   );
// }



import { useState } from 'react';
import DashboardNav from '../components/DashboardNav';
import { LayoutDashboard, X } from 'lucide-react';
import NewProjectForm from '../components/NewProjectForm';
import SidebarMenu from '../components/SidebarMenu';

export default function NewProject() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <DashboardNav toggleSidebar={() => setShowMobileSidebar(true)} />

      <div className="pt-[42px] flex h-[calc(100vh-40px)]">
        {/* Sidebar for desktop */}
        <div className="hidden sm:block w-1/6 bg-white shadow h-[calc(100vh-40px)] fixed top-[40px] left-0 px-4 py-10 overflow-y-auto">
          <SidebarMenu/>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex">
            <div className="w-2/3 bg-white p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Menu</h2>
                <button onClick={() => setShowMobileSidebar(false)}>
                  <X className="w-6 h-6 text-gray-800" />
                </button>
              </div>
              <SidebarMenu />
            </div>
            <div
              className="flex-1"
              onClick={() => setShowMobileSidebar(false)}
            />
          </div>
        )}

        {/* Main content shifted if on desktop */}
        <div className="w-full sm:ml-0">
          <NewProjectForm />
        </div>
      </div>
    </div>
  );
}

