"use client";

import Link from "next/link";
import {
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function DataVisualizationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:400%_400%] py-16 px-6 text-white relative">
      {/* Hero Intro */}
      <section className="max-w-3xl mx-auto text-center mb-12">
        
        <div className="inline-flex items-center gap-3 justify-center">
          <h1 className="text-5xl font-extrabold text-white">Career Insights</h1>
        </div>
        <p className="mt-6 text-xl text-white/90 mb-4">
          Dive into interactive data stories—compare wages, explore employment trends,
          and uncover the skills powering tomorrow’s careers.
        </p>
      </section>

      {/* KPI Stat Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-screen-lg mx-auto mb-12">
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-md p-4 rounded-lg">
          <ChartBarIcon className="w-8 h-8 text-white mb-2" />
          <span className="text-lg font-semibold">$58,260</span>
          <span className="text-sm text-white/80">Avg. Median Wage</span>
        </div>
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-md p-4 rounded-lg">
          <UserGroupIcon className="w-8 h-8 text-white mb-2" />
          <span className="text-lg font-semibold">157M</span>
          <span className="text-sm text-white/80">Total Workforce</span>
        </div>
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-md p-4 rounded-lg">
          <ArrowTrendingUpIcon className="w-8 h-8 text-white mb-2" />
          <span className="text-lg font-semibold">+5.2%</span>
          <span className="text-sm text-white/80">Growth Rate</span>
        </div>
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-md p-4 rounded-lg">
          <BriefcaseIcon className="w-8 h-8 text-white mb-2" />
          <span className="text-lg font-semibold">Retail Sales</span>
          <span className="text-sm text-white/80">Top Job</span>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-screen-lg mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          href="/datavisualization/overview"
          className="group block bg-white/20 backdrop-blur-md rounded-2xl p-8 text-center hover:bg-white/30 transition-shadow shadow-lg max-w-xs mx-auto"
        >
          <SparklesIcon className="w-8 h-8 mx-auto mb-4 text-white" />
          <h2 className="text-2xl font-semibold text-white mb-2">
            Overview Dashboard
          </h2>
          <p className="text-white/80">
            Explore the high-level Career Data Dashboard overview.
          </p>
        </Link>
        <Link
          href="/datavisualization/wages"
          className="group block bg-white/20 backdrop-blur-md rounded-2xl p-8 text-center hover:bg-white/30 transition-shadow shadow-lg max-w-xs mx-auto"
        >
          <ChartBarIcon className="w-8 h-8 mx-auto mb-4 text-white" />
          <h2 className="text-2xl font-semibold text-white mb-2">
            Wages in America
          </h2>
          <p className="text-white/80">
            Explore median wages by state, occupation groups, and detailed roles.
          </p>
        </Link>
        <Link
          href="/datavisualization/employment-type"
          className="group block bg-white/20 backdrop-blur-md rounded-2xl p-8 text-center hover:bg-white/30 transition-shadow shadow-lg max-w-xs mx-auto"
        >
          <UserGroupIcon className="w-8 h-8 mx-auto mb-4 text-white" />
          <h2 className="text-2xl font-semibold text-white mb-2">
            Employment Trends
          </h2>
          <p className="text-white/80">
            See which occupations employ the most people and uncover workforce patterns.
          </p>
        </Link>
      </div>

      <div className="mt-16 text-center">
        <p className="text-base text-white/80 mb-4">
          Ready for personalized guidance? Our Chatbot can help interpret these insights—return now to continue your discussion.
        </p>
        <Link
          href="/chatbot"
          className="inline-block bg-white text-purple-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-white/90 transition"
        >
          Continue with Chatbot
        </Link>
      </div>
    </main>
  );
}
