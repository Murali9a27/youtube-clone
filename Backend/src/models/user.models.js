import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //Cloudnary Url
            required: true,
        },
        coverImage: {
            type: String,
        },
        
        password:{
            type: String,
            required: [true, 'Password is required']
        },
        refreshTokens: [
            {
                token: {
                type: String,
                required: true
                },
                device: {
                type: String // browser / device info
                },
                createdAt: {
                type: Date,
                default: Date.now
                }
            }
        ]

    },
    {
        timestamps: true
    }
)

// Pre-save hook to ensure the password is hashed before saving to the database
userSchema.pre("save", async function(next){
    if (!this.isModified("password"))return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


// Function to verify if the provided password matches the stored hash
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// Function to generate a JWT access token
userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Function to generate a JWT refresh token
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)