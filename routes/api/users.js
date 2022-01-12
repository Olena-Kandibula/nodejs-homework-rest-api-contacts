const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const { SECRET_KEY } = process.env;
const { User } = require('../../model');
const { joiRegisterSchema, joiLoginSchema } = require('../../model/user');
const { authenticate } = require('../../middlewares');

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
        const newUser = await User.create({ email, password: hashPassword});
        res.status(201).json({
            user: {                
                email: newUser.email,
                subscription: "starter"
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




module.exports = router;