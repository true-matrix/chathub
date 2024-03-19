import { useEffect, useState } from "react";
const formatBytes = (bytes : any) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const ImageSizeDisplay = ({ imageUrl } : any) => {
  const [imageSize, setImageSize] = useState(null);

  useEffect(() => {
    const getImageSize = async () => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const size : any = blob.size;
        setImageSize(size);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    getImageSize();
  }, [imageUrl]);

  return (
    <div>
      {imageSize !== null ? (
        <p>Size: {formatBytes(imageSize)}</p>
      ) : (
        <p>Loading image size...</p>
      )}
    </div>
  );
};