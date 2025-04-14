import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/api";

// Redirect to login or home based on authentication status
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = getCurrentUser();
    
    if (user && user.isLoggedIn) {
      navigate("/home");
    } else {
      navigate("/");
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">MonFlix</h1>
        <p className="text-lg text-muted-foreground">Caricamento...</p>
      </div>
    </div>
  );
};

export default Index;
