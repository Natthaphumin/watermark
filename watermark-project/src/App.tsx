import { Route, Routes } from "react-router-dom";
import "./App.css";
import { BottomNav } from "./components/layout/BottomNav";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Topbar } from "./components/layout/Topbar";
import { DashboardPage } from "./pages/DashboardPage";
import { EditorPage } from "./pages/EditorPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

function App() {
  return (
    <div className="app-shell">
      <Topbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
