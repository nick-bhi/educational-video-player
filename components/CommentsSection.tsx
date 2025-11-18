'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { apiService } from '@/lib/api';
import { validateComment, INPUT_LIMITS, sanitizeText } from '@/lib/validation';
import { logger } from '@/lib/logger';

interface CommentsSectionProps {
  videoId: string;
}

export default function CommentsSection({ videoId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getComments(videoId);
      
      // Handle different response formats. Ensure result is always an array
      let commentsArray: Comment[] = [];
      if (Array.isArray(data)) {
        commentsArray = data;
      } else if (data && typeof data === 'object') {
        // Handle API response as object with comments property
        const dataObj = data as any;
        if (Array.isArray(dataObj.comments)) {
          commentsArray = dataObj.comments;
        } else if (Array.isArray(dataObj.data)) {
          commentsArray = dataObj.data;
        } else {
          logger.warn('Unexpected API response format for comments', data);
        }
      }
      
      setComments(commentsArray);
    } catch (err) {
      setError('Failed to load comments');
      logger.error('Error loading comments', err);
      setComments([]); // Ensure comments is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate comment
    const commentValidation = validateComment(newComment);
    if (!commentValidation.isValid) {
      setError(commentValidation.error || 'Invalid comment');
      return;
    }

    setSubmitting(true);
    try {
      // Use fake user_id for comments
      const fakeUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
      await apiService.createComment({
        video_id: videoId,
        user_id: fakeUserId,
        content: sanitizeText(newComment),
      });
      setNewComment('');
      await loadComments();
    } catch (err) {
      setError('Failed to post comment. Please try again.');
      logger.error('Error creating comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-lg p-6" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6" aria-label="Add a comment">
        <label htmlFor="comment-input" className="sr-only">
          Write a comment
        </label>
        <div className="space-y-3">
          <textarea
            id="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            maxLength={INPUT_LIMITS.COMMENT_MAX}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            aria-label="Comment text"
            aria-required="true"
            aria-describedby="comment-help"
          />
          <div className="flex items-center justify-between">
            <p id="comment-help" className="text-xs text-gray-500">
              {newComment.length}/{INPUT_LIMITS.COMMENT_MAX} characters
            </p>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={submitting ? 'Posting comment, please wait' : 'Post comment'}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8" role="status" aria-live="polite" aria-label="Loading comments">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" aria-hidden="true"></div>
          <span className="sr-only">Loading comments...</span>
        </div>
      ) : (() => {
        // Ensure comments is always an array
        const commentsArray = Array.isArray(comments) ? comments : [];
        return commentsArray.length === 0 ? (
          <div className="text-center py-8 text-gray-500" role="status">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <ul className="space-y-4" role="list" aria-label="Video comments">
            {commentsArray.map((comment) => (
            <li key={comment.id} className="border-b border-gray-200 pb-4 last:border-0">
              <article>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center" aria-hidden="true">
                      <span className="text-primary-600 font-semibold text-sm">
                        {comment.user_id.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900" aria-label={`Comment by ${comment.user_id}`}>{comment.user_id}</span>
                  </div>
                  {comment.created_at && (
                    <time dateTime={comment.created_at} className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </time>
                  )}
                </div>
                <p className="text-gray-700 ml-10">{comment.content}</p>
              </article>
            </li>
          ))}
          </ul>
        );
      })()}
    </section>
  );
}

