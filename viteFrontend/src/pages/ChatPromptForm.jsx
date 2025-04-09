import { useState } from 'react';
import axios from 'axios';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [structured, setStructured] = useState(null);
  const [matchedImage, setMatchedImage] = useState(null);
  const [error, setError] = useState('');

  const sendPrompt = async () => {
    if (!message.trim()) {
      setError('❌ Please describe your lost item.');
      return;
    }
    setError('');

    try {
      const res = await axios.post('http://localhost:5001/api/prompt/report', {
        promptText: message
      });

      setStructured(res.data.structured);
      setMessage('');

      if (res.data.match) {
        setMatchedImage(res.data.match);
      } else {
        setMatchedImage(null);
      }
    } catch (err) {
      console.error('❌ Failed to submit prompt', err);
      setError('❌ Server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-neonGreen drop-shadow-neon">🎮 Lost & Found AI Assistant</h2>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I lost a black Logitech wireless mouse..."
          className="w-full bg-black border border-green-500 p-4 rounded-lg text-green-300 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-neonGreen transition mb-4"
        />

        <button
          onClick={sendPrompt}
          className="bg-green text-white font-semibold px-6 py-2 rounded hover:bg-green-400 transition shadow-lg"
        >
          Submit Prompt
        </button>

        {error && <p className="mt-4 text-red-500 font-bold">{error}</p>}

        {/* 🧠 Structured Prompt Preview */}
        {structured && (
          <div className="mt-6 border border-green-700 p-4 rounded bg-[#0a0a0a] shadow-md">
            <h3 className="text-lg font-bold mb-2 text-neonGreen">🧠 Structured Prompt:</h3>
            <pre className="text-sm text-green-200 bg-black p-3 rounded overflow-x-auto">
              {JSON.stringify(structured, null, 2)}
            </pre>
          </div>
        )}

        {/* ✅ Best Match Result from Images */}
        {matchedImage && (
          <div className="mt-6 border border-green-700 p-4 rounded bg-[#0a0a0a] shadow-md">
            <h3 className="text-lg font-bold mb-3 text-neonGreen">✅ Best Image Match Found:</h3>

            {/* Image Preview */}
            <div className="flex justify-center">
              <img
                src={`http://localhost:5001/api/uploads/${matchedImage.filename}`}
                alt="Matched item"
                className="object-contain rounded-lg border border-green-400 shadow-md w-full max-w-xs"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>

            {/* 📝 Descriptive Caption */}
            {matchedImage.description && (
              <div className="mt-4 bg-black border border-green-500 p-3 rounded">
                <h4 className="text-sm font-semibold text-green-400 mb-1">📝 Description:</h4>
                <pre className="text-xs text-green-200 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(matchedImage.imageDescription, null, 2)}
              </pre>
               
              </div>
            )}

            {/* 🧠 Matched Structured JSON */}
            <div className="bg-black border border-green-500 mt-4 p-3 rounded">
              <h4 className="text-sm font-semibold text-green-400 mb-1">🧠 Structured Data:</h4>
              <pre className="text-xs text-green-200 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(matchedImage.imageJson, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}