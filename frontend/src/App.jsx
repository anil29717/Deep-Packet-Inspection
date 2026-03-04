import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import Analytics from './pages/Analytics';
import DeepPacketKnowledge from './pages/DeepPacketKnowledge';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="employees" element={<Employees />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="knowledge" element={<DeepPacketKnowledge />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
