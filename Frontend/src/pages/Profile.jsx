import React from "react";

const Profile = () => {
  Temporary dummy data (replace with API data)
  const user = {
    username: "murali_kumar",
    email: "murali@gmail.com",
    avatar:
      "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png",
    subscribers: 120,
    videos: 15
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={user.avatar}
            alt="Profile"
            className="w-32 h-32 rounded-full border border-gray-700"
          />

          <div>
            <h1 className="text-3xl font-bold">{user.username}</h1>
            <p className="text-gray-400">{user.email}</p>

            <div className="flex gap-6 mt-3 text-sm text-gray-300">
              <span>{user.subscribers} Subscribers</span>
              <span>{user.videos} Videos</span>
            </div>

            <button className="mt-4 px-4 py-2 bg-red-600 rounded-full hover:bg-red-700">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-800" />

        {/* Channel Content */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Videos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Video Card Placeholder */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="h-32 bg-gray-800 rounded mb-3"></div>
              <p className="text-sm font-medium">
                Sample Video Title
              </p>
              <p className="text-xs text-gray-400">1K views</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
