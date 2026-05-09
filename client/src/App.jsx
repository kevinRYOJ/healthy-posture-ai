import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Home />}      />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history"   element={<History />}   />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
