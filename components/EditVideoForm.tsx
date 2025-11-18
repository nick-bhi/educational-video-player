'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Video } from '@/types';
import { validateVideoTitle, validateVideoDescription, INPUT_LIMITS, sanitizeText } from '@/lib/validation';
import { logger } from '@/lib/logger';

interface EditVideoFormProps {
  video: Video;
  onVideoUpdated: () => void;
  onCancel: () => void;
  existingTitles?: string[];
}

export default function EditVideoForm({ video, onVideoUpdated, onCancel, existingTitles = [] }: EditVideoFormProps) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(video.title);
    setDescription(video.description);
  }, [video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Get existing titles excluding current video
    const otherTitles = existingTitles.filter(t => t !== video.title);

    // Validate title
    const titleValidation = validateVideoTitle(title, otherTitles);
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

    setLoading(true);
    try {
      await apiService.updateVideo({
        video_id: video.id,
        title: sanitizeText(title),
        description: sanitizeText(description),
      });
      onVideoUpdated();
    } catch (err) {
      setError('Failed to update video. Please try again.');
      logger.error('Error updating video', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Video</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Edit video form">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter video title"
            maxLength={INPUT_LIMITS.TITLE_MAX}
            required
            aria-describedby="edit-title-help"
          />
          <p id="edit-title-help" className="mt-1 text-xs text-gray-500">
            {title.length}/{INPUT_LIMITS.TITLE_MAX} characters
          </p>
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter video description"
            maxLength={INPUT_LIMITS.DESCRIPTION_MAX}
            required
            aria-describedby="edit-description-help"
          />
          <p id="edit-description-help" className="mt-1 text-xs text-gray-500">
            {description.length}/{INPUT_LIMITS.DESCRIPTION_MAX} characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Video URL
          </label>
          <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600">
            {video.video_url}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Video URL cannot be edited. Only title and description can be modified.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            disabled={loading}
            aria-label="Cancel editing video"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            aria-label={loading ? 'Updating video, please wait' : 'Submit video update'}
          >
            {loading ? 'Updating...' : 'Update Video'}
          </button>
        </div>
      </form>
    </div>
  );
}

