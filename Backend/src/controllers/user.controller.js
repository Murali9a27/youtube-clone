import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {

    const { fullname, email, username, password } = req.body;

    // ----------- FULLNAME VALIDATION -----------
    if (!fullname || fullname.trim() === "") {
        throw new ApiError(400, "Fullname is required");
    }
    if (fullname.length < 3) {
        throw new ApiError(400, "Fullname must be at least 3 characters");
    }
    // Allow only alphabets & spaces
    if (!/^[A-Za-z\s]+$/.test(fullname)) {
        throw new ApiError(400, "Fullname can contain only letters and spaces");
    }

    // ----------- EMAIL VALIDATION -----------
    if (!email || email.trim() === "") {
        throw new ApiError(400, "Email is required");
    }
    // Basic email regex (no external package)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // ----------- USERNAME VALIDATION -----------
    if (!username || username.trim() === "") {
        throw new ApiError(400, "Username is required");
    }
    if (username.length < 4) {
        throw new ApiError(400, "Username must be at least 4 characters");
    }
    if (!/^[A-Za-z0-9_]+$/.test(username)) {
        throw new ApiError(400, "Username can contain only letters, numbers and underscore");
    }

    // ----------- PASSWORD VALIDATION -----------
    if (!password || password.trim() === "") {
        throw new ApiError(400, "Password is required");
    }
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    // At least 1 uppercase, 1 lowercase, 1 number
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!strongPassword.test(password)) {
        throw new ApiError(400, 
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        );
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

    const userExist = User.findOne({
        // check whether any one exist (usernamre or email)
        $or: [{username}, {email}] 
    })

    if (userExist){
        throw new ApiError(409, "user with this email id or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
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

export { registerUser };
