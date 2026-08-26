import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SalesChart = ({ monthlySales }) => {
  const formattedData = (monthlySales || []).map(item => ({
    name: `${monthNames[item._id.month - 1]} '${String(item._id.year).slice(2)}`,
    Sales: item.sales
  }));

  if (formattedData.length === 0) {
    return (
      <div className="card-saas p-6 flex flex-col justify-center items-center h-64 text-surface-400 font-medium">
        <p className="text-xs">No monthly sales data recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="card-saas p-6 shadow-premium">
      <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider mb-4 font-display">📈 Monthly Sales Trends</h4>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              formatter={(value) => [`₹${value}`, 'Sales Revenue']}
            />
            <Bar dataKey="Sales" fill="#059669" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
