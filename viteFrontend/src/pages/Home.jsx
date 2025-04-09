import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        🧳 Public Transit Lost & Found
      </h1>

      <div className="flex flex-col sm:flex-row gap-6">
        <button
          onClick={() => navigate('/report')}
          className="bg-blue-600 text-white px-6 py-3 rounded shadow-md hover:bg-blue-700 transition"
        >
          Report Lost Item
        </button>

        <button
          onClick={() => navigate('/upload')}
          className="bg-green-600 text-white px-6 py-3 rounded shadow-md hover:bg-green-700 transition"
        >
          Upload Found Item
        </button>
      </div>
    </div>
  );
}