import { useState } from "react";
import { loginUser } from "../../api/auth.api";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser(formData);
      console.log("Login success:", res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg border border-gray-800">

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Sign in
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="username"
            placeholder="Username or Email"
            value={formData.identifier}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* ✅ Error message */}
          {error && (
            <p className="text-sm text-red-500 mt-4 text-center">
              {error}
            </p>
          )}

        </form>

      </div>
    </div>
  );
};

export default Login;
