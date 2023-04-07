const createError = require("http-errors");
require('express-async-errors');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ReportsController {
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
      const reports = await prisma.report.findMany({
        where: {
          description: {
            contains: req.query.search
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit,
        cursor: cursorObj,
        skip: cursor === '' ? 0 : 1
      })

      res.status(200).json({
        reports,
        nextId:  reports.length === limit ? reports[limit - 1].id : undefined
      })
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
	};

	static create = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const createReport = await prisma.report.create({
        data: {
          type: req.body.type,
					description: req.body.description,
					user_id: req.body.user_id
        }
      })

      // add notification for creating report
      const createNotification = await prisma.notification.create({
        data: {
          type: 'ADD_REPORTS',
          message: `Check it out this new report - ${req.body.type}`,
          routeId: createReport.id,
          notification_to: 'ADMIN',
          notification_from_id: req.body.user_id
        }
      })

      const io = req.app.get('socketio_global')

      // socket.io trigger push notification in client-side
      io.emit('new_notification', {
        id: createNotification.id,
        notification_to: 'ADMIN',
        account_type: req.session.user.account_type,
        title: 'FarmFriend',
        message: `Check it out this new report - ${req.body.type}`
      })

      res.status(200).json({
        report: createReport,
        notification: createNotification
      })
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };
};

module.exports = ReportsController;
