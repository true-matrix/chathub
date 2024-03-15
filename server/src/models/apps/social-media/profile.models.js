import mongoose, { Schema } from "mongoose";
import { User } from "../auth/user.models.js";

const profileSchema = new Schema(
  {
    coverImage: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        // url: `https://via.placeholder.com/800x450.png`,
        url: `https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhothlnJsd0wKXgKssTSTMC2k-yKd62p9z4i2L5iltSAiXPqPZRJJfTho6lusiNSwbfKISFwqjYVC1ampECERAt7tIfamtP9dqXRLJs6QUk8s9YZYbaUnamlFy6hHdtp_ag9bUJwMzanKI1VebqudP4BxClxq352jWzssLExZICezsEDmXo9NNolnHhDmtJ/w300-h320/www.jpg`,
        localPath: "",
      },
    },
    firstName: {
      type: String,
      default: "John",
    },
    lastName: {
      type: String,
      default: "Doe",
    },
    bio: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      default: "",
    },
    countryCode: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const SocialProfile = mongoose.model("SocialProfile", profileSchema);
