
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, QrCode, Clock, Truck, Package, Bell } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/student-login");
      return;
    }

    try {
      // Load orders
      const { data: ordersData } = await supabase
        .from('laundry_orders')
        .select(`
          *,
          clothing_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Load notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userId");
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

  const unreadNotifications = notifications.filter(n => !n.is_read);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-purple-600 animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center space-x-4">
            {unreadNotifications.length > 0 && (
              <div className="relative">
                <Bell className="h-6 w-6 text-purple-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
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

            {/* Notifications */}
            {unreadNotifications.length > 0 && (
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-purple-600" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {unreadNotifications.slice(0, 3).map((notification) => (
                    <div 
                      key={notification.id}
                      className="border rounded-xl p-3 cursor-pointer hover:bg-purple-50"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
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
                                  {order.laundry_type === "normal" ? "Normal Wash" : "Stain/Warm Wash"}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Items:</span> {order.clothing_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {order.preferred_date}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {order.preferred_time}
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
      </div>
    </div>
  );
};

export default StudentDashboard;
