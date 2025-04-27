import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Smile, Trophy, Users } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Passion for Fitness",
      description: "We believe in making fitness accessible and enjoyable for everyone."
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Your data privacy and security are our top priorities."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a supportive community that motivates and inspires."
    },
    {
      icon: Trophy,
      title: "Achievement Driven",
      description: "Celebrating every milestone in your fitness journey."
    },
    {
      icon: Smile,
      title: "User Experience",
      description: "Creating an intuitive and enjoyable platform for all users."
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-fitPurple-100 via-white to-fitGreen-50 dark:from-fitDark-950 dark:via-fitDark-900 dark:to-fitDark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Our Mission
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            We're on a mission to revolutionize fitness by combining artificial intelligence with gamification, making workouts more engaging and effective for everyone through BubblyFit AI.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-fitDark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
              >
                <value.icon className="w-12 h-12 text-fitPurple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50 dark:bg-fitDark-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Story</h2>
          <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400">
            <p>
              BubblyFit AI was born from a simple observation: traditional fitness apps weren't engaging enough to keep users motivated long-term. We saw an opportunity to combine the power of AI with gamification to create something truly unique.
            </p>
            <p>
              Starting in 2024, our team of fitness enthusiasts, AI experts, and game designers came together to build a platform that makes fitness fun and accessible to everyone.
            </p>
            <p>
              Today, we're proud to help thousands of users achieve their fitness goals while having fun along the way. But this is just the beginning of our journey.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-fitPurple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Join BubblyFit AI's Fitness Revolution
          </h2>
          <p className="text-lg mb-8 text-fitPurple-100">
            Be part of a community that's transforming the way people approach fitness.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button variant="secondary" size="lg">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default About;
