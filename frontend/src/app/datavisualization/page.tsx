import TableauEmbed from "@/components/TableauEmbed";

export default function DataVisualizationPage() {
  return (
    <main className="p-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
        📊 Career Data Dashboard
      </h1>
      <TableauEmbed />
    </main>
  );
}