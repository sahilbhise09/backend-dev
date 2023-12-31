import { response } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResonse.js"
import mongoose from "mongoose";
import jwt  from "jsonwebtoken";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // 1. get user details from frontend - to check what details to take we can refer to the model
    // 2. Validation - not empty
    // 3. check if user already exists - check through username and email
    // 4. check for images, check for avatar
    // 5. upload them to cloudinary, avatar
    // 6. create user object - create entry in db
    // 7. remove password and refresh token field from response
    // 8. check for user creation 
    // 9. return res

    //1
    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    //2
    if(        
        [fullName, email, username, password].some((field)=>
    field?.trim() === ""))
    {
        throw new ApiError(400, "all fields are required")
    }

    //3
    const existedUser = await User.findOne({ $or:[{username, email}]})
    
    if(existedUser)
    {
        throw new ApiError(409, "user with email or username already exists");
    }

    //4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required")
    }

    //5
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    //6
    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    //7
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //8
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );    

    //9
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    //10
    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req,res) => {
    //1. req body -> data
    //2. username or email
    //3. find the user
    //4. password check
    //5. access and refresh token
    //6. send cookie

    //1. 
    const {email, username, password} = req.body;
    console.log(req.body)

    //2.
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    //3.
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }


    //4.
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    //5.
    const {accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //6.
    const options = {
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Succesfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken: undefined}
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
       const user = await User.findById(decodedToken?._id);
       if(!user){
        throw new ApiError(401, "Invalid Refresh Token");
       }
    
       if(incomingRefreshToken != user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used");
       }
    
       const options = {
        httpOnly :true,
        secure: true
       }
    
       const {accessToken, newrefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newrefreshToken, options)
       .json(
        new ApiResponse(
            200, 
            {accessToken, refreshToken: newrefreshToken},
            "Access token refreshed"
        )
       )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})



export { registerUser, loginUser, logoutUser, refreshAccessToken}