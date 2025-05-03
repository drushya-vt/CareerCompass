"use client";

import Head from "next/head";
import TableauEmbed from "./TableauEmbed";

export default function WagesInAmerica() {
  return (
    <>
      <Head>
        <title>Wages in America</title>
      </Head>
      <main className="w-full min-h-screen bg-gray-50 text-gray-800 py-10 px-4 md:px-8 lg:px-16">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6 text-blue-800">
            Wages in America
          </h1>

          <p className="text-lg mb-4">
            One factor to consider when selecting a career is how much you will earn in that job.
            In this data story, we’ll use wage data from the 2024 release of the Occupational Employment
            and Wage Statistics Tables from the U.S. Bureau of Labor Statistics to explore how earnings vary
            across states, major occupation groups, and individual jobs.
          </p>
          <p className="text-lg mb-8">
            The wage data is from 2023 and represents the <strong>median annual wage</strong> — not the average —
            offering a more realistic view of earnings. Wages are capped at <strong>$239,200</strong>,
            so higher values may not be shown precisely.
          </p>

          {/* Section: Overall */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">Overall</h2>
            <p className="mb-4">
              At the national level, wages vary significantly. Some Americans earn under $30,000 annually,
              while others make six figures or more.
            </p>
            <TableauEmbed
              id="viz1745886677094"
              name="Salary-1_17457933491730/WageHist"
              className="rounded-xl shadow"
            />
          </section>

          {/* Section: By State */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">By State</h2>
            <p className="mb-4">
              Geography plays a major role in wages. States with high costs of living—California,
              New York, and Massachusetts—typically offer higher wages.
            </p>
            <TableauEmbed
              id="viz1745886846618"
              name="Salary-2_17457934519330/Dashboard5"
              className="rounded-xl shadow"
            />
          </section>

          {/* Section: By Major Occupation Group */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">By Major Occupation Group</h2>
            <p className="mb-4">
              Different industries offer different levels of compensation. For instance, legal jobs are fewer
              but generally high-paying, while production roles are more numerous with varied wages.
            </p>
            <TableauEmbed
              id="viz1745886913767"
              name="Salary-3/Dashboard6"
              className="rounded-xl shadow"
            />
          </section>

          {/* Section: By Detailed Occupation */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">By Detailed Occupation</h2>
            <p className="mb-4">
              Even within the same group, roles vary. For example, surgeons earn far more than EMTs or
              physical therapists. Similarly, professors out-earn preschool teachers.
            </p>
            <TableauEmbed
              id="viz1745887568216"
              name="Salary-6/Dashboard8"
              className="rounded-xl shadow"
            />
          </section>

          {/* Key Takeaways */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Key Takeaways</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Location matters:</strong> Local economies affect earning potential.</li>
              <li><strong>Industry is key:</strong> Some fields consistently pay more regardless of region.</li>
              <li><strong>Job title matters most:</strong> Responsibility and specialization significantly impact wages.</li>
              <li>Always consider other factors like interests, work-life balance, and job satisfaction too.</li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
