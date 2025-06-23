import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

const pkgColor = {
  Gold: '#FFD700',
  Silver: '#C0C0C0',
  Platinum: '#E5E4E2',
};

const ProjectTable = ({ title, projects, onDelete }) => {
  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(index);
    }
  };

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex justify-between items-center bg-[#181818] text-white py-3 px-4 lg:px-[18px] rounded-t-[10px] text-base lg:text-[1.2rem]">
        <span>{title} projects</span>
        <a href="#" className="text-[#FFD700] no-underline text-sm lg:text-base">View All</a>
      </div>
      {projects.length === 0 ? (
        <div className="bg-white rounded-b-[10px] p-6 lg:p-8 text-center text-gray-500">
          <div className="text-3xl lg:text-4xl mb-3 lg:mb-4">📋</div>
          <p className="text-base lg:text-lg">No {title.toLowerCase()} projects found</p>
          <p className="text-xs lg:text-sm mt-2">Projects will appear here when added</p>
        </div>
      ) : (
        <div className="bg-white rounded-b-[10px] overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {projects.map((p, i) => (
              <div key={i} className={`p-4 border-b border-gray-200 ${i % 2 === 1 ? 'bg-[#fafafa]' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-bold text-sm">{p.name}</div>
                    <div className="text-xs text-gray-600 mt-1">#{(i + 1).toString().padStart(2, '0')}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="cursor-pointer text-base text-[#222]" title="Edit">✏️</span>
                    <span 
                      className="cursor-pointer text-base text-[#e74c3c]" 
                      title="Delete"
                      onClick={() => handleDelete(i)}
                    >
                      🗑️
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Package: </span>
                    <span style={{ color: pkgColor[p.pkg] || '#222', fontWeight: 600 }}>{p.pkg}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date: </span>
                    <span>{p.date}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Mobile: </span>
                    <span>{p.mobile}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <table className="w-full border-collapse hidden lg:table">
            <thead>
              <tr>
                <th className="py-3 px-[10px] text-left bg-[#f4f4f4] font-semibold">S. No.</th>
                <th className="py-3 px-[10px] text-left bg-[#f4f4f4] font-semibold">Wedding Name</th>
                <th className="py-3 px-[10px] text-left bg-[#f4f4f4] font-semibold">Package</th>
                <th className="py-3 px-[10px] text-left bg-[#f4f4f4] font-semibold">Date</th>
                <th className="py-3 px-[10px] text-left bg-[#f4f4f4] font-semibold">Mobile Number</th>
                <th className="py-3 px-[10px] text-left bg-[#f4f4f4] font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={i} className={`${i % 2 === 1 ? 'bg-[#fafafa]' : ''}`}>
                  <td className="py-3 px-[10px]">{(i + 1).toString().padStart(2, '0')}</td>
                  <td className="py-3 px-[10px]"><b>{p.name}</b></td>
                  <td className="py-3 px-[10px]" style={{ color: pkgColor[p.pkg] || '#222', fontWeight: 600 }}>{p.pkg}</td>
                  <td className="py-3 px-[10px]">{p.date}</td>
                  <td className="py-3 px-[10px]">{p.mobile}</td>
                  <td className="py-3 px-[10px]">
                    <span className="cursor-pointer mr-2 text-[1.1rem] text-[#222]" title="Edit">✏️</span>
                    <span 
                      className="cursor-pointer text-[1.1rem] text-[#e74c3c]" 
                      title="Delete"
                      onClick={() => handleDelete(i)}
                    >
                      🗑️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ section }) => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(section || 'dashboard');
  const [pendingProjects, setPendingProjects] = useState(initialPendingProjects);
  const [currentProjects, setCurrentProjects] = useState(initialCurrentProjects);
  const [completedProjects, setCompletedProjects] = useState(initialCompletedProjects);

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

  useEffect(() => {
    if (section && section !== currentSection) {
      setCurrentSection(section);
    }
    if (!section) {
      setCurrentSection('dashboard');
    }
  }, [section]);

  const handleNav = (sec) => {
    setCurrentSection(sec);
    navigate(sec === 'dashboard' ? '/dashboard' : `/dashboard/${sec}`);
  };

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

  return (
    <div className="flex min-h-screen bg-[#f4f4f4] lg:flex-row flex-col">
      <aside className="w-full lg:w-[220px] bg-[#222] text-white flex flex-col lg:pt-6 lg:pb-6 lg:pl-0 lg:pr-0 lg:min-h-screen p-2 lg:p-0">
        <div className="flex items-center gap-3 font-['Pacifico'] text-base lg:text-[1.3rem] px-3 lg:px-6 pb-3 lg:pb-8">
          <img 
            src="/logo.png" 
            alt="Fotographiya Logo" 
            className="h-8 lg:h-10 w-auto object-contain"
          />
        </div>
        <nav className="flex flex-row lg:flex-col gap-1 lg:gap-2 px-2 lg:px-3 overflow-x-auto lg:overflow-visible scrollbar-hide pb-2 lg:pb-0">
          <a 
            href="#" 
            className={`text-white no-underline py-2 lg:py-3 px-3 sm:px-4 lg:px-[18px] rounded-lg text-xs sm:text-sm lg:text-[1.08rem] flex items-center gap-1 sm:gap-2 lg:gap-[10px] hover:bg-white hover:text-[#181818] whitespace-nowrap min-w-max transition-colors duration-150 ${currentSection === 'dashboard' ? 'bg-white text-[#181818]' : ''}`}
            onClick={() => handleNav('dashboard')}
          >
            <span className="text-sm lg:text-base">🏠</span> 
            <span className="hidden sm:inline lg:inline">Dashboard</span>
          </a>
          <a 
            href="#" 
            className={`text-white no-underline py-2 lg:py-3 px-3 sm:px-4 lg:px-[18px] rounded-lg text-xs sm:text-sm lg:text-[1.08rem] flex items-center gap-1 sm:gap-2 lg:gap-[10px] hover:bg-white hover:text-[#181818] whitespace-nowrap min-w-max transition-colors duration-150 ${currentSection === 'pending' ? 'bg-white text-[#181818]' : ''}`}
            onClick={() => handleNav('pending')}
          >
            <span className="text-sm lg:text-base">⏳</span> 
            <span className="hidden sm:inline lg:inline">Pending</span>
          </a>
          <a 
            href="#" 
            className={`text-white no-underline py-2 lg:py-3 px-3 sm:px-4 lg:px-[18px] rounded-lg text-xs sm:text-sm lg:text-[1.08rem] flex items-center gap-1 sm:gap-2 lg:gap-[10px] hover:bg-white hover:text-[#181818] whitespace-nowrap min-w-max transition-colors duration-150 ${currentSection === 'current' ? 'bg-white text-[#181818]' : ''}`}
            onClick={() => handleNav('current')}
          >
            <span className="text-sm lg:text-base">📂</span> 
            <span className="hidden sm:inline lg:inline">Current</span>
          </a>
          <a 
            href="#" 
            className={`text-white no-underline py-2 lg:py-3 px-3 sm:px-4 lg:px-[18px] rounded-lg text-xs sm:text-sm lg:text-[1.08rem] flex items-center gap-1 sm:gap-2 lg:gap-[10px] hover:bg-white hover:text-[#181818] whitespace-nowrap min-w-max transition-colors duration-150 ${currentSection === 'completed' ? 'bg-white text-[#181818]' : ''}`}
            onClick={() => handleNav('completed')}
          >
            <span className="text-sm lg:text-base">✅</span> 
            <span className="hidden sm:inline lg:inline">Completed</span>
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-4 lg:pt-8 lg:pr-8 lg:pb-8 lg:pl-0 flex flex-col">
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white py-4 lg:py-[18px] px-4 lg:px-8 rounded-xl lg:rounded-t-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] mb-4 lg:mb-[18px] gap-4 sm:gap-0">
          <div className="flex-1 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search ..." 
              className="py-[10px] px-[18px] rounded-lg border-[1.5px] border-[#ccc] text-base w-full sm:w-[220px]"
            />
          </div>
          <div className="flex items-center gap-3 lg:gap-[18px] w-full sm:w-auto justify-center sm:justify-end">
            <button 
              className="bg-[#181818] text-white border-none rounded-lg py-[10px] px-4 lg:px-[18px] text-sm lg:text-base font-medium cursor-pointer hover:bg-[#444] flex-1 sm:flex-none"
              type="button" 
              onClick={() => navigate('/face-match')}
            >
              <span className="sm:hidden">+</span>
              <span className="hidden sm:inline">+ Add project</span>
            </button>
            <span className="text-xl lg:text-2xl cursor-pointer">🔔</span>
          </div>
        </header>
        <section className="bg-white rounded-xl lg:rounded-b-xl p-4 lg:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
          {(!currentSection || currentSection === 'dashboard') && <>
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
              projects={pendingProjects.slice(0, 4)} 
              onDelete={(index) => handleDelete('pending', index)}
            />
            <ProjectTable 
              title="Current" 
              projects={currentProjects}
              onDelete={(index) => handleDelete('current', index)}
            />
            <ProjectTable 
              title="Completed" 
              projects={completedProjects}
              onDelete={(index) => handleDelete('completed', index)}
            />
          </>}
          {currentSection === 'pending' && <>
            <h2 className="text-xl lg:text-[2rem] mb-4 lg:mb-6 font-['Montserrat']">Pending projects</h2>
            <ProjectTable 
              title="Pending" 
              projects={pendingProjects}
              onDelete={(index) => handleDelete('pending', index)}
            />
          </>}
          {currentSection === 'current' && <>
            <h2 className="text-xl lg:text-[2rem] mb-4 lg:mb-6 font-['Montserrat']">Current projects</h2>
            <ProjectTable 
              title="Current" 
              projects={currentProjects}
              onDelete={(index) => handleDelete('current', index)}
            />
          </>}
          {currentSection === 'completed' && <>
            <h2 className="text-xl lg:text-[2rem] mb-4 lg:mb-6 font-['Montserrat']">Completed projects</h2>
            <ProjectTable 
              title="Completed" 
              projects={completedProjects}
              onDelete={(index) => handleDelete('completed', index)}
            />
          </>}
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 