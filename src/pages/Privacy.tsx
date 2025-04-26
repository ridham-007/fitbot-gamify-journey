
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Privacy = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to FitBot. We respect your privacy and are committed to protecting your personal data.
            This privacy policy explains how we collect, use, and protect your information when you use our service.
          </p>

          <h2>2. Data We Collect</h2>
          <p>We collect and process the following information:</p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Profile information (fitness goals, experience level)</li>
            <li>Workout data and progress</li>
            <li>Usage data and analytics</li>
            <li>Payment information (processed securely by Stripe)</li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Personalize your workout experience</li>
            <li>Process payments and maintain your subscription</li>
            <li>Send important updates and notifications</li>
            <li>Analyze and improve our platform</li>
          </ul>

          <h2>4. Data Protection</h2>
          <p>
            We implement appropriate security measures to protect your personal data against unauthorized access,
            alteration, disclosure, or destruction.
          </p>

          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Export your data</li>
          </ul>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices,
            please contact us at privacy@fitbot.com.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
