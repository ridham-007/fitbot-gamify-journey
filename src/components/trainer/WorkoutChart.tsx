
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface WorkoutData {
  date: string;
  duration: number;
  calories: number;
}

interface WorkoutChartProps {
  data: WorkoutData[];
  title: string;
}

// Custom tooltip component with improved styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-fitDark-800 p-3 border border-gray-200 dark:border-fitDark-700 rounded-md shadow-lg">
        <p className="font-bold text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-fitPurple-600 text-sm">
          <span className="inline-block w-3 h-3 bg-[#8884d8] mr-1 rounded-full"></span>
          Duration: {payload[0].value} mins
        </p>
        <p className="text-emerald-500 text-sm">
          <span className="inline-block w-3 h-3 bg-[#82ca9d] mr-1 rounded-full"></span>
          Calories: {payload[1].value}
        </p>
      </div>
    );
  }
  return null;
};

const WorkoutChart = ({ data, title }: WorkoutChartProps) => {
  // Animation variants for the chart container
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  // Process data to add missing days if needed
  const processedData = data.length > 0 ? data : [
    { date: 'Mon', duration: 0, calories: 0 },
    { date: 'Tue', duration: 0, calories: 0 },
    { date: 'Wed', duration: 0, calories: 0 },
    { date: 'Thu', duration: 0, calories: 0 },
    { date: 'Fri', duration: 0, calories: 0 },
    { date: 'Sat', duration: 0, calories: 0 },
    { date: 'Sun', duration: 0, calories: 0 }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="workout-chart-container"
    >
      <Card className="overflow-hidden border-gray-200 dark:border-fitDark-700 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-fitPurple-50 to-white dark:from-fitDark-800 dark:to-fitDark-900 pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="bg-fitPurple-100 dark:bg-fitPurple-900 p-1 rounded text-fitPurple-600 dark:text-fitPurple-300">
              📊
            </span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={processedData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                barGap={0}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-fitDark-700" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left" 
                  stroke="#8884d8"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8884d8', fontSize: 12 }}
                  tickFormatter={(value) => `${value}m`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right" 
                  stroke="#82ca9d"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#82ca9d', fontSize: 12 }}
                  tickFormatter={(value) => `${value}cal`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="duration" 
                  fill="#8884d8" 
                  name="Duration (min)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="calories" 
                  fill="#82ca9d" 
                  name="Calories" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <motion.div 
            className="text-center text-xs text-gray-500 mt-2 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Hover over bars for details • Click legend to toggle visibility
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WorkoutChart;
