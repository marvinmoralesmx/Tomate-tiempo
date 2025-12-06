import React, { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  videoId?: string;
  playlistId?: string;
  isPlaying: boolean;
  volume: number;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, playlistId, isPlaying, volume }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else {
      createPlayer();
    }

    function createPlayer() {
      if (playerRef.current) return;
      
      const playerVars: any = {
        'playsinline': 1,
        'controls': 0,
        'disablekb': 1,
        'fs': 0,
        'modestbranding': 1,
        'rel': 0,
        'origin': window.location.origin, // Security best practice
      };

      if (playlistId) {
        playerVars.listType = 'playlist';
        playerVars.list = playlistId;
      }

      // If playing a playlist, we often want to omit videoId to let the playlist start from index 0
      // unless a specific video is requested.
      const playerConfig: any = {
        height: '100%',
        width: '100%',
        playerVars: playerVars,
        events: {
          'onReady': (event: any) => {
            setIsReady(true);
            event.target.setVolume(volume);
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          'onError': (event: any) => {
            console.error("YouTube Player Error:", event.data);
          }
        }
      };

      if (videoId) {
        playerConfig.videoId = videoId;
      }

      playerRef.current = new window.YT.Player(containerRef.current, playerConfig);
    }

    return () => {
      // Cleanup handled by React unmount usually
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, playlistId]);

  // Sync Play/Pause state
  useEffect(() => {
    if (isReady && playerRef.current && playerRef.current.playVideo) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isReady]);

  // Sync Volume
  useEffect(() => {
    if (isReady && playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume, isReady]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-stone-200 shadow-inner">
      <div className="absolute inset-0 pointer-events-none" />
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};