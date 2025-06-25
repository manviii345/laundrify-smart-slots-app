
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, QrCode, Search, Package, Clock, Users, CheckCircle } from "lucide-react";
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
  batchId?: string;
  feedback?: string;
  slotNote?: string;
}

interface Batch {
  id: string;
  name: string;
  status: "created" | "washing" | "drying" | "completed";
  orders: string[];
  createdAt: string;
}

const StaffScan = () => {
  const navigate = useNavigate();
  const [scannedCode, setScannedCode] = useState("");
  const [currentOrder, setCurrentOrder] = useState<LaundryOrder | null>(null);
  const [feedback, setFeedback] = useState("");
  const [slotNote, setSlotNote] = useState("");
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [newBatchName, setNewBatchName] = useState("");

  useEffect(() => {
    // Load orders and batches
    const savedOrders = localStorage.getItem("allOrders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    
    const savedBatches = localStorage.getItem("batches");
    if (savedBatches) {
      setBatches(JSON.parse(savedBatches));
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

  const handleScan = () => {
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

    setCurrentOrder(order);
    toast({
      title: "Order Found!",
      description: `Found order for ${order.studentName}`,
    });
  };

  const updateOrderStatus = (newStatus: LaundryOrder["status"]) => {
    if (!currentOrder) return;

    const updatedOrders = orders.map(order => 
      order.id === currentOrder.id 
        ? { ...order, status: newStatus, feedback, slotNote }
        : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem("allOrders", JSON.stringify(updatedOrders));
    
    // Also update student orders
    const studentOrders = JSON.parse(localStorage.getItem("studentOrders") || "[]");
    const updatedStudentOrders = studentOrders.map((order: LaundryOrder) => 
      order.id === currentOrder.id 
        ? { ...order, status: newStatus, feedback, slotNote }
        : order
    );
    localStorage.setItem("studentOrders", JSON.stringify(updatedStudentOrders));
    
    toast({
      title: "Status Updated",
      description: `Order marked as ${newStatus}`,
    });

    // Reset form
    setCurrentOrder(null);
    setScannedCode("");
    setFeedback("");
    setSlotNote("");
  };

  const createBatch = () => {
    if (!newBatchName) {
      toast({
        title: "Batch Name Required",
        description: "Please enter a name for the new batch",
        variant: "destructive"
      });
      return;
    }

    const newBatch: Batch = {
      id: Date.now().toString(),
      name: newBatchName,
      status: "created",
      orders: [],
      createdAt: new Date().toISOString()
    };

    const updatedBatches = [...batches, newBatch];
    setBatches(updatedBatches);
    localStorage.setItem("batches", JSON.stringify(updatedBatches));
    
    setSelectedBatch(newBatch.id);
    setNewBatchName("");
    
    toast({
      title: "Batch Created",
      description: `Batch "${newBatch.name}" created successfully`,
    });
  };

  const addOrderToBatch = () => {
    if (!currentOrder || !selectedBatch) {
      toast({
        title: "Missing Information",
        description: "Please select an order and batch",
        variant: "destructive"
      });
      return;
    }

    const updatedBatches = batches.map(batch => 
      batch.id === selectedBatch 
        ? { ...batch, orders: [...batch.orders, currentOrder.id] }
        : batch
    );

    const updatedOrders = orders.map(order => 
      order.id === currentOrder.id 
        ? { ...order, batchId: selectedBatch }
        : order
    );

    setBatches(updatedBatches);
    setOrders(updatedOrders);
    localStorage.setItem("batches", JSON.stringify(updatedBatches));
    localStorage.setItem("allOrders", JSON.stringify(updatedOrders));

    toast({
      title: "Added to Batch",
      description: `Order added to batch successfully`,
    });
  };

  const updateBatchStatus = (batchId: string, newStatus: Batch["status"]) => {
    const updatedBatches = batches.map(batch => 
      batch.id === batchId ? { ...batch, status: newStatus } : batch
    );

    // Update all orders in the batch
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      const statusMap = {
        washing: "washing" as const,
        drying: "drying" as const,
        completed: "completed" as const
      };

      if (statusMap[newStatus]) {
        const updatedOrders = orders.map(order => 
          batch.orders.includes(order.id) 
            ? { ...order, status: statusMap[newStatus] }
            : order
        );
        setOrders(updatedOrders);
        localStorage.setItem("allOrders", JSON.stringify(updatedOrders));
      }
    }

    setBatches(updatedBatches);
    localStorage.setItem("batches", JSON.stringify(updatedBatches));

    toast({
      title: "Batch Updated",
      description: `Batch marked as ${newStatus}`,
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
      case "created": return "bg-blue-100 text-blue-800";
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
              <h1 className="text-xl font-bold text-gray-800">Laundrify Staff</h1>
              <p className="text-sm text-gray-600">Scan & Track Interface</p>
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
          {/* Scan Section */}
          <div className="space-y-6">
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
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode / Order ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="barcode"
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                      placeholder="Enter barcode or order ID"
                      className="rounded-xl"
                    />
                    <Button onClick={handleScan} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {currentOrder && (
                  <div className="bg-purple-50 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Package className="h-5 w-5 mr-2 text-purple-600" />
                      Order Found
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Student:</span><br />
                        {currentOrder.studentName}
                      </div>
                      <div>
                        <span className="font-medium">Room:</span><br />
                        {currentOrder.roomNumber}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span><br />
                        {currentOrder.type === "normal" ? "Normal" : "Stain/Warm"}
                      </div>
                      <div>
                        <span className="font-medium">Current Status:</span><br />
                        <Badge className={getStatusColor(currentOrder.status)}>
                          {currentOrder.status}
                        </Badge>
                      </div>
                    </div>

                    {currentOrder.specialInstructions && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <span className="font-medium text-blue-800">Special Instructions:</span>
                        <p className="text-blue-700 text-sm mt-1">{currentOrder.specialInstructions}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback (Optional)</Label>
                        <Textarea
                          id="feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Add any feedback or notes..."
                          className="rounded-xl"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slotNote">Slot Note (Optional)</Label>
                        <Input
                          id="slotNote"
                          value={slotNote}
                          onChange={(e) => setSlotNote(e.target.value)}
                          placeholder="Slot or location note"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => updateOrderStatus("pickup")}
                          variant="outline"
                          className="rounded-xl"
                        >
                          Mark Picked Up
                        </Button>
                        <Button
                          onClick={() => updateOrderStatus("washing")}
                          variant="outline"
                          className="rounded-xl"
                        >
                          Start Washing
                        </Button>
                        <Button
                          onClick={() => updateOrderStatus("drying")}
                          variant="outline"
                          className="rounded-xl"
                        >
                          Start Drying
                        </Button>
                        <Button
                          onClick={() => updateOrderStatus("completed")}
                          className="bg-green-600 hover:bg-green-700 rounded-xl"
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Batch Management */}
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-600" />
                      Batch Management
                    </CardTitle>
                    <CardDescription>
                      Create and manage laundry batches
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create New Batch */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Create New Batch</h3>
                  <div className="flex space-x-2">
                    <Input
                      value={newBatchName}
                      onChange={(e) => setNewBatchName(e.target.value)}
                      placeholder="Batch name (e.g., Morning Batch 1)"
                      className="rounded-xl"
                    />
                    <Button onClick={createBatch} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                      Create
                    </Button>
                  </div>
                </div>

                {/* Select Batch */}
                {batches.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Active Batch</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Choose a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name} ({batch.orders.length} orders) - {batch.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Add to Batch */}
                {currentOrder && selectedBatch && (
                  <Button
                    onClick={addOrderToBatch}
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    Add Current Order to Batch
                  </Button>
                )}

                {/* Batch Actions */}
                {selectedBatch && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Batch Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => updateBatchStatus(selectedBatch, "washing")}
                        variant="outline"
                        className="rounded-xl"
                      >
                        Start Washing
                      </Button>
                      <Button
                        onClick={() => updateBatchStatus(selectedBatch, "drying")}
                        variant="outline"
                        className="rounded-xl"
                      >
                        Start Drying
                      </Button>
                      <Button
                        onClick={() => updateBatchStatus(selectedBatch, "completed")}
                        className="bg-green-600 hover:bg-green-700 rounded-xl col-span-2"
                      >
                        Mark Batch Complete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Batches */}
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Active Batches</CardTitle>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No batches created yet</p>
                ) : (
                  <div className="space-y-3">
                    {batches.map((batch) => (
                      <div key={batch.id} className="border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{batch.name}</h4>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {batch.orders.length} orders • Created {new Date(batch.createdAt).toLocaleDateString()}
                        </p>
                      </div>
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

export default StaffScan;
