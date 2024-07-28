import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { UploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const GenerateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { email, username, fullName } = req.body
    console.log("email: ", email)
    if (
        [email, username, fullName, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required!")
    }
    //Validation
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]

    })


    console.log(existedUser)


    if (existedUser) {
        throw new ApiError(409, "User with Username and email already exist!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required!");
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath)
    const coverImage = await UploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const CreatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!CreatedUser) {
        throw new ApiError(500, "Something went wrong while creating the user")
    }

    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User created successfully")
    )
})


const loginUser = asyncHandler(async (req, res) => {
    //req body->data
    //username or email
    //find user
    //password check
    //access and refresh token 
    //send cookies

    const { email, username, password } = req.body
    console.log(email)

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required!")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect!")
    }

    const { accessToken, refreshToken } = await GenerateAccessandRefreshToken(user._id)

    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: LoggedInUser, accessToken, refreshToken }, "User Logged in successfully!")
        )

})

const LogoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }

    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", accessToken)
        .clearCookie("refreshToken", refreshToken)
        .json(new ApiResponse(200, {}, "User logged out"))
})

const RefreshAccessToken = asyncHandler(async (req, res) => {
    const IncomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!IncomingRefreshToken) {
        throw new ApiError(401, "unauthorized request!")
    }

    try {
        const decodedToken = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    

const user = await User.findById(decodedToken?._id)

if (!user) {
    throw new ApiError(401, "Invalid refresh token!")
}

if (IncomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token has expired or used!")
}

const options = {
    httpOnly: true,
    secure: true
}

const { accessToken, newrefreshToken } = await GenerateAccessandRefreshToken(user._id)

return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
        new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Access token refreshed")
    )
 } catch (error) {
   throw new ApiError(401, error?.message || "Invalid refresh token!")
}
})

const ChangeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password!")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Password changed successfully!"))
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(200 , req.user , "Current User fetched successfully")
})

const UpdateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName,email} = req.body

    if (!(fullName || email)) {
        throw new ApiError(400 , "All fields are required!") 
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account details updated succssfully!"))

})

const UpdateUserAvatar = asyncHandler(async (req,res) => {
    const avatarLocalpath = req.file?.path

    if (!avatarLocalpath) {
        throw new ApiError(400 , "Avatar file is missing!")
    }

    const avatar = await UploadOnCloudinary(avatarLocalpath)

    if (!avatar.url) {
        throw new ApiError(400 , "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar : avatar.url
            }
        },
        {new: true}
    ).select("-password")

    
    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Avatar updated successfully!"))
})

const UpdateUserCoverImage = asyncHandler(async (req,res) => {
    const CoverImageLocalpath = req.file?.path

    if (!CoverImageLocalpath) {
        throw new ApiError(400 , "Cover Image file is missing!")
    }

    const coverImage = await UploadOnCloudinary(CoverImageLocalpath)

    if (!coverImage.url) {
        throw new ApiError(400 , "Error while uploading Cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage : coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Cover Image updated successfully!"))
})

const getChannelProfile = asyncHandler(async (req,res) => {
    const {username} =  req.params

    if (!username?.trim()) {
        throw new ApiError(400 , "Username is missing")
    }
    
    const channel = await User.aggregate([{
        $match: {
            username: username?.toLowerCase()
        }
    },
    {
        $lookup: {
            from: "subscriptions", 
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscriptions", 
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    },
    {
        $addFields: {
            subscribersCount: {
                $size: "$subscribers"
            },
            channelsSubscribedToCount: {
                 $size: "$subscribedTo"
            },
            isSubscribed: {
                $cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber" ]},
                    then: true,
                    else: false
                }   
            }
        }
    },
    {
        $project: {
            fullName: 1,
            username: 1,
            avatar: 1,
            coverImage: 1,
            email: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1

        }
    }
])

    if (!channel?.length) {
        throw new ApiError(404 , "Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , channel , "Channel fetched successfully!")
    )
})

const getWatchHistory = asyncHandler(async (req,res) => {
      const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)    
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as : "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
      ])
})


export { registerUser, loginUser, LogoutUser, RefreshAccessToken, ChangeCurrentPassword, getCurrentUser, UpdateAccountDetails, UpdateUserAvatar, UpdateUserCoverImage, getChannelProfile, getWatchHistory }