import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import {
  AvailableSocialLogins,
  AvailableUserRoles,
  USER_TEMPORARY_TOKEN_EXPIRY,
  UserLoginType,
  UserRolesEnum,
} from "../../../constants.js";
import { Cart } from "../ecommerce/cart.models.js";
import { EcomProfile } from "../ecommerce/profile.models.js";
import { SocialProfile } from "../social-media/profile.models.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    about: {
      type: String,
    },
    phone: {
      type: String,
    },
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://via.placeholder.com/200x200.png`,
        localPath: "",
      },
    },
    username: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // email: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   lowercase: true,
    //   trim: true,
    // },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: function (email) {
          return String(email)
            .toLowerCase()
            .match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
        },
        message: (props) => `Email (${props.value}) is invalid!`,
      },
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
      required: true,
    },
    gender: {
      type: String,
    },
    userRole: {
      type: String,
    },
    selectedSigma: {
      type: String,
    },
    addedBy: {
      type: String,
    },
    addedByUserRole: {
      type: String,
    },
    aiStatus: {
      // active inactive status
      type: String,
      default: "active"
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    passwordChangedAt: {
      // unselect
      type: Date,
    },
    passwordResetToken: {
      // unselect
      type: String,
    },
    passwordResetExpires: {
      // unselect
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      // unselect
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    islogin: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otp_expiry_time: {
      type: Date,
    },
    otp_send_time: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Online", "Offline"]
    },
    loginType: {
      type: String,
      enum: AvailableSocialLogins,
      default: UserLoginType.EMAIL_PASSWORD,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.post("save", async function (user, next) {
  // ! Generally, querying data on every user save is not a good idea and not necessary when you are working on a specific application which has concrete models which are tightly coupled
  // ! However, in this application this user model is being referenced in many loosely coupled models so we need to do some initial setups before proceeding to make sure the data consistency and integrity
  const ecomProfile = await EcomProfile.findOne({ owner: user._id });
  const socialProfile = await SocialProfile.findOne({ owner: user._id });
  const cart = await Cart.findOne({ owner: user._id });

  // Setup necessary ecommerce models for the user
  if (!ecomProfile) {
    await EcomProfile.create({
      owner: user._id,
    });
  }
  if (!cart) {
    await Cart.create({
      owner: user._id,
      items: [],
    });
  }

  // Setup necessary social media models for the user
  if (!socialProfile) {
    await SocialProfile.create({
      owner: user._id,
    });
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * @description Method responsible for generating tokens for email verification, password reset etc.
 */
userSchema.methods.generateTemporaryToken = function () {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // This should stay in the DB to compare at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
