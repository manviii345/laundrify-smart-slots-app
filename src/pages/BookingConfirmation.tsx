
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Home, QrCode, Share, Calendar, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const barcode = searchParams.get("barcode");
  const [barcodeDataUrl, setBarcodeDataUrl] = useState("");

  useEffect(() => {
    if (barcode) {
      generateBarcode(barcode);
    }
  }, [barcode]);

  const generateBarcode = (code: string) => {
    // Create a simple barcode representation using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 300;
    canvas.height = 120;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Black bars for barcode pattern
    ctx.fillStyle = '#000000';
    
    // Generate a simple barcode pattern based on the code
    const barWidth = 3;
    let x = 20;
    
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const height = 60 + (charCode % 20);
      
      for (let j = 0; j < 3; j++) {
        if ((charCode + j) % 2 === 0) {
          ctx.fillRect(x, 20, barWidth, height);
        }
        x += barWidth + 1;
      }
      x += 2;
    }
    
    // Add text below barcode
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(code, canvas.width / 2, 105);
    
    setBarcodeDataUrl(canvas.toDataURL());
  };

  const handleDownloadBarcode = () => {
    if (barcodeDataUrl) {
      const link = document.createElement('a');
      link.download = `laundrify-barcode-${barcode}.png`;
      link.href = barcodeDataUrl;
      link.click();
      
      toast({
        title: "Barcode Downloaded",
        description: "Save this barcode for your laundry bag",
      });
    }
  };

  const handleShareBarcode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Laundrify Barcode',
          text: `My laundry barcode: ${barcode}`,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(barcode || "");
        toast({
          title: "Barcode Copied",
          description: "Barcode copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(barcode || "");
      toast({
        title: "Barcode Copied",
        description: "Barcode copied to clipboard",
      });
    }
  };

  if (!orderId || !barcode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Invalid Booking</h2>
            <p className="text-gray-600 mb-6">No booking information found</p>
            <Button onClick={() => navigate("/student-dashboard")} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your laundry slot has been successfully booked
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Order Details */}
            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Order Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">#{orderId.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Barcode:</span>
                  <span className="font-medium">{barcode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-yellow-600">Pending Pickup</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Barcode */}
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-center">
                <QrCode className="h-5 w-5 mr-2 text-purple-600" />
                Your Laundry Barcode
              </h3>
              
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
                {barcodeDataUrl ? (
                  <img 
                    src={barcodeDataUrl} 
                    alt="Laundry Barcode" 
                    className="mx-auto max-w-full h-auto"
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center text-gray-500">
                    Generating barcode...
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleDownloadBarcode}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleShareBarcode}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-800 mb-3">Important Instructions</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Attach this barcode to your laundry bag</li>
                <li>• Keep the barcode visible and undamaged</li>
                <li>• You'll receive updates on your order status</li>
                <li>• Download or screenshot this barcode for backup</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => navigate("/student-dashboard")}
                className="bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={() => navigate("/schedule")}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmation;
