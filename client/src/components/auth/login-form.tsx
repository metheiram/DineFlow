import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { Utensils, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-elegant-50 to-elegant-100 p-4">
      <Card className="w-full max-w-md neu-card border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mb-4">
            <Utensils className="h-8 w-8 text-accent-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-elegant-800">Elegant POS</CardTitle>
          <CardDescription className="text-elegant-500">
            Sign in to your restaurant management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-elegant-700 font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="neu-input border-0 text-elegant-800"
                placeholder="Enter your username"
                required
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-elegant-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neu-input border-0 text-elegant-800"
                placeholder="Enter your password"
                required
                data-testid="input-password"
              />
            </div>
            
            {loginError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  Invalid credentials. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 rounded-xl transition-colors"
              disabled={isLoggingIn}
              data-testid="button-login"
            >
              {isLoggingIn ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-elegant-100 rounded-xl">
            <p className="text-sm text-elegant-600 mb-2 font-medium">Demo Credentials:</p>
            <p className="text-xs text-elegant-500">Username: admin</p>
            <p className="text-xs text-elegant-500">Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
