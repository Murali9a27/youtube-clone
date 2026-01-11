import { useState } from "react";

const Login = () => {
  // 1️⃣ State to store form data
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });

  // 2️⃣ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 3️⃣ Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login data:", formData);
    // later → send this to backend
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg border border-gray-800">

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Sign in
        </h2>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Username or Email */}
          <input
            type="text"
            name="identifier"
            placeholder="Username or Email"
            value={formData.identifier}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
          />

          {/* Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition"
          >
            Sign In
          </button>

        </form>

      </div>
    </div>
  );
};

export default Login;
