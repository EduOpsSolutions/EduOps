import axiosInstance from './axios.js';

// Posts API endpoints
const POSTS_API = {
  // Get all posts with optional filters
  getPosts: (params = {}) => {
    return axiosInstance.get('/posts', { params });
  },

  // Get single post by ID
  getPost: (postId) => {
    return axiosInstance.get(`/posts/${postId}`);
  },

  // Create new post with optional files
  createPost: (formData) => {
    return axiosInstance.post('/posts/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update existing post
  updatePost: (postId, data) => {
    return axiosInstance.put(`/posts/${postId}`, data);
  },

  // Archive post
  archivePost: (postId) => {
    return axiosInstance.patch(`/posts/${postId}/archive`);
  },

  // Unarchive post
  unarchivePost: (postId) => {
    return axiosInstance.patch(`/posts/${postId}/unarchive`);
  },

  // Delete post (soft delete)
  deletePost: (postId) => {
    return axiosInstance.delete(`/posts/${postId}`);
  },

  // Add files to existing post
  addFilesToPost: (postId, formData) => {
    return axiosInstance.post(`/posts/${postId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete file from post
  deletePostFile: (postId, fileId) => {
    return axiosInstance.delete(`/posts/${postId}/files/${fileId}`);
  },

  // Get current user's posts
  getMyPosts: (params = {}) => {
    return axiosInstance.get('/posts/my/posts', { params });
  },

  // Get posts by specific user
  getUserPosts: (userId, params = {}) => {
    return axiosInstance.get(`/posts/user/${userId}`, { params });
  },
};

export default POSTS_API;

// Helper functions for formatting data
export const formatPostData = (formData, files = []) => {
  const postFormData = new FormData();
  
  postFormData.append('title', formData.title);
  postFormData.append('content', formData.content);
  postFormData.append('tag', formData.tag);
  postFormData.append('sendOption', formData.sendOption);
  
  // Add files if provided
  files.forEach((file, index) => {
    postFormData.append('files', file);
  });
  
  return postFormData;
};

// Convert backend post data to frontend format
export const formatBackendPost = (backendPost) => {
  return {
    id: backendPost.id,
    profilePic: backendPost.user?.profilePicLink || '/default-avatar.png',
    postedBy: `${backendPost.user?.firstName} ${backendPost.user?.lastName}`,
    department: backendPost.user?.role === 'admin' ? 'Admin Office' : 
                backendPost.user?.role === 'teacher' ? 'Faculty' : 'Student',
    title: backendPost.title,
    content: backendPost.content,
    tag: backendPost.tag,
    status: backendPost.status,
    createdAt: formatDate(backendPost.createdAt),
    updatedAt: backendPost.updatedAt ? formatDate(backendPost.updatedAt) : '',
    isArchived: backendPost.isArchived,
    files: backendPost.files || [],
    userId: backendPost.userId
  };
};

// Format date to match your current format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' - ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Convert frontend files to File objects for upload
export const prepareFilesForUpload = (selectedImages, selectedFiles) => {
  const files = [];
  
  // Note: selectedImages are URLs from createImagePreview, 
  // you'll need to convert them back to File objects or handle differently
  // This depends on how you're storing the actual File objects
  
  return files;
};
