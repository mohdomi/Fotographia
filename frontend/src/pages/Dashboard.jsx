import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProjectTable from '../components/ProjectTable';

// Add scrollbar hide styles
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarHideStyle;
  document.head.appendChild(style);
}

// Stats will be calculated dynamically in the component

const initialPendingProjects = [];
const initialCurrentProjects = [
  { name: 'Amrita-Deepak', pkg: 'Gold', date: '22 May 2024', mobile: '9426585858' },
  { name: 'Amrita-Deepak', pkg: 'Silver', date: '22 May 2024', mobile: '9426585858' },
  { name: 'Amrita-Deepak', pkg: 'Platinum', date: '22 May 2024', mobile: '9426585858' },
  { name: 'Amrita-Deepak', pkg: 'Gold', date: '22 May 2024', mobile: '9426585858' },
];
const initialCompletedProjects = initialCurrentProjects;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [pendingProjects, setPendingProjects] = useState(initialPendingProjects);
  const [currentProjects, setCurrentProjects] = useState(initialCurrentProjects);
  const [completedProjects, setCompletedProjects] = useState(initialCompletedProjects);
  const [searchQuery, setSearchQuery] = useState('');

  // Load pending projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('pendingProjects');
    if (savedProjects) {
      setPendingProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save pending projects to localStorage whenever pendingProjects changes
  useEffect(() => {
    localStorage.setItem('pendingProjects', JSON.stringify(pendingProjects));
  }, [pendingProjects]);

  // Update section based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') {
      setCurrentSection('dashboard');
    } else if (path === '/dashboard/pending') {
      setCurrentSection('pending');
    } else if (path === '/dashboard/current') {
      setCurrentSection('current');
    } else if (path === '/dashboard/completed') {
      setCurrentSection('completed');
    }
  }, [location.pathname]);

  // const handleNav = (sec) => {
  //   setCurrentSection(sec);
  //   navigate(sec === 'dashboard' ? '/dashboard' : `/dashboard/${sec}`);
  // };

  const handleDelete = (type, index) => {
    switch (type) {
      case 'pending':
        setPendingProjects(prev => prev.filter((_, i) => i !== index));
        break;
      case 'current':
        setCurrentProjects(prev => prev.filter((_, i) => i !== index));
        break;
      case 'completed':
        setCompletedProjects(prev => prev.filter((_, i) => i !== index));
        break;
      default:
        break;
    }
  };

  // Calculate dynamic stats
  const stats = [
    { label: 'Total projects', value: pendingProjects.length + currentProjects.length + completedProjects.length },
    { label: 'Pending projects', value: pendingProjects.length },
    { label: 'Current projects', value: currentProjects.length },
    { label: 'Completed projects', value: completedProjects.length },
  ];

  // Filter projects based on search query
  const filterProjects = (projects) => {
    if (!searchQuery) return projects;
    return projects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.pkg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.mobile.includes(searchQuery)
    );
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'pending':
        return (
          <>
            <h2 className="text-xl lg:text-[2rem] mb-4 lg:mb-6 font-['Montserrat']">Pending Projects</h2>
            <ProjectTable 
              title="Pending" 
              projects={filterProjects(pendingProjects)}
              onDelete={(index) => handleDelete('pending', index)}
            />
          </>
        );
      case 'current':
        return (
          <>
            <h2 className="text-xl lg:text-[2rem] mb-4 lg:mb-6 font-['Montserrat']">Current Projects</h2>
            <ProjectTable 
              title="Current" 
              projects={filterProjects(currentProjects)}
              onDelete={(index) => handleDelete('current', index)}
            />
          </>
        );
      case 'completed':
        return (
          <>
            <h2 className="text-xl lg:text-[2rem] mb-4 lg:mb-6 font-['Montserrat']">Completed Projects</h2>
            <ProjectTable 
              title="Completed" 
              projects={filterProjects(completedProjects)}
              onDelete={(index) => handleDelete('completed', index)}
            />
          </>
        );
      default:
        return (
          <>
            <h2 className="text-xl lg:text-[2rem] mb-4 lg:mb-6 font-['Montserrat']">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-6 gap-3 lg:gap-6 mb-6 lg:mb-8">
              {stats.map((s, i) => (
                <div key={i} className="bg-[#181818] text-white rounded-xl py-4 lg:py-6 px-4 lg:px-8 lg:min-w-[160px] flex flex-col items-center shadow-[0_2px_8px_rgba(0,0,0,0.10)]">
                  <div className="text-xl lg:text-[2rem] font-bold">{s.value}</div>
                  <div className="text-sm lg:text-[1.1rem] mt-1 lg:mt-[6px] text-[#ccc] text-center">{s.label}</div>
                </div>
              ))}
            </div>
            <ProjectTable 
              title="Pending" 
              projects={filterProjects(pendingProjects.slice(0, 4))} 
              onDelete={(index) => handleDelete('pending', index)}
            />
            <ProjectTable 
              title="Current" 
              projects={filterProjects(currentProjects)}
              onDelete={(index) => handleDelete('current', index)}
            />
            <ProjectTable 
              title="Completed" 
              projects={filterProjects(completedProjects)}
              onDelete={(index) => handleDelete('completed', index)}
            />
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f4f4] lg:flex-row flex-col">
      <Sidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />
      <main className="flex-1 p-4 lg:pt-8 lg:pr-8 lg:pb-8 lg:pl-0 flex flex-col">
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white py-4 lg:py-[18px] px-4 lg:px-8 rounded-xl lg:rounded-t-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] mb-4 lg:mb-[18px] gap-4 sm:gap-0">
          <div className="flex-1 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-[10px] px-[18px] rounded-lg border-[1.5px] border-[#ccc] text-base w-full sm:w-[220px]"
            />
          </div>
          <div className="flex items-center gap-3 lg:gap-[18px] w-full sm:w-auto justify-center sm:justify-end">
            <button 
              className="bg-[#181818] text-white border-none rounded-lg py-[10px] px-4 lg:px-[18px] text-sm lg:text-base font-medium cursor-pointer hover:bg-[#444] flex-1 sm:flex-none"
              type="button" 
              onClick={() => navigate('/new-project')}
            >
              <span className="sm:hidden">+</span>
              <span className="hidden sm:inline">+ Add project</span>
            </button>
            <span className="text-xl lg:text-2xl cursor-pointer">🔔</span>
          </div>
        </header>
        <section className="bg-white rounded-xl lg:rounded-b-xl p-4 lg:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 
