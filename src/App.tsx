import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import SymbolPage from "./pages/SymbolPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/symbol/:ticker" element={<SymbolPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
