import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
          Ready to streamline your
          <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            {' '}invoicing?
          </span>
        </h2>
        
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of users who trust our platform for their invoicing needs. Start your free trial today.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 flex items-center">
            Start Free Trial
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="text-gray-400">
            <div className="text-2xl font-bold text-white mb-2">10k+</div>
            <div>Active Users</div>
          </div>
          <div className="text-gray-400">
            <div className="text-2xl font-bold text-white mb-2">50k+</div>
            <div>Invoices Generated</div>
          </div>
          <div className="text-gray-400">
            <div className="text-2xl font-bold text-white mb-2">99.9%</div>
            <div>Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;