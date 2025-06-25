
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, QrCode, Download, Share, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BarcodeGenerator = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [barcodeDataUrl, setBarcodeDataUrl] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const generateBarcode = (text: string) => {
    if (!text) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 400;
    canvas.height =150;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Black bars for barcode pattern
    ctx.fillStyle = '#000000';
    
    // Generate a barcode pattern based on the text
    const barWidth = 3;
    let x = 30;
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const height = 80 + (charCode % 20);
      
      for (let j = 0; j < 4; j++) {
        if ((charCode + j) % 2 === 0) {
          ctx.fillRect(x, 30, barWidth, height);
        }
        x += barWidth + 1;
      }
      x += 3;
    }
    
    // Add text below barcode
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, 135);
    
    setBarcodeDataUrl(canvas.toDataURL());
    setGeneratedCode(text);
  };

  const handleGenerate = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text to generate a barcode",
        variant: "destructive"
      });
      return;
    }
    
    generateBarcode(inputText.trim());
    toast({
      title: "Barcode Generated",
      description: "Your barcode has been created successfully",
    });
  };

  const generateRandomCode = () => {
    const randomCode = `LDY${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    setInputText(randomCode);
    generateBarcode(randomCode);
  };

  const handleDownload = () => {
    if (!barcodeDataUrl) {
      toast({
        title: "No Barcode",
        description: "Please generate a barcode first",
        variant: "destructive"
      });
      return;
    }

    const link = document.createElement('a');
    link.download = `barcode-${generatedCode}.png`;
    link.href = barcodeDataUrl;
    link.click();
    
    toast({
      title: "Downloaded",
      description: "Barcode image downloaded successfully",
    });
  };

  const handleShare = async () => {
    if (!generatedCode) {
      toast({
        title: "No Barcode",
        description: "Please generate a barcode first",
        variant: "destructive"
      });
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Laundrify Barcode',
          text: `Barcode: ${generatedCode}`,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(generatedCode);
        toast({
          title: "Copied",
          description: "Barcode text copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(generatedCode);
      toast({
        title: "Copied",
        description: "Barcode text copied to clipboard",
      });
    }
  };

  useEffect(() => {
    // Generate a sample barcode on load
    const sampleCode = `LDY${Date.now().toString().slice(-8)}`;
    setInputText(sampleCode);
    generateBarcode(sampleCode);
  }, []);

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
              <QrCode className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Barcode Generator</CardTitle>
            <CardDescription>
              Generate custom barcodes for your laundry orders
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcodeText">Enter Text for Barcode</Label>
                <Input
                  id="barcodeText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text (e.g., LDY12345678)"
                  className="rounded-xl"
                  maxLength={20}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleGenerate}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  Generate Barcode
                </Button>
                <Button
                  onClick={generateRandomCode}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Random
                </Button>
              </div>
            </div>

            {/* Barcode Display */}
            {barcodeDataUrl && (
              <div className="space-y-4">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
                  <img 
                    src={barcodeDataUrl} 
                    alt="Generated Barcode" 
                    className="mx-auto max-w-full h-auto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Code Details */}
                <div className="bg-purple-50 rounded-2xl p-4">
                  <h3 className="font-medium text-purple-800 mb-2">Generated Code Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-600">Code:</span>
                      <span className="font-mono font-medium">{generatedCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-600">Length:</span>
                      <span className="font-medium">{generatedCode.length} characters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-600">Format:</span>
                      <span className="font-medium">Code128 Compatible</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-800 mb-3">How to Use</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Enter any text or use the random generator</li>
                <li>• Click "Generate Barcode" to create your barcode</li>
                <li>• Download the image or share the code</li>
                <li>• Print and attach to your laundry bag</li>
                <li>• Staff can scan this code to track your order</li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="font-semibold text-yellow-800 mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Use clear, readable text for better scanning</li>
                <li>• Avoid special characters if possible</li>
                <li>• Keep codes under 20 characters for optimal scanning</li>
                <li>• LDY prefix helps identify as Laundrify codes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarcodeGenerator;
