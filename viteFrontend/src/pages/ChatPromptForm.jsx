import { useState } from 'react';
import axios from 'axios';

export default function ChatPromptForm() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendPrompt = async () => {
    try {
      const res = await axios.post('http://localhost:5001/api/prompt/report', {
        promptText: message   // Ensure this key matches the backend expectation
      });
      setResponse(`✅ Prompt submitted. ID: ${res.data.id}`);
      setMessage('');
    } catch (err) {
      console.error(err);
      setResponse('❌ Failed to submit prompt');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Describe Your Lost Item</h2>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="I lost a black Logitech wireless mouse..."
        className="w-full border p-3 rounded h-32"
      />
      <button
        onClick={sendPrompt}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700 transition"
      >
        Submit
      </button>
      {response && <p className="mt-4 text-green-700">{response}</p>}
    </div>
  );
}