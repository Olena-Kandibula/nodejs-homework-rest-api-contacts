const { Schema, model } = require('mongoose');
const Joi = require('joi');


const emailRegexp = /^\w+([\\.-]?\w+)+@\w+([\\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/;

const userSchema = Schema({
    name: {
        type: String        
    },
    email: {
        type: String,
        match: emailRegexp,
        required: [true, 'Email is required'],
        unique:true
    },
    password: {
        type: String,
        minlength: 6,
        equired: [true, 'Password is required']
    },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
    default: null,
  },
},
    { versionKey: false, timestamps: true }
);

const joiRegisterSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(), 
});

const joiLoginSchema = Joi.object({    
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(), 
});

const User = model('user', userSchema);

module.exports = {
    User,
    joiRegisterSchema,
    joiLoginSchema
};