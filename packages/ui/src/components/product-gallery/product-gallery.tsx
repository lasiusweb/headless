import * as React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  className?: string;
  startIndex?: number;
}

const ProductGallery = React.forwardRef<
  HTMLDivElement,
  ProductGalleryProps
>(({
  images,
  className,
  startIndex = 0
}, ref) => {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (images.length === 0) {
    return (
      <div className={cn("bg-gray-100 rounded-lg flex items-center justify-center aspect-square", className)}>
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      {/* Main image display */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={currentImage.url}
          alt={currentImage.alt || `Product image ${currentIndex + 1}`}
          className="w-full h-full object-contain cursor-zoom-in"
          onClick={() => setIsFullscreen(true)}
        />
        
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-2 hide-scrollbar">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
                index === currentIndex ? "border-primary" : "border-transparent"
              )}
              onClick={() => goToImage(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.url}
                alt={image.alt || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              className="absolute top-4 right-4 z-10 text-white bg-black/30 rounded-full p-2 hover:bg-black/50"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="relative h-[70vh] flex items-center justify-center">
              <img
                src={currentImage.url}
                alt={currentImage.alt || `Product image ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
              
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ProductGallery.displayName = "ProductGallery";

export { ProductGallery };