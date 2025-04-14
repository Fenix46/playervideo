
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { loginUser } from "@/lib/api";
import { useAppContext } from "@/context/AppContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { dispatch } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the login API
      const user = await loginUser(username, password);
      
      // Update app context with user information
      dispatch({ type: "SET_USER", payload: user });
      
      // Show success toast
      toast({
        title: "Login effettuato",
        description: "Benvenuto su MonFlix!",
      });
      
      // Navigate to home page
      navigate("/home");
    } catch (error) {
      // Show error toast
      toast({
        title: "Errore di autenticazione",
        description: error instanceof Error ? error.message : "Credenziali non valide",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 py-8 fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">MonFlix</h1>
          <p className="text-muted-foreground mt-2">La tua TV in streaming</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Accedi al tuo account</CardTitle>
            <CardDescription>
              Inserisci le tue credenziali per accedere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome utente</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleLogin} 
              disabled={isLoading}
            >
              {isLoading ? "Autenticazione..." : "Accedi"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
