"use client";

import Head from "next/head";
import TableauEmbed from "./TableauEmbed";

export default function WagesInAmerica() {
  return (
    <div className="mt-20">
      <Head>
        <title>Wages in America</title>
      </Head>
      <main className="w-full min-h-screen bg-gray-50 text-gray-800 py-10 px-4 md:px-8 lg:px-16">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6 text-blue-800">
            Wages in America
          </h1>

          <p className="text-lg mb-4">
            One factor to consider when selecting a career is how much you will earn in that job. In this data story, we’ll use wage data from the 2024 release of the Occupational Employment and Wage Statistics Tables from the U.S. Bureau of Labor Statistics to explore how earnings vary across states, major occupation groups, and individual jobs.
          </p>
          <p className="text-lg mb-8">
            The wage data is from 2023 and the values for wages are the median annual wage, meaning that it is the middle value not the average. This doesn’t allow the small number of extremely high earners to skew the value, giving a realistic view of earnings. The wages are capped at $239,200, so any profession with this threshold has a median wage equal to or above this value but it is unknown the exact value.
          </p>

          {/* Section: Overall */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">Overall</h2>
            <p className="mb-4 p-3">
              At the national level, wages paint a wide and varied picture. Some Americans earn less than $30,000 annually, while others bring home six figures or more. The distribution of wages across the U.S. shows how skills, education, and demand influence income.
            </p>
            <TableauEmbed
              id="viz1745886677094"
              name="Salary-1_17457933491730/WageHist"
              className="rounded-xl shadow"
            />
            <p className="mb-4 p-3">
              The majority of jobs have median annual wages between $30k and $70k but we can see that there are still a lot of jobs that range from over $70k all the way to the jobs that are at the capped value of $239k.
            </p>
          </section>

          {/* Section: By State */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">By State</h2>
            <p className="mb-4 p-3">
              Geography plays a major role in wages. States with high costs of living -  California, New York, and Massachusetts - often have higher average wages to support those costs. Meanwhile, more rural or states with smaller economies may see lower earnings.
            </p>
            <TableauEmbed
              id="viz1745886846618"
              name="Salary-2_17457934519330/Dashboard5"
              className="rounded-xl shadow"
            />
            <p className="mb-4 p-3">
              These values are across all industries - and don’t take into account that some industries in certain states may do better or worse than national average. The Northeast and the West Coast have the highest average median annual wages around $70,000. Hawaii and Alaska also have high median annual wage averaged across jobs which is likely due to the high cost of living and remoteness. The states with the lowest average wages are Mississippi, Louisiana, and West Virginia.
            </p>
          </section>

          {/* Section: By Major Occupation Group */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">By Major Occupation Group</h2>
            <p className="mb-4 p-3">
              Before looking at individual jobs, we can look at major occupation group which relates to the overall industry. Major occupation group reveals how different industries compare in compensation. This a list of the major occupation groups with the number of jobs that are within each group. This can vary a lot from Legal having only 8 distinct jobs, while Production has 105 professions in that group.
            </p>

            <TableauEmbed
              id="viz1745886913767"
              name="Salary-3/Dashboard6"
              className="rounded-xl shadow"
            />
          </section>
          <p className="mb-4 p-3">
            The occupation groups with the highest average median annual wage are management, computer and math, and legal occupations. These reflect additional years of education or experience and in-demand skills. On the opposite end are industries such as food preparation and personal care and services which many jobs don’t require college degrees.
          </p>
          <section className="mb-12">
            <TableauEmbed
              id="viz1745887007346"
              name="Salary-4/Wage"
              className="rounded-xl shadow"
            />
            <p className="mb-4 p-3">
              However, there is still nuance within many of these major occupation groups where there can be significantly different annual wages depending on the exact job within the group. That is where we turn to the box plot where the distribution of the median wages can be seen. When looking at this chart, we can see that Healthcare Practitioners and Technical Occupations has many jobs above its median, whereas Computer and Mathematics Occupations has a high median annual wages but does not have as large of a spread of jobs. The spread is important to see if there is a lot of variability within the same major occupation group. It is also important to note the many outliers for occupation groups that have lower averages, for example the data point for Transportation and Material Moving that is well above $200k is airline pilots, copilots, and flight engineers. This goes to show that it is still important to look closer at the jobs within these major occupation because they can have very different annual wages, education requirements, and skill sets.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">Distribution of Wages Within Occupation Groups</h2>
            <p className="mb-4 p-3">
              Some occupation groups have wide wage ranges. This chart shows how much wage spread exists within each group.
              For example, airline pilots in Transportation earn much more than the group average, while Healthcare has a high number of jobs above its median.
            </p>
            <TableauEmbed
              id="viz1745887504083"
              name="Salary-5/Dashboard7"
              className="rounded-xl shadow"
            />
          </section>

          {/* Section: By Detailed Occupation */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">By Detailed Occupation</h2>
            <p className="mb-4 p-3">
              Within each major occupation group, annual wages can show surprising variation. Even roles within the same sub-field can differ drastically in annual wages.
              Take healthcare: Physicians and surgeons earn far more than physical therapists or paramedics. In education, college professors earn more than preschool teachers.
              These differences are direct influences of education, responsibility, and demand.
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
              <li>Location matters: Different states will pay the same job a different amount depending on the market. </li>
              <li>Industry matters more: While there is some decrease or increase depending on state, certain industries are naturally higher or lower paying which has much to do with skills and education. </li>
              <li>Job title is ultimately the deciding factor: At the end of the day, the exact path you take within a broad profession or field does make a difference in what you can expect to make. </li>
            </ul>
            <p className="mt-4">
              Understanding these layers can empower job seekers to make informed decisions and know what to expect. Wages are not the only factor to be taken into consideration when choosing a job to pursue or where to live, there are many other factors such as work-life balance, interests, skills, desired education level, where companies and industries are located that all play a part in deciding what careers to explore.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
