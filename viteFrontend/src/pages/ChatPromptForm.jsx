import { useState } from 'react';
import axios from 'axios';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [structured, setStructured] = useState(null);
  const [matchedImage, setMatchedImage] = useState(null);
  const [error, setError] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [promptId, setPromptId] = useState(null);

  const sendPrompt = async () => {
    if (!message.trim()) {
      setError('❌ Please describe your lost item.');
      return;
    }
    setError('');
    setShowFollowUp(false);
    setMatchedImage(null);

    try {
      const res = await axios.post('http://localhost:5001/api/prompt/report', {
        promptText: message,
      });

      setStructured(res.data.structured);
      setMessage('');

      if (res.data.followUpRequired) {
        setFollowUpQuestion(res.data.followUpQuestion);
        setPromptId(res.data.id);
        setShowFollowUp(true);
      } else if (res.data.match) {
        setMatchedImage(res.data.match);
      } else {
        setMatchedImage(null);
      }
    } catch (err) {
      console.error('❌ Failed to submit prompt', err);
      setError('❌ Server error. Please try again.');
    }
  };

  const submitFollowUp = async () => {
    if (!followUpAnswer.trim()) return;

    try {
      const res = await axios.post('http://localhost:5001/api/prompt/reanalyze', {
        promptId,
        additionalAnswer: followUpAnswer,
      });

      if (res.data.match) {
        setMatchedImage(res.data.match);
        setShowFollowUp(false);
        setFollowUpAnswer('');
      } else {
        setMatchedImage(null);
        setShowFollowUp(false);
      }
    } catch (err) {
      console.error('❌ Follow-up error:', err);
      setError('❌ Follow-up failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-neonGreen drop-shadow-neon">
          🎮 Lost & Found AI Assistant
        </h2>

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

        {/* ❓ Follow-up Question */}
        {showFollowUp && (
          <div className="mt-6 border border-yellow-600 p-4 rounded bg-[#111] text-yellow-400 shadow-md">
            <h3 className="text-lg font-bold mb-2">🧐 Follow-up Question:</h3>
            <p className="mb-3">{followUpQuestion}</p>
            <textarea
              value={followUpAnswer}
              onChange={(e) => setFollowUpAnswer(e.target.value)}
              placeholder="Your answer..."
              className="w-full border border-yellow-400 bg-black text-yellow-200 p-3 rounded mb-2"
            />
            <button
              onClick={submitFollowUp}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
            >
              Submit Follow-up Answer
            </button>
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

            {/* 📝 Description */}
            {matchedImage.imageDescription && (
              <div className="mt-4 bg-black border border-green-500 p-3 rounded">
                <h4 className="text-sm font-semibold text-green-400 mb-1">📝 Description:</h4>
                <p className="text-xs text-green-200 whitespace-pre-wrap">
                  {matchedImage.imageDescription}
                </p>
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