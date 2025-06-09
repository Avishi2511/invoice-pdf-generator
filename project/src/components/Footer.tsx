import React from 'react';
import { FileText } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">InvoicePro</span>
          </div>

          {/* Copyright */}
          <div className="text-gray-400 text-center md:text-right">
            <p>&copy; 2025 Invoice PDF Generator. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;