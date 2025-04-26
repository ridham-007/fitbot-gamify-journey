
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ContactForm from '@/components/contact/ContactForm';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a question or need assistance? We're here to help! Fill out the form below
            and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-fitPurple-500" />
                  <span>support@fitbot.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-fitPurple-500" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-fitPurple-500" />
                  <span>123 Fitness Street, Health City, 12345</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">Response Time</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We typically respond within 24 hours during business days. 
                For urgent matters, please contact us directly via phone.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-fitDark-800 rounded-lg p-6 shadow-lg">
            <ContactForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
