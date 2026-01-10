const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-black border-b border-gray-800">
      
      {/* LEFT: Menu + Logo */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-800">
          ☰
        </button>
        <h1 className="text-xl font-bold text-white">
          YouTube
        </h1>
      </div>

      {/* CENTER: Search */}
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

      {/* RIGHT: User */}
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 text-sm font-medium border border-blue-500 rounded-full text-blue-500 hover:bg-blue-500 hover:text-white transition">
          Sign in
        </button>
      </div>

    </header>
  );
};

export default Navbar;
