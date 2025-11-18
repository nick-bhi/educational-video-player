'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Video } from '@/types';
import { analyzeVideoUrl } from '@/lib/videoUtils';
import { logger } from '@/lib/logger';

interface VideoPlayerProps {
  video: Video;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    logger.debug('VideoPlayer mounted', {
      videoId: video.id,
      videoTitle: video.title,
    });
  }, [video]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      logger.warn('VideoPlayer: video element ref is null');
      return;
    }

    const updateTime = () => setCurrentTime(videoElement.currentTime);
    const updateDuration = () => {
      logger.debug('VideoPlayer: Duration loaded', {
        duration: videoElement.duration,
      });
      setDuration(videoElement.duration);
    };
    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Error handlers
    const handleError = (e: Event) => {
      const error = videoElement.error;
      if (error) {
        let errorMessage = 'Unknown video error';
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Video playback was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading video';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Video decoding error';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Video source not supported';
            break;
        }
        logger.error('VideoPlayer error', {
          errorCode: error.code,
          errorMessage: error.message || errorMessage,
          src: videoElement.src,
        });
      }
    };

    const handleLoadStart = () => {
      logger.debug('VideoPlayer: Load start', { src: videoElement.src });
    };

    const handleLoadedData = () => {
      logger.debug('VideoPlayer: Data loaded', { readyState: videoElement.readyState });
    };

    const handleCanPlay = () => {
      logger.debug('VideoPlayer: Can play');
    };

    const handleStalled = () => {
      logger.warn('VideoPlayer: Stalled - buffering');
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('stalled', handleStalled);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('stalled', handleStalled);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.playbackRate = playbackRate;
    }
  }, [volume, playbackRate]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      logger.warn('VideoPlayer: Cannot toggle play - video element is null');
      return;
    }

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play().catch((error) => {
        logger.error('VideoPlayer: Play failed', {
          error: error.message,
          src: videoElement.src,
        });
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!document.fullscreenElement) {
      videoElement.requestFullscreen().catch((err) => {
        logger.error('Error attempting to enable fullscreen', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Analyze video URL to determine type (YouTube, Vimeo, or direct file)
  const videoInfo = useMemo(() => analyzeVideoUrl(video.video_url), [video.video_url]);
  const isEmbedded = videoInfo.type === 'youtube' || videoInfo.type === 'vimeo';

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden" aria-labelledby="video-title">
      <div
        className="relative bg-black group"
        onMouseEnter={() => !isEmbedded && setShowControls(true)}
        onMouseLeave={() => !isEmbedded && setShowControls(false)}
      >
        {isEmbedded ? (
          // YouTube or Vimeo iframe
          <iframe
            src={videoInfo.embedUrl}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={`Video player for ${video.title}`}
            aria-label={`Video player: ${video.title}`}
          />
        ) : (
          // Direct video file
          <>
            <video
              ref={videoRef}
              src={videoInfo.type === 'local' ? videoInfo.originalUrl : video.video_url}
              className="w-full aspect-video"
              onClick={togglePlay}
              onError={(e) => {
                logger.error('VideoPlayer: onError handler', e);
              }}
              crossOrigin="anonymous"
              aria-label={`Video: ${video.title}`}
              controls={false}
            />

            {/* Video Overlay Controls - Only for direct video files */}
            <div
              className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={!showControls}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all transform hover:scale-110"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <svg className="w-12 h-12 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Controls Bar - Only for direct video files */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={!showControls}
            >
          <div className="space-y-3">
            {/* Progress Bar */}
            <label htmlFor="video-progress" className="sr-only">
              Video progress
            </label>
            <input
              type="range"
              id="video-progress"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={currentTime}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            />

            {/* Controls Row */}
              <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={togglePlay} 
                  className="hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded transition-colors"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  )}
                </button>

                <span className="text-sm" aria-live="polite" aria-atomic="true">
                  <span className="sr-only">Current time: </span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    {volume === 0 ? (
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.793a1 1 0 011.383.07zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.793a1 1 0 011.383.07zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    )}
                  </svg>
                  <label htmlFor="volume-control" className="sr-only">
                    Volume control
                  </label>
                  <input
                    type="range"
                    id="volume-control"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    aria-label="Volume"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(volume * 100)}
                    aria-valuetext={`${Math.round(volume * 100)}%`}
                  />
                  <span className="text-xs w-8" aria-hidden="true">{Math.round(volume * 100)}%</span>
                </div>

                {/* Playback Speed */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="playback-speed" className="text-xs sr-only">
                    Playback speed
                  </label>
                  <span className="text-xs" aria-hidden="true">Speed:</span>
                  <select
                    id="playback-speed"
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                    className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    aria-label="Playback speed"
                  >
                    {playbackRates.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}x
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded transition-colors"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Video Info */}
      <div className="p-6">
        <h2 id="video-title" className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h2>
        <p className="text-gray-600 mb-4">{video.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <span aria-label={`Created by ${video.user_id}`}>Created by {video.user_id}</span>
          {video.created_at && (
            <>
              <span className="mx-2" aria-hidden="true">•</span>
              <time dateTime={video.created_at}>
                {new Date(video.created_at).toLocaleDateString()}
              </time>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

