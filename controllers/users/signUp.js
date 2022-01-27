
const bcrypt = require("bcryptjs");
// const jwt = require('jsonwebtoken');
// const path = require('path');
// const fs = require("fs/promises");
const gravatar = require('gravatar');
// const Jimp = require('jimp');
const { nanoid } = require('nanoid');
require('dotenv').config();

// const { SECRET_KEY, SITE_NAME } = process.env;
const {  SITE_NAME} = process.env;

const { User } = require('../../model');
// const { joiRegisterSchema, joiLoginSchema } = require('../../model/user');
const { joiRegisterSchema } = require('../../model/user');
// const { authenticate, upload } = require('../../middlewares');
const sendEmail = require('../../helpers');

const signUp = async (req, res, next) => {
    try {
        const{error} = joiRegisterSchema.validate(req.body);
        if (error) {
            // throw new BadRequest(error.message); 
            return res.status(400).json({
        message: error.message,
      });
        }
        const {  email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            // throw new Conflict('User alredy exist');
            return res.status(409).json({                
                message: 'Email in use'                
      });
        }
       
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const verificationToken = nanoid();

        const avatarURL = gravatar.url(email);

        const newUser = await User.create({
            email,
            password: hashPassword,
            verificationToken,
            avatarURL,
        });

         const data = {
             to: email,                 
             subject: "Confirm email",    
             html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердить email</a>`
        }     
        
        await sendEmail(data);

        res.status(201).json({
            user: {                
                email: newUser.email,
                subscription: "starter",
                
            }
        })
    } catch (error) {
        next(error);
   }
};

module.exports = signUp;