
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Brain, Dumbbell, Trophy, BarChart2, Users, Star } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Smart Trainer",
      description: "Get personalized workout plans created by our advanced AI that adapts to your progress and goals."
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Turn your fitness journey into an exciting game with XP, achievements, and unique challenges."
    },
    {
      icon: BarChart2,
      title: "Progress Tracking",
      description: "Visualize your improvements with detailed analytics and progress tracking tools."
    },
    {
      icon: Dumbbell,
      title: "Custom Workouts",
      description: "Create and save your own workout routines or use AI-generated ones based on your preferences."
    },
    {
      icon: Users,
      title: "Community Challenges",
      description: "Join group challenges and compete with others to stay motivated and accountable."
    },
    {
      icon: Star,
      title: "Achievement System",
      description: "Unlock badges and rewards as you hit milestones in your fitness journey."
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-fitPurple-100 via-white to-fitGreen-50 dark:from-fitDark-950 dark:via-fitDark-900 dark:to-fitDark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transform Your Fitness Journey
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Discover how FitBot combines artificial intelligence with gamification to make your workouts more effective and enjoyable.
            </p>
            <Link to="/signup">
              <Button size="lg" className="mx-auto">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-fitDark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-fitPurple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-fitPurple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-lg mb-8 text-fitPurple-100">
            Join thousands of users who have already revolutionized their workout routine with FitBot.
          </p>
          <Link to="/signup">
            <Button variant="secondary" size="lg">
              Get Started For Free
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default Features;
