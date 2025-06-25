
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LogOut, QrCode, Search, Users, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [scannedCode, setScannedCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await supabase
        .from('laundry_orders')
        .select(`
          *,
          clothing_items (*)
        `)
        .order('created_at', { ascending: false });
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleScanQR = async () => {
    if (!scannedCode) {
      toast({
        title: "No Code Entered",
        description: "Please enter a barcode to scan",
        variant: "destructive"
      });
      return;
    }

    const order = orders.find(o => o.barcode === scannedCode || o.id.includes(scannedCode));
    
    if (!order) {
      toast({
        title: "Order Not Found",
        description: "No order found with this barcode",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Order Found!",
      description: `Found order for ${order.student_name}`,
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('laundry_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Create notification for user
      const order = orders.find(o => o.id === orderId);
      if (order && newStatus === 'pickup') {
        await supabase
          .from('notifications')
          .insert([{
            user_id: order.user_id,
            order_id: orderId,
            title: 'Order Picked Up',
            message: `Your laundry order has been picked up and is being processed.`
          }]);
      }

      await loadOrders();
      toast({
        title: "Status Updated",
        description: `Order marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userId");
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
              <p className="text-sm text-gray-600">Management Dashboard</p>
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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Scanner */}
          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Scan QR Code</CardTitle>
              <CardDescription>
                Scan or enter the barcode to find laundry orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex space-x-2">
                <Input
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder="Enter barcode or order ID"
                  className="rounded-xl"
                />
                <Button onClick={handleScanQR} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {orders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Orders</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status === 'pickup').length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-600">
                    {orders.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="rounded-2xl shadow-lg mt-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 10).map((order) => (
                <div key={order.id} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{order.student_name}</h4>
                      <p className="text-sm text-gray-600">Room: {order.room_number}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {order.clothing_items?.length} clothing types • {order.barcode}
                    </div>
                    <div className="space-x-2">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'pickup')}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Mark Pickup
                        </Button>
                      )}
                      {order.status === 'pickup' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
