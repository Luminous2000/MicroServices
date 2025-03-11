const rideModel = require("../models/ride.model");
const { subscribeToQueue, publishToQueue } = require("../service/rabbit");

module.exports.createRide = async (req, res, next) => {
  const { pickup, destination } = req.body;

  const newRide = new rideModel({
    user: req.user._id,
    pickup,
    destination,
  });

  try {
    await newRide.save();
    publishToQueue("new-ride", JSON.stringify(newRide));
    res.send(newRide);
  } catch (err) {
    console.error("Error creating ride:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.acceptRide = async (req, res, next) => {
  const { rideId } = req.query;
  console.log(rideId)
  const ride = await rideModel.findById(rideId);
  if (!ride) {
    return res.status(404).json({ message: "ride not found" });
  }

  ride.status = "accepted";
  await ride.save();
  publishToQueue("ride-accepted", JSON.stringify(ride));
  res.send(ride);
};
