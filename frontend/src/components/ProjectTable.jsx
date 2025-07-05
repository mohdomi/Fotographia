import React from 'react';
import { useNavigate } from 'react-router-dom';

const pkgColor = {
  Gold: '#FFD700',
  Silver: '#C0C0C0',
  Platinum: '#E5E4E2',
};

const ProjectTable = ({ title, projects, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(index);
    }
  };

  const handleViewAll = () => {
    const section = title.toLowerCase();
    navigate(`/dashboard/${section}`);
  };

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex justify-between items-center bg-[#181818] text-white py-3 px-4 lg:px-[18px] rounded-t-[10px] text-base lg:text-[1.2rem]">
        <span>{title} projects</span>
        <button 
          onClick={handleViewAll}
          className="text-[#FFD700] no-underline text-sm lg:text-base bg-transparent border-0 cursor-pointer hover:text-[#FFF]"
        >
          View All
        </button>
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

export default ProjectTable; 