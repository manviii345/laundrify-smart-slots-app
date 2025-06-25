
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, QrCode, Clock, Truck, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LaundryOrder {
  id: string;
  type: "normal" | "stain";
  pickupType: "self-drop" | "pickup";
  status: "pending" | "pickup" | "washing" | "drying" | "completed" | "delivered";
  createdAt: string;
  scheduledPickup?: string;
  barcode: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);

  useEffect(() => {
    // Load existing orders from localStorage
    const savedOrders = localStorage.getItem("studentOrders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userPhone");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "pickup": return "bg-blue-100 text-blue-800";
      case "washing": return "bg-purple-100 text-purple-800";
      case "drying": return "bg-orange-100 text-orange-800";
      case "completed": return "bg-green-100 text-green-800";
      case "delivered": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "pickup": return <Truck className="h-4 w-4" />;
      case "washing": case "drying": return <Package className="h-4 w-4" />;
      case "completed": case "delivered": return <QrCode className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Laundrify</h1>
              <p className="text-sm text-gray-600">Student Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => navigate("/book-slot")}
                  className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl h-12"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Book New Slot
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/schedule")}
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl h-12"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  View Schedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/barcode-generator")}
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl h-12"
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Your Laundry Orders</CardTitle>
                <CardDescription>
                  Track your current and recent laundry orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-6">Start by booking your first laundry slot</p>
                    <Button
                      onClick={() => navigate("/book-slot")}
                      className="bg-purple-600 hover:bg-purple-700 rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Book Your First Slot
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="border rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                {getStatusIcon(order.status)}
                              </div>
                              <div>
                                <h4 className="font-semibold">Order #{order.id.slice(-6).toUpperCase()}</h4>
                                <p className="text-sm text-gray-600">
                                  {order.type === "normal" ? "Normal Wash" : "Stain/Warm Wash"}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Pickup:</span> {order.pickupType}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {order.scheduledPickup && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Scheduled:</span> {order.scheduledPickup}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
