const userModel =  require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const blacklistTokenSchema = require('../models/blacklisttoken.model');
// const { subscribe } = require('../routes/user.routes');
const { subscribeToQueue } = require('../../ride/service/rabbit');
const EventEmitter = require('events')
const rideEventEmitter = new EventEmitter()


module.exports.register = async(req,res )=>{
    try{
        const {name,email,password} = req.body;
        const user = await userModel.findOne({email});
        if(user){
            return res.status(400).json({message:"user already exists"})


        }
        const hash = await bcrypt.hash(password,10);
        const newUser = new userModel({name,email,password:hash})

        await newUser.save();

        const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:'1h'})

        res.cookie('token',token,)

        res.status(200).json({token,newUser})

    }catch(err){
        res.status(500).json({message:err.message})
    }
}

module.exports.login = async(req,res) =>{

    try{
        const {email,password} = req.body;
        const user = await userModel.findOne({email}).select('+password');

        if(!user){
            return res.status(400).json({message:"user does not exist"})
        }
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({message:"invalid email or password"})
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'})

        delete user._doc.password;

        res.cookie('token',token);

        res.status(200).json({token,user})
        
        
        
    }catch(error){
        res.status(500).json({message:error.message})
    }
}


module.exports.logout = async(req,res)=>{
    try{
        const token = req.cookies.token;
        await blacklistTokenSchema.create({token});
        res.clearCookie('token');
        res.send({message:"user logged out successfully"})
    }catch(error){
        res.status(500).json({message:error.message})
    }
}

module.exports.profile = async(req,res)=>{
    try{
        res.send(req.user);
    }catch(error){
        res.status(500).json({message:error.message})
    }

}

module.exports.acceptedRide = async(req,res)=>{
    // Long polling: wait for 'ride-accepted' event

    try{
        rideEventEmitter.once('ride-accepted',(data)=>{
            res.send(data);
        })

        // set timeout for long polling
        setTimeout(()=>{
            res.status(204).send();
        },60000) // changed 30 sec to 60sec for testing
    }catch(error){
        console.log("err ",error)
    }
    
}

subscribeToQueue('ride-accepted',async (msg)=>{
    const data = JSON.parse(msg);
    rideEventEmitter.emit('ride-accepted',data)
})
