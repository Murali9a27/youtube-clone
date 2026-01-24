import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-black border-b border-gray-800">
      
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-800">
          &#9776;
        </button>

        <h1
          onClick={() => navigate("/")}
          className="text-xl font-bold text-white cursor-pointer"
        >
          YouTube
        </h1>
      </div>

      {/* CENTER */}
      <div className="hidden md:flex flex-1 max-w-xl mx-6">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-2 bg-black border border-gray-700 rounded-l-full focus:outline-none focus:border-gray-500"
        />
        <button className="px-6 border border-gray-700 rounded-r-full bg-gray-900 hover:bg-gray-800">
          🔍
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {!token ? (
          <>
            {/* NOT LOGGED IN */}
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 text-sm font-medium border border-blue-500 rounded-full text-blue-500 hover:bg-blue-500 hover:text-white transition"
            >
              Sign in
            </button>

            <button
              onClick={() => navigate("/login")}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Login
            </button>
          </>
        ) : (
          <>
            {/* LOGGED IN → PROFILE */}
            <div
              onClick={() => navigate("/profile")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-red-600 text-white font-semibold cursor-pointer"
              title="Profile"
            >
              U
            </div>

            <button
              onClick={handleLogout}
              className="text-sm text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
