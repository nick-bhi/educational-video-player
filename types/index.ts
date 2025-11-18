export interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  user_id: string;
  created_at?: string;
  num_comments?: number;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  created_at?: string;
}

export interface CreateVideoRequest {
  title: string;
  description: string;
  video_url: string;
  user_id: string;
}

export interface CreateCommentRequest {
  video_id: string;
  user_id: string;
  content: string;
}

export interface EditVideoRequest {
  video_id: string;
  title: string;
  description: string;
}

