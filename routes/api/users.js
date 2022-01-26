const express = require('express');


const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require("fs/promises");
const gravatar = require('gravatar');
const Jimp = require('jimp');
const { nanoid } = require('nanoid');

const { SECRET_KEY, SITE_NAME} = process.env;

const { User } = require('../../model');
const { joiRegisterSchema, joiLoginSchema } = require('../../model/user');
const { authenticate, upload } = require('../../middlewares');
const sendEmail = require('../../helpers');

const router = express.Router();

router.get('/current', authenticate, async (req, res, next) => {
    
    const { email, subscription } = req.user;
    res.json({
        user: { email, subscription }
    });
   
});

router.get('/logout', authenticate, async (req, res, next) => {
 
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).send();

});

// router.post("/register")

router.post('/signup', async (req, res, next) => {
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
});

// router.post("/signin")
router.post('/login', async (req, res, next) => {
    try {
        const {error} = joiLoginSchema.validate(req.body);
        if(error){
            return res.status(400).json({
        message: error.message,
      });
        }
        const { email, password } = req.body;
        
        const user = await User.findOne({email});
        if (!user) {
            res.status(401).json({
                message:"Email or password is wrong"
            })            
        }

        if(!user.verify){
            res.status(401).json({                
                message: 'Email not verify',                
            });  
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare ) {
            return res.status(401).json({                
                message: 'Email or Password is wrong',                
            });            
        }

        const {  name } = user;

        const payload = {
            id: user._id
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '10h' }); 
        
        await User.findByIdAndUpdate(user._id, { token });        
        res.json({
            token,
            user: {
                email,
                name
            }
        });
        
    } catch (error) {
        next(error);
    }    
});

const avatarsDir = path.join(__dirname, '../../', 'public','avatars');

router.patch('/avatars', authenticate, upload.single('avatar'),
    async (req, res, next) => {
        try {
            const { path: tempUpload, filename } = req.file;

            async function resize(path, name) {
                const avatar = await Jimp.read(`${path}`);
                avatar.resize(250, 250);
                avatar.write(`${path}`);
                return name.split('.').reverse();
            }
            const [extension] = await resize(tempUpload, filename);
            // const [extension] = filename.split(".").reverse();
            console.log("path: tempUpload", tempUpload)
            const newFileName = `${req.user._id}.${extension}`;
            const fileUpload = path.join(avatarsDir, newFileName);
            await fs.rename(tempUpload, fileUpload);
            const avatarURL = path.join('avatars', newFileName)
            await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true })
            
            res.json({ avatarURL })

          
        } catch (error) {
            next(error)
        }
    });

router.post("/verify", async(req, res, next)=> {
    try {
        const {email} = req.body;
        if (!email) {
            res.status(400).json({
                message:'Missing required field email'
            })         
            
        }
        const user = await User.findOne({email});
        if (!user) {            
            res.status(404).json({
                message:'User not found'
            }) 
        }
        if (user.verify) {
            res.status(400).json({
                message:'Verification has already been passed'
            })             
        }

        const {verificationToken} = user;
        const data = {
            to: email,
            subject: "Подтверждение email",
            html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердить email</a>`
        }

        await sendEmail(data);

        res.json({message: "Verification email sent"});
    } catch (error) {        
        next(error);
    }
})

router.get("/verify/:verificationToken", async(req, res, next)=> {
    try {
        const {verificationToken} = req.params;
        const user = await User.findOne({verificationToken});
        
        if (!user) {
             res.status(404).json({
                message:'User not found'
            })      
        }

        await User.findByIdAndUpdate(user._id, {
            verificationToken: null,
            verify: true
        });

        res.json({
            message: 'Verification successful'
        })
    } catch (error) {
        next(error);
    }
})

module.exports = router;