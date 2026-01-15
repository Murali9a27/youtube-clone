import Navbar from "./components/Navbar";
import Login from "./pages/auth/Login";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <Navbar />
      <Login />
      <AppRoutes />
    </>
    
  );
}

export default App;
