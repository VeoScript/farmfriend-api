const createError = require("http-errors");
require('express-async-errors');
var bcrypt = require('bcryptjs')

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AuthController {
  static user = async (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({
        message: 'Unauthorized!'
      })
      return
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          id: String(req.session.user.id)
        },
        select: {
          id: true,
          image: true,
          first_name: true,
          last_name: true,
          address: true,
          contact_num: true,
          email: true,
          created_at: true,
          updated_at: true
        }
      })

      res.status(200).json(user)
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  }

  static register = async (req, res, next) => {
    try {
      const {
        account_type,
        first_name,
        last_name,
        address,
        contact_num,
        email,
        password,
      } = req.body

      const foundUser = await prisma.user.findMany({
        select: {
          email: true,
          contact_num: true
        }
      })

      const check_email_exist = foundUser.some((user) => user.email === email)
      const check_contact_num_exist = foundUser.some((user) => user.contact_num === contact_num)

      if (check_email_exist) {
        return res.status(400).json({
          message: 'Email is not available.'
        })
      }
      
      if (check_contact_num_exist) {
        return res.status(400).json({
          message: 'Contact number already exists.'
        })
      } 
      
      const salt = await bcrypt.genSalt()
      const hashPassword = await bcrypt.hash(password, salt)
      
      await prisma.user.create({
        data: {
          account_type,
          first_name,
          last_name,
          address,
          contact_num,
          email,
          password: hashPassword,
        }
      })

      res.status(200).json({
        message: 'Registered successfully.'
      })

    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };

  static login = async (req, res, next) => {
    try {
      const { email, password } = req.body
  
      const foundUser = await prisma.user.findMany({
        where: {
          email: email
        },
        select: {
          id: true,
          email: true,
          password: true
        }
      })
  
      if (!foundUser[0]) {
        return res.status(400).json({
          message: 'Account not found, create account first.'
        })
      }

      const userId = foundUser[0].id
      const userHashPassword = foundUser[0].password

      const matchedPassword = await bcrypt.compare(password, userHashPassword)

      if (!matchedPassword) {
        return res.status(400).json({
          message: 'Password is incorrect!'
        })
      }

      req.session.user = { id: userId }

      await req.session.save();
      
      res.status(200).json({
        message: 'Logged in successfully.'
      })
    } catch (e) {
      next(createError(e.statusCode, e.message))
      process.exit(1)
    }
  };

  static logout = async (req, res) => {
    await req.session.destroy();

    res.status(200).json({
      message: 'Logged out successfully.'
    })
  };
};

module.exports = AuthController;
