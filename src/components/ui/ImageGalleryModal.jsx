import { useState, useEffect } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiHeart, FiShare2, FiLock, FiUnlock, FiStar, FiMaximize2 } from "react-icons/fi";
import { FaOpencart } from "react-icons/fa6";

const ImageGalleryModal = ({ 
  isOpen, 
  onClose, 
  post, 
  isUnlocked, 
  authorUnavailable, 
  onUnlock 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || !post.images || post.images.length <= 1) return;
      
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedImageIndex(prev => prev > 0 ? prev - 1 : post.images.length - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedImageIndex(prev => prev < post.images.length - 1 ? prev + 1 : 0);
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, post.images, selectedImageIndex, onClose, isFullscreen]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setImageLoaded(false);
  }, [post._id]);

  if (!isOpen || !post.images || post.images.length === 0) return null;

  const handlePrevious = () => {
    setImageLoaded(false);
    setSelectedImageIndex(prev => prev > 0 ? prev - 1 : post.images.length - 1);
  };

  const handleNext = () => {
    setImageLoaded(false);
    setSelectedImageIndex(prev => prev < post.images.length - 1 ? prev + 1 : 0);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className={`relative ${isFullscreen ? 'w-full h-full' : 'max-w-4xl w-full'} flex flex-col lg:flex-row bg-white rounded-lg overflow-hidden shadow-xl`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 z-30 shadow-md"
          onClick={onClose}
        >
          <FiX className="text-xl" />
        </button>
        
        {/* Left: Main Image and Navigation */}
        <div className={`${isFullscreen ? 'w-full' : 'lg:w-[60%]'} flex flex-col bg-gray-100`}>
          {/* Main Image Container */}
          <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: '400px' }}>
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <img
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${post.images[selectedImageIndex]}`}
              alt={`Post image ${selectedImageIndex + 1}`}
              className={`max-h-[70vh] object-contain max-w-full ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
                setImageLoaded(true);
              }}
            />
            
            {/* Top Controls */}
            <div className="absolute top-3 left-3 flex gap-2 z-20">
              <button 
                className="text-gray-600 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title="Toggle Fullscreen"
              >
                <FiMaximize2 className="text-lg" />
              </button>
            </div>
            
            {/* Navigation Arrows */}
            {post.images.length > 1 && (
              <>
                <button 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 z-10"
                  onClick={handlePrevious}
                >
                  <FiChevronLeft className="text-xl" />
                </button>
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 z-10"
                  onClick={handleNext}
                >
                  <FiChevronRight className="text-xl" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            {post.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full font-medium">
                {selectedImageIndex + 1} / {post.images.length}
              </div>
            )}
          </div>
          
          {/* Thumbnails with Horizontal Scroll */}
          {post.images.length > 1 && !isFullscreen && (
            <div className="p-3 bg-gray-200">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {post.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded cursor-pointer border-2 ${
                      selectedImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-transparent hover:border-gray-400'
                    }`}
                    onClick={() => {
                      setImageLoaded(false);
                      setSelectedImageIndex(index);
                    }}
                    style={{ minHeight: '64px' }}
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${image}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right: Post Details - Simplified */}
        {!isFullscreen && (
          <div className="lg:w-[40%] bg-white overflow-y-auto" style={{ maxHeight: '85vh' }}>
            <div className="p-4 space-y-4">
              {/* Header Section */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{post.title}</h2>
              </div>
              
              {/* Content Sections */}
              <div className="space-y-4">
                {/* Requirement Section */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FiStar className="text-blue-500" />
                    Requirement
                  </h3>
                  <p className="text-gray-700 text-sm">{post.requirement}</p>
                </div>
                
                {/* Description Section */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    {isUnlocked ? <FiUnlock className="text-blue-500" /> : <FiLock className="text-blue-500" />}
                    Description
                  </h3>
                  <div className="text-gray-700 text-sm">
                    {isUnlocked ? (
                      <div className="whitespace-pre-line">
                        {post.description}
                      </div>
                    ) : (
                      <p>
                        {post.description?.substring(0, 100) + "..."}
                      </p>
                    )}
                  </div>
                  
                  {!isUnlocked && (
                    <button 
                      onClick={onUnlock}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-medium py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <FiUnlock />
                      Unlock Full Description
                    </button>
                  )}
                </div>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {post.subcategory}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryModal;