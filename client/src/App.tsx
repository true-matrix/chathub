// Importing required modules and components from the react-router-dom and other files.
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import { LocalStorage, requestHandler } from "./utils";
import { logoutUser } from "./api";
import { useEffect, useState } from "react";

// Main App component
const App = () => {
  // Extracting 'token' and 'user' from the authentication context
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  console.log(isLoading);
  useEffect(() => {
    let inactivityTimer : any;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        // await logoutUser(); // Make an API call to logout
        // // await LocalStorage.clear();
        // await navigate("/login"); 

            await requestHandler(
        async () => await logoutUser(),
        setIsLoading,
        () => {
          // Exclude clearing unread messages from local storage
          const unreadMessages = LocalStorage.get('unreadMessages');
          LocalStorage.clear();
          if (unreadMessages) {
            // Restore unread messages after clearing local storage
            LocalStorage.set('unreadMessages', unreadMessages);
          }
          navigate("/login"); // Redirect to the login page after successful logout
        clearInterval(inactivityTimer);
              },
        alert // Display error alerts on request failure
        );
      }, 3600000); // 1 hour in milliseconds
    };

    const handleActivity = () => {
      resetTimer();
    };

    const clearDataAndSetTimer = () => {
      // Clear all data or delete cookies from the browser
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
       
      // Call resetTimer only once after clearing data
      resetTimer();

      // Add event listeners for user activity
      document.addEventListener("mousemove", handleActivity);
      document.addEventListener("keypress", handleActivity);
    }
    // Initial setup of the timer
    resetTimer();
    // Call clearDataAndSetTimer to clear data and set timer only once
    clearDataAndSetTimer();


    return () => {
      // Cleanup event listeners
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("keypress", handleActivity);
      clearTimeout(inactivityTimer);
    };
  }, []);

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
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* This should be private Route */}
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword/>
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
