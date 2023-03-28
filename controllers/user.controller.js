const createError = require("http-errors");
require('express-async-errors');
var bcrypt = require('bcryptjs');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserController {
  static updateAccount = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const updateAccount = await prisma.user.update({
        where: {
          id: String(req.params.id)
        },
        data: {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          address: req.body.address,
          contact_num: req.body.contact_num,
          email: req.body.email,
        }
      })

      res.status(200).json(updateAccount)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };

  static changeProfile = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const changeprofile = await prisma.user.update({
        where: {
          id: String(req.params.id)
        },
        data: {
          image: String(req.body.imageURL)
        }
      })
      res.status(200).json(changeprofile)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };

  static changePassword = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }
    
    try {
      const { old_password, new_password } = req.body
  
      const foundUser = await prisma.user.findMany({
        where: {
          id: String(req.params.id)
        },
        select: {
          id: true,
          password: true
        }
      })
  
      if (!foundUser[0]) {
        return res.status(400).json({
          message: 'You are not logged in!'
        })
      }
      const userHashPassword = foundUser[0].password

      const matchedPassword = await bcrypt.compare(old_password, userHashPassword)

      if (!matchedPassword) {
        return res.status(400).json({
          message: 'Old password did not match.'
        })
      }

      const salt = await bcrypt.genSalt()
      const hashPassword = await bcrypt.hash(new_password, salt)
      
      const updatePassword = await prisma.user.update({
        where: {
          id: String(req.params.id)
        },
        data: {
          password: hashPassword
        }
      })

      res.status(200).json(updatePassword)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };

  static deleteAccount = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const { user_password } = req.body

      const foundUser = await prisma.user.findMany({
        where: {
          id: String(req.params.id)
        },
        select: {
          id: true,
          password: true
        }
      })
  
      if (!foundUser[0]) {
        return res.status(400).json({
          message: 'You are not logged in!'
        })
      }
      
      const userHashPassword = foundUser[0].password

      const matchedPassword = await bcrypt.compare(user_password, userHashPassword)

      if (!matchedPassword) {
        return res.status(400).json({
          message: 'Incorrect password'
        })
      }

      const deleteAccount = await prisma.user.delete({
        where: {
          id: String(req.params.id)
        }
      })
      res.status(200).json(deleteAccount)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  }
};

module.exports = UserController;