import { response } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResonse.js"

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
    console.log("email: ", email);

    //2
    if(        
        [fullName, email, username, password].some((field)=>
    field?.trim() === ""))
    {
        throw new ApiError(400, "all fields are required")
    }

    //3
    const existedUser = User.findOne({ $or:[username, email]})
    
    if(existedUser)
    {
        throw new ApiError(409, "user with email or username already exists");
    }

    //4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0].path;
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
    const createdUser = await user.findById(user._id).select(
        "-pasword -refreshToken"
    )

    //9
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    //10
    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered Successfully")
    )
})

export { registerUser }