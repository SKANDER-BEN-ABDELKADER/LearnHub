import React, { useRef, useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const VideoPlayer = ({ courseId, videoUrl, onProgressUpdate }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedTime, setSavedTime] = useState(0);
  const saveIntervalRef = useRef(null);

  // Load saved progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await api.get(`/video-progress/${courseId}`);
        if (response.data && response.data.currentTime) {
          setSavedTime(response.data.currentTime);
        }
      } catch (error) {
        console.log('No previous progress found');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadProgress();
    }
  }, [courseId]);

  // Set video to saved time when loaded
  useEffect(() => {
    const video = videoRef.current;
    if (video && savedTime > 0 && !isLoading) {
      const handleLoadedMetadata = () => {
        video.currentTime = savedTime;
        toast.success(`Resuming from ${formatTime(savedTime)}`);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [savedTime, isLoading]);

  // Save progress periodically
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const saveProgress = async () => {
      if (video.duration && video.currentTime) {
        try {
          await api.post(`/video-progress/${courseId}`, {
            currentTime: video.currentTime,
            duration: video.duration,
          });

          if (onProgressUpdate) {
            const progress = (video.currentTime / video.duration) * 100;
            onProgressUpdate({
              currentTime: video.currentTime,
              duration: video.duration,
              progress: progress,
              completed: progress >= 95,
            });
          }
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }
    };

    // Save progress every 5 seconds
    saveIntervalRef.current = setInterval(saveProgress, 5000);

    // Save on pause
    const handlePause = () => saveProgress();
    video.addEventListener('pause', handlePause);

    // Save on end
    const handleEnded = () => {
      saveProgress();
      toast.success('Course completed! 🎉');
    };
    video.addEventListener('ended', handleEnded);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [courseId, onProgressUpdate]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (num) => String(num).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading video...</div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="w-full rounded-lg"
      controls
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
    >
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
