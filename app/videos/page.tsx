'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Video } from '@/types';
import { apiService, USER_ID } from '@/lib/api';
import { logger } from '@/lib/logger';
import VideoList from '@/components/VideoList';
import VideoPlayer from '@/components/VideoPlayer';
import CreateVideoForm from '@/components/CreateVideoForm';
import EditVideoForm from '@/components/EditVideoForm';
import CommentsSection from '@/components/CommentsSection';
import Logo from '@/components/Logo';

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getVideos(USER_ID);
      
      // Handle different response formats. Ensure result is always an array
      let videosArray: Video[] = [];
      if (Array.isArray(data)) {
        videosArray = data;
      } else if (data && typeof data === 'object') {
        // Handle API response as object with videos property
        const dataObj = data as any;
        if (Array.isArray(dataObj.videos)) {
          videosArray = dataObj.videos;
        } else if (Array.isArray(dataObj.data)) {
          videosArray = dataObj.data;
        } else {
          logger.warn('Unexpected API response format', data);
        }
      }
      
      setVideos(videosArray);
    } catch (err) {
      setError('Failed to load videos. Please check if the API server is running.');
      logger.error('Error loading videos', err);
      setVideos([]); // Ensure videos is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setShowCreateForm(false);
  };

  const handleVideoCreated = async () => {
    setShowCreateForm(false);
    await loadVideos();
  };

  const handleBackToList = () => {
    setSelectedVideo(null);
    setEditingVideo(null);
  };

  const handleVideoEdit = (video: Video) => {
    setEditingVideo(video);
    setSelectedVideo(null);
    setShowCreateForm(false);
  };

  const handleVideoUpdated = async () => {
    setEditingVideo(null);
    await loadVideos();
    // Refresh edited video if currently viewing it
    if (selectedVideo) {
      const updatedVideo = videos.find(v => v.id === selectedVideo.id);
      if (updatedVideo) {
        setSelectedVideo(updatedVideo);
      }
    }
  };

  // Filter videos based on search query
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) {
      return videos;
    }
    const query = searchQuery.toLowerCase();
    return videos.filter(video => 
      video.title.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ka-blue focus:text-white focus:rounded-xl focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="bg-white shadow-sm border-b-2 border-gray-100" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link href="/" className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-shrink hover:opacity-80 transition-opacity">
              <div className="flex-shrink-0">
                <Logo size="large" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  Tutorly
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 -mt-1 hidden sm:block">Learn with your study buddy!</p>
              </div>
            </Link>
            {!selectedVideo && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full sm:w-auto px-6 py-3 bg-ka-blue text-white rounded-xl hover:bg-ka-teal focus:outline-none focus:ring-4 focus:ring-ka-blue/30 transition-all font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                aria-label={showCreateForm ? 'Cancel creating video' : 'Create new video'}
                aria-expanded={showCreateForm}
              >
                {showCreateForm ? (
                  <span>Cancel</span>
                ) : (
                  <>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Video</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {error && (
          <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-2xl text-red-800 shadow-md" role="alert" aria-live="polite">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg">Error: {error}</p>
                <p className="text-sm mt-1">
                  Make sure the API server is running. You can configure the API URL via NEXT_PUBLIC_API_URL environment variable.
                </p>
              </div>
            </div>
          </div>
        )}

        {showCreateForm && !selectedVideo && !editingVideo && (
          <div className="mb-8">
            <CreateVideoForm
              onVideoCreated={handleVideoCreated}
              onCancel={() => setShowCreateForm(false)}
              existingTitles={videos.map(v => v.title)}
            />
          </div>
        )}

        {editingVideo && !selectedVideo && (
          <div className="mb-8">
            <EditVideoForm
              video={editingVideo}
              onVideoUpdated={handleVideoUpdated}
              onCancel={() => setEditingVideo(null)}
              existingTitles={videos.map(v => v.title)}
            />
          </div>
        )}

        {selectedVideo ? (
          <div className="space-y-6">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-2 text-ka-blue hover:text-ka-teal focus:outline-none focus:ring-4 focus:ring-ka-blue/30 rounded-xl px-4 py-2 font-semibold text-lg transition-all"
              aria-label="Go back to video list"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Videos</span>
            </button>
            <VideoPlayer video={selectedVideo} />
            <CommentsSection videoId={selectedVideo.id} />
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-8">
              <label htmlFor="video-search" className="sr-only">
                Search videos by name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-ka-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="video-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-14 pr-14 py-4 border-2 border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-4 focus:ring-ka-blue/30 focus:border-ka-blue text-lg shadow-md"
                  placeholder="Search videos by name..."
                  aria-label="Search videos by name"
                  aria-describedby={searchQuery ? "search-results" : undefined}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none focus:ring-4 focus:ring-ka-blue/30 rounded-2xl"
                    aria-label="Clear search"
                  >
                    <svg className="h-6 w-6 text-gray-400 hover:text-ka-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p id="search-results" className="mt-3 text-base text-gray-600 font-medium" role="status" aria-live="polite">
                  Found {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} matching "{searchQuery}"
                </p>
              )}
            </div>

            <VideoList
              videos={filteredVideos}
              onVideoSelect={handleVideoSelect}
              onVideoEdit={handleVideoEdit}
              loading={loading}
            />
          </>
        )}
      </main>
    </div>
  );
}

