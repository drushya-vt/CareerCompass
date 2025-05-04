"use client"
import Header from "@/components/Header";
import TableauEmbed from "@/components/TableauEmbed";


export default function DataVisualizationPage() {
  return (
    <main className="p-10 bg-gray-50">
      <Header/>
      <h1 className="mt-20 text-3xl font-bold mb-6 text-center text-blue-800">
        📊 Career Data Dashboard
      </h1>
      <TableauEmbed
        id="overviewTableauDashboard"
        name="Overview_17458637669160/Overview2"
        className="rounded-xl shadow w-full h-[85vh] md:h-[90vh] lg:h-screen mt-10"
      />
    </main>
  );
}
