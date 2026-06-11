import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl ${colorMap[color] || colorMap.indigo}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;