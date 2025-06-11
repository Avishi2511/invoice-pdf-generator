import React from 'react';
import { Play, Check } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900 flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Effortlessly Create and
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              {' '}Manage PDF Invoices
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Streamline your invoicing process with automated PDF generation, secure storage, and real-time status updates
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50">
              Get Started Free
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
            </button>
            
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-8 text-gray-400">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Free Trial</span>
            </div>
          </div>
        </div>

        {/* Right Column - Hero Illustration */}
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm">Invoice Dashboard</span>
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-gray-600 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="h-20 bg-gradient-to-br from-purple-500/30 to-purple-700/30 rounded-lg flex items-center justify-center">
                    <span className="text-purple-300 text-sm font-medium">PDF Ready</span>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-blue-500/30 to-blue-700/30 rounded-lg flex items-center justify-center">
                    <span className="text-blue-300 text-sm font-medium">Auto-Generated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;