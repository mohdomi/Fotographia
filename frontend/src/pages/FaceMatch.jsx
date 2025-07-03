import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState , useMemo , useCallback } from 'react';


const Icon = ({ type, className = "w-6 h-6" }) => {
    const icons = {
        upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
        pending: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        uploading: <div className="spinner w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>,
        success: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
        error: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    };

    if (type === 'uploading') return icons.uploading;

    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            {icons[type]}
        </svg>
    );
};


const FileItem = ({ fileInfo }) => {
    const { name, relativePath, size, status, progress, errorMessage } = fileInfo;
    const friendlySize = (size / (1024 * 1024)).toFixed(2) + ' MB';

    const statusColors = {
        pending: 'bg-gray-400',
        uploading: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
    };
    
    const statusIcons = {
        pending: 'pending',
        uploading: 'uploading',
        success: 'success',
        error: 'error',
    }

    return (
        <div className="p-4 bg-gray-50 rounded-lg transition-all">
            <div className="flex items-center justify-between">
                <div className="flex-grow mr-4 overflow-hidden">
                    <p className="font-semibold text-gray-800 truncate">{name}</p>
                    <p className="text-sm text-gray-500 truncate">{relativePath}</p>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-600 mr-4">{friendlySize}</div>
                <div title={errorMessage || status} className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <Icon type={statusIcons[status]} />
                </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full transition-all duration-300 ${statusColors[status]}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

const FaceMatch = () => {

  // --- State Management ---
  const [filesInfo, setFilesInfo] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, selecting, ready, uploading, complete, error
  const [, setLog] = useState([]);
  const [, setOverallProgress] = useState(0);
  const [, setUploadSessionId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [weddingName , setWeddingName] = useState("");
  const [mobileNo , setMobileNo] = useState("");
  const [packages , setPackages] = useState("");

  const navigate = useNavigate();


  // --- Backend API Endpoints ---
  const API_BASE_URL = 'http://localhost:8000/api/v1/admin'; // Replace with your backend URL if needed
  const GENERATE_URLS_ENDPOINT = `${API_BASE_URL}/generate-upload-urls`;
  const UPLOAD_COMPLETE_ENDPOINT = `${API_BASE_URL}/upload-complete`;

  // --- Memoized Values ---
  const totalBytes = useMemo(() => filesInfo.reduce((sum, f) => sum + f.size, 0), [filesInfo]);
  const isReadyToUpload = status === 'ready';
  const isUploading = status === 'uploading';
  // const showProgress = ['ready', 'uploading', 'complete', 'error'].includes(status);

  // --- Utility Functions ---
  const logMessage = useCallback((message, type = 'info') => {
    const now = new Date().toLocaleTimeString();
    setLog(prevLog => [...prevLog, { message, type, time: now }]);
    console.log(`[${type}] ${message}`);
  }, []);

  const resetState = useCallback(() => {
    setFilesInfo([]);
    setStatus('idle');
    setLog([]);
    setOverallProgress(0);
    setUploadSessionId(null);
  }, []);

  // --- File & Folder Processing ---
  const traverseFileTree = useCallback(async (entry) => {
    let files = [];
    if (entry.isFile) {
      const file = await new Promise(resolve => entry.file(resolve));
      file.relativePath = entry.fullPath.startsWith('/') ? entry.fullPath.substring(1) : entry.fullPath;
      files.push(file);
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const entries = await new Promise(resolve => reader.readEntries(resolve));
      const filePromises = entries.map(e => traverseFileTree(e));
      const nestedFiles = await Promise.all(filePromises);
      files = files.concat(...nestedFiles);
    }
    return files;
  }, []);

  const processFiles = useCallback(async (droppedItems) => {
    resetState();
    logMessage(`Processing ${droppedItems.length} items...`);
    setStatus('selecting');

    const filePromises = Array.from(droppedItems).map(item => {
      const entry = item.webkitGetAsEntry();
      return entry ? traverseFileTree(entry) : Promise.resolve([]);
    });

    try {
      const nestedFileArrays = await Promise.all(filePromises);
      const allFiles = nestedFileArrays.flat();

      if (allFiles.length === 0) {
        logMessage('No files found to upload.', 'error');
        setStatus('idle');
        return;
      }

      const filesData = allFiles.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        relativePath: file.relativePath || file.name,
        status: 'pending',
        progress: 0,
        errorMessage: null,
      }));

      setFilesInfo(filesData);
      setStatus('ready');
      logMessage(`Found ${filesData.length} files. Ready to upload.`);
    } catch (error) {
      logMessage(`Error processing files: ${error.message}`, 'error');
      setStatus('error');
    }
  }, [logMessage, resetState, traverseFileTree]);


  // --- Drag and Drop Handlers ---
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.items) {
      await processFiles(e.dataTransfer.items);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files).map(file => {
      // Mock a DataTransferItem-like structure for processFiles
      return {
        webkitGetAsEntry: () => ({
          isFile: true,
          isDirectory: false,
          name: file.name,
          fullPath: file.webkitRelativePath || file.name,
          file: (callback) => callback(file),
        })
      };
    });
    if (files.length > 0) {
      await processFiles(files);
    }
  }, [processFiles]);


  // --- Core Upload Logic ---
  const handleUpload = async () => {
    if (!isReadyToUpload) return;

    setStatus('uploading');
    logMessage('Starting upload process...');

    let uploadedBytesTracker = filesInfo.map(() => 0);

    const updateProgress = () => {
      const totalUploadedBytes = uploadedBytesTracker.reduce((sum, bytes) => sum + bytes, 0);
      const percentage = totalBytes > 0 ? Math.round((totalUploadedBytes / totalBytes) * 100) : 0;
      setOverallProgress(percentage);
    };

    try {
      // 1. Get Pre-signed URLs from the backend
      const filesToRequest = filesInfo.map(({ name, size, type, relativePath }) => ({ name, size, type, relativePath }));
      logMessage(`Requesting pre-signed URLs for ${filesToRequest.length} files...`);
      console.log(filesToRequest);
      const genUrlsResponse = await axios.post(GENERATE_URLS_ENDPOINT, {
        files: filesToRequest,
        weddingName: weddingName,
        mobile_no : mobileNo,
        packages : packages
      });

      if (!genUrlsResponse.data.success) {
        throw new Error(genUrlsResponse.data.error || 'Failed to get pre-signed URLs.');
      }

      const { data: urlData } = genUrlsResponse;
      setUploadSessionId(urlData.uploadSessionId);
      logMessage(`Received session ID: ${urlData.uploadSessionId}`, 'success');

      setFilesInfo(prevFiles => {
        const newFiles = [...prevFiles];
        urlData.data.successful.forEach(res => {
          // Match by relativePath and name for better accuracy with nested folders
          const fileIndex = newFiles.findIndex(f => f.name === res.originalName && f.relativePath === (res.originalPath ? `${res.originalPath}/${res.originalName}` : res.originalName));
          if (fileIndex !== -1) {
            newFiles[fileIndex] = { ...newFiles[fileIndex], ...res, status: 'pending' };
          }
        });
        urlData.data.failed?.forEach(res => {
          const fileIndex = newFiles.findIndex(f => f.name === res.originalName);
          if (fileIndex !== -1) {
            newFiles[fileIndex].status = 'error';
            newFiles[fileIndex].errorMessage = res.error;
          }
        });
        return newFiles;
      });

      // 2. Upload files to S3
      const uploadPromises = filesInfo.map(async (fileInfo, index) => {
        const urlInfo = urlData.data.successful.find(u => u.originalName === fileInfo.name && u.originalPath === (fileInfo.relativePath.includes('/') ? fileInfo.relativePath.substring(0, fileInfo.relativePath.lastIndexOf('/')) : ''));
        if (!urlInfo) {
          return Promise.resolve(); // Skip files that failed to get a URL
        }

        const formData = new FormData();
        Object.entries(urlInfo.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append('file', fileInfo.file);

        setFilesInfo(prev => prev.map(f => f.id === fileInfo.id ? { ...f, status: 'uploading' } : f));

        try {
          const res = await axios.post(urlInfo.uploadUrl, formData, {
            onUploadProgress: (progressEvent_2) => {
              const { loaded, total } = progressEvent_2;
              const percentage = Math.floor((loaded * 100) / total);

              uploadedBytesTracker[index] = loaded;
              updateProgress();

              setFilesInfo(prev_1 => prev_1.map(f_1 => f_1.id === fileInfo.id ? { ...f_1, progress: percentage } : f_1
              ));
            },
          });
          setFilesInfo(prev_2 => prev_2.map(f_2 => {
            if (f_2.id === fileInfo.id) {
              // Attach S3 metadata to the file object for backend notification
              return {
                ...f_2,
                status: 'success',
                etag: res.headers.etag,
                key: urlInfo.key,
                finalUrl: urlInfo.finalUrl,
                folderPath: urlInfo.folderPath,
                originalName: urlInfo.originalName,
              };
            }
            return f_2;
          }));
        } catch (err) {
          const message = err.response ? `S3 Error: ${err.response.status}` : 'Network Error';
          logMessage(`Upload failed for ${fileInfo.name}: ${message}`, 'error');
          setFilesInfo(prev_3 => prev_3.map(f_3 => f_3.id === fileInfo.id ? { ...f_3, status: 'error', errorMessage: message } : f_3));
        }
      });

      await Promise.all(uploadPromises);
      logMessage('All file uploads processed.');

      // 3. Notify backend of completion using the latest filesInfo state
      setFilesInfo(prevFiles => {
        const completedFiles = prevFiles.filter(f => f.status === 'success')
          .map(({ key, originalName, finalUrl, size, etag, folderPath, weddingId, categoryId }) => ({
            key,
            originalName,
            finalUrl,
            status: 'completed',
            size,
            etag,
            folderPath,
            weddingId, // ObjectId from backend response
            categoryId // ObjectId from backend response
          }));

        if (completedFiles.length > 0 && urlData.uploadSessionId) {
          logMessage('Notifying backend of completion...');

          axios.post(UPLOAD_COMPLETE_ENDPOINT, {
            uploadSessionId: urlData.uploadSessionId,
            files: completedFiles
          }).then(() => {
            logMessage('Backend notified successfully.', 'success');
          }).catch(error => {
            logMessage(`Backend notification failed: ${error.message}`, 'error');
          });
        } else {
          logMessage('No files successfully uploaded or no session ID. Skipping completion notice.');
        }
        return prevFiles;
      });

      setStatus('complete');

    } catch (error) {
      logMessage(`An error occurred: ${error.message}`, 'error');
      setStatus('error');
    }
  };

    const dropzoneClassName = `border-4 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 bg-white ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`;



  return (
    <div className="flex min-h-screen bg-[#f4f4f4] lg:flex-row flex-col">
      {/* --- Sidebar --- */}
      <aside className="w-full lg:w-[220px] bg-[#222] text-white flex flex-col lg:pt-6 lg:pb-6 lg:pl-0 lg:pr-0 lg:min-h-screen p-3 lg:p-0">
        <div className="flex items-center gap-3 font-['Pacifico'] text-lg lg:text-[1.3rem] px-3 lg:px-6 pb-4 lg:pb-8">
          <img src="/logo.png" alt="Fotographiya Logo" className="h-8 lg:h-10 w-auto object-contain" />
        </div>
        <nav className="flex flex-row lg:flex-col gap-2 px-0 lg:px-3 overflow-x-auto lg:overflow-visible">
          <a href="#" className="text-white no-underline py-2 lg:py-3 px-3 lg:px-[18px] rounded-lg text-sm lg:text-[1.08rem] flex items-center gap-2 lg:gap-[10px] transition-all duration-200 hover:bg-white hover:text-[#181818] whitespace-nowrap" onClick={() => navigate('/dashboard')}>
            <span>🏠</span> <span className="hidden sm:block">Dashboard</span>
          </a>
          <a href="#" className="text-white no-underline py-2 lg:py-3 px-3 lg:px-[18px] rounded-lg text-sm lg:text-[1.08rem] flex items-center gap-2 lg:gap-[10px] transition-all duration-200 hover:bg-white hover:text-[#181818] whitespace-nowrap" onClick={() => navigate('/dashboard/pending')}>
            <span>⏳</span> <span className="hidden sm:block">Pending</span>
          </a>
          <a href="#" className="text-white no-underline py-2 lg:py-3 px-3 lg:px-[18px] rounded-lg text-sm lg:text-[1.08rem] flex items-center gap-2 lg:gap-[10px] transition-all duration-200 hover:bg-white hover:text-[#181818] whitespace-nowrap" onClick={() => navigate('/dashboard/current')}>
            <span>📂</span> <span className="hidden sm:block">Current</span>
          </a>
          <a href="#" className="text-white no-underline py-2 lg:py-3 px-3 lg:px-[18px] rounded-lg text-sm lg:text-[1.08rem] flex items-center gap-2 lg:gap-[10px] transition-all duration-200 hover:bg-white hover:text-[#181818] whitespace-nowrap" onClick={() => navigate('/dashboard/completed')}>
            <span>✅</span> <span className="hidden sm:block">Completed</span>
          </a>
        </nav>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-4 lg:pt-8 lg:pr-8 lg:pb-8 lg:pl-0 flex flex-col">
        <section className="bg-white rounded-xl lg:rounded-b-xl p-4 lg:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl lg:text-[2rem] mb-6 font-['Montserrat'] text-white bg-[#181818] py-3 lg:py-4 px-4 lg:px-6 rounded-lg -mt-4 lg:-mt-8 -mx-4 lg:-mx-8 mb-6 lg:mb-8">Add project</h2>

          <form className="space-y-6">
            {/* --- Form Inputs --- */}
            <div>
              <input onChange={(e)=>{
                setWeddingName(e.target.value);
              }} type="text" name="weddingName" placeholder="Wedding-Name" className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
                <select onChange={(e)=>{
                  setPackages(e.target.value);
                  console.log(e.target.value);
                }} name="package" className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base">
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input onChange={(e)=>{
                  setMobileNo(e.target.value);
                }} type="tel" name="mobileNumber" placeholder="Add Groom Mobile No." className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base" />
              </div>
            </div>

            {/* --- Upload Section --- */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                <label className="block text-sm font-medium text-gray-700">Upload Photos (Multiple Folders)</label>
              </div>
              <div
                        id="dropzone"
                        className={dropzoneClassName}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('fileInput')?.click()}
                    >
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                            <Icon type="upload" className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-lg font-semibold text-gray-700">Drag & Drop a Folder Here</p>
                            <p className="text-gray-500">or click to select files</p>
                            <input type="file" id="fileInput" className="hidden" webkitdirectory="" directory="" multiple onChange={handleFileSelect} />
                        </div>
                    </div>

                      <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                onClick={handleUpload}
                                disabled={!isReadyToUpload}
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {isUploading ? 'Uploading...' : `Upload ${filesInfo.length} Files`}
                            </button>
                             <button
                                onClick={resetState}
                                disabled={isUploading}
                                className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 disabled:bg-gray-400 transition-all duration-300"
                            >
                                Clear
                            </button>
                        </div>
                    

              {/* --- Display Uploaded Folders (Static UI) --- */}
              {/* This section would dynamically render based on uploadedFolders state in a real app */}
              {/* Example of how it would look with some dummy data */}
              {false && ( // Set to true to see the static UI example
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    Selected Folders (2)
                  </h4>
                  <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center min-w-0 flex-1">
                        <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📂</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-800 text-sm sm:text-base truncate">Wedding_Day_1</div>
                          <div className="text-xs sm:text-sm text-gray-600">150 photos</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <div className="hidden sm:flex -space-x-1">
                          {/* Dummy image previews */}
                          <img src="https://via.placeholder.com/24" alt="preview" className="w-6 sm:w-8 h-6 sm:h-8 object-cover rounded-full border-2 border-white" />
                          <img src="https://via.placeholder.com/24" alt="preview" className="w-6 sm:w-8 h-6 sm:h-8 object-cover rounded-full border-2 border-white" />
                          <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium">
                            +147
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" className="text-red-500 hover:text-red-700 text-lg sm:text-xl" title="Remove folder">
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center min-w-0 flex-1">
                        <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📂</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-800 text-sm sm:text-base truncate">Reception_Photos</div>
                          <div className="text-xs sm:text-sm text-gray-600">80 photos</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <div className="hidden sm:flex -space-x-1">
                          {/* Dummy image previews */}
                          <img src="https://via.placeholder.com/24" alt="preview" className="w-6 sm:w-8 h-6 sm:h-8 object-cover rounded-full border-2 border-white" />
                          <img src="https://via.placeholder.com/24" alt="preview" className="w-6 sm:w-8 h-6 sm:h-8 object-cover rounded-full border-2 border-white" />
                          <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium">
                            +78
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" className="text-red-500 hover:text-red-700 text-lg sm:text-xl" title="Remove folder">
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-600">
                    Total: 230 photos from 2 folders
                    <span className="block sm:inline sm:ml-2 text-green-600">✅ Ready to upload</span>
                  </div>
                </div>
              )}
            </div>

            {/* --- Due Date, Time, and Terms --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input type="date" name="dueDate" className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                <select name="estimatedTime" className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base">
                  <option value="">Select estimated time</option>
                  <option value="1-2 days">1-2 Days</option>
                  <option value="3-5 days">3-5 Days</option>
                  <option value="1 week">1 Week</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms and Conditions</label>
              <select name="termsConditions" className="w-full py-3 px-4 rounded-lg border-[1.5px] border-[#ccc] text-base">
                <option value="">Select terms and Conditions</option>
                <option value="accepted">I accept terms and conditions</option>
              </select>
            </div>

            {/* --- Submit Button --- */}
            <div className="flex justify-center sm:justify-end">
              <button type="submit" className="w-full sm:w-auto py-3 px-6 sm:px-8 text-base font-medium cursor-pointer transition-colors duration-200 rounded-lg border-none bg-[#181818] text-white hover:bg-[#444]">
                Submit Project
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default FaceMatch;