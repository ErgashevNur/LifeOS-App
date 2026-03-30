import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email va password kiriting.",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "Siz tizimga muvaffaqiyatli kirdingiz.",
      });
      navigate("/", { replace: true });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
          type="button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to landing
        </Button>

        <Card className="border-0 shadow-2xl">
          <CardContent className="space-y-6 pt-8">
            <div className="text-center">
              <Badge variant="secondary" className="mb-3">
                <Sparkles className="mr-1 h-3 w-3" />
                Login
              </Badge>
              <h1 className="mb-1 text-3xl font-bold">Welcome Back</h1>
              <p className="text-muted-foreground text-sm">
                Akkauntingizga kirib davom eting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              <Button className="h-12 w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
