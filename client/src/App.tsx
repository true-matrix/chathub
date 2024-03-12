// Importing required modules and components from the react-router-dom and other files.
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import ChatPage from "./pages/chat";
import { useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import ContactsPage from "./pages/contacts";
import ProfilePage from "./pages/profile";
import SettingsPage from "./pages/settings";
import VerifyOtp from "./pages/Otp/VerifyOtp";
import AdminDashboard from "./pages/Admin/AdminDashboard";

// Main App component
const App = () => {
  // Extracting 'token' and 'user' from the authentication context
  const { token, user } = useAuth();

  return (
    <Routes>
      {/* Root route: Redirects to chat if the user is logged in, else to the login page */}
      <Route
        path="/"
        element={
          token && user?._id ? (
            user?.verified ? (<Navigate to="/chat" />) : (<Navigate to="/verify-otp" />)
          ) : (
            <Navigate to="/login" />
          )
        }
      ></Route>
      {/* Public login route: Accessible by everyone */}
      <Route
        path="/verify-otp"
        element={
          <PrivateRoute>
            <VerifyOtp />
          </PrivateRoute>
        }
      />

      {/* Private chat route: Can only be accessed by authenticated users */}
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      />

    <Route
            path="/contacts"
            element={
              <PrivateRoute>
                <ContactsPage />
              </PrivateRoute>
            }
          />

    <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              /> 

    <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />  

     <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />            

      {/* Public login route: Accessible by everyone */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      


      {/* Wildcard route for undefined paths. Shows a 404 error */}
      <Route path="*" element={<p>404 Not found</p>} />
    </Routes>
  );
};

// Exporting the App component to be used in other parts of the application
export default App;
