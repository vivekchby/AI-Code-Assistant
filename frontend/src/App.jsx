import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReviewDetails from "./pages/ReviewDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
          }}
        />
        <Routes>
            <Route
              path="/"
              element={
                <DashboardLayout>
                  {(ref) => <Dashboard ref={ref} />}
                </DashboardLayout>
              }
            />
            <Route
              path="/history"
              element={
                <DashboardLayout>
                  {() => <History />}
                </DashboardLayout>
              }
            />
            <Route
              path="/reviews/:id"
              element={
                <DashboardLayout>
                  {() => <ReviewDetails />}
                </DashboardLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <DashboardLayout>
                  {() => <Profile />}
                </DashboardLayout>
              }
            />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;