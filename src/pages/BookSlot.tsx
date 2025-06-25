
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Package, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClothingItem {
  type: string;
  quantity: number;
}

const BookSlot = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: "",
    roomNumber: "",
    phoneNumber: localStorage.getItem("userPhone") || "",
    laundryType: "normal",
    preferredDate: "",
    preferredTime: "",
    specialInstructions: ""
  });
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([
    { type: "shirts", quantity: 0 },
    { type: "jeans", quantity: 0 },
    { type: "trousers", quantity: 0 },
    { type: "underwear", quantity: 0 },
    { type: "socks", quantity: 0 },
    { type: "jackets", quantity: 0 },
    { type: "sweaters", quantity: 0 },
    { type: "dresses", quantity: 0 },
    { type: "skirts", quantity: 0 },
    { type: "others", quantity: 0 }
  ]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableSlots();
  }, [formData.preferredDate]);

  const loadAvailableSlots = async () => {
    if (!formData.preferredDate) return;
    
    try {
      const { data: slots } = await supabase
        .from('time_slots')
        .select('*')
        .eq('date', formData.preferredDate)
        .eq('is_active', true)
        .order('time_range');
      
      setAvailableSlots(slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  const updateClothingQuantity = (type: string, change: number) => {
    const totalItems = clothingItems.reduce((sum, item) => sum + item.quantity, 0);
    
    if (change > 0 && totalItems >= 10) {
      toast({
        title: "Maximum Limit Reached",
        description: "You can add maximum 10 clothing items",
        variant: "destructive"
      });
      return;
    }

    setClothingItems(prev => 
      prev.map(item => 
        item.type === type 
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
    );
  };

  const getTotalItems = () => {
    return clothingItems.reduce((sum, item) => sum + item.quantity, 0);
  };

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

    const totalItems = getTotalItems();
    if (totalItems === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one clothing item",
        variant: "destructive"
      });
      return;
    }

    if (totalItems > 10) {
      toast({
        title: "Too Many Items",
        description: "Maximum 10 clothing items allowed",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const orderId = crypto.randomUUID();
      const barcode = `LDY${Date.now().toString().slice(-8)}`;
      
      // Find the selected slot
      const selectedSlot = availableSlots.find(slot => slot.time_range === formData.preferredTime);
      
      // Create the order
      const { error: orderError } = await supabase
        .from('laundry_orders')
        .insert([{
          id: orderId,
          user_id: userId,
          student_name: formData.studentName,
          room_number: formData.roomNumber,
          phone_number: formData.phoneNumber,
          laundry_type: formData.laundryType,
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          special_instructions: formData.specialInstructions,
          barcode: barcode,
          slot_id: selectedSlot?.id,
          status: 'pending'
        }]);

      if (orderError) throw orderError;

      // Add clothing items
      const clothingInserts = clothingItems
        .filter(item => item.quantity > 0)
        .map(item => ({
          order_id: orderId,
          clothing_type: item.type,
          quantity: item.quantity
        }));

      if (clothingInserts.length > 0) {
        const { error: clothingError } = await supabase
          .from('clothing_items')
          .insert(clothingInserts);

        if (clothingError) throw clothingError;
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your laundry slot has been booked. Order ID: ${orderId.slice(-6)}`,
      });

      navigate(`/booking-confirmation?orderId=${orderId}&barcode=${barcode}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    }
    
    setLoading(false);
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
              Fill in your details and sort your clothes (max 10 items)
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

              {/* Clothing Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Sort Your Clothes ({getTotalItems()}/10)</Label>
                  <div className="text-sm text-gray-500">
                    {getTotalItems() === 10 && "Maximum limit reached"}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {clothingItems.map((item) => (
                    <div key={item.type} className="border rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{item.type}</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateClothingQuantity(item.type, -1)}
                            disabled={item.quantity === 0}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateClothingQuantity(item.type, 1)}
                            disabled={getTotalItems() >= 10}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <Label htmlFor="preferredTime">Available Time Slots *</Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(value) => setFormData({...formData, preferredTime: value})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.time_range}>
                          {slot.time_range} ({slot.current_bookings}/{slot.max_capacity} booked)
                        </SelectItem>
                      ))}
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
                disabled={loading || getTotalItems() === 0}
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
