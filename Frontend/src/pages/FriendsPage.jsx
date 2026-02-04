import { useQuery } from "@tanstack/react-query"
import { getUserFriends } from "../lib/api"
import NoFriendsFound from "../components/NoFriendsFound";
import FriendCard from "../components/FriendCard";

const FriendsPage = () => {

    const {data : friends = [], isLoading} = useQuery({
        queryKey: ["friends"],
        queryFn : getUserFriends,
    });


  return (
    <div className="p-6 sm:p-4 lg:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 ">
            Your Friends
        </h2>

        {isLoading ? (
            <div className="flex justify-center py-12">
             <span className="loading loading-ring loading-lg"/>   
            </div>
        ) : friends.length === 0 ?(
            <NoFriendsFound/>
        ):(
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {friends.map((friend) =>(
                    <FriendCard key={friend._id} friend={friend}/>
                ))}
            </div>
        )}
    </div>
  );
};

export default FriendsPage
