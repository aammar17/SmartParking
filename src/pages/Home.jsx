// rafce
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role === "admin" || user.role === "superadmin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/user", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full text-gray-600">
      Redirecting...
    </div>
  );
};

export default Home;
