import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from 'fs';
import { use } from "react";


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wromg while generating access and refresh token")
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
    if(!username || !email){
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

    const loggedInUser = await user.findById(user._id).select("-password -refreshToken")

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
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in Succesfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) =>{
    User.findById
})
export { registerUser };
