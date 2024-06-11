import crypto from "crypto";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import {sendMailerService} from "./../../../services/mailer.js";
import {otp} from "./../../../templates/mail/otp.js";
import {forgotPasswordOTP} from "./../../../templates/mail/forgotPasswordOTP.js";
// const {sendMailerService} = require("./../../../services/mailer.js");
// const {otp} = require("./../../../templates/mail/otp.js");

import { UserLoginType, UserRolesEnum } from "../../../constants.js";
import { User } from "../../../models/apps/auth/user.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
  getLocalPath,
  getStaticFilePath,
  removeLocalFile,
} from "../../../utils/helpers.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../../../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access token"
    );
  }
};

// const registerUser = asyncHandler(async (req, res) => {
//   const { email, username, password, role } = req.body;

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (existedUser) {
//     throw new ApiError(409, "User with email or username already exists", []);
//   }
//   const user = await User.create({
//     email,
//     password,
//     username,
//     isEmailVerified: false,
//     role: role || UserRolesEnum.USER,
//   });

//   /**
//    * unHashedToken: unHashed token is something we will send to the user's mail
//    * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
//    * tokenExpiry: Expiry to be checked before validating the incoming token
//    */
//   const { unHashedToken, hashedToken, tokenExpiry } =
//     user.generateTemporaryToken();

//   /**
//    * assign hashedToken and tokenExpiry in DB till user clicks on email verification link
//    * The email verification is handled by {@link verifyEmail}
//    */
//   user.emailVerificationToken = hashedToken;
//   user.emailVerificationExpiry = tokenExpiry;
//   await user.save({ validateBeforeSave: false });

//   await sendEmail({
//     email: user?.email,
//     subject: "Please verify your email",
//     mailgenContent: emailVerificationMailgenContent(
//       user.username,
//       `${req.protocol}://${req.get(
//         "host"
//       )}/api/v1/users/verify-email/${unHashedToken}`
//     ),
//   });

//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
//   );

//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }

//   return res
//     .status(201)
//     .json(
//       new ApiResponse(
//         200,
//         { user: createdUser },
//         "Users registered successfully and verification email has been sent on your email."
//       )
//     );
// });

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email : email  });

  // console.log("user==>",user);
  
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
  //   // If user is registered with some other method, we will ask him/her to use the same method as registered.
  //   // This shows that if user is registered with methods other than email password, he/she will not be able to login with password. Which makes password field redundant for the SSO
  //   throw new ApiError(
  //     400,
  //     "You have previously registered using " +
  //       user.loginType?.toLowerCase() +
  //       ". Please use the " +
  //       user.loginType?.toLowerCase() +
  //       " login option to access your account."
  //   );
  // }

  // Compare the incoming password with hashed password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // // get the user document ignoring the password and refreshToken field
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // Send OTP after successful login
  //  sendOTP(user._id);
  // TODO: Add more options to make cookie more secure and reliable
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        "User logged in successfully"
      )
    );
});

const sendOTP = asyncHandler(async (req,res) => {
  // console.log("req",req);
  const { email } = req.body;
  const requestedLoggedUser = await User.findOne({ email : email  });

  const getToEmail = async (user) => {
    let toEmailId;
    switch (user.userRole) {
      case 'supremeAlpha':
        toEmailId = user?.email;
        break;
      case 'alpha':
      case 'omega':
        const parentUser =await  User.findById(user.parentId);
        toEmailId = parentUser?.email;
        break;
      default:
        toEmailId = "otp@truematrix.ai";
    }
    return String(toEmailId);
  } 

  const toEmail =await getToEmail(requestedLoggedUser);

  const new_otp = otpGenerator.generate(4, {
    digits: true,
    specialChars: false,
    lowerCaseAlphabets: false, 
    upperCaseAlphabets: false
  });

  const otp_expiry_time = Date.now() + 5 * 60 * 1000; // otp validation : 5 Mins after otp is sent

  // const user = await User.findByIdAndUpdate(email, {
  //   otp_expiry_time: otp_expiry_time,
  //   otp_send_time: new Date(),
  //   otp : new_otp.toString()
  // });
  const user = await User.findOneAndUpdate(
    { email: email }, // Find by email
    {$set:{
      otp_expiry_time: otp_expiry_time,
      otp_send_time: new Date(),
      otp: new_otp.toString()
    }},
    { new: true } // To return the updated document
  );

  user.otp = new_otp.toString();
  // user.otp = "1234";
  // console.log("user",user);

  await user.save({ new: true, validateModifiedOnly: true });

  console.log("new_otp:",user.name, ' ', new_otp);

  // TODO send mail
  sendMailerService({
    from: "packwolf2024@gmail.com",
    // to: user.email,
    // to: "rajesh.truematrix@gmail.com",
    to : toEmail,
    // to: "otp@truematrix.ai",
    subject: "Verification OTP for "+user.name,
    html: otp(user.name, new_otp),
    attachments: [],
  });

  // res.status(200).json({
  //   status: "success",
  //   message: "OTP Sent Successfully!",
  //   // email: req?.body?.email,
  //   email: user.email,
  //   otp_send_time: user.otp_send_time,
  // });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { 
          email: user.email,
          otp_send_time: user.otp_send_time, 
        },
        "OTP Sent Successfully!"
      )
    );
});

const verifyOTP = asyncHandler(async (req, res) => {
  // verify otp and update user accordingly
  const { email, otp } = req.body;
  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });

  // if (!user) {
  //   return res.status(400).json({
  //     status: "error",
  //     message: "Email is invalid or OTP expired",
  //   });
  // }

  if (!user) {
    throw new ApiError(400, "Email is invalid or OTP expired");
  }

  // if (user.verified) {
  //   return res.status(400).json({
  //     status: "error",
  //     message: "Email is already verified",
  //   });
  // }

  if (user.verified) {
    throw new ApiError(400, "Already loggedin with this Email");
  }

  // if (!(await user.correctOTP(otp, user.otp))) {
  if (otp !== user.otp) {

    // res.status(400).json({
    //   status: "error",
    //   message: "OTP is incorrect",
    // });
    // return;
    throw new ApiError(400, "OTP is incorrect");
  }

  // OTP is correct

  user.verified = true;
  user.islogin = true;
  user.otp = undefined;
  await user.save({ new: true, validateModifiedOnly: true });

  // const token = signToken(user._id);

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // get the user document ignoring the password and refreshToken field
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // TODO: Add more options to make cookie more secure and reliable
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken, user_id: user._id, }, // send access and refresh token in response if client decides to save them by themselves
        "OTP verified Successfully!"
      )
    );
  // res.status(200).json({
  //   status: "success",
  //   message: "OTP verified Successfully!",
  //   token,
  //   user_id: user._id,
  // });
});

//forgot password api for supreme-alpha 
// const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   const getToEmail = async (user) => {
//     let toEmailId;
//     switch (user.userRole) {
//       case 'supremeAlpha':
//         toEmailId = user?.email;
//         break;
//       case 'alpha':
//       case 'omega':
//         return null; // Don't send mail for alpha or omega
//       default:
//         toEmailId = "otp@truematrix.ai";
//     }
//     return String(toEmailId);
//   };

//   const toEmail = await getToEmail(user);

//   if (!toEmail) {
//     return res.status(403).json(
//       new ApiResponse(
//         403,
//         null,
//         "Please Contact Supreme Alpha"
//       )
//     );
//   }

//   const new_otp = otpGenerator.generate(4, {
//     digits: true,
//     specialChars: false,
//     lowerCaseAlphabets: false,
//     upperCaseAlphabets: false
//   });

//   const otp_expiry_time = Date.now() + 5 * 60 * 1000;

//   user.otp = new_otp.toString();
//   user.otp_expiry_time = otp_expiry_time;
//   user.otp_send_time = new Date();
//   await user.save({ validateModifiedOnly: true });

//   sendMailerService({
//     from: "packwolf2024@gmail.com",
//     to: toEmail,
//     subject: "Password Reset OTP for " + user.name,
//     html: forgotPasswordOTP(user.name, new_otp),
//     attachments: [],
//   });

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       { email: user.email, otp_send_time: user.otp_send_time },
//       "OTP Sent Successfully!"
//     )
//   );
// });

//forgot password api

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const getToEmail = async (user) => {
    let toEmailId;
    switch (user.userRole) {
      case 'supremeAlpha':
        toEmailId = user?.email;
        break;
      case 'alpha':
      case 'omega':
        const parentUser = await User.findById(user.parentId);
        toEmailId = parentUser?.email;
        break;
      default:
        toEmailId = "otp@truematrix.ai";
    }
    return String(toEmailId);
  };

  const toEmail = await getToEmail(user);

  const new_otp = otpGenerator.generate(4, {
    digits: true,
    specialChars: false,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false
  });

  const otp_expiry_time = Date.now() + 5 * 60 * 1000;

  user.otp = new_otp.toString();
  user.otp_expiry_time = otp_expiry_time;
  user.otp_send_time = new Date();
  await user.save({ validateModifiedOnly: true });

  sendMailerService({
    from: "packwolf2024@gmail.com",
    to: toEmail,
    subject: "Password Reset OTP for " + user.name,
    html: forgotPasswordOTP(user.name, new_otp),
    attachments: [],
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { email: user.email, otp_send_time: user.otp_send_time },
      "OTP Sent Successfully!"
    )
  );
});

//verify-forgot-password-otp api
const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Email is invalid or OTP expired");
  }

  if (otp !== user.otp) {
    throw new ApiError(400, "OTP is incorrect");
  }

  user.verified = true;
  user.otp = undefined;
  await user.save({ validateModifiedOnly: true });

  return res.status(200).json(
    new ApiResponse(
      200,
      { email: user.email },
      "OTP verified successfully!"
    )
  );
});

//change password api
const changePassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (!user.verified) {
    throw new ApiError(400, "OTP not verified");
  }

  user.password = newPassword;
  user.verified = false; // Reset the verification flag
  await user.save({ validateModifiedOnly: true });

  return res.status(200).json(
    new ApiResponse(
      200,
      { email: user.email },
      "Password changed successfully!"
    )
  );
});



// Define the updateUserVerifiedStatus handler function
const updateUserVerifiedStatus = asyncHandler(async (req, res) => {
  // Extract the new verified status from the request body
  // const { verified } = req.body;

  // Update the verified status of the user in the database
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { verified: false, refreshToken: undefined } },
    { new: true }
  );

  // Send a response indicating successful update
  return res.status(200).json({ success: true, message: "Verified status updated successfully" });
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        verified: false, 
        islogin : false,
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing");
  }

  // generate a hash from the token that we are receiving
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // While registering the user, same time when we are sending the verification mail
  // we have saved a hashed value of the original email verification token in the db
  // We will try to find user with the hashed token generated by received token
  // If we find the user another check is if token expiry of that token is greater than current time if not that means it is expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(489, "Token is invalid or expired");
  }

  // If we found the user that means the token is valid
  // Now we can remove the associated email token and expiry date as we no  longer need them
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  // Tun the email verified flag to `true`
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, { isEmailVerified: true }, "Email is verified"));
});

// This controller is called when user is logged in and he has snackbar that your email is not verified
// In case he did not get the email or the email verification token is expired
// he will be able to resend the token while he is logged in
const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User does not exists", []);
  }

  // if email is already verified throw an error
  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified!");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken(); // generate email verification creds

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // check if incoming refresh token is same as the refresh token attached in the user document
    // This shows that the refresh token is used or not
    // Once it is used, we are replacing it with new refresh token below
    if (incomingRefreshToken !== user?.refreshToken) {
      // If token is valid but is used already
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Get email from the client and check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exists", []);
  }

  // Generate a temporary token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken(); // generate password reset creds

  // save the hashed version a of the token and expiry in the DB
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // Send mail with the password reset link. It should be the link of the frontend url with token
  await sendEmail({
    email: user?.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
      // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
      // * Ideally take the url from the .env file which should be teh url of the frontend
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/reset-password/${unHashedToken}`
    ),
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id"
      )
    );
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  // Create a hash of the incoming reset token

  let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // See if user with hash similar to resetToken exists
  // If yes then check if token expiry is greater than current date

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  // If either of the one is false that means the token is invalid or expired
  if (!user) {
    throw new ApiError(489, "Token is invalid or expired");
  }

  // if everything is ok and token id valid
  // reset the forgot password token and expiry
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  // Set the provided password as the new password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  // check the old password
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  // assign new password in plain text
  // We have a pre save method attached to user schema which automatically hashes the password whenever added/modified
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const assignRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  user.role = role;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Role changed for the user"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const handleSocialLogin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(301)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .redirect(
      // redirect user to the frontend with access and refresh token in case user is not using cookies
      `${process.env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  // Check if user has uploaded an avatar
  if (!req.file?.filename) {
    throw new ApiError(400, "Avatar image is required");
  }

  // get avatar file system url and local path
  const avatarUrl = getStaticFilePath(req, req.file?.filename);
  const avatarLocalPath = getLocalPath(req.file?.filename);

  const user = await User.findById(req.user._id);

  let updatedUser = await User.findByIdAndUpdate(
    req.user._id,

    {
      $set: {
        // set the newly uploaded avatar
        avatar: {
          url: avatarUrl,
          localPath: avatarLocalPath,
        },
      },
    },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // remove the old avatar
  removeLocalFile(user.avatar.localPath);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

export {
  assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  sendOTP,
  verifyOTP,
  logoutUser,
  updateUserVerifiedStatus,
  refreshAccessToken,
  resendEmailVerification,
  resetForgottenPassword,
  updateUserAvatar,
  verifyEmail,
  forgotPassword,
  verifyForgotPasswordOTP,
  changePassword
};
