
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Package, Plus } from "lucide-react";

interface LaundryOrder {
  id: string;
  type: "normal" | "stain";
  pickupType: "self-drop" | "pickup";
  status: "pending" | "pickup" | "washing" | "drying" | "completed" | "delivered";
  createdAt: string;
  scheduledPickup?: string;
  barcode: string;
  studentName: string;
  roomNumber: string;
  specialInstructions?: string;
}

const Schedule = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem("studentOrders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

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

  const groupOrdersByDate = () => {
    const grouped: { [key: string]: LaundryOrder[] } = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(order);
    });
    
    return grouped;
  };

  const groupedOrders = groupOrdersByDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/student-dashboard")}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Button
            onClick={() => navigate("/book-slot")}
            className="bg-purple-600 hover:bg-purple-700 rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Book New Slot
          </Button>
        </div>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Pickup & Drop Schedule</CardTitle>
            <CardDescription>
              View your scheduled laundry pickups and deliveries
            </CardDescription>
          </CardHeader>

          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Scheduled Orders</h3>
                <p className="text-gray-500 mb-6">Book your first laundry slot to see it here</p>
                <Button
                  onClick={() => navigate("/book-slot")}
                  className="bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your First Slot
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedOrders)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([date, dateOrders]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-purple-600" />
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    
                    <div className="space-y-4">
                      {dateOrders.map((order) => (
                        <Card key={order.id} className="border rounded-xl hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg">Order #{order.id.slice(-6).toUpperCase()}</h4>
                                  <p className="text-gray-600">
                                    {order.type === "normal" ? "Normal Wash" : "Stain/Warm Wash"}
                                  </p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Pickup Type:</span>
                                <p className="text-gray-600">
                                  {order.pickupType === "self-drop" ? "Self Drop" : "Pickup Service"}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Barcode:</span>
                                <p className="text-gray-600 font-mono">{order.barcode}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Room:</span>
                                <p className="text-gray-600">{order.roomNumber}</p>
                              </div>
                            </div>

                            {order.scheduledPickup && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <span className="font-medium text-blue-800">Scheduled Pickup:</span>
                                <p className="text-blue-700">{order.scheduledPickup}</p>
                              </div>
                            )}

                            {order.specialInstructions && (
                              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                <span className="font-medium text-yellow-800">Special Instructions:</span>
                                <p className="text-yellow-700 text-sm">{order.specialInstructions}</p>
                              </div>
                            )}

                            {/* Progress Timeline */}
                            <div className="mt-6">
                              <h5 className="font-medium text-gray-700 mb-3">Progress Timeline</h5>
                              <div className="flex items-center space-x-2">
                                {["pending", "pickup", "washing", "drying", "completed", "delivered"].map((status, index) => {
                                  const isCompleted = ["pending", "pickup", "washing", "drying", "completed", "delivered"]
                                    .indexOf(order.status) >= index;
                                  const isCurrent = order.status === status;
                                  
                                  return (
                                    <div key={status} className="flex items-center">
                                      <div className={`
                                        w-3 h-3 rounded-full border-2 
                                        ${isCurrent 
                                          ? 'bg-purple-600 border-purple-600' 
                                          : isCompleted 
                                            ? 'bg-green-500 border-green-500' 
                                            : 'bg-gray-200 border-gray-300'
                                        }
                                      `} />
                                      {index < 5 && (
                                        <div className={`
                                          w-8 h-0.5 
                                          ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                                        `} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Pending</span>
                                <span>Pickup</span>
                                <span>Wash</span>
                                <span>Dry</span>
                                <span>Done</span>
                                <span>Delivered</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedule;
