export default function ReportsTab() {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-600">Reports</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Average Attendance</p>
          <p className="text-2xl font-bold">92%</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Chronic Absentees</p>
          <p className="text-2xl font-bold">3</p>
        </div>
      </div>
    </div>
  );
}
