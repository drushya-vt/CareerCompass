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
        When exploring potential career paths, one of the most important questions to ask is: how many people are actually working in this field?
        Understanding which occupations employ the most people, and how that employment is distributed across industries and job types, can
        provide valuable insight into job market demand, accessibility, and growth potential.
        In this section, we will explore employment trends using the 2023 release of the Occupational Employment and Wage Statistics dataset
        from the U.S. Bureau of Labor Statistics. Rather than focusing on how much jobs pay, this page focuses on how many people work in
        different roles, which industries dominate the workforce, and what types of jobs offer the greatest opportunities in terms of scale and reach.
        Using a series of visualizations, we’ll dive into employment numbers by occupation, highlight differences across job groups, and uncover
        patterns that can inform career decisions, workforce planning, and policy-making.
        </p>
        <p className="text-lg mb-8">
          In this section, we will explore employment trends using the 2023 release of the Occupational Employment and Wage Statistics dataset from the U.S. Bureau of Labor Statistics. Rather than focusing on how much jobs pay, this page focuses on how many people work in different roles, which industries dominate the workforce, and what types of jobs offer the greatest opportunities in terms of scale and reach.
        </p>
          <section className="mb-12 p-6">
            <h2 className="text-2xl font-semibold mb-2">Most Common Jobs in America</h2>
            <p className="mb-4 p-3">
            One of the most revealing ways to understand the U.S. workforce is to look at which specific occupations employ the most people. The
            horizontal bar chart above presents the top 20 occupations by total employment in 2023, showing how the workforce is concentrated
            across roles that are essential, accessible, and widespread.
            Unsurprisingly, many of these highly populated jobs fall within food service, office administration, transportation, and healthcare support.
            Positions such as retail salespersons, fast food workers, and office clerks are among the most common across the country. These roles
            are often found in virtually every city and town and typically require lower formal educational credentials, making them more accessible to
            a broad population.
            What this chart makes clear is that a large portion of the U.S. labor force is concentrated in a handful of job titles. These roles may not
            always be the highest-paying, but they are foundational to everyday life and are often crucial entry points into the job market. Recognizing
            this helps us better understand where job opportunities are most abundant and which sectors serve as the backbone of employment in
            America.
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
          <section className="mb-12 p-6">
            <h2 className="text-2xl font-semibold mb-2">
              In-Demand & High-Paying Jobs
            </h2>
            <p className="mb-4 p-3">
            The scatter plot above visualizes the relationship between total employment and annual median salary across various occupations. Each
            point represents a distinct occupation, with its horizontal position indicating the number of people employed in that role, and the vertical
            position reflecting its median annual wage. The size and color intensity of each bubble correspond to employment levels and salary
            brackets respectively, adding a multi-dimensional view to the analysis.
            A quick glance reveals a dense cluster of occupations with high employment but relatively modest salaries concentrated in the lower-left
            quadrant. These are roles that are essential to the economy—such as retail, food service, and clerical positions—but often lack
            competitive compensation. On the opposite end, high-paying occupations like specialized physicians, executives, and tech managers are
            positioned higher up on the chart, though they employ fewer people. These roles highlight the trade-off between job prevalence and salary
            potential.
            Interestingly, a few standout occupations manage to strike a balance—falling above the average salary line while also having substantial
            employment numbers. These are the sweet spots in the job market: roles that are both lucrative and widely available. The inclusion of
            average lines for both salary and employment helps contextualize each point, offering a benchmark for understanding where different
            occupations stand in terms of value and volume.
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
          <section className="mb-12 p-6">
            <h2 className="text-2xl font-semibold mb-2">
              Size Meets Salary: Treemap Overview
            </h2>
            <p className="mb-4 p-3">
            This treemap visualization offers a compact yet powerful snapshot of the top 30 occupations in the U.S. based on their employment size,
            while simultaneously encoding salary data through color. Each rectangle represents a distinct occupation, with the area sized by the
            number of employed individuals and the color gradient indicating the annual median wage—darker hues representing higher-paying roles.
            The layout clearly highlights that healthcare and legal professions, such as Physicians, Nurse Anesthetists, and Lawyers, tend to occupy
            larger blocks with deeper shades, signaling both high employment and lucrative salaries. In contrast, roles in fields like Public Relations or
            Marketing and Sales show moderate employment but slightly lighter shades, reflecting mid-range wages.
            This dual-encoded view allows viewers to quickly identify jobs that strike a balance between high demand and strong compensation, as
            well as those that may be widely held but not as financially rewarding. It’s an excellent way to explore the labor market’s landscape
            holistically—where size meets salary.
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
          <section className="mb-12 p-6">
            <h2 className="text-2xl font-semibold mb-2">Who Earns the Most?</h2>
            <p className="mb-4 p-3">
            This horizontal bar chart highlights the 30 occupations with the highest average median salaries across the United States in 2023. The
            chart ranks job titles in descending order based on their median annual wage, offering a clear and concise look at the most lucrative roles
            in the labor market.
            Unsurprisingly, roles in healthcare, legal, and executive leadership dominate the top of the list. Occupations such as Anesthesiologists,
            Surgeons, and Chief Executives boast some of the highest median earnings, often exceeding $200,000 annually. These positions typically
            require extensive education, licensing, and years of experience, which justifies their compensation.
            This visualization serves as a straightforward guide for understanding which professions lead in salary potential. While these roles may not
            represent the largest portion of the workforce, they often come with greater responsibilities, higher skill requirements, and critical decision-
            making power. For job seekers prioritizing income, this chart offers valuable insight into the pinnacle of earning potential.
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
          <section className="mb-12 p-6">
            <h2 className="text-2xl font-semibold mb-2">Conclusion</h2>
            <p className="mb-4 p-3">
            This analysis of U.S. employment data paints a detailed picture of the job landscape by blending wage insights with workforce scale. From
            the bar chart of the most populated occupations to the scatter plot of in-demand, high-paying roles, each visualization highlights the trade-
            offs between job availability and compensation.
            Occupations such as office administration and food services dominate in terms of total employment, but often fall on the lower end of the
            wage spectrum. In contrast, specialized roles in healthcare, law, and engineering consistently top the salary charts despite their relatively
            lower headcounts. This contrast reveals an important dynamic in the labor market: the most lucrative roles are often the most selective or
            skill-intensive.
            Whether you're a policymaker, job seeker, or workforce strategist, these insights help answer a key question—where are the jobs, and
            where's the money? Understanding the intersection of employment scale and salary can better inform career choices, education planning,
            and workforce development strategies.
            </p>
            </section>
        </div>
      </main>
    </div>
  );
}