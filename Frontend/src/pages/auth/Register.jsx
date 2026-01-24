import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    avatar: null,
    coverImage: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ------------------ Validation ------------------ */
  const validate = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.avatar) {
      newErrors.avatar = "Avatar is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------ Handlers ------------------ */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    data.append("fullname", formData.fullname);
    data.append("email", formData.email);
    data.append("username", formData.username.toLowerCase());
    data.append("password", formData.password);
    data.append("avatar", formData.avatar);

    if (formData.coverImage) {
      data.append("coverImage", formData.coverImage);
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8000/users/register",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("User registered successfully 🎉");
    } catch (error) {
      alert(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl text-red-950 font-bold text-center mb-6">
          Create Account
        </h2>

        {/* Full Name */}
        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          className="input text-black border border-blue-950 "
          onChange={handleChange}
        />
        {errors.fullname && <p className="error">{errors.fullname}</p>}

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input text-black border border-blue-950"
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="input text-black border border-blue-950"
          onChange={handleChange}
        />
        {errors.username && <p className="error">{errors.username}</p>}

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input text-black border border-blue-950"
          onChange={handleChange}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        {/* Avatar */}
        <label className="block mt-4 font-medium">
          Avatar (Required)
        </label>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          className="border border-blue-950 text-black"
          onChange={handleFileChange}
        />
        {errors.avatar && <p className="error">{errors.avatar}</p>}

        {/* Cover Image */}
        <label className="block mt-4 font-medium">
          Cover Image (Optional)
        </label>
        <input
          type="file"
          name="coverImage"
          accept="image/*"          
          className="border border-blue-950 text-black"
          onChange={handleFileChange}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
