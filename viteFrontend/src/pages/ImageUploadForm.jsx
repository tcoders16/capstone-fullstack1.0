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
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Found Item Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-4"
      />
      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Upload Image
      </button>
      {status && <p className="mt-4 text-blue-700">{status}</p>}
    </div>
  );
}