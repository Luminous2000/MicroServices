const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const blacklistTokenModel = require('../models/blacklisttoken.model')

module.exports.userAuth = async (req,res,next) =>{
    try{
        const token  = req.cookies.token || req.headers.authorization.split(' ')[1];

        if(!token){
            return res.status(401).json({message:"unauthorized"})
        }

        const isBlacklisted = await blacklistTokenModel.find({token});

        if(isBlacklisted.length){
            return res.status(401).json({message:"Unauthorized"})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET ) 

        const user = await userModel.findById(decoded.id);

        if(!user){
            return res.status(401).json({message:"unauthorized"})
        }

        req.user = user;
        next();
        
        

        
    }catch(err){
        res.status(500).json({message:err.message})
    }
}
