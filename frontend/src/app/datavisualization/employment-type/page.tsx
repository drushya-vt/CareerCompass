"use client";

import Head from "next/head";
import TableauEmbed from "@/components/TableauEmbed";

export default function EmploymentTypePage() {
  return (
    <>
      <Head>
        <title>Employment Type</title>
      </Head>
      <main className="w-full min-h-screen bg-gray-50 text-gray-800 py-10 px-4 md:px-8 lg:px-16 space-y-12">
        {/* Introduction */}
        <section className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl font-extrabold text-blue-800">
            Employment Type
          </h1>
          <p>
            When exploring potential career paths, one of the most important
            questions to ask is: how many people are actually working in this
            field? Understanding which occupations employ the most people, and
            how that employment is distributed across industries and job types,
            can provide valuable insight into job market demand, accessibility,
            and growth potential.
          </p>
          <p>
            In this section, we will explore employment trends using the 2023
            release of the Occupational Employment and Wage Statistics dataset
            from the U.S. Bureau of Labor Statistics. Rather than focusing on
            how much jobs pay, this page focuses on how many people work in
            different roles, which industries dominate the workforce, and what
            types of jobs offer the greatest opportunities in terms of scale and
            reach.
          </p>
        </section>

        {/* Most Common Jobs */}
        <section className="max-w-screen-lg mx-auto space-y-4">
          <h2 className="text-2xl font-semibold">Most Common Jobs in America</h2>
          <p className="text-gray-600">
            One of the most revealing ways to understand the U.S. workforce is to
            look at which specific occupations employ the most people. The
            horizontal bar chart below presents the top 20 occupations by total
            employment in 2023.
          </p>
          <TableauEmbed
            id="viz1746277028133"
            name="Top20OccupationsbyEmployment/Dashboard1"
            className="rounded-xl shadow"
          />
          <p className="text-sm text-gray-500">
            Fig. 1 Top 20 Occupations by Total Employment
          </p>
        </section>

        {/* In-Demand & High-Paying */}
        <section className="max-w-screen-lg mx-auto space-y-4">
          <h2 className="text-2xl font-semibold">
            In-Demand & High-Paying Jobs
          </h2>
          <p className="text-gray-600">
            This scatter plot visualizes the relationship between total
            employment and median annual salary. Each bubble represents an
            occupation, showing employment vs pay.
          </p>
          <TableauEmbed
            id="viz1746277218631"
            name="ScatterPlot-EmploymentvsSalary/Dashboard2"
            className="rounded-xl shadow"
          />
          <p className="text-sm text-gray-500">
            Fig. 2 Scatter Plot – Salary vs Employment Type
          </p>
        </section>

        {/* Treemap Overview */}
        <section className="max-w-screen-lg mx-auto space-y-4">
          <h2 className="text-2xl font-semibold">
            Size Meets Salary: Treemap Overview
          </h2>
          <p className="text-gray-600">
            A treemap encoding both employment size and salary via area and
            color, revealing which roles balance demand and pay.
          </p>
          <TableauEmbed
            id="viz1746277249777"
            name="TreemapofTop30byEmploymentandSalary/Dashboard3"
            className="rounded-xl shadow"
          />
          <p className="text-sm text-gray-500">
            Fig. 3 Treemap – Top 30 Occupations by Employment & Salary
          </p>
        </section>

        {/* Top Earners */}
        <section className="max-w-screen-lg mx-auto space-y-4">
          <h2 className="text-2xl font-semibold">Who Earns the Most?</h2>
          <p className="text-gray-600">
            The bar chart below highlights the top 30 occupations by median
            salary, showing the pinnacle of earning potential.
          </p>
          <TableauEmbed
            id="viz1746277276382"
            name="Top30OccupationsbySalary/Dashboard4"
            className="rounded-xl shadow"
          />
          <p className="text-sm text-gray-500">
            Fig. 4 Top 30 Highest Paying Occupations
          </p>
        </section>
      </main>
    </>
  );
}