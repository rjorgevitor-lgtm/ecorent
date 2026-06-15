import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter basename="/ecorent">
      <Routes>
        <Route path="/" element={<h1>HOME</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
