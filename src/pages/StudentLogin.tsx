
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
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
    try {
      // Create or get user with phone number
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (!existingUser) {
        // Create new user
        const { error } = await supabase
          .from('users')
          .insert([{ phone_number: phoneNumber, role: 'student' }]);
        
        if (error) throw error;
      }

      // For demo purposes, we'll simulate OTP sending
      setTimeout(() => {
        setLoading(false);
        setStep("otp");
        toast({
          title: "OTP Sent!",
          description: `Verification code sent to ${phoneNumber}`,
        });
      }, 1500);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    }
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
    try {
      // For demo purposes, accept any 6-digit OTP
      // In production, you would verify the actual OTP
      
      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (userData) {
        // Store user info in localStorage for demo
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userPhone", phoneNumber);
        localStorage.setItem("userId", userData.id);
        
        toast({
          title: "Login Successful!",
          description: "Welcome to Laundrify",
        });
        navigate("/student-dashboard");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
    setLoading(false);
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
                <Phone className="h-8 w-8 text-purple-600" />
              ) : (
                <MessageSquare className="h-8 w-8 text-purple-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {step === "phone" ? "Welcome Student!" : "Verify OTP"}
            </CardTitle>
            <CardDescription>
              {step === "phone" 
                ? "Enter your phone number to continue" 
                : `We sent a code to ${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === "phone" ? (
              <>
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
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="w-full text-purple-600"
                >
                  Change Phone Number
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLogin;
