'use client';

import { useState } from 'react';
import { Video } from '@/types';
import { getVideoThumbnail } from '@/lib/videoUtils';

interface VideoListProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  onVideoEdit?: (video: Video) => void;
  loading: boolean;
}

interface VideoCardProps {
  video: Video;
  onVideoSelect: (video: Video) => void;
  onVideoEdit?: (video: Video) => void;
}

function VideoCard({ video, onVideoSelect, onVideoEdit }: VideoCardProps) {
  const thumbnailUrl = getVideoThumbnail(video.video_url);
  const [imageError, setImageError] = useState(false);
  
  // Colorful gradients for placeholder. Rotate through colors
  const colorGradients = [
    'from-ka-blue to-ka-teal',
    'from-ka-green to-ka-teal',
    'from-ka-purple to-ka-pink',
    'from-ka-orange to-ka-yellow',
    'from-ka-pink to-ka-purple',
  ];
  const gradientIndex = video.id.charCodeAt(0) % colorGradients.length;
  const gradientClass = colorGradients[gradientIndex];

  return (
    <article
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group focus-within:ring-4 focus-within:ring-ka-blue/30 transform hover:scale-[1.02]"
      role="listitem"
    >
      <div
        className="relative aspect-video bg-gradient-to-br cursor-pointer overflow-hidden rounded-t-2xl"
        onClick={() => onVideoSelect(video)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onVideoSelect(video);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Play video: ${video.title}`}
      >
        {thumbnailUrl && !imageError ? (
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${video.title}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientClass}`}>
            <svg
              className="w-24 h-24 text-white drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
          <div className="bg-white rounded-full p-6 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-2xl">
            <svg className="w-16 h-16 text-ka-blue" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
        {onVideoEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVideoEdit(video);
            }}
            className="absolute top-3 right-3 bg-white hover:bg-ka-yellow text-gray-700 hover:text-gray-900 p-3 rounded-xl shadow-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-ka-blue/30"
            aria-label={`Edit video: ${video.title}`}
            title="Edit video"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-base text-gray-600 line-clamp-2 mb-4">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-ka-blue" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 font-medium" aria-label={`Created by ${video.user_id}`}>{video.user_id}</span>
            </div>
            {video.num_comments !== undefined && (
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5 text-ka-purple" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span className="text-ka-purple font-semibold" aria-label={`${video.num_comments} ${video.num_comments === 1 ? 'comment' : 'comments'}`}>
                  {video.num_comments}
                </span>
              </div>
            )}
          </div>
          {video.created_at && (
            <time dateTime={video.created_at} className="text-gray-500">
              {new Date(video.created_at).toLocaleDateString()}
            </time>
          )}
        </div>
      </div>
    </article>
  );
}

export default function VideoList({ videos, onVideoSelect, onVideoEdit, loading }: VideoListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-ka-blue border-t-transparent"></div>
          <p className="text-gray-600 font-medium text-lg">Loading videos...</p>
        </div>
      </div>
    );
  }

        // Ensure videos is always an array
  const videosArray = Array.isArray(videos) ? videos : [];

  if (videosArray.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-ka-blue to-ka-teal rounded-2xl flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        </div>
        <p className="text-gray-700 text-xl font-semibold mb-2">No videos available yet.</p>
        <p className="text-gray-500 text-base">Create your first video to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list" aria-label="Video list">
      {videosArray.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onVideoSelect={onVideoSelect}
          onVideoEdit={onVideoEdit}
        />
      ))}
    </div>
  );
}

