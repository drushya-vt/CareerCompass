"use client";

import Head from "next/head";
import TableauEmbed from "@/components/TableauEmbed";
import Header from "@/components/Header";

export default function EmploymentTypePage() {
  return (
    <div className="mt-20">
    <Header/>
      <Head>
        <title>Employment Type</title>
      </Head>
      <main className="w-full min-h-screen bg-gray-50 text-gray-800 py-10 px-4 md:px-8 lg:px-16">
        {/* Introduction */}
        <div className="max-w-screen-xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6 text-blue-800">
          Employment Type
        </h1>
        <p className="text-lg mb-4">
          When exploring potential career paths, one of the most important questions to ask is: how many people are actually working in this field? Understanding which occupations employ the most people, and how that employment is distributed across industries and job types, can provide valuable insight into job market demand, accessibility, and growth potential.
        </p>
        <p className="text-lg mb-8">
          In this section, we will explore employment trends using the 2023 release of the Occupational Employment and Wage Statistics dataset from the U.S. Bureau of Labor Statistics. Rather than focusing on how much jobs pay, this page focuses on how many people work in different roles, which industries dominate the workforce, and what types of jobs offer the greatest opportunities in terms of scale and reach.
        </p>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">Most Common Jobs in America</h2>
            <p className="mb-4">
              One of the most revealing ways to understand the U.S. workforce is to
              look at which specific occupations employ the most people. The
              horizontal bar chart below presents the top 20 occupations by total
              employment in 2023.
            </p>
              <TableauEmbed
                id="viz1746277028133"
                name="Top20OccupationsbyEmployment/Dashboard1"
                className="w-full max-w-screen-lg h-48 rounded-xl shadow-lg"
              />
            <p className="text-sm text-gray-500">
              Fig. 1 Top 20 Occupations by Total Employment
            </p>
          </section>

          {/* In-Demand & High-Paying */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">
              In-Demand & High-Paying Jobs
            </h2>
            <p className="mb-4">
              This scatter plot visualizes the relationship between total
              employment and median annual salary. Each bubble represents an
              occupation, showing employment vs pay.
            </p>
              <TableauEmbed
                id="viz1746277218631"
                name="ScatterPlot-EmploymentvsSalary/Dashboard2"
                className="w-full max-w-screen-lg h-48 rounded-xl shadow-lg"
              />
            <p className="text-sm text-gray-500">
              Fig. 2 Scatter Plot - Salary vs Employment Type
            </p>
          </section>

          {/* Treemap Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">
              Size Meets Salary: Treemap Overview
            </h2>
            <p className="mb-4">
              A treemap encoding both employment size and salary via area and
              color, revealing which roles balance demand and pay.
            </p>
              <TableauEmbed
                id="viz1746277249777"
                name="TreemapofTop30byEmploymentandSalary/Dashboard3"
                className="w-full max-w-screen-lg h-48 rounded-xl shadow-lg"
              />
            <p className="text-sm text-gray-500">
              Fig. 3 Treemap – Top 30 Occupations by Employment & Salary
            </p>
          </section>

          {/* Top Earners */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">Who Earns the Most?</h2>
            <p className="mb-4">
              The bar chart below highlights the top 30 occupations by median
              salary, showing the pinnacle of earning potential.
            </p>
              <TableauEmbed
                id="viz1746277276382"
                name="Top30OccupationsbySalary/Dashboard4"
                className="w-full max-w-screen-lg h-48 rounded-xl shadow-lg"
              />
            <p className="text-sm text-gray-500">
              Fig. 4 Top 30 Highest Paying Occupations
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}