
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
  const [sentOtp, setSentOtp] = useState("");

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

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
      // Generate a random OTP for demo purposes
      const generatedOtp = generateOTP();
      setSentOtp(generatedOtp);

      // Check if user exists, if not create one
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user:', fetchError);
      }

      if (!existingUser) {
        // Create new user
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ 
            phone_number: phoneNumber, 
            role: 'student' 
          }]);
        
        if (insertError) {
          console.error('Error creating user:', insertError);
          throw insertError;
        }
      }

      // Simulate OTP sending delay
      setTimeout(() => {
        setLoading(false);
        setStep("otp");
        toast({
          title: "OTP Sent!",
          description: `Verification code sent to ${phoneNumber}. For demo: ${generatedOtp}`,
        });
      }, 1500);
    } catch (error) {
      console.error('Error in handleSendOTP:', error);
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

    if (otp !== sentOtp) {
      toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get user data after successful OTP verification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }

      if (userData) {
        // Store user info in localStorage for demo
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userPhone", phoneNumber);
        localStorage.setItem("userId", userData.id);
        localStorage.setItem("isLoggedIn", "true");
        
        toast({
          title: "Login Successful!",
          description: "Welcome to Laundrify",
        });
        navigate("/student-dashboard");
      }
    } catch (error) {
      console.error('Error in handleVerifyOTP:', error);
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleResendOTP = () => {
    setOtp("");
    setSentOtp("");
    handleSendOTP();
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
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setStep("phone")}
                    className="flex-1 text-purple-600"
                  >
                    Change Phone Number
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResendOTP}
                    className="flex-1 text-purple-600 border-purple-600"
                    disabled={loading}
                  >
                    Resend OTP
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLogin;
