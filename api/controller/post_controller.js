import { PrismaClient } from '@prisma/client';
import { uploadFile } from '../utils/fileStorage.js';
import { filePaths } from '../constants/file_paths.js';
import { logUserActivity, logError } from '../utils/logger.js';
import { MODULE_TYPES } from '../constants/module_types.js';

const prisma = new PrismaClient();

// Get all posts
export const getPosts = async (req, res) => {
  try {
    const { tag, status, userId, isArchived } = req.query;
    const userRole = req.user?.data?.role;
    const whereClause = { deletedAt: null };

    // Role-based filtering
    if (userRole === 'admin') {
    } else if (userRole === 'teacher') {
      whereClause.OR = [{ tag: 'global' }, { tag: 'teacher' }];
    } else if (userRole === 'student') {
      whereClause.OR = [{ tag: 'global' }, { tag: 'student' }];
    } else {
      whereClause.tag = 'global';
    }

    if (tag) whereClause.tag = tag;
    if (status) whereClause.status = status;
    if (userId) whereClause.userId = userId;
    if (isArchived !== undefined)
      whereClause.isArchived = isArchived === 'true';

    const posts = await prisma.posts.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicLink: true,
            role: true,
          },
        },
        files: {
          where: {
            status: 'visible',
          },
          select: {
            id: true,
            url: true,
            fileName: true,
            fileType: true,
            fileSize: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      error: false,
      data: posts,
    });
  } catch (err) {
    console.error('Get posts error:', err);
    await logError(
      'Posts - Get Posts Error',
      err,
      req.user?.data?.id || null,
      MODULE_TYPES.CONTENTS
    );
    res.status(500).json({
      error: true,
      message: 'Failed to get posts',
    });
  }
};

// Create a new post with optional file uploads
export const createPost = async (req, res) => {
  try {
    const { title, content, tag = 'global' } = req.body;
    const userId = req.user.data.id;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        error: true,
        message: 'Title and content are required',
      });
    }

    // Handle file uploads if any
    let uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const uploadResult = await uploadFile(file, filePaths.posts);
          if (uploadResult.success) {
            uploadedFiles.push({
              url: uploadResult.downloadURL,
              fileName: uploadResult.fileName,
              fileType: file.mimetype,
              fileSize: file.size,
            });
          }
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({
          error: true,
          message: 'Failed to upload files',
        });
      }
    }

    // Create post with files using Prisma transaction
    const post = await prisma.posts.create({
      data: {
        title,
        content,
        tag,
        userId,
        files: {
          create: uploadedFiles.map((file) => ({
            url: file.url,
            fileName: file.fileName,
            fileType: file.fileType,
            fileSize: file.fileSize,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            profilePicLink: true,
            role: true,
          },
        },
        files: {
          where: {
            status: 'visible',
          },
          select: {
            id: true,
            url: true,
            fileName: true,
            fileType: true,
            fileSize: true,
          },
        },
      },
    });

    await logUserActivity(
      'Posts - Created New Post',
      post.user.userId,
      MODULE_TYPES.CONTENTS,
      `Created post: "${title}" with tag: ${tag}`
    );

    res.status(201).json({
      error: false,
      data: post,
      message: 'Post created successfully',
    });
  } catch (err) {
    console.error('Create post error:', err);
    await logError(
      'Posts - Create Post Error',
      err,
      req.user?.data?.id || null,
      MODULE_TYPES.CONTENTS
    );
    res.status(500).json({
      error: true,
      message: 'Failed to create post',
    });
  }
};

// Update an existing post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tag, status } = req.body;
    const userId = req.user.data.userId;

    // Check if post exists and user owns it (or user is admin)
    const existingPost = await prisma.posts.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingPost) {
      return res.status(404).json({
        error: true,
        message: 'Post not found',
      });
    }

    // Check ownership (unless user is admin)
    if (existingPost.userId !== userId && req.user.data.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to update this post',
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (tag) updateData.tag = tag;
    if (status) updateData.status = status;

    const updatedPost = await prisma.posts.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            profilePicLink: true,
            role: true,
          },
        },
        files: {
          where: {
            status: 'visible',
          },
          select: {
            id: true,
            url: true,
            fileName: true,
            fileType: true,
            fileSize: true,
          },
        },
      },
    });

    await logUserActivity(
      'Posts - Updated Post',
      userId,
      MODULE_TYPES.CONTENTS,
      `Updated post: ${id}, Fields: ${Object.keys(updateData).join(', ')}`
    );

    res.json({
      error: false,
      data: updatedPost,
      message: 'Post updated successfully',
    });
  } catch (err) {
    console.error('Update post error:', err);
    await logError(
      'Posts - Update Post Error',
      err,
      req.user?.data?.id || null,
      MODULE_TYPES.CONTENTS
    );
    res.status(500).json({
      error: true,
      message: 'Failed to update post',
    });
  }
};

// Archive a post
export const archivePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.data.id;

    // Check if post exists and user owns it (or user is admin)
    const existingPost = await prisma.posts.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingPost) {
      return res.status(404).json({
        error: true,
        message: 'Post not found',
      });
    }

    // Check ownership (unless user is admin)
    if (existingPost.userId !== userId && req.user.data.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to archive this post',
      });
    }

    const updatedPost = await prisma.posts.update({
      where: { id },
      data: {
        isArchived: true,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            profilePicLink: true,
            role: true,
          },
        },
        files: {
          where: {
            status: 'visible',
          },
          select: {
            id: true,
            url: true,
            fileName: true,
            fileType: true,
            fileSize: true,
          },
        },
      },
    });

    await logUserActivity(
      'Posts - Archived Post',
      userId,
      MODULE_TYPES.CONTENTS,
      `Archived post: ${id}`
    );

    res.json({
      error: false,
      data: updatedPost,
      message: 'Post archived successfully',
    });
  } catch (err) {
    console.error('Archive post error:', err);
    await logError(
      'Posts - Archive Post Error',
      err,
      req.user?.data?.id || null,
      MODULE_TYPES.CONTENTS
    );
    res.status(500).json({
      error: true,
      message: 'Failed to archive post',
    });
  }
};

// Unarchive a post
export const unarchivePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.data.id;

    // Check if post exists and user owns it (or user is admin)
    const existingPost = await prisma.posts.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingPost) {
      return res.status(404).json({
        error: true,
        message: 'Post not found',
      });
    }

    // Check ownership (unless user is admin)
    if (existingPost.userId !== userId && req.user.data.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to unarchive this post',
      });
    }

    const updatedPost = await prisma.posts.update({
      where: { id },
      data: {
        isArchived: false,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            profilePicLink: true,
            role: true,
          },
        },
        files: {
          where: {
            status: 'visible',
          },
          select: {
            id: true,
            url: true,
            fileName: true,
            fileType: true,
            fileSize: true,
          },
        },
      },
    });

    await logUserActivity(
      'Posts - Unarchived Post',
      userId,
      MODULE_TYPES.CONTENTS,
      `Unarchived post: ${id}`
    );

    res.json({
      error: false,
      data: updatedPost,
      message: 'Post unarchived successfully',
    });
  } catch (err) {
    console.error('Unarchive post error:', err);
    await logError(
      'Posts - Unarchive Post Error',
      err,
      req.user?.data?.id || null,
      MODULE_TYPES.CONTENTS
    );
    res.status(500).json({
      error: true,
      message: 'Failed to unarchive post',
    });
  }
};

// Delete a post (soft delete)
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.data.id;

    // Check if post exists and user owns it (or user is admin)
    const existingPost = await prisma.posts.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingPost) {
      return res.status(404).json({
        error: true,
        message: 'Post not found',
      });
    }

    // Check ownership (unless user is admin)
    if (existingPost.userId !== userId && req.user.data.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to delete this post',
      });
    }

    await prisma.posts.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    await logUserActivity(
      'Posts - Deleted Post',
      userId,
      MODULE_TYPES.CONTENTS,
      `Deleted post: ${id}`
    );

    res.json({
      error: false,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    console.error('Delete post error:', err);
    await logError(
      'Posts - Delete Post Error',
      err,
      req.user?.data?.id || null,
      MODULE_TYPES.CONTENTS
    );
    res.status(500).json({
      error: true,
      message: 'Failed to delete post',
    });
  }
};

// Add files to existing post
export const addFilesToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.data.id;

    // Check if post exists and user owns it (or user is admin)
    const existingPost = await prisma.posts.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingPost) {
      return res.status(404).json({
        error: true,
        message: 'Post not found',
      });
    }

    // Check ownership (unless user is admin)
    if (existingPost.userId !== userId && req.user.data.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to modify this post',
      });
    }

    // Validate files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No files to upload',
      });
    }

    // Upload files
    let uploadedFiles = [];
    try {
      for (const file of req.files) {
        const uploadResult = await uploadFile(file, filePaths.posts);
        if (uploadResult.success) {
          uploadedFiles.push({
            postId: id,
            url: uploadResult.downloadURL,
            fileName: uploadResult.fileName,
            fileType: file.mimetype,
            fileSize: file.size,
          });
        }
      }
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      return res.status(500).json({
        error: true,
        message: 'Failed to upload files',
      });
    }

    // Add files to post
    await prisma.post_files.createMany({
      data: uploadedFiles,
    });

    // Get updated post
    const updatedPost = await prisma.posts.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            profilePicLink: true,
            role: true,
          },
        },
        files: {
          where: {
            status: 'visible',
          },
          select: {
            id: true,
            url: true,
            fileName: true,
            fileType: true,
            fileSize: true,
          },
        },
      },
    });

    await logUserActivity(
      'Posts - Added Files to Post',
      userId,
      MODULE_TYPES.CONTENTS,
      `Added ${uploadedFiles.length} file(s) to post: ${id}`
    );

    res.json({
      error: false,
      data: updatedPost,
      message: 'Files added successfully',
    });
  } catch (err) {
    console.error('Add files error:', err);
    await logError(
      'Posts - Add Files Error',
      err,
      req.user?.data?.id || null,
      MODULE_TYPES.CONTENTS
    );
    res.status(500).json({
      error: true,
      message: 'Failed to add files to post',
    });
  }
};

// Delete a file from post
export const deletePostFile = async (req, res) => {
  try {
    const { postId, fileId } = req.params;
    const userId = req.user.data.id;

    // Check if post exists and user owns it (or user is admin)
    const existingPost = await prisma.posts.findUnique({
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!existingPost) {
      return res.status(404).json({
        error: true,
        message: 'Post not found',
      });
    }

    // Check ownership (unless user is admin)
    if (existingPost.userId !== userId && req.user.data.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to modify this post',
      });
    }

    await prisma.post_files.update({
      where: { id: fileId },
      data: {
        status: 'deleted',
        updatedAt: new Date(),
      },
    });

    await logUserActivity(
      'Posts - Deleted File from Post',
      userId,
      MODULE_TYPES.CONTENTS,
      `Deleted file ${fileId} from post: ${postId}`
    );

    res.json({
      error: false,
      message: 'File deleted successfully',
    });
  } catch (err) {
    console.error('Delete file error:', err);
    await logError(
      'Posts - Delete File Error',
      err,
      req.user?.data?.id || null,
      MODULE_TYPES.CONTENTS
    );
    res.status(500).json({
      error: true,
      message: 'Failed to delete file',
    });
  }
};
