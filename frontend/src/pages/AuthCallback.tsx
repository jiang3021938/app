import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
import { Loader2 } from "lucide-react";

const client = createClient();

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      await client.auth.login();
      navigate("/dashboard");
    } catch (error) {
      console.error("Auth callback error:", error);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600">Completing sign in...</p>
      </div>
    </div>
  );
}