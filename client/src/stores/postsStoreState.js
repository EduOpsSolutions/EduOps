import John_logo from '../assets/images/John.jpg';
import Tricia_logo from '../assets/images/Tricia.png';

export const POST_TAGS = {
  GLOBAL: 'global',
  STUDENT: 'student',
  TEACHER: 'teacher'
};

export const USER_ROLES = {
  GUEST: 'guest',
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher'
};

// Sample Data
export const initialPosts = [
  {
    id: 1,
    profilePic: John_logo,
    postedBy: "John Carlo",
    department: "Department Office",
    title: "Test Post",
    content: "Hi, All!",
    tag: POST_TAGS.GLOBAL,
    status: "locked",
    createdAt: "March 4, 2024 - 9:35 AM",
    updatedAt: "",
    isArchived: false
  },
  {
    id: 2,
    profilePic: Tricia_logo,
    postedBy: "Tricia Diaz",
    department: "Department Office",
    title: "Student Announcement",
    content: "Hi, Students!",
    tag: POST_TAGS.STUDENT,
    status: "locked",
    createdAt: "February 29, 2024 - 3:10 PM",
    updatedAt: "",
    isArchived: false
  },
  {
    id: 3,
    profilePic: Tricia_logo,
    postedBy: "Tricia Diaz",
    department: "Department Office",
    title: "Teacher Announcement",
    content: "Hi, Teachers!",
    tag: POST_TAGS.TEACHER,
    status: "locked",
    createdAt: "February 29, 2024 - 3:10 PM",
    updatedAt: "",
    isArchived: false
  },
];

export const defaultFormData = {
  title: '',
  content: '',
  tag: POST_TAGS.GLOBAL,
  sendOption: 'email',
  
  selectedImages: [],
  selectedFiles: [],
  
  showEmojiPicker: false,
  isSubmitting: false,
  
  editingPostId: null
};

export const createImagePreview = (file) => URL.createObjectURL(file);
export const getFileName = (file) => file.name;

export const getFormattedDateTime = () => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' - ' + new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const TAG_ROTATION = {
  [POST_TAGS.GLOBAL]: POST_TAGS.STUDENT,
  [POST_TAGS.STUDENT]: POST_TAGS.TEACHER,
  [POST_TAGS.TEACHER]: POST_TAGS.GLOBAL
};

/**
 * Get next tag in rotation
 * @param {string} currentTag -
 * @returns {string} 
 */
export const getNextTag = (currentTag) => {
  return TAG_ROTATION[currentTag] || POST_TAGS.GLOBAL;
};

/**
 * Create a new post object with standard properties
 * @param {Object} formData 
 * @returns {Object} 
 */
export const createPostObject = (formData) => {
  return {
    id: Date.now(),
    profilePic: John_logo,
    postedBy: "Administrator",
    department: "Admin Office",
    title: formData.title,
    content: formData.content,
    tag: formData.tag,
    status: "locked",
    createdAt: getFormattedDateTime(),
    updatedAt: "",
    images: formData.selectedImages,
    files: formData.selectedFiles,
    sendOption: formData.sendOption,
    isArchived: false
  };
};

/**
 * Create updated data object for an existing post
 * @param {Object} formData 
 * @returns {Object} 
 */
export const createUpdatedPostData = (formData) => {
  return {
    title: formData.title,
    content: formData.content,
    tag: formData.tag,
    sendOption: formData.sendOption,
    updatedAt: getFormattedDateTime()
  };
};

/**
 * Determine if a post is visible to a specific user role
 * @param {Object} post 
 * @param {string} userRole 
 * @returns {boolean} 
 */
export const isPostVisibleToRole = (post, userRole) => {
  if (!post) return false;
  
  if (post.isArchived) return userRole === USER_ROLES.ADMIN;
  
  if (userRole === USER_ROLES.ADMIN) return true;
  
  const visibilityMap = {
    [POST_TAGS.GLOBAL]: true,
    [POST_TAGS.STUDENT]: userRole === USER_ROLES.STUDENT,
    [POST_TAGS.TEACHER]: userRole === USER_ROLES.TEACHER
  };
  
  return visibilityMap[post.tag] || false;
};

/**
 * Filter visible posts based on user role and tags
 * @param {Array} posts 
 * @param {string} userRole 
 * @returns {Array}
 */
export const filterVisiblePosts = (posts, userRole) => {
  const nonArchivedPosts = posts.filter(post => !post.isArchived);
  
  return nonArchivedPosts.filter(post => isPostVisibleToRole(post, userRole));
};

/**
 * Filter archived posts
 * @param {Array} posts 
 * @returns {Array} 
 */
export const filterArchivedPosts = (posts) => {
  return posts.filter(post => post.isArchived);
};

/**
 * Validate form data for creating/updating posts
 * @param {Object} formData
 * @param {number} maxAttachments
 * @returns {Object} 
 */
export const validatePostForm = (formData, maxAttachments) => {
  const errors = [];

  if (!formData.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (!formData.content?.trim()) {
    errors.push('Content is required');
  }

  if (formData.title?.trim().length > 100) {
    errors.push('Title must be 100 characters or less');
  }

  // Validate attachments
  const totalAttachments = 
    (formData.selectedImages?.length || 0) + 
    (formData.selectedFiles?.length || 0);
    
  if (totalAttachments > maxAttachments) {
    errors.push(`You can't upload more than ${maxAttachments} attachments`);
  }

  if (errors.length > 0) {
    return { 
      isValid: false, 
      error: errors.join('. ')
    };
  }

  return { isValid: true, error: null };
};