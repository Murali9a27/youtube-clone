import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from 'fs';
import jwt from "jsonwebtoken";
import { match } from "assert";
import { lookup } from "dns";


const generateAccessAndRefreshTokens = async(userId, req) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // OPTIONAL: limit number of devices (e.g. max 5)
        if (user.refreshTokens.length >= 5) {
        user.refreshTokens.shift(); // remove oldest session
        }

        user.refreshTokens.push({
        token: refreshToken,
        device: req.headers["user-agent"] || "unknown device"
        });

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if ([fullname, email, username, password].some(
    (field) => field?.trim() === ""
  )) {
    throw new ApiError(400, "All fields are required");
  }

  const userExist = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (userExist) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath, "avatars");
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath, "covers")
    : null;

  if (!avatar?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  let user;
  try {
    user = await User.create({
      fullname,
      email,
      password,
      username: username.toLowerCase(),
      avatar: {
        url: avatar.url,
        public_id: avatar.public_id
      },
      coverImage: coverImage
        ? {
            url: coverImage.url,
            public_id: coverImage.public_id
          }
        : undefined
    });
  } catch (error) {
    // rollback cloudinary uploads if DB fails
    await deleteFromCloudinary(avatar.public_id);
    if (coverImage?.public_id) {
      await deleteFromCloudinary(coverImage.public_id);
    }
    throw error;
  }

  const createdUser = await User.findById(user._id)
    .select("-password -refreshTokens");

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});



const loginUser = asyncHandler(async (req, res) =>{
    const {username, email, password} = req.body;
    if(!username && !email){
        throw new ApiError(400, "Username or Email Missing");
    }

    const user = await User.findOne({
        $or:[{email}, {username}]
    })

    if(!user){
        throw new ApiError(401, "Username or Email Doesn't exist");
    }

    const isValidPassword = await user.isPasswordCorrect(password);

    if(!isValidPassword){
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id, req)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshTokens");

    const options = {
        httpOnly: true,
        // secure: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser
            },
            "User Logged in Succesfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (incomingRefreshToken) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        refreshTokens: { token: incomingRefreshToken }
      }
    });
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});




const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findOne({
    _id: decoded._id,
    "refreshTokens.token": incomingRefreshToken
  });

  if (!user) {
    throw new ApiError(401, "Refresh token is invalid or revoked");
  }

  // 🔁 Rotate refresh token
  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.token !== incomingRefreshToken
  );

  user.refreshTokens.push({
    token: newRefreshToken,
    device: req.headers["user-agent"] || "unknown device"
  });

  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      )
    );
});


const changeUserPassword = asyncHandler(async (req, res)=>{
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(401, "User Not Found");
    }

    const isValidPassword = await user.isPasswordCorrect(oldPassword);
    if (!isValidPassword) {
        throw new ApiError(400, "Wrong Password");
    }

    user.password = newPassword;
    // invalidate all sessions
    user.refreshTokens = [];
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed. Please login again."))
})

const getCurrentUser = asyncHandler((req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched"))
})

const updateUserDetails = asyncHandler(async(req, res)=>{
    const {fullname, email} = req.body

    if (!fullname && !email) {
        throw new ApiError(400, "Nothing to update");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname: fullname,
                email: email
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"))
})


const updateUserAvatar = asyncHandler(async(req, res)=>{
    const avatarLocalPath = req.files?.path;

    if(!avatarLocalPath){
        throw new ApiError(401, "Avatar is Missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(401, "Error on Uploading Avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
               avatar: avatar.url 
            }
        },
        {
            new:true,
        }
    ).select("-password")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
})


const updateUserCoverImage = await asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.files?.path;

    if(!coverImageLocalPath){
        throw new ApiError(401, "Avatar is Missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(401, "Error on Uploading Avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            set:{
               coverImage: coverImage.url 
            }
        },
        {
            new:true,
        }
    ).select("-password")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})

const getUserChannelProfile = await asyncHandler(async (req,res)=>{
    const {username} = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.arguments([
        {
            $match:{
                username: username?.toLowerCase
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribeTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                channelSubscribeToCount:{
                    $size: "$subscribeTo"
                },
                isSubscribed:{
                    $cond:{
                        $if:{$in:[req.user?._id, $subscribers.subscriber]},
                        $then: true,
                        $else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                email:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                channelSubscribeToCount:1,
                isSubscribed:1

            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400, "Channel Doesn't exist")
    }

    res.status(200).json(
        new ApiResponse(
            200,
            channel[0],
            "User Channel Picked succesfully"
            
        )
    )
})




export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeUserPassword, 
    getCurrentUser, 
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
};
