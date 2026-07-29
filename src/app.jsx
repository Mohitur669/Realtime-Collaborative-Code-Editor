import "./app.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/home";
import EditorPage from "./pages/editor-page";
import { RecoilRoot } from "recoil";

function App() {
  return (
    <RecoilRoot>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "hsl(222 47% 11%)",
            color: "hsl(213 31% 91%)",
            border: "1px solid hsl(216 34% 17%)",
            fontSize: "0.875rem",
          },
          success: {
            iconTheme: {
              primary: "hsl(142 71% 45%)",
              secondary: "hsl(222 47% 11%)",
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
