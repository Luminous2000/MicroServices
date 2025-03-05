const captainModel =  require('../models/captain.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const blacklistTokenSchema = require('../models/blacklisttoken.model')
const {subscribeToQueue,publishToQueue} = require('../service/rabbit');


module.exports.register = async(req,res )=>{
    try{
        const {name,email,password} = req.body;
        const captain = await captainModel.findOne({email});
        if(captain){
            return res.status(400).json({message:"Captain already exists"})


        }
        const hash = await bcrypt.hash(password,10);
        const newCaptain = new captainModel({name,email,password:hash})

        await newCaptain.save();

        const token = jwt.sign({id:newCaptain._id},process.env.JWT_SECRET,{expiresIn:'1h'})

        res.cookie('token',token,)

        res.status(200).json({token,newCaptain})

    }catch(err){
        res.status(500).json({message:err.message})
    }
}

module.exports.login = async(req,res) =>{

    try{
        const {email,password} = req.body;
        const captain = await captainModel.findOne({email}).select('+password');

        if(!captain){
            return res.status(400).json({message:"Captain does not exist"})
        }
        const isMatch = await bcrypt.compare(password,captain.password);

        if(!isMatch){
            return res.status(400).json({message:"invalid email or password"})
        }

        const token = jwt.sign({id:captain._id},process.env.JWT_SECRET,{expiresIn:'1h'})

        delete captain._doc.password;

        res.cookie('token',token);

        res.status(200).json({token,captain})
        
        
        
    }catch(error){
        res.status(500).json({message:error.message})
    }
}


module.exports.logout = async(req,res)=>{
    try{
        const token = req.cookies.token;
        await blacklistTokenSchema.create({token});
        res.clearCookie('token');
        res.send({message:"Captain logged out successfully"})
    }catch(error){
        res.status(500).json({message:error.message})
    }
}

module.exports.profile = async(req,res)=>{
    try{
        res.send(req.captain);
    }catch(error){
        res.status(500).json({message:error.message})
    }

}

module.exports.toggleAvailability = async(req,res)=>{
    
    try{
        const captain = await captainModel.findById(req.captain._id);
        captain.isAvailable = !captain.isAvailable;
        await captain.save();
        res.send(captain);


    }catch(error){
        res.status(500).json({message:error})
        console.error(error.message);
        
    }
    
}

subscribeToQueue("new-ride", (data) => {
  try {
    console.log(JSON.parse(data));
  } catch (error) {
    console.error("Error processing new ride data:", error);
  }
});
