const rideModel = require("../models/ride.model");
const { subscribeToQueue,publishToQueue } = require('../service/rabbit');

module.exports.createRide = async (req,res,next)=>{
    const {pickup,destination} = req.body;

    const newRide = new rideModel({
        user:req.user._id,
        pickup,
        destination
    })

    try{

        await newRide.save();
        publishToQueue("new-ride",JSON.stringify(newRide))
        res.send(newRide);
    }catch(err){
        console.error("Error creating ride:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}