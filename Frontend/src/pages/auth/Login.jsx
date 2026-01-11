const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      
      {/* Card */}
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg border border-gray-800">
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Sign in
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
        />

        {/* Button */}
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition">
          Sign In
        </button>

      </div>
    </div>
  );
};

export default Login;
