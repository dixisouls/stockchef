import React from 'react';

const App: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-6 bg-white shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🚀 React + TypeScript + Tailwind v2
        </h1>
        <p className="text-gray-600">
          Your frontend is ready. Start building something cool!
        </p>
      </div>
    </div>
  );
};

export default App;