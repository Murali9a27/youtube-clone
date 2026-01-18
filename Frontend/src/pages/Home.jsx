const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-red-600">YouTube Clone</h1>

        <input
          type="text"
          placeholder="Search"
          className="w-1/2 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        
      </header>

      {/* Main Content */}
      <main className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((video) => (
          <div
            key={video}
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
          >
            <div className="h-40 bg-gray-300 rounded-t-xl"></div>

            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1">
                Video Title {video}
              </h3>
              <p className="text-xs text-gray-500">Channel Name</p>
              <p className="text-xs text-gray-400">1M views • 2 days ago</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Home;
