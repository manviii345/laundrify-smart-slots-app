
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, Phone, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("admin");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: `Verification code sent to ${phoneNumber}`,
      });
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userPhone", phoneNumber);
      toast({
        title: "Login Successful!",
        description: `Welcome ${role}`,
      });
      
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/staff-scan");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === "phone" ? (
                <Shield className="h-8 w-8 text-purple-600" />
              ) : (
                <MessageSquare className="h-8 w-8 text-purple-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {step === "phone" ? "Admin/Staff Login" : "Verify OTP"}
            </CardTitle>
            <CardDescription>
              {step === "phone" 
                ? "Select your role and enter credentials" 
                : `We sent a code to ${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === "phone" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select value={role} onValueChange={(value: "admin" | "staff") => setRole(value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your 10-digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-xl"
                    maxLength={10}
                  />
                </div>
                <Button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="rounded-xl text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  {loading ? "Verifying..." : `Login as ${role}`}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="w-full text-purple-600"
                >
                  Change Details
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
