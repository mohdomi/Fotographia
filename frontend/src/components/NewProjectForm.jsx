import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useMemo,useCallback } from 'react';
import axios from 'axios';
import api from "../api/axios.js";
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

export default function NewProjectForm() {
   // --- State Management ---
  const [filesInfo, setFilesInfo] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, selecting, ready, uploading, complete, error
  const [, setLog] = useState([]);
  const [, setOverallProgress] = useState(0);
  const [, setUploadSessionId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [weddingName , setWeddingName] = useState("");
  const [mobileNo , setMobileNo] = useState("");
  const [packages , setPackages] = useState("Free");
  const [Userpin,setUserpin]=useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dueDate,setDueDate]=useState("");
  const [photocount,setPhotocount] =useState(0);
  const [estimatedDays,setestimatedDays]=useState(0);
  


  // --- Memoized Values ---
  const totalBytes = useMemo(() => filesInfo.reduce((sum, f) => sum + f.size, 0), [filesInfo]);
  const isReadyToUpload = status === 'ready';
  const isUploading = status === 'uploading';
  const showProgress = ['ready', 'uploading', 'complete', 'error'].includes(status);

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
    console.log(files);
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
      setPhotocount(allFiles.length);

      if (allFiles.length === 0) {
        logMessage('No files found to upload.', 'error');
        setStatus('idle');
        return;
      }
console.log(allFiles);
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
    console.log(files);
    if (files.length > 0) {
      await processFiles(files);
    }
  }, [processFiles]);



  // --- Core Upload Logic ---
  const handleUpload = async () => {

    if(
    !weddingName.trim() ||
    !mobileNo.trim() ||
    !packages.trim() ||
    !dueDate ||
    !Userpin.trim() ||
    filesInfo.length === 0 ||
    !estimatedDays ||
    !photocount
    ) {
      toast.error("Please fill all required fields and select files before Uploading");
      return;
    }

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

      const genUrlsResponse = await api.post("/api/v1/admin/generate-upload-urls", {
        files: filesToRequest,
        weddingName: weddingName,
        mobile_no : mobileNo,
        packages : packages,
        dueDate:dueDate,
        estimatedDays:estimatedDays,
        Userpin:Userpin,
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
            onUploadProgress: (progressEvent) => {
              const { loaded, total } = progressEvent;
              const percentage = Math.floor((loaded * 100) / total);

              uploadedBytesTracker[index] = loaded;
              updateProgress();

              setFilesInfo(prev => prev.map(f => f.id === fileInfo.id ? { ...f, progress: percentage } : f
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
            weddingId,    // ObjectId from backend response
            categoryId    // ObjectId from backend response
          }));

        if (completedFiles.length > 0 && urlData.uploadSessionId) {
          logMessage('Notifying backend of completion...');

          api.post("/api/v1/admin/upload-complete", {
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
      if(status==='complete'){
      setFilesInfo();
      setWeddingName("");
      setMobileNo("");
      setPackages("");
      setUserpin("");
      setDueDate("");
      setPhotocount(0);
      setestimatedDays(0);
      }
      
    } catch (error) {
      logMessage(`An error occurred: ${error.message}`, 'error');
      setStatus('error');
    }
  };



const generatePassword = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "@#&!";
  const allChars = lowercase + numbers + symbols;

  const passwordSet = new Set();

  // First character: must be uppercase
  const firstChar = uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  passwordSet.add(firstChar);

  while (passwordSet.size < 8) {
    const randomChar = allChars.charAt(Math.floor(Math.random() * allChars.length));
    passwordSet.add(randomChar); // Set ensures uniqueness
  }

  const password = Array.from(passwordSet).join('');
  setUserpin(password);
};

console.log(filesInfo);
  const dropzoneClassName = `border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 bg-white ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`;

  return (
    <div className="md:ml-[16.66%] md:w-5/6 h-[calc(100vh-20px)]  overflow-y-auto scrollbar-hide  pt-[5px] text-gray-500">
      <div className="bg-black md:rounded-l-xl py-8 px-10">
        <h1 className="text-white text-2xl font-bold mb-6">Add Project</h1>

        <form className="space-y-6">
          {/* Wedding Name */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Wedding-name</label>
            <input
              onChange={(e) => setWeddingName(e.target.value)}
              type="text"
              name="weddingName"
              placeholder="Wedding-Name"
              className="w-full py-3 px-4 text-black  rounded-lg  focus:outline-none text-base"
            />
          </div>

          {/* Package & Mobile */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className='md:max-w-xs w-full'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
              <select
                onChange={(e) => setPackages(e.target.value)}
                name="package"
                className="w-full py-3 px-4 rounded-lg text-black  focus:outline-none  text-base"
              >
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div className='md:max-w-xs w-full'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                onChange={(e) => setMobileNo(e.target.value)}
                type="tel"
                name="mobileNumber"
                placeholder="Add Groom Mobile No."
                className="w-full text-black py-3 px-4 rounded-lg focus:outline-none text-base"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className='md:max-w-xs w-full'>
              <label className="block text-sm font-medium text-gray-700 mb-2">PhotoCount</label>
             <input
                type="number"
                value={photocount}
                onChange={()=>{}}
                placeholder="Add Groom Mobile No."
                className="w-full text-black py-3 px-4 rounded-lg focus:outline-none text-base"
              />
            </div>

<div className="relative md:max-w-xs w-full">
  <label className="block text-sm font-medium text-gray-700 mb-2">Userpin</label>
  <input
    onChange={(e) => setUserpin(e.target.value)}
    value={Userpin}
    type={showPassword ? "text" : "password"}
    name="Userpin"
    placeholder="Add unique userpin"
    className="w-full text-black py-3 px-4 center rounded-lg focus:outline-none text-base pr-20"
  />
  
  {/* Password visibility toggle */}
  <div
    className="absolute inset-y-0 right-10 top-[40px] flex justify-center items-center cursor-pointer text-gray-500"
    onClick={() => setShowPassword(prev => !prev)}
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </div>

  {/* Password generator */}
  <div
    className="absolute inset-y-0 right-2 top-[40px] flex items-center cursor-pointer text-blue-500"
    onClick={generatePassword}
    title="Generate Password"
  >
    <Sparkles size={20} />
  </div>
</div>  
          </div>

          {/* File Upload Section */}
          <div className='p-5 rounded-lg cursor-pointer bg-white'>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos (Multiple Folders)</label>
            <div
              id="dropzone"
              
              className={dropzoneClassName}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
      <div className="flex justify-center pointer-events-none">
             <div className=" flex justify-center space-x-4">
                   <img 
            src="/upload.png" 
             alt="upload icon" 
          className="w-auto h-8  object-contain"
    />
    <div className='flex flex-col justify-center'>
   <p className="text-lg font-normal text-gray-500 tracking-wider">Drop files to begin upload , or browse.</p>
    </div>
                </div>
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={handleUpload}
                type="button"
                disabled={!isReadyToUpload}
                className="px-8 py-3 bg-zinc-900 text-white font-semibold rounded-lg shadow-md hover:bg-zinc-800 disabled:bg-zinc-900 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isUploading ? 'Uploading...' : `Upload ${filesInfo.length} Files`}
              </button>
              <button
                onClick={resetState}
                type="button"
                disabled={isUploading}
                className="px-8 py-3 bg-zinc-900 text-white font-semibold rounded-lg shadow-md hover:bg-zinc-800 disabled:bg-gray-400 transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>

          {/* --- File Progress and Log Viewer Section --- */}
            {showProgress && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <h4 className="text-md font-semibold text-gray-700 mb-3">
                                Upload Progress
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-gray-100 rounded-lg">
                                {filesInfo.map(fileInfo => (
                                    <FileItem key={fileInfo.id} fileInfo={fileInfo} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

          {/* Due Date & Estimated Time */}
          <div className="flex flex-col  sm:flex-row justify-between gap-6">
            <div className='w-full md:max-w-xs'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                onChange={(e)=>setDueDate(e.target.value)}
                name="dueDate"
                className="w-full text-black py-3 px-4 rounded-lg  focus:outline-none text-base"
              />
            </div>
            <div className='w-full md:max-w-xs'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
              {/* <select
                name="estimatedTime"
                className="w-full py-3 px-4 rounded-lg  focus:outline-none text-base"
              >
                <option value="">Select estimated time</option>
                <option value="1-2 days">1-2 Days</option>
                <option value="3-5 days">3-5 Days</option>
                <option value="1 week">1 Week</option>
              </select> */}
               <input
                type="number"
                name="estimatedDays"
                onChange={(e)=>setestimatedDays(parseInt(e.target.value) || 0)}
                className="w-full text-black py-3 px-4 rounded-lg  focus:outline-none text-base"
                placeholder='Enter estimated time (in days)'
              />
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Terms and Conditions</label>
            <select
              name="termsConditions"
              className="w-full text-black py-3 px-4 rounded-lg  focus:outline-none text-base"
            >
              <option value="">Select terms and Conditions</option>
              <option value="accepted">I accept terms and conditions</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex justify-center sm:justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto py-3 px-6 sm:px-8 text-base font-medium cursor-pointer transition-colors duration-200 rounded-lg border-none bg-[#181818] text-white hover:bg-[#444]"
            >
              Submit Project
            </button>
            {/* <button
                onClick={handleUpload}
                type="button"
                disabled={!isReadyToUpload}
                className="px-8 py-3 bg-zinc-900 text-white font-semibold rounded-lg shadow-md hover:bg-zinc-800 disabled:bg-zinc-900 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isUploading ? 'Uploading...' : `Upload ${filesInfo.length} Files`}
              </button> */}
          </div>
        </form>
      </div>
    </div>
  );
}


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
