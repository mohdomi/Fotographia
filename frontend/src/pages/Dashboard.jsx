import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarMenu from '../components/SidebarMenu';
import ProjectTable from '../components/ProjectTable';
import DashboardNav from '../components/DashboardNav';
import { X } from 'lucide-react';
import instance from '../api/axios';


/**
 * components/StatCard.js
 * Displays a single statistic card.
 * @param {object} props - The component props.
 * @param {string} props.number - The number to display (e.g., '120').
 * @param {string} props.label - The label for the statistic (e.g., 'Total projects').
 */
const StatCard = ({ number, label }) => (
  <div className="bg-white rounded-[20px] p-4 md:p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-black/5 p-2 rounded">
        {/* Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </div>
      <span className="text-3xl md:text-4xl font-bold">{number}</span>
    </div>
    <p className="text-gray-500 text-sm md:text-base">{label}</p>
  </div>
);

const Dashboard = () => {
  // --- State and Logic ---
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [searchQuery,] = useState('');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Stats will be dynamic based on fetched projects
  const [allProjects, setAllProjects] = useState([]);
  const stats = [
    { number: allProjects.length, label: 'Total projects' },
    { number: allProjects.filter(p => p.status === 'pending').length, label: 'Pending projects' },
    { number: allProjects.filter(p => p.status === 'current').length, label: 'Current projects' },
    { number: allProjects.filter(p => p.status === 'completed').length, label: 'Completed projects' },
  ];


  useEffect(() => {
    async function getAllProjects() {
      try {
        const res = await instance.get('/api/v1/admin/all-projects');
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setAllProjects(res.data.data);
        } else {
          setAllProjects([]);
        }
      } catch (err) {
        console.log("error in getAllProjects", err);
        setAllProjects([]);
      }
    }
    getAllProjects();
  }, []);



  // Filtered projects by status and search
  const filterProjects = (status) =>
    allProjects.filter(
      (p) =>
        p.status === status &&
        (p.wedding_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.Package.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.Mobile_Number.includes(searchQuery))
    );

  const pendingProjects = filterProjects('pending');
  const currentProjects = filterProjects('current');
  const completedProjects = filterProjects('completed');

  // Section switching (if Sidebar supports it)
  // Example: setCurrentSection('pending')

  const renderContent = () => {
    switch (currentSection) {
      case 'pending':
        return <ProjectTable title="Pending" projects={pendingProjects} onDelete={(index) => handleDeleteProject(index, pendingProjects[index]._id)} />;
      case 'current':
        return <ProjectTable title="Current" projects={currentProjects} onDelete={(index) => handleDeleteProject(index, pendingProjects[index]._id)} />;
      case 'completed':
        return <ProjectTable title="Completed" projects={completedProjects} onDelete={(index) => handleDeleteProject(index, pendingProjects[index]._id)} />;
      case 'dashboard':
      default:
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
            <div className="space-y-6">
              <ProjectTable title="Pending" projects={pendingProjects} onDelete={(index) => handleDeleteProject(index, pendingProjects[index]._id)} />
              <ProjectTable title="Current" projects={currentProjects} onDelete={(index) => handleDeleteProject(index, pendingProjects[index]._id)} />
              <ProjectTable title="Completed" projects={completedProjects} onDelete={(index) => handleDeleteProject(index, pendingProjects[index]._id)} />
            </div>
          </>
        );
    }
  };


  const handleDeleteProject = (index, deletedId) => {
    setAllProjects(prev => prev.filter(p => p._id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-black">
      <DashboardNav toggleSidebar={() => setShowMobileSidebar(true)} />
      <div className="pt-[42px] flex h-[calc(100vh-40px)]">
        {/* Sidebar for desktop */}
        <div className="hidden sm:block w-1/6 bg-white shadow h-[calc(100vh-40px)] fixed top-[40px] left-0 px-4 py-10 overflow-y-auto">
          <SidebarMenu currentSection={currentSection} onSectionChange={setCurrentSection} />
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
              <SidebarMenu currentSection={currentSection} onSectionChange={(section) => { setCurrentSection(section); setShowMobileSidebar(false); }} />
            </div>
            <div
              className="flex-1"
              onClick={() => setShowMobileSidebar(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 sm:ml-[16.667%] h-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                {/* The onChange handler should be added here */}
                <input
                  type="text"
                  placeholder="Search ..."
                  value={searchQuery}
                  // onChange={(e) => setSearchQuery(e.target.value)} // Logic to be added
                  className="w-full sm:w-[300px] py-2 px-4 pr-10 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/20"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="flex gap-3">
                {/* The onClick handler should be added here */}
                <button
                  className="bg-white text-black py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors font-medium"
                  onClick={() => navigate('/new-project')} // Logic to be added
                >
                  <span>+</span>
                  <span className="hidden sm:inline">Add project</span>
                </button>
                <button className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          {renderContent()}

        </main>
      </div>
    </div>
  );
};

// This would be your main App component that renders the Dashboard
export default Dashboard;
