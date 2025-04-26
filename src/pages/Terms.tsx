
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Terms = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using FitBot, you agree to be bound by these Terms of Service
            and all applicable laws and regulations.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            FitBot provides an AI-powered fitness platform with workout planning,
            progress tracking, and gamification features. We reserve the right to
            modify or discontinue any aspect of the service at any time.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You must create an account to use our services. You are responsible for:
          </p>
          <ul>
            <li>Maintaining account security</li>
            <li>All activities under your account</li>
            <li>Providing accurate information</li>
            <li>Notifying us of unauthorized access</li>
          </ul>

          <h2>4. Subscription and Payments</h2>
          <p>
            Paid features require a subscription. By subscribing, you agree to:
          </p>
          <ul>
            <li>Pay all applicable fees</li>
            <li>Automatic renewal unless cancelled</li>
            <li>Our refund policy</li>
          </ul>

          <h2>5. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on others' rights</li>
            <li>Share inappropriate content</li>
            <li>Attempt to breach security measures</li>
          </ul>

          <h2>6. Limitation of Liability</h2>
          <p>
            FitBot is provided "as is" without warranties. We are not liable for
            any damages arising from your use of the service.
          </p>

          <h2>7. Changes to Terms</h2>
          <p>
            We may modify these terms at any time. Continued use of the service
            constitutes acceptance of new terms.
          </p>

          <h2>8. Contact</h2>
          <p>
            For questions about these terms, please contact us at legal@fitbot.com.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;
