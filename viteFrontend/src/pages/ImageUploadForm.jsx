import { useState } from 'react';
import axios from 'axios';

export default function ImageUploadForm() {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async () => {
    if (!image) {
      setStatus('❌ Please upload an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:5001/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('✅ Image uploaded! ID: ' + res.data.id);
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to upload');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono px-6">
      <h2 className="text-4xl font-bold mb-6 text-neonGreen drop-shadow-neon text-center">
        🖼️ Upload Found Item
      </h2>

      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full mb-4 text-white file:bg-neonGreen file:text-black file:px-4 file:py-2 file:rounded file:border-none file:cursor-pointer"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-green-400 to-lime-500 hover:from-lime-500 hover:to-green-400 text-black font-semibold py-2 px-6 rounded drop-shadow-neon transition-all duration-300"
        >
          🚀 Upload Image
        </button>

        {status && (
          <p className="mt-4 text-sm text-center text-neonGreen drop-shadow-neon">{status}</p>
        )}
      </div>
    </div>
  );
}