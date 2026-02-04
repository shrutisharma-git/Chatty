import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req,res){
   const {email,password,fullName}= req.body;

   try {
        if(!email || !password || !fullName){
            return res.status(400).json({
                message : "All Fields are Required"
            });
        }

        if(password.length < 6){
            return res.status(400).json({
                message : "Password must contain atleast 6 character"
            })
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                message : "Invalid Email Format"
            })
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                message : "User with this email already exists please try a different email"
            });
        }

        const idx = Math.floor(Math.random() * 100)+1;  //generate a random num between 1-100;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            password,
            fullName,
            profilePic : randomAvatar,
        });

        try {
            await upsertStreamUser({
                id : newUser._id.toString(),
                name : newUser.fullName,
                image : newUser.profilePic || "",
            })
            console.log(`Stream user created for ${newUser.fullName}`);
        } catch (error) {
            console.log("Error creating stream user : ", error);
        }

        const token = jwt.sign({userId : newUser._id}, process.env.JWT_SECRET_KEY,{
            expiresIn : "7d"
        })

        res.cookie("jwt",token,{
            maxAge : 7* 24 * 60 * 60 * 1000, // 7 days in milliseconds
            httpOnly : true, //prevents XSS attacks by not allowing client-side scripts to access the cookie
            sameSite : "lax", //allows cookies in cross-site requests for development
            secure : process.env.NODE_ENV === "production" //ensures the cookie is sent only over HTTPS in production
        });

        res.status(201).json({
            success : true,
            message : "User Created Successfully",
            user : newUser
        });


   }
    catch (error) {
        console.error("Error in Signup Controller", error);
        res.status(500).json({
            message : "Internal Server Error"
        });
   }
}

export async function login(req,res){
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.json({
                message : "All fields are required"
            });
        }

        const user = await User.findOne({email});

        if(!user) return res.status(401).json({
            message : "Invalid email "
        });

        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect) return res.status(401).json({
            message : "Invalid password"
        });

        const token = jwt.sign({userId : user._id}, process.env.JWT_SECRET_KEY,{
            expiresIn : "7d"
        })

        res.cookie("jwt",token,{
            maxAge : 7* 24 * 60 * 60 * 1000, // 7 days in milliseconds
            httpOnly : true, //prevents XSS attacks by not allowing client-side scripts to access the cookie
            sameSite : "lax", //allows cookies in cross-site requests for development
            secure : process.env.NODE_ENV === "production" //ensures the cookie is sent only over HTTPS in production
        });

        res.status(200).json({success : true, user});

    } catch (error) {
  console.error("🔥 FULL LOGIN ERROR:", error);
  res.status(500).json({
    message: "Internal server error",
    error: error.message,
  });
}

}

export function logout(req,res){
    res.clearCookie("jwt");
    res.status(200).json({success : true, message : "Logout Successfull"});
}

export async function onboard(req,res){
    try {
        const userId = req.user._id;
        const{fullName,bio, nativeLanguage, learningLanguage, location} = req.body; 

        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
            return res.status(400).json({
                message : "all fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId,{
            ...req.body,
            isOnboarded : true,
        },{new : true})  
        
        if(!updatedUser) return res.status(404).json({message : "User not found"})
        try {
            await upsertStreamUser({
                id : updatedUser._id.toString(),
                name : updatedUser.fullName,
                profilePic : updatedUser.profilePic || ""
            });
            console.log(`Stream User update after Onboarding for ${updatedUser.fullName}`);
        } catch (streamError) {
            console.log("Error updating Stream user during onboarding:", streamError.message);
            
        }
            res.status(200).json({success : true, user : updatedUser});
    }
 catch (error) {
        console.error("Onboarding error",error);
        res.status(500).json({message : "internal server error"});
    }
}
