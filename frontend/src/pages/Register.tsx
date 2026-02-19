import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, Mail, Lock, Eye, EyeOff, User, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const isResetMode = location.state?.forgotPassword === true;
  const [mode, setMode] = useState<"register" | "reset">(isResetMode ? "reset" : "register");
  const [step, setStep] = useState<"email" | "verify" | "password">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/auth/google/login");
      const data = await response.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        setError("Failed to initialize Google login");
        setGoogleLoading(false);
      }
    } catch {
      setError("Failed to connect to server");
      setGoogleLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setSendingCode(true);
    setError("");

    try {
      const response = await fetch("/api/v1/email-auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: mode })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Verification code sent to your email");
        setStep("verify");
        setCountdown(60); // 60 seconds cooldown
      } else {
        setError(data.message || "Failed to send verification code");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/email-auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await response.json();

      if (data.success) {
        setCodeVerified(true);
        toast.success("Email verified successfully");
        setStep("password");
      } else {
        setError(data.message || "Invalid verification code");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (mode === "reset") {
        // Reset password flow
        const response = await fetch("/api/v1/email-auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success) {
          toast.success("Password reset successful!");
          navigate("/login");
        } else {
          setError(data.message || "Password reset failed");
        }
      } else {
        // Register flow
        const response = await fetch("/api/v1/email-auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            password, 
            code: verificationCode,
            name: name || email.split("@")[0] 
          })
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Registration successful!");
          // Auto login after registration
          const loginResponse = await fetch("/api/v1/email-auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginResponse.json();
          
          if (loginData.success && loginData.token) {
            localStorage.setItem("auth_token", loginData.token);
            navigate("/dashboard");
          } else {
            navigate("/login");
          }
        } else {
          setError(data.message || "Registration failed");
        }
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-blue-600">
            <FileText className="h-8 w-8" />
            LeaseLenses
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {mode === "reset" ? "Reset Password" : "Create Account"}
          </h1>
          <p className="mt-2 text-gray-600">
            {mode === "reset" ? "Verify your email to set a new password" : "Get started with your free account"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`flex items-center gap-1 ${step === "email" ? "text-blue-600" : "text-green-600"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "email" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
              }`}>
                {step !== "email" ? <CheckCircle className="h-5 w-5" /> : "1"}
              </div>
              <span className="text-xs hidden sm:inline">Email</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div className={`flex items-center gap-1 ${
              step === "verify" ? "text-blue-600" : step === "password" ? "text-green-600" : "text-gray-400"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "verify" ? "bg-blue-100 text-blue-600" : 
                step === "password" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              }`}>
                {step === "password" ? <CheckCircle className="h-5 w-5" /> : "2"}
              </div>
              <span className="text-xs hidden sm:inline">Verify</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div className={`flex items-center gap-1 ${step === "password" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "password" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
              }`}>
                3
              </div>
              <span className="text-xs hidden sm:inline">Password</span>
            </div>
          </div>

          {/* Google Sign Up - only show in register mode */}
          {mode === "register" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 mb-6"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or register with email</span>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Email Input */}
          {step === "email" && (
            <div className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <Button 
                type="button" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700" 
                onClick={handleSendCode}
                disabled={sendingCode}
              >
                {sendingCode ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Send Verification Code
              </Button>

              {mode === "reset" && (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          )}

          {/* Step 2: Verification Code */}
          {step === "verify" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  We've sent a verification code to
                </p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-12 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button 
                type="button" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700" 
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Verify Code
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || sendingCode}
                  className={`text-sm ${countdown > 0 ? "text-gray-400" : "text-blue-600 hover:text-blue-700"}`}
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Change email address
              </button>
            </div>
          )}

          {/* Step 3: Password */}
          {step === "password" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700">Email verified: {email}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "reset" ? "New Password" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "reset" ? "Confirm New Password" : "Confirm Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {mode === "reset" ? "Reset Password" : "Create Account"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}