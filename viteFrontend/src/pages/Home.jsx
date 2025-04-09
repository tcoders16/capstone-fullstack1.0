import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 font-mono">
      <h1 className="text-5xl font-bold mb-6 text-black drop-shadow-neon text-center tracking-wide">
        🎮 Lost & Found AI Assistant
      </h1>

      <p className="text-gray-500 mb-12 text-center text-lg max-w-2xl">
        Your ultimate AI-powered tool for reuniting people with their lost items in public transit.
      </p>

      <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
        <button
          onClick={() => navigate('/report')}
          className="bg-gradient-to-r from-green-400 to-lime-500 hover:from-lime-500 hover:to-green-400 text-black px-6 py-3 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transform transition-all duration-300 drop-shadow-neon"
        >
          📝 Report Lost Item
        </button>

        <button
          onClick={() => navigate('/upload')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transform transition-all duration-300 drop-shadow-neon"
        >
          📤 Upload Found Item
        </button>
      </div>
    </div>
  );
}