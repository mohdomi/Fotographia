import React, { useState, useEffect } from 'react';

const ClientMain = () => {
  // Timer state - starts at 30 minutes (1800 seconds)
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Progress tracking
  const [selectedHaldiPhotos, setSelectedHaldiPhotos] = useState(new Set());
  const [selectedMehendiPhotos, setSelectedMehendiPhotos] = useState(new Set());
  const [selectedWeddingPhotos, setSelectedWeddingPhotos] = useState(new Set());
  
  // Required minimum photos to unlock next section
  const REQUIRED_HALDI_PHOTOS = 10;
  const REQUIRED_MEHENDI_PHOTOS = 8;
  
  // Unlock states - need to select required number of photos
  const mehendiUnlocked = selectedHaldiPhotos.size >= REQUIRED_HALDI_PHOTOS;
  const weddingUnlocked = selectedMehendiPhotos.size >= REQUIRED_MEHENDI_PHOTOS;

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mock photo data
  const haldiPhotos = Array(30).fill(null).map((_, i) => ({
    id: `haldi-${i}`,
    src: '/public/image.jpg',
    selected: selectedHaldiPhotos.has(`haldi-${i}`)
  }));

  const mehendiPhotos = Array(24).fill(null).map((_, i) => ({
    id: `mehendi-${i}`,
    src: '/public/image.jpg',
    selected: selectedMehendiPhotos.has(`mehendi-${i}`)
  }));

  const weddingPhotos = Array(36).fill(null).map((_, i) => ({
    id: `wedding-${i}`,
    src: '/public/image.jpg',
    selected: selectedWeddingPhotos.has(`wedding-${i}`)
  }));

  const handlePhotoSelect = (photoId, section) => {
    if (section === 'haldi') {
      const newSelected = new Set(selectedHaldiPhotos);
      if (newSelected.has(photoId)) {
        newSelected.delete(photoId);
      } else {
        newSelected.add(photoId);
      }
      setSelectedHaldiPhotos(newSelected);
    } else if (section === 'mehendi' && mehendiUnlocked) {
      const newSelected = new Set(selectedMehendiPhotos);
      if (newSelected.has(photoId)) {
        newSelected.delete(photoId);
      } else {
        newSelected.add(photoId);
      }
      setSelectedMehendiPhotos(newSelected);
    } else if (section === 'wedding' && weddingUnlocked) {
      const newSelected = new Set(selectedWeddingPhotos);
      if (newSelected.has(photoId)) {
        newSelected.delete(photoId);
      } else {
        newSelected.add(photoId);
      }
      setSelectedWeddingPhotos(newSelected);
    }
  };

  const PhotoGrid = ({ photos, section, locked = false, title, requiredCount, selectedCount }) => (
    <div className="mb-8 md:mb-16 px-4 md:px-8 py-4 md:py-6 bg-white rounded-3xl shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        {/* Title */}
        <h1 className="text-4xl md:text-7xl font-light tracking-wider">{title}</h1>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button 
            className={`flex items-center gap-2 ${locked ? 'bg-gray-50 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-3 md:px-4 py-2 rounded-full transition-colors`}
            disabled={locked}
          >
            <svg className="w-4 md:w-5 h-4 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button 
            className={`flex items-center gap-2 ${locked ? 'bg-purple-50 text-purple-300' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'} px-4 md:px-6 py-2 rounded-full transition-colors text-sm md:text-base`}
            disabled={locked}
          >
            SELECT PC
          </button>
          <button 
            className={`flex items-center gap-2 ${locked ? 'bg-purple-50 text-purple-300' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'} px-4 md:px-6 py-2 rounded-full transition-colors text-sm md:text-base`}
            disabled={locked}
          >
            <span>REPLACE</span>
            <svg className="w-3 md:w-4 h-3 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square cursor-pointer group"
            onClick={() => !locked && handlePhotoSelect(photo.id, section)}
          >
            {/* Pink gradient border effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-[2px] transition-opacity duration-200 ${photo.selected ? 'opacity-100' : 'opacity-40'}`}>
              <div className="absolute inset-[1px] bg-white rounded-[10px]" />
            </div>
            
            {/* Image */}
            <div className="relative h-full rounded-xl overflow-hidden">
              <img
                src={photo.src}
                alt={`${section} photo`}
                className={`w-full h-full object-cover transition-all duration-200
                  ${locked ? 'brightness-50' : 'hover:scale-105'}
                  ${photo.selected ? 'brightness-90' : ''}
                `}
              />
              
              {/* Selection Checkmark for unlocked sections */}
              {!locked && photo.selected && (
                <div className="absolute bottom-2 right-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Lock overlay for locked sections */}
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Counter */}
      <div className="mt-4 md:mt-6 text-right text-xs md:text-sm text-gray-600">
        {!locked ? (
          `Selected: ${selectedCount}/${requiredCount || photos.length}`
        ) : (
          <div className="flex items-center justify-end gap-2 text-gray-400">
            <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Complete previous section to unlock</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              <img 
                src="/logo.png" 
                alt="Fotographiya Logo" 
                className="h-8 md:h-10 w-auto object-contain"
              />
            </div>

            {/* Center Navigation - Hide on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <div className="bg-indigo-900 rounded-full py-1 px-4 flex items-center gap-2">
                <button className="px-2 md:px-3 py-1 text-white text-xs md:text-sm font-medium">
                  1<br/>month
                </button>
                <button className="px-2 md:px-3 py-1 text-white text-xs md:text-sm font-medium">
                  19<br/>days
                </button>
                <button className="px-2 md:px-3 py-1 text-white text-xs md:text-sm font-medium">
                  12<br/>hours
                </button>
                <button className="px-2 md:px-3 py-1 text-white text-xs md:text-sm font-medium">
                  55<br/>sec
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center">
                Time Limit
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* User Profile */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg className="w-5 md:w-6 h-5 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    2
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">DESHANT MEMARA</div>
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              {/* Mobile Timer */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="bg-indigo-900 rounded-full py-1 px-4 flex items-center gap-2">
                  <button className="px-2 py-1 text-white text-xs font-medium">
                    1<br/>month
                  </button>
                  <button className="px-2 py-1 text-white text-xs font-medium">
                    19<br/>days
                  </button>
                  <button className="px-2 py-1 text-white text-xs font-medium">
                    12<br/>hours
                  </button>
                  <button className="px-2 py-1 text-white text-xs font-medium">
                    55<br/>sec
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Time Limit
                </div>
              </div>
              
              {/* Mobile User Profile */}
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="relative">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    2
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-800">DESHANT MEMARA</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Blue accent line */}
      <div className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></div>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto py-4 md:py-8 px-4 md:px-8">
        {/* HALDI Section */}
        <section id="haldi">
          <PhotoGrid
            photos={haldiPhotos}
            section="haldi"
            title="HALDI"
            locked={false}
            requiredCount={REQUIRED_HALDI_PHOTOS}
            selectedCount={selectedHaldiPhotos.size}
          />
        </section>

        {/* MEHENDI Section */}
        <section id="mehendi">
          <PhotoGrid
            photos={mehendiPhotos}
            section="mehendi"
            title="MEHENDI"
            locked={!mehendiUnlocked}
            requiredCount={REQUIRED_MEHENDI_PHOTOS}
            selectedCount={selectedMehendiPhotos.size}
          />
        </section>

        {/* WEDDING Section */}
        <section id="wedding">
          <PhotoGrid
            photos={weddingPhotos}
            section="wedding"
            title="WEDDING"
            locked={!weddingUnlocked}
            requiredCount={15}
            selectedCount={selectedWeddingPhotos.size}
          />
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2">
        <button className="bg-green-500 text-white rounded-full p-3 md:p-4 shadow-2xl hover:bg-green-600 transition-all duration-300 hover:scale-110">
          <svg className="w-6 md:w-8 h-6 md:h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ClientMain;