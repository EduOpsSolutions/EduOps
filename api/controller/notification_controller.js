import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get notifications for the current user (paginated)
export const getNotifications = async (req, res) => {
	try {
		const userId = req.user.data.id;
		const page = parseInt(req.query.page) || 1;
		const pageSize = parseInt(req.query.pageSize) || 20;
		const skip = (page - 1) * pageSize;


		const [notifications, total] = await Promise.all([
			prisma.notification.findMany({
				where: { userId, deletedAt: null },
				orderBy: { createdAt: 'desc' },
				skip,
				take: pageSize,
				include: {
					user: {
						select: {
							firstName: true,
							lastName: true,
							profilePicLink: true,
							role: true,
						}
					}
				}
			}),
			prisma.notification.count({ where: { userId, deletedAt: null } })
		]);

		// Enrich notifications with post poster information
		const enrichedNotifications = await Promise.all(
			notifications.map(async (notification) => {
				if (notification.type === 'post' && notification.data?.postId) {
					try {
						const post = await prisma.posts.findUnique({
							where: { id: notification.data.postId },
							select: {
								userId: true,
								user: {
									select: {
										firstName: true,
										lastName: true,
										profilePicLink: true,
									}
								}
							}
						});

						if (post) {
							return {
								...notification,
								data: {
									...notification.data,
									posterFirstName: post.user.firstName,
									posterLastName: post.user.lastName,
									posterProfilePic: post.user.profilePicLink,
									posterId: post.userId
								}
							};
						}
					} catch (err) {
						console.error('Error fetching post for notification:', err);
					}
				}
				return notification;
			})
		);

		res.json({
			error: false,
			data: enrichedNotifications,
			total,
			page,
			pageSize
		});
	} catch (err) {
		console.error('Get notifications error:', err);
		res.status(500).json({ error: true, message: 'Failed to get notifications' });
	}
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
	try {
		const { id } = req.body;
		const userId = req.user.data.id;
		const notification = await prisma.notification.updateMany({
			where: { id, userId },
			data: { isRead: true, updatedAt: new Date() },
		});
		res.json({ error: false, message: 'Notification marked as read' });
	} catch (err) {
		console.error('Mark as read error:', err);
		res.status(500).json({ error: true, message: 'Failed to mark as read' });
	}
};

// Create a notification
export const createNotification = async (req, res) => {
	try {
		const { userId, type, title, message, data } = req.body;
		const notification = await prisma.notification.create({
			data: { userId, type, title, message, data },
		});
		res.status(201).json({ error: false, data: notification });
	} catch (err) {
		console.error('Create notification error:', err);
		res.status(500).json({ error: true, message: 'Failed to create notification' });
	}
};

export default {
    getNotifications,
    markAsRead,
    createNotification
}