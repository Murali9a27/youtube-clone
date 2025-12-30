import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from 'fs';
import jwt from "jsonwebtoken";
import { match } from "assert";
import { lookup } from "dns";


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId).select("+refreshToken");;

        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, email, username, password } = req.body;

    // ----------- FULLNAME VALIDATION -----------
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    // ------------------------------
    // (Next steps as per your logic)
    // ------------------------------

    // check if user exists (pseudo code)
    // const existingUser = await User.findOne({ $or: [{email}, {username}] })
    // if (existingUser) throw new ApiError(409, "User already exists");

    // upload avatar etc...
    // create user in DB...
    // hide password & token...

    const userExist = await User.findOne({
        // check whether any one exist (usernamre or email)
        $or: [{username}, {email}] 
    })

    if (userExist){
        throw new ApiError(409, "user with this email id or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

console.log("FILES RECEIVED:", req.files);
    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    console.log("Files:", req.files);
console.log("Avatar Path:", avatarLocalPath);
console.log("File Exists:", fs.existsSync(avatarLocalPath));
    

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    

    console.log(avatar);
    if (!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )
    
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
        throw new ApiError(401, "Password is incorrect");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password")

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

const logoutUser = asyncHandler(async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        // secure: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out"))
})



const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised Access")
    }

    const decodeToken= jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (!decodeToken) {
        throw new ApiError(401, "Unauthorised Access")
    }

    const user = await User.findById(decodeToken?._id).select("+refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid refresh token") 
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
        httpOnly: true,
        // secure: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    }

    const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)
    console.log(refreshToken);
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json(new ApiResponse(
        200, 
        {accessToken, refreshToken: refreshToken},
        "Accesstoken refrehed succesfully"
    ))
})

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
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password is changed succesfully"))
})

const getCurrentUser = asyncHandler((req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched"))
})

const updateUserDetails = asyncHandler(async(req, res)=>{
    const {fullname, email} = req.body
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


const updateUserAvatar = await asyncHandler(async(req, res)=>{
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
            set:{
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
    updateUserCoverImage
};
