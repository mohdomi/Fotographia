import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FaceMatch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    weddingName: '',
    groom: '',
    bride: '',
    mobileNumber: '',
    groomMobile: '',
    brideMobile: '',
    package: 'Gold',
    eventDate: '',
    venue: '',
    groomAddress: '',
    brideAddress: '',
    termsConditions: '',
    dueDate: '',
    estimatedTime: ''
  });

  // Multiple folder upload states
  const [uploadedFolders, setUploadedFolders] = useState([]);
  const [allUploadedPhotos, setAllUploadedPhotos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const multiplePhotosRef = useRef();

  const [uploadedFiles, setUploadedFiles] = useState({
    shaadi: null,
    mehandi: null,
    haldi: null,
    reception: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  // Save folders to localStorage
  const saveFoldersToStorage = (folders) => {
    setIsUploading(true);
    const savedFolders = [];

    folders.forEach(folder => {
      const folderData = {
        folderName: folder.name,
        fileCount: folder.count,
        uploadedAt: new Date().toISOString()
      };
      savedFolders.push(folderData);
    });

    // Save to localStorage
    localStorage.setItem('uploadedFolders', JSON.stringify(savedFolders));
    
    setIsUploading(false);
    setUploadProgress({});
  };

  // Handle multiple folder uploads
  const handleMultipleFolderUpload = async (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Group files by folder path
    const folderGroups = {};
    imageFiles.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      const folderName = pathParts[0]; // First part is the folder name
      
      if (!folderGroups[folderName]) {
        folderGroups[folderName] = [];
      }
      folderGroups[folderName].push(file);
    });

    // Convert to array format for display
    const foldersArray = Object.keys(folderGroups).map(folderName => ({
      name: folderName,
      files: folderGroups[folderName],
      count: folderGroups[folderName].length
    }));

    setUploadedFolders(foldersArray);
    setAllUploadedPhotos(imageFiles);
    
    // Save to localStorage
    if (foldersArray.length > 0) {
      saveFoldersToStorage(foldersArray);
      console.log('Folders saved to localStorage:', foldersArray);
    }
  };

  // Remove a specific folder
  const removeFolder = (folderName) => {
    const updatedFolders = uploadedFolders.filter(folder => folder.name !== folderName);
    setUploadedFolders(updatedFolders);
    
    // Update all photos array
    const remainingPhotos = allUploadedPhotos.filter(photo => {
      const pathParts = photo.webkitRelativePath.split('/');
      return pathParts[0] !== folderName;
    });
    setAllUploadedPhotos(remainingPhotos);

    // Update localStorage
    const savedFolders = JSON.parse(localStorage.getItem('uploadedFolders') || '[]');
    const updatedSavedFolders = savedFolders.filter(folder => folder.folderName !== folderName);
    localStorage.setItem('uploadedFolders', JSON.stringify(updatedSavedFolders));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Handle multiple file drops if needed
      console.log('Files dropped:', files);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.weddingName || !formData.mobileNumber || !formData.package) {
      alert('Please fill in all required fields: Wedding Name, Mobile Number, and Package');
      return;
    }

    // Create new project object
    const newProject = {
      name: formData.weddingName,
      pkg: formData.package,
      date: formData.dueDate || new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/,/, ''),
      mobile: formData.mobileNumber,
      estimatedTime: formData.estimatedTime,
      termsConditions: formData.termsConditions,
      uploadedFolders: uploadedFolders.length,
      totalPhotos: allUploadedPhotos.length,
      createdAt: new Date().toISOString()
    };

    // Get existing pending projects from localStorage
    const existingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
    
    // Add new project to the beginning of the array
    const updatedProjects = [newProject, ...existingProjects];
    
    // Save back to localStorage
    localStorage.setItem('pendingProjects', JSON.stringify(updatedProjects));
    
    console.log('Project added to pending:', newProject);
    console.log('Uploaded Folders:', uploadedFolders);
    console.log('All Photos:', allUploadedPhotos);
    
    // Get saved folders from localStorage
    const savedFolders = JSON.parse(localStorage.getItem('uploadedFolders') || '[]');
    console.log('Saved Folders:', savedFolders);
    
    // Show success message and redirect to dashboard
    alert('Project successfully added to pending projects!');
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[#f4f4f4] lg:flex-row flex-col">
      {/* Sidebar */}
      <aside className="w-full lg:w-[220px] bg-[#222] text-white flex flex-col lg:pt-6 lg:pb-6 lg:pl-0 lg:pr-0 lg:min-h-screen p-3 lg:p-0">
        <div className="flex items-center gap-3 font-['Pacifico'] text-lg lg:text-[1.3rem] px-3 lg:px-6 pb-4 lg:pb-8">
          <span>📸</span>
          <span className="hidden sm:block">Fotographiya</span>
        </div>
        <nav className="flex flex-row lg:flex-col gap-2 px-0 lg:px-3 overflow-x-auto lg:overflow-visible">
          <a 
            href="#" 
            className="text-white no-underline py-2 lg:py-3 px-3 lg:px-[18px] rounded-lg text-sm lg:text-[1.08rem] flex items-center gap-2 lg:gap-[10px] transition-all duration-200 hover:bg-white hover:text-[#181818] whitespace-nowrap"
            onClick={() => navigate('/dashboard')}
          >
            <span>🏠</span> <span className="hidden sm:block">Dashboard</span>
          </a>
          <a 
            href="#" 
            className="text-white no-underline py-2 lg:py-3 px-3 lg:px-[18px] rounded-lg text-sm lg:text-[1.08rem] flex items-center gap-2 lg:gap-[10px] transition-all duration-200 hover:bg-white hover:text-[#181818] whitespace-nowrap"
            onClick={() => navigate('/dashboard/pending')}
          >
            <span>⏳</span> <span className="hidden sm:block">Pending</span>
          </a>
          <a 
            href="#" 
            className="text-white no-underline py-2 lg:py-3 px-3 lg:px-[18px] rounded-lg text-sm lg:text-[1.08rem] flex items-center gap-2 lg:gap-[10px] transition-all duration-200 hover:bg-white hover:text-[#181818] whitespace-nowrap"
            onClick={() => navigate('/dashboard/current')}
          >
            <span>📂</span> <span className="hidden sm:block">Current</span>
          </a>
          <a 
            href="#" 
            className="text-white no-underline py-2 lg:py-3 px-3 lg:px-[18px] rounded-lg text-sm lg:text-[1.08rem] flex items-center gap-2 lg:gap-[10px] transition-all duration-200 hover:bg-white hover:text-[#181818] whitespace-nowrap"
            onClick={() => navigate('/dashboard/completed')}
          >
            <span>✅</span> <span className="hidden sm:block">Completed</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:pt-8 lg:pr-8 lg:pb-8 lg:pl-0 flex flex-col">
        
        {/* Form Content */}
        <section className="bg-white rounded-xl lg:rounded-b-xl p-4 lg:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl lg:text-[2rem] mb-6 font-['Montserrat'] text-white bg-[#181818] py-3 lg:py-4 px-4 lg:px-6 rounded-lg -mt-4 lg:-mt-8 -mx-4 lg:-mx-8 mb-6 lg:mb-8">Add project</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wedding Name */}
            <div>
              <input
                type="text"
                name="weddingName"
                placeholder="Wedding-Name"
                value={formData.weddingName}
                onChange={handleInputChange}
                className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base"
              />
            </div>

            {/* Package and Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
                <select
                  name="package"
                  value={formData.package}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  placeholder="Add Groom Mobile No."
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base"
                />
              </div>
            </div>

            {/* Upload Multiple Folders Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                <label className="block text-sm font-medium text-gray-700">Upload Photos (Multiple Folders)</label>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>💾 Saved to browser storage</span>
                </div>
              </div>
                              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center bg-gray-50"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-2">
                  <span className="text-3xl sm:text-4xl">📁</span>
                  <span className="text-gray-600 text-sm sm:text-base">
                    Drop folders here, or{' '}
                    <button 
                      type="button" 
                      className="text-blue-500 underline"
                      onClick={() => multiplePhotosRef.current?.click()}
                      disabled={isUploading}
                    >
                      browse
                    </button>
                    .
                  </span>
                </div>
                {isUploading && (
                  <div className="text-blue-600 font-medium">
                    💾 Saving to browser storage...
                  </div>
                )}
                <input
                  type="file"
                  ref={multiplePhotosRef}
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleMultipleFolderUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              {/* Display Uploaded Folders */}
              {uploadedFolders.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    Uploaded Folders ({uploadedFolders.length})
                  </h4>
                  <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
                    {uploadedFolders.map((folder, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📂</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-800 text-sm sm:text-base truncate">{folder.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              {folder.count} photos
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {/* Preview some photos from the folder */}
                          <div className="hidden sm:flex -space-x-1">
                            {folder.files.slice(0, 3).map((file, fileIndex) => (
                              <img
                                key={fileIndex}
                                src={URL.createObjectURL(file)}
                                alt={`preview-${fileIndex}`}
                                className="w-6 sm:w-8 h-6 sm:h-8 object-cover rounded-full border-2 border-white"
                              />
                            ))}
                            {folder.files.length > 3 && (
                              <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium">
                                +{folder.files.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-green-500 text-sm" title="Saved locally">💾</span>
                            <button
                              type="button"
                              onClick={() => removeFolder(folder.name)}
                              className="text-red-500 hover:text-red-700 text-lg sm:text-xl"
                              title="Remove folder"
                              disabled={isUploading}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-600">
                    Total: {allUploadedPhotos.length} photos from {uploadedFolders.length} folders
                    <span className="block sm:inline sm:ml-2 text-green-600">💾 Saved to browser storage</span>
                  </div>
                </div>
              )}
            </div>

           

            {/* Due Date and Estimated Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                <select
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base"
                >
                  <option value="">Select estimated time</option>
                  <option value="1-2 days">1-2 Days</option>
                  <option value="3-5 days">3-5 Days</option>
                  <option value="1 week">1 Week</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="3 weeks">3 Weeks</option>
                  <option value="1 month">1 Month</option>
                  <option value="2 months">2 Months</option>
                  <option value="custom">Custom Timeline</option>
                </select>
              </div>
            </div>

           

           

            {/* Terms and Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms and Conditions</label>
              <select
                name="termsConditions"
                value={formData.termsConditions}
                onChange={handleInputChange}
                className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base"
              >
                <option value="">Select terms and Conditions</option>
                <option value="accepted">I accept terms and conditions</option>
               
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center sm:justify-end">
              <button
                type="submit"
                disabled={isUploading}
                className={`w-full sm:w-auto py-3 px-6 sm:px-8 text-base font-medium cursor-pointer transition-colors duration-200 rounded-lg border-none ${
                  isUploading 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-[#181818] text-white hover:bg-[#444]'
                }`}
              >
                {isUploading ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default FaceMatch; 