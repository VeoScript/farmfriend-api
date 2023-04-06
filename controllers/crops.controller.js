const createError = require("http-errors");
require('express-async-errors');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class CropsContoller {
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
      const crops = await prisma.crops.findMany({
        where: {
          name: {
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
        crops,
        nextId:  crops.length === limit ? crops[limit - 1].id : undefined
      })
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };

  static suggestedCrops = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const suggestedCrops = await prisma.crops.findMany({
        where: {
          name: {
            contains: req.query.search
          }
        }
      })
      res.status(200).json(suggestedCrops)
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
      const createCrop = await prisma.crops.create({
        data: {
          image: req.body.photo,
          name: req.body.name,
          description: req.body.description,
          temperature: req.body.temperature,
          user_id: req.body.user_id
        }
      })
      res.status(200).json(createCrop)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };

  static update = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const createCrop = await prisma.crops.update({
        where: {
          id: req.params.id
        },
        data: {
          image: req.body.photo,
          name: req.body.name,
          description: req.body.description,
          temperature: req.body.temperature
        }
      })
      res.status(200).json(createCrop)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };
};

module.exports = CropsContoller;