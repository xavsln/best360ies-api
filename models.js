const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let panoSchema = mongoose.Schema({
  panoUrl: { type: String, required: true },
  googlePanoId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  heading: { type: Number, required: true },
  pitch: { type: Number, required: true },
  country: { type: String, required: true, default: "Data not available" },
  areaName: { type: String, required: true, default: "Data not available" },
  addedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  staticImgUrl: { type: String, required: true },
});

let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  addedPanos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pano" }],
  favoritePanos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pano" }],
  role: { type: String, enum: ["user", "admin"], default: "user" },
  panoMax: {
    type: Number,
    required: true,
    default: 10,
  },
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

let Pano = mongoose.model("Pano", panoSchema);
let User = mongoose.model("User", userSchema);

module.exports.Pano = Pano;
module.exports.User = User;
