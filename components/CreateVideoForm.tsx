'use client';

import { useState } from 'react';
import { apiService, USER_ID } from '@/lib/api';
import { validateVideoTitle, validateVideoDescription, validateVideoUrl, INPUT_LIMITS, sanitizeText } from '@/lib/validation';
import { logger } from '@/lib/logger';

interface CreateVideoFormProps {
  onVideoCreated: () => void;
  onCancel: () => void;
  existingTitles?: string[];
}

export default function CreateVideoForm({ onVideoCreated, onCancel, existingTitles = [] }: CreateVideoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use shared USER_ID constant

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate title
    const titleValidation = validateVideoTitle(title, existingTitles);
    if (!titleValidation.isValid) {
      setError(titleValidation.error || 'Invalid title');
      return;
    }

    // Validate description
    const descriptionValidation = validateVideoDescription(description);
    if (!descriptionValidation.isValid) {
      setError(descriptionValidation.error || 'Invalid description');
      return;
    }

    // Validate URL
    const urlValidation = validateVideoUrl(videoUrl);
    if (!urlValidation.isValid) {
      setError(urlValidation.error || 'Invalid URL');
      return;
    }

    setLoading(true);
    try {
      await apiService.createVideo({
        title: sanitizeText(title),
        description: sanitizeText(description),
        video_url: videoUrl.trim(),
        user_id: USER_ID,
      });
      setTitle('');
      setDescription('');
      setVideoUrl('');
      onVideoCreated();
    } catch (err) {
      setError('Failed to create video. Please try again.');
      logger.error('Error creating video', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-ka-green to-ka-teal rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Create New Video</h2>
      </div>
      
      {error && (
        <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-2xl text-red-800 shadow-md" role="alert" aria-live="polite">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-semibold text-base">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Create new video form">
        <div>
          <label htmlFor="title" className="block text-base font-semibold text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-ka-blue/30 focus:border-ka-blue text-lg shadow-sm"
            placeholder="Enter video title"
            maxLength={INPUT_LIMITS.TITLE_MAX}
            required
            aria-describedby="title-help"
          />
          <p id="title-help" className="mt-2 text-sm text-gray-500">
            {title.length}/{INPUT_LIMITS.TITLE_MAX} characters
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-base font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-ka-blue/30 focus:border-ka-blue text-lg shadow-sm resize-none"
            placeholder="Enter video description"
            maxLength={INPUT_LIMITS.DESCRIPTION_MAX}
            required
            aria-describedby="description-help"
          />
          <p id="description-help" className="mt-2 text-sm text-gray-500">
            {description.length}/{INPUT_LIMITS.DESCRIPTION_MAX} characters
          </p>
        </div>

        <div>
          <label htmlFor="videoUrl" className="block text-base font-semibold text-gray-700 mb-2">
            <span className="flex items-center space-x-2">
              <span>Video URL *</span>
            </span>
          </label>
          <input
            type="text"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-ka-blue/30 focus:border-ka-blue text-lg shadow-sm"
            placeholder="https://www.youtube.com/watch?v=... or /videos/my-video.mp4"
            maxLength={INPUT_LIMITS.URL_MAX}
            required
            aria-describedby="url-help"
          />
          <p className="mt-2 text-sm text-gray-500">
            Supports embedded YouTube and Vimeo urls, direct video urls, or local files in /videos/ folder
          </p>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300/30 transition-all font-semibold text-lg"
            disabled={loading}
            aria-label="Cancel creating video"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-ka-green text-white rounded-xl hover:bg-ka-teal focus:outline-none focus:ring-4 focus:ring-ka-green/30 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
            aria-label={loading ? 'Creating video, please wait' : 'Submit video creation form'}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Create Video</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

