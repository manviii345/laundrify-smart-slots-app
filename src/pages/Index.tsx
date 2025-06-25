
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Users, UserCheck, Clock, QrCode, Truck, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      title: "No Waiting Queues",
      description: "Book your slot and get notified when it's ready"
    },
    {
      icon: <QrCode className="h-8 w-8 text-purple-600" />,
      title: "QR Code Tracking",
      description: "Unique barcode for every laundry order"
    },
    {
      icon: <Truck className="h-8 w-8 text-purple-600" />,
      title: "Pickup & Drop",
      description: "Schedule convenient pickup and delivery times"
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Free for Students",
      description: "No payment required - vendor monetized service"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">Laundrify</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">How it Works</a>
            <a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-100">
            🎓 Made for Students
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Hassle-Free
            <span className="text-purple-600"> Laundry</span>
            <br />for Hostel Life
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Book slots, track your laundry with QR codes, and get pickup/drop services. 
            No queues, no payments - just clean clothes when you need them.
          </p>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-purple-300"
              onClick={() => navigate('/student-login')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">I'm a Student</CardTitle>
                <CardDescription>
                  Book laundry slots and track your orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 rounded-full">
                  Continue as Student
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-purple-300"
              onClick={() => navigate('/admin-login')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Admin/Staff</CardTitle>
                <CardDescription>
                  Manage orders and track laundry operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full">
                  Admin Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Laundrify?</h2>
            <p className="text-xl text-gray-600">Built specifically for hostel students' laundry needs</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 rounded-2xl">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-purple-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get your laundry done</p>
          </div>

          <div className="space-y-8">
            {[
              { step: 1, title: "Book a Slot", desc: "Choose your preferred time slot and laundry type" },
              { step: 2, title: "Get QR Code", desc: "Receive a unique barcode for your laundry order" },
              { step: 3, title: "Schedule Pickup", desc: "Set pickup time or drop at the laundry center" },
              { step: 4, title: "Track Progress", desc: "Monitor washing, drying, and completion status" },
              { step: 5, title: "Delivery", desc: "Get your clean laundry delivered back to you" }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Started Today</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students already using Laundrify for their laundry needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 rounded-full px-8"
              onClick={() => navigate('/student-login')}
            >
              <Phone className="mr-2 h-5 w-5" />
              Start Booking Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full px-8"
              onClick={() => navigate('/admin-login')}
            >
              Admin Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="text-xl font-bold">Laundrify</span>
          </div>
          <p className="text-gray-400 mb-4">Making hostel laundry simple and efficient</p>
          <p className="text-sm text-gray-500">© 2024 Laundrify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
