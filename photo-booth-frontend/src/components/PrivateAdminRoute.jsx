import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PrivateAdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionToken = localStorage.getItem("adminSessionToken");

    if (!sessionToken) {
      navigate("/admin/login");
      setIsAuthenticated(false);
      return;
    }

    // Verify session with backend
    fetch("http://localhost:5000/api/admin/folders", {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminSessionToken");
          navigate("/admin/login");
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("adminSessionToken");
        navigate("/admin/login");
        setIsAuthenticated(false);
      });
  }, [navigate]);

  if (isAuthenticated === null) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
