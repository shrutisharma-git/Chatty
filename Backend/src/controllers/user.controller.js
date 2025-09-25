import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export async function getRecommendedUsers(req,res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and : [
                
                {_id : {$ne: currentUserId} } ,//exclude current user id
                {_id : {$nin : currentUser.friends} }, //exclude current user's friends
                {isOnboarded : true},
                
            ],
        });
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({message : "internal server error"});
    }
}

export async function getMyfriends(req,res){
    try {
        const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends","fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller",error);
        res.status(500).json({message : "Internal server error"});
    }

}

export async function sendFriendRequest(req,res){

    try {
        const myId = req.user.id;
        // console.log(req.user)
        const { id: recipientId } = req.params
        // console.log(recipientId)

        //prevent send req to yourself
        if(myId==recipientId){
            return res.status(400).json({message : "You can't send friend request to yourself"});
        }
        
        const recipient = await User.findById(recipientId)

        // console.log(recipient)
        if(!recipient){
            return res.status(404).json({message : "Recipient not found"});
        }

        // check if user is already friend
        if(recipient.friends.includes(myId)){
            return res.status(400).json({message : "You are already firend with this user"});
        }
        
        // console.log("kjekr")
        // check if a req already exists
        const existingRequest = await FriendRequest.findOne({
            $or:[
                {sender : myId , recipient : recipientId},
                {sender : recipientId, recipient : myId},
            ],

        });
        
        if(existingRequest){
            // console.log("errroorrrrr")
            return res.json({message : "a friend request already exists between you and this user"});
        }
    

        const friendRequest = await FriendRequest.create({
            sender : myId,
            recipient : recipientId,
        });
        // console.log("frintrgberiuber", friendRequest)

        res.status(201).json(friendRequest);

    } catch (error) {
        console.error("Error in sendFriendRequest controller",error.message);
        res.status(500).json({message : "Internal server error"});

    }
}

export async function acceptFriendRequest(req,res){
    try {
        
        const {id : requestId} = req.params
        const friendRequest = await FriendRequest.findById(requestId);
        
        if(!friendRequest){
           return res.status(404).json({message : "Friend request not found"});
        }

       //Verify the current user is the recipient
        if(friendRequest.recipient.toString() !== req.user.id){
            return res.status(403).json({message : "You are not authorized to accept this request"});
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        // add each user to other's friends array
        // $addToSet : adds element to an array only if they do not already exists

        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet : {friends : friendRequest.recipient},
        });
        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet : {friends : friendRequest.sender},
        });

        res.status(200).json({message : "friend request accepted"});

    } catch (error) {
        console.error("Error in acceptFriendRequest controller",error.message);
        res.status(400).json({message : "Internal server error"});
    }
}

export async function getFriendRequests(req,res){
    try {
        const incomingReqs = await FriendRequest.find({
            recipient : req.user.id,
            status : "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        const acceptedReqs = await FriendRequest.find({
            sender : req.user.id,
            status : "accepted",
        }).populate("recipient"," fullName profilePic ");

        res.status(200).json({incomingReqs, acceptedReqs});
    } catch (error) {
        console.log("Error in getPendingFriendRequest", error.message);
        res.status(500).json({message : "Internal Server Error"});
    }
}

export async function getOutgoingFriendReqs(req, res){
    try {
        const outgoingRequests = await FriendRequest.find({
            sender : req.user.id,
            status : "pending",
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage")

        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.log("Error in getOutgoingFriendReqs controller",error.message);
        res.status(500).json({message : "Internal Server Error"});
    }
}