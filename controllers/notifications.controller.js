const createError = require("http-errors");
require('express-async-errors');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class NotificationsController {
  static index = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    const limit = 10
    const cursor = req.query.cursor ?? ''
    const cursorObj = cursor === '' ? undefined : { id: String(cursor) }

    try {
      const notifications = await prisma.notification.findMany({
        where: {
          OR: [
            { notification_to: req.query.notification_to },
            { notification_to: 'ALL' }
          ]
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit,
        cursor: cursorObj,
        skip: cursor === '' ? 0 : 1
      })

      res.status(200).json({
        notifications,
        nextId:  notifications.length === limit ? notifications[limit - 1].id : undefined
      })
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
	};

  static unreadCount = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const unreadNotification = await prisma.notification.count({
        where: {
          read: false,
          OR: [
            { notification_to: req.query.notification_to },
            { notification_to: 'ALL' },
          ],
        }
      })
      res.status(200).json(unreadNotification)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };

  static read = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const readNotification = await prisma.notification.update({
        where: {
          id: req.params.id
        },
        data: {
          read: true
        }
      })
      res.status(200).json(readNotification)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };
};

module.exports = NotificationsController;
