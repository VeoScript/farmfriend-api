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
      res.status(200).json(createProgram)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };
};

module.exports = ProgramsController;