import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react";
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest } from "../lib/api";
import { CheckCircleIcon, Link, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { useNavigate } from "react-router";
import FriendCard from "../components/FriendCard.jsx";
import NoFriendsFound from "../components/NoFriendsFound.jsx";
import { LANGUAGE_TO_FLAG } from "../constants/index.js";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set()); // FIXED HERE
  const navigate = useNavigate();

  const {data: friends = [], isLoading: loadingFriends} = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  })

  const {data: recommendedUsers = [], isLoading: loadingUsers} = useQuery({
    queryKey: ["user"],
    queryFn: getRecommendedUsers,
  })

  const {data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const {mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      const outgoingIds = new Set();
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  // Also add a cleanup or reset when there are no outgoing requests
  useEffect(() => {
    if (!outgoingFriendReqs || outgoingFriendReqs.length === 0) {
      setOutgoingRequestsIds(new Set());
    }
  }, [outgoingFriendReqs]);

  // console.log(recommendedUsers)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:3xl font-bold tracking-tight">Your Friends</h2>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/notifications")}>
            Friend Requests
          </button>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg "/>
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound/>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg "/>
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="crd bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div key={user._id} className="card bg-base-200 hover:shadow-lg transition-all duration-300">
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1"/>
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitalize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        }`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2"/>
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2"/>
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;

const capitalize = (str) => str?.charAt(0)?.toUpperCase() + str?.slice(1);

function getLanguageFlag(language) {
    if(!language) return null;

    const langLower = language.toLowerCase();
    const countryCode = LANGUAGE_TO_FLAG[langLower];

    if(countryCode){
        return <img
         src={`https://flagcdn.com/24x18/${countryCode}.png`} 
         alt= {`${langLower} flag`}
         className='h-3 mr-1 inline-block'
          />
    }
    return null;

}

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// import { useEffect, useState } from "react";
// import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest } from "../lib/api";
// import { CheckCircleIcon, Link, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";
// import { useNavigate } from "react-router";
// import FriendCard from "../components/FriendCard.jsx";
// import NoFriendsFound from "../components/NoFriendsFound.jsx";

// const HomePage = () => {
//   const queryClient = useQueryClient();
//   const {outgoingRequestsIds, setOutgoingRequestsIds} = useState(new Set())
//   const navigate = useNavigate();

//   const{data:friends=[], isLoading:loadingFriends} = useQuery({
//     queryKey: ["friends"],
//     queryFn: getUserFriends,
//   })

//   const{data:recommendedUsers=[], isLoading:loadingUsers} = useQuery({
//     queryKey: ["user"],
//     queryFn: getRecommendedUsers,
//   })

//   const {data: outgoingFriendReqs } = useQuery({
//     queryKey: ["outgoingFriendReqs"],
//     queryFn: getOutgoingFriendReqs,
//   });

//   const {mutate:sendRequestMutation, isPending } = useMutation({
//     mutationFn : sendFriendRequest,
//     onSuccess: () => queryClient.invalidateQueries({queryKey: ["outgoingFriendReqs"] }),
  
//   });

//   useEffect(()=>{
//     const outgoingIds = new Set()
//     if(outgoingFriendReqs && outgoingFriendReqs.length > 0){
//       outgoingFriendReqs.forEach((req) =>{
//         outgoingIds.add(req.recipient._id)
//       })
//       setOutgoingRequestsIds(outgoingIds)
//     }
//   }, [outgoingFriendReqs])


//   return (
//     <div className="p-4 sm:p-6 lg:p-8">
//       <div className="container mx-auto space-y-10">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <h2 className="text-2xl sm:3xl font-bold tracking-tight">Your Friends</h2>
//           <button className="btn btn-outline btn-sm" onClick={() => navigate("/notifications")}>
//             Friend Requests
//           </button>
//           {/* <Link to="/notifications" className="btn btn-outline btn-sm">
//             <UsersIcon className="mr-2 size-4"/>
//             Friend Requests 
//           </Link> */}
//         </div>

//         {loadingFriends ? (
//           <div className="flex justify-center py-12">
//             <span className="loading loading-spinner loading-lg "/>
//           </div>
//         ):friends.length === 0 ?(
//         <NoFriendsFound/>
//         )
//         :(<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {friends.map((friend) =>{
//             <FriendCard key={friend._id} friend={friend} />
//           })}
//         </div>
//         )}

//         <section>
//           <div className="mb-6 sm:mb-8">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
//                 <p className="opacity-70">
//                   Discover perfect language exchange partners based on your profile
//                 </p>
//               </div>
//             </div>
//           </div>

//           {loadingUsers ?(
//             <div className="flex justify-center py-12">
//               <span className="loading loading-spinner loading-lg "/>
//           </div>
//           ): recommendedUsers.length === 0 ?(
//             <div className="crd bg-base-200 p-6 text-center">
//               <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
//               <p className="text-base-content opacity-70">
//                 Check back later for new language partners!
//               </p>
//             </div>
//           ):(
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {recommendedUsers.map((user) => {
//                 const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

//                 return(
//                   <div key={user._id}
//                   className="card bg-base-200 hover:shadow-lg transition-all duration-300"
//                   >
//                     <div className="card-body p-5 space-y-4">
//                       <div className="flex items-center gap-3">
//                         <div className="avatar size-16 rounded-full">
//                           <img src={user.profilePic} alt={user.fullName} />
//                         </div>

//                         <div>
//                           <h3 className="font-semibold text-lg">{user.fullName}</h3>
//                           {user.location && (
//                             <div className="flex items-center text-xs opacity-70 mt-1">
//                               <MapPinIcon className="size-3 mr-1"/>
//                               {user.location}
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       {/* Languages with flags */}
//                       <div className="flex flex-wrap gap-1.5">
//                         <span className="badge badge-secondary">
//                           {/* {getLanguageFlag(user.nativeLanguage)} */}
//                           Native: {capitalize(user.nativeLanguage)}
//                         </span>
//                         <span className="badge badge-outline">
//                           {/* {getLanguageFlag(user.learningLanguage)} */}
//                           Learning : {capitalize(user.learningLanguage)}
//                         </span>
//                       </div>

//                       {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

//                       {/* ACTION BUTTON */}
//                       <button
//                       className={`btn w-full mt-2${
//                         hasRequestBeenSent ? "btn-disabled" : "btn-primary"
//                       }`}
//                       onClick={() => sendRequestMutation(user._id)}
//                       disabled={hasRequestBeenSent || isPending}
//                       >
//                         {hasRequestBeenSent ? (
//                           <>
//                             <CheckCircleIcon className="size-4 mr-2"/>
//                             Request Sent
//                           </>
//                         ) : (
//                           <>
//                             <UserPlusIcon className="size-4 mr-2"/>
//                             Send Friend Request
//                           </>
//                         )}

//                       </button>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </section>
//       </div>
//     </div>
//   )
// }

// export default HomePage;

// const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
