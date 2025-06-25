
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LogOut, Package, Clock, Truck, CheckCircle, Search, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<LaundryOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem("allOrders");
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      setOrders(parsedOrders);
      setFilteredOrders(parsedOrders);
    }
  }, []);

  useEffect(() => {
    // Filter orders based on search term and status
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.includes(searchTerm) ||
        order.barcode.includes(searchTerm)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userPhone");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const updateOrderStatus = (orderId: string, newStatus: LaundryOrder["status"]) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem("allOrders", JSON.stringify(updatedOrders));
    
    // Also update student orders
    const studentOrders = JSON.parse(localStorage.getItem("studentOrders") || "[]");
    const updatedStudentOrders = studentOrders.map((order: LaundryOrder) => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem("studentOrders", JSON.stringify(updatedStudentOrders));
    
    toast({
      title: "Status Updated",
      description: `Order moved to ${newStatus}`,
    });
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

  const getStatusCount = (status: string) => {
    return orders.filter(order => order.status === status).length;
  };

  const getTodaysCount = () => {
    const today = new Date().toDateString();
    return orders.filter(order => new Date(order.createdAt).toDateString() === today).length;
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
              <h1 className="text-xl font-bold text-gray-800">Laundrify Admin</h1>
              <p className="text-sm text-gray-600">Order Management Dashboard</p>
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{getTodaysCount()}</div>
              <div className="text-sm text-gray-600">Today's Requests</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{getStatusCount("pending")}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{getStatusCount("washing") + getStatusCount("drying")}</div>
              <div className="text-sm text-gray-600">Ongoing</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{getStatusCount("completed")}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{getStatusCount("delivered")}</div>
              <div className="text-sm text-gray-600">Delivered</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="rounded-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-purple-600" />
              Filter Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, room, order ID, or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="washing">Washing</SelectItem>
                  <SelectItem value="drying">Drying</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
            <CardDescription>
              Manage and track all laundry orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {orders.length === 0 ? "No Orders Yet" : "No Matching Orders"}
                </h3>
                <p className="text-gray-500">
                  {orders.length === 0 ? "Orders will appear here once students start booking" : "Try adjusting your search or filter criteria"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="border rounded-xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">#{order.id.slice(-6).toUpperCase()}</h4>
                              <p className="text-gray-600">{order.studentName} - Room {order.roomNumber}</p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Type:</span><br />
                              {order.type === "normal" ? "Normal Wash" : "Stain/Warm Wash"}
                            </div>
                            <div>
                              <span className="font-medium">Pickup:</span><br />
                              {order.pickupType === "self-drop" ? "Self Drop" : "Pickup Service"}
                            </div>
                            <div>
                              <span className="font-medium">Barcode:</span><br />
                              {order.barcode}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span><br />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {order.specialInstructions && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <span className="font-medium text-blue-800">Special Instructions:</span>
                              <p className="text-blue-700 text-sm mt-1">{order.specialInstructions}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="lg:ml-6">
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm text-gray-700 mb-2">Update Status:</h5>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                size="sm"
                                variant={order.status === "pickup" ? "default" : "outline"}
                                onClick={() => updateOrderStatus(order.id, "pickup")}
                                className="rounded-lg text-xs"
                              >
                                Pickup
                              </Button>
                              <Button
                                size="sm"
                                variant={order.status === "washing" ? "default" : "outline"}
                                onClick={() => updateOrderStatus(order.id, "washing")}
                                className="rounded-lg text-xs"
                              >
                                Washing
                              </Button>
                              <Button
                                size="sm"
                                variant={order.status === "drying" ? "default" : "outline"}
                                onClick={() => updateOrderStatus(order.id, "drying")}
                                className="rounded-lg text-xs"
                              >
                                Drying
                              </Button>
                              <Button
                                size="sm"
                                variant={order.status === "completed" ? "default" : "outline"}
                                onClick={() => updateOrderStatus(order.id, "completed")}
                                className="rounded-lg text-xs"
                              >
                                Completed
                              </Button>
                              <Button
                                size="sm"
                                variant={order.status === "delivered" ? "default" : "outline"}
                                onClick={() => updateOrderStatus(order.id, "delivered")}
                                className="rounded-lg text-xs col-span-2"
                              >
                                Delivered
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
