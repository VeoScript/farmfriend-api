const createError = require("http-errors");
require('express-async-errors');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class RatesController {
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
    
    let rates

    try {
      if (req.query.search) {
        rates = await prisma.rates.findMany({
          where: {
            rate: {
              equals: Number(req.query.search)
            }
          },
          select: {
            id: true,
            rate: true,
            feedback: true,
            created_at: true,
            user: {
              select: {
                image: true,
                account_type:true,
                first_name: true,
                last_name: true
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
      } else {
        rates = await prisma.rates.findMany({
          select: {
            id: true,
            rate: true,
            feedback: true,
            created_at: true,
            user: {
              select: {
                image: true,
                account_type:true,
                first_name: true,
                last_name: true
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
      }

      res.status(200).json({
        rates,
        nextId:  rates.length === limit ? rates[limit - 1].id : undefined
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
      const createRate = await prisma.rates.create({
        data: {
          rate: req.body.rate,
          feedback: req.body.feedback,
          user_id: req.body.user_id
        }
      })
      res.status(200).json(createRate)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };
};

module.exports = RatesController;
