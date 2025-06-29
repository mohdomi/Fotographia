import React, { useState } from 'react';

const Invite = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('Can add');
  
  // Mock data for invited users - matches what's shown in the image
  const [invitedUsers, setInvitedUsers] = useState([
    { email: 'mewaradishant@gmail.com', permission: 'Haidi only' },
    { email: 'mewaradishant@gmail.com', permission: 'All view' },
    { email: 'mewaradishant@gmail.com', permission: 'All view' },
    { email: 'mewaradishant@gmail.com', permission: 'All view' },
    { email: 'mewaradishant@gmail.com', permission: 'All view' },
    { email: 'mewaradishant@gmail.com', permission: 'All view' },
    { email: 'mewaradishant@gmail.com', permission: 'All view' },
  ]);

  const handleInvite = () => {
    if (email.trim()) {
      setInvitedUsers([...invitedUsers, { email: email.trim(), permission }]);
      setEmail('');
    }
  };

  const handlePermissionChange = (index, newPermission) => {
    const updated = [...invitedUsers];
    updated[index].permission = newPermission;
    setInvitedUsers(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Invite</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Email input section */}
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="Add Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select 
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option>Can add</option>
              <option>Can edit</option>
              <option>Can view</option>
              <option>All view</option>
              <option>Haidi only</option>
            </select>
            <button 
              onClick={handleInvite}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Invite
            </button>
          </div>

          {/* Access info */}
          <div className="flex justify-between items-center mb-4 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">Only people invited to this file</span>
            </div>
            <span className="text-gray-600">can access</span>
          </div>

          {/* Invited users list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {invitedUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>
                <select 
                  value={user.permission}
                  onChange={(e) => handlePermissionChange(index, e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option>Haidi only</option>
                  <option>All view</option>
                  <option>Can edit</option>
                  <option>Can add</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invite; 