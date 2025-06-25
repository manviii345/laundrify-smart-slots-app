
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Package, QrCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BookSlot = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: "",
    roomNumber: "",
    phoneNumber: localStorage.getItem("userPhone") || "",
    laundryType: "normal",
    pickupType: "self-drop",
    preferredDate: "",
    preferredTime: "",
    specialInstructions: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.roomNumber || !formData.preferredDate || !formData.preferredTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Simulate booking process
    setTimeout(() => {
      const orderId = Date.now().toString();
      const barcode = `LDY${orderId.slice(-8)}`;
      
      const newOrder = {
        id: orderId,
        type: formData.laundryType as "normal" | "stain",
        pickupType: formData.pickupType as "self-drop" | "pickup",
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        scheduledPickup: `${formData.preferredDate} at ${formData.preferredTime}`,
        barcode: barcode,
        studentName: formData.studentName,
        roomNumber: formData.roomNumber,
        specialInstructions: formData.specialInstructions
      };

      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem("studentOrders") || "[]");
      existingOrders.push(newOrder);
      localStorage.setItem("studentOrders", JSON.stringify(existingOrders));

      // Also save for admin dashboard
      const allOrders = JSON.parse(localStorage.getItem("allOrders") || "[]");
      allOrders.push(newOrder);
      localStorage.setItem("allOrders", JSON.stringify(allOrders));

      setLoading(false);
      toast({
        title: "Booking Confirmed!",
        description: `Your laundry slot has been booked. Order ID: ${orderId.slice(-6)}`,
      });

      // Navigate to confirmation page with order details
      navigate(`/booking-confirmation?orderId=${orderId}&barcode=${barcode}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/student-dashboard")}
          className="mb-6 text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Book Laundry Slot</CardTitle>
            <CardDescription>
              Fill in your details to book a laundry slot
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    placeholder="Enter your name"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                    placeholder="e.g., A-101"
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="Your phone number"
                  className="rounded-xl"
                  disabled
                />
              </div>

              {/* Laundry Type */}
              <div className="space-y-3">
                <Label>Laundry Type</Label>
                <RadioGroup
                  value={formData.laundryType}
                  onValueChange={(value) => setFormData({...formData, laundryType: value})}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-xl p-4">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="flex-1 cursor-pointer">
                      <div className="font-medium">Normal Wash</div>
                      <div className="text-sm text-gray-500">Regular washing</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-xl p-4">
                    <RadioGroupItem value="stain" id="stain" />
                    <Label htmlFor="stain" className="flex-1 cursor-pointer">
                      <div className="font-medium">Stain/Warm Wash</div>
                      <div className="text-sm text-gray-500">For tough stains</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Pickup Type */}
              <div className="space-y-3">
                <Label>Pickup Type</Label>
                <RadioGroup
                  value={formData.pickupType}
                  onValueChange={(value) => setFormData({...formData, pickupType: value})}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-xl p-4">
                    <RadioGroupItem value="self-drop" id="self-drop" />
                    <Label htmlFor="self-drop" className="flex-1 cursor-pointer">
                      <div className="font-medium">Self Drop</div>
                      <div className="text-sm text-gray-500">Drop at center</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-xl p-4">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <div className="font-medium">Pickup Service</div>
                      <div className="text-sm text-gray-500">We'll collect</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Schedule */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Date *</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                    className="rounded-xl"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Preferred Time *</Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(value) => setFormData({...formData, preferredTime: value})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00-11:00">9:00 AM - 11:00 AM</SelectItem>
                      <SelectItem value="11:00-13:00">11:00 AM - 1:00 PM</SelectItem>
                      <SelectItem value="13:00-15:00">1:00 PM - 3:00 PM</SelectItem>
                      <SelectItem value="15:00-17:00">3:00 PM - 5:00 PM</SelectItem>
                      <SelectItem value="17:00-19:00">5:00 PM - 7:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                  placeholder="Any special care instructions..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl h-12"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookSlot;
