const createError = require("http-errors");
require('express-async-errors');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProgramsController {
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
      const programs = await prisma.program.findMany({
        where: {
          title: {
            contains: req.query.search
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          created_at: true,
          updated_at: true,
          user_id: true,
          user: {
            select: {
              image: true,
              first_name: true,
              last_name: true,
              address: true,
            }
          },
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit,
        cursor: cursorObj,
        skip: cursor === '' ? 0 : 1
      })

      res.status(200).json({
        programs,
        nextId:  programs.length === limit ? programs[limit - 1].id : undefined
      })
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };

  static show = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const showProgram = await prisma.program.findFirst({
        where: {
          id: req.params.id
        },
        select: {
          id: true,
          title: true,
          description: true,
          created_at: true,
          updated_at: true,
          user_id: true,
          user: {
            select: {
              image: true,
              first_name: true,
              last_name: true,
              address: true,
            }
          },
        },
      })
      res.status(200).json(showProgram)
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
      const createProgram = await prisma.program.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          user_id: req.body.user_id
        }
      })

      // add notification for creating program (FARMERS)
      const createNotificationFarmer = await prisma.notification.create({
        data: {
          type: 'ADD_PROGRAMS',
          message: `There is a new program titled - ${req.body.title}`,
          routeId: createProgram.id,
          notification_to: 'FARMERS',
          notification_from_id: req.body.user_id
        }
      })

      // add notification for creating program (LGU/NGO)
      const createNotificationLgu = await prisma.notification.create({
        data: {
          type: 'ADD_PROGRAMS',
          message: `There is a new program titled - ${req.body.title}`,
          routeId: createProgram.id,
          notification_to: 'LGU_NGO',
          notification_from_id: req.body.user_id
        }
      })

      const io = req.app.get('socketio_global')

      // socket.io trigger push notification in client-side (FARMERS)
      io.emit('new_notification', {
        id: createNotification.id,
        notification_to: 'FARMERS',
        account_type: req.session.user.account_type,
        title: 'FarmFriend',
        message: `There is a new program titled - ${req.body.title}`
      })

      // socket.io trigger push notification in client-side (LGU/NGO)
      io.emit('new_notification', {
        id: createNotification.id,
        notification_to: 'LGU_NGO',
        account_type: req.session.user.account_type,
        title: 'FarmFriend',
        message: `There is a new program titled - ${req.body.title}`
      })

      res.status(200).json({
        program: createProgram,
        notificationFarmer: createNotificationFarmer,
        createNotificationLgu: createNotificationLgu,
      })
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };
};

module.exports = ProgramsController;