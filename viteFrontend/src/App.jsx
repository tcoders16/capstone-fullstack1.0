import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChatPromptForm from './pages/ChatPromptForm';
import ImageUploadForm from './pages/ImageUploadForm';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ChatPromptForm />} />
        <Route path="/upload" element={<ImageUploadForm />} />
      </Routes>
    </Router>
  );
}