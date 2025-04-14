
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Dumbbell, 
  Brain, 
  Trophy, 
  BarChart2, 
  User, 
  ChevronRight
} from 'lucide-react';

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-fitPurple-100 via-white to-fitGreen-50 dark:from-fitDark-950 dark:via-fitDark-900 dark:to-fitDark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-10 pb-10 md:pb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-fitDark-900 dark:text-white mb-6 leading-tight animate-slide-down">
                Level Up Your <span className="text-fitPurple-600">Fitness</span> Journey
              </h1>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 animate-slide-down" style={{ animationDelay: '0.1s' }}>
                Meet your AI fitness trainer that gamifies your workouts. 
                Earn XP, unlock achievements, and compete on leaderboards while getting fitter.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-down" style={{ animationDelay: '0.2s' }}>
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Start Your Journey
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative mx-auto w-full max-w-md">
                <div className="aspect-video bg-fitPurple-600 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center">
                  <div className="text-white text-center px-8">
                    <Dumbbell className="mx-auto h-12 w-12 mb-4 animate-pulse-scale" />
                    <p className="text-xl font-semibold">AI Fitness Trainer</p>
                    <p className="mt-2 text-sm opacity-80">Interactive demo image placeholder</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white dark:bg-fitDark-800 rounded-full p-3 shadow-lg animate-pulse-scale">
                  <div className="bg-fitGreen-500 rounded-full w-16 h-16 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-fitDark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-fitDark-900 dark:text-white mb-4">
              Train Smarter, Not Harder
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              FitBot combines artificial intelligence with gamification to make your fitness journey more effective and fun.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-fitDark-700">
              <div className="w-12 h-12 bg-fitPurple-100 dark:bg-fitPurple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-fitPurple-600 dark:text-fitPurple-400" />
              </div>
              <h3 className="text-xl font-semibold text-fitDark-900 dark:text-white mb-2">
                AI Smart Trainer
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get personalized workout plans created by our AI that adapts to your progress, goals, and available equipment.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-fitDark-700">
              <div className="w-12 h-12 bg-fitPurple-100 dark:bg-fitPurple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-fitPurple-600 dark:text-fitPurple-400" />
              </div>
              <h3 className="text-xl font-semibold text-fitDark-900 dark:text-white mb-2">
                Gamified Experience
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Earn XP, level up, unlock achievements, and compete on leaderboards to stay motivated and consistent.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-fitDark-700">
              <div className="w-12 h-12 bg-fitPurple-100 dark:bg-fitPurple-900/30 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-fitPurple-600 dark:text-fitPurple-400" />
              </div>
              <h3 className="text-xl font-semibold text-fitDark-900 dark:text-white mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize your fitness journey with intuitive charts and metrics that show your improvement over time.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-fitDark-700">
              <div className="w-12 h-12 bg-fitPurple-100 dark:bg-fitPurple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-fitPurple-600 dark:text-fitPurple-400" />
              </div>
              <h3 className="text-xl font-semibold text-fitDark-900 dark:text-white mb-2">
                Daily Workout Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get a structured daily workout program that keeps you on track with your fitness goals and celebrates your consistency.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-fitDark-700">
              <div className="w-12 h-12 bg-fitPurple-100 dark:bg-fitPurple-900/30 rounded-lg flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-fitPurple-600 dark:text-fitPurple-400" />
              </div>
              <h3 className="text-xl font-semibold text-fitDark-900 dark:text-white mb-2">
                Personalized Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your fitness level, achievements, and milestones in your custom profile that showcases your progress.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-fitDark-700">
              <div className="w-12 h-12 bg-fitPurple-100 dark:bg-fitPurple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-fitPurple-600 dark:text-fitPurple-400" />
              </div>
              <h3 className="text-xl font-semibold text-fitDark-900 dark:text-white mb-2">
                Challenges & Quests
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take on time-limited challenges and quests to earn bonus rewards and push yourself to new fitness heights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-fitDark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-fitDark-900 dark:text-white mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See how FitBot has helped people transform their fitness journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-fitDark-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-fitPurple-100 dark:bg-fitPurple-900 rounded-full flex items-center justify-center text-fitPurple-600 dark:text-fitPurple-300 font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-fitDark-900 dark:text-white">
                    John Doe
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Level 24 Fitness Warrior
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "The gamification aspect of FitBot kept me motivated like nothing else. I've lost 15 pounds and gained so much energy!"
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-fitDark-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-fitPurple-100 dark:bg-fitPurple-900 rounded-full flex items-center justify-center text-fitPurple-600 dark:text-fitPurple-300 font-bold">
                  JS
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-fitDark-900 dark:text-white">
                    Jane Smith
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Level 32 Cardio Queen
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "The AI trainer understood exactly what I needed. My marathon time improved by 15 minutes after following the custom plan!"
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-fitDark-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-fitPurple-100 dark:bg-fitPurple-900 rounded-full flex items-center justify-center text-fitPurple-600 dark:text-fitPurple-300 font-bold">
                  MB
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-fitDark-900 dark:text-white">
                    Mike Brown
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Level 18 Strength Builder
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Competing on the leaderboard with my friends keeps me accountable. I've never stuck with a fitness program this long!"
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-fitPurple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-lg text-fitPurple-100 max-w-3xl mx-auto mb-8">
            Join FitBot today and experience the perfect blend of AI-powered workouts and gamification.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start For Free
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
