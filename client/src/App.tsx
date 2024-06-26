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
import { useEffect, useRef, useState } from "react";
import { useSocket } from "./context/SocketContext";
import NOTI_SOUND from '../src/assets/sound/notification-sound1.mp3';
import { ChatListItemInterface, ChatMessageInterface } from "./interfaces/chat";
import { useGlobal } from "./context/GlobalContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmailVerifyOtp from "./pages/Auth/EmailVerifyOtp";
import ChangePassword from "./pages/Auth/ChangePassword";
import AccessDenied from "./components/AccessDenied";

const MESSAGE_RECEIVED_EVENT = "messageReceived";

// Main App component
const App = () => {
  // Extracting 'token' and 'user' from the authentication context
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  console.log(isLoading);
  const { socket } = useSocket();
  const { setUnreadMessages, activeButton, statusEnableDisable } = useGlobal();
  const currentChat = useRef<ChatListItemInterface | null>(null);
  // const [isRestricted, setIsRestricted] = useState(false);
  const [isRestricted, setIsRestricted] = useState(() => {
    // Initialize isRestricted from localStorage or default to false
    const storedIsRestricted = LocalStorage.get("isRestricted");
    return storedIsRestricted ? JSON.parse(storedIsRestricted) : false;
  });
  

  useEffect(() => {
    let inactivityTimer : any;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
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
          // alert // Display error alerts on request failure
          (error: string) => toast.error(error)
          
        );
      }, 3600000); // 1 hour = 3600000 milliseconds, 1 min = 60000 milliseconds
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

      // Add event listener for beforeunload to clear local storage and call logoutUser
      window.addEventListener("beforeunload", async () => {
        await logoutUser();
        const unreadMessages = LocalStorage.get('unreadMessages');
        LocalStorage.clear();
        if (unreadMessages) {
          // Restore unread messages after clearing local storage
          LocalStorage.set('unreadMessages', unreadMessages);
        }
      });
    };

    // Initial setup of the timer
    resetTimer();
    // Call clearDataAndSetTimer to clear data and set timer only once
    clearDataAndSetTimer();


    return () => {
      // Cleanup event listeners
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("keypress", handleActivity);
      clearTimeout(inactivityTimer);
      window.removeEventListener("beforeunload", async () => {
        await logoutUser();
        const unreadMessages = LocalStorage.get('unreadMessages');
        LocalStorage.clear();
        if (unreadMessages) {
          // Restore unread messages after clearing local storage
          LocalStorage.set('unreadMessages', unreadMessages);
        }
      });
    };
  }, []);


// // Clear localstorage data on tab close
//   useEffect(() => {
//     const clearLocalStorage = () => {
//       localStorage.clear();
//     };

//     window.addEventListener('beforeunload', clearLocalStorage);

//     return () => {
//       window.removeEventListener('beforeunload', clearLocalStorage);
//     };
//   }, []);

  
   const showNotification = (title : any, options : any, duration = 2500) => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
    } else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      const notification = new Notification(title, options);

      // Close the notification after the specified duration
      setTimeout(() => {
        notification.close();
      }, duration);
    }
  };

  const playMessageSound = () => {
    const audio = new Audio(NOTI_SOUND); // Replace with the path to your sound file
    audio.play();
  };

  const onMessageReceived = (message: ChatMessageInterface) => {
    console.log('message?.chat', message?.chat);
    console.log('currentChat.current?._id',currentChat);
    const _currentChat = LocalStorage.get("currentChat");
    if (_currentChat) {
      // Set the current chat reference to the one from local storage.
      currentChat.current = _currentChat;
    }
    
    if ((message?.chat !== currentChat.current?._id) || ((message?.chat === currentChat.current?._id) && (activeButton !== 'chat'))) {
      setUnreadMessages((prev) => {
        const updatedUnreadMessages = [message, ...prev];
        // Store the updated unread messages in local storage
        LocalStorage.set("unreadMessages", updatedUnreadMessages);
        return updatedUnreadMessages;
      });

      showNotification('New WolfChat Message', {
      body: 'You have received a new message.',
      icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPGIbqtNtn1yzk1w1cGmCgFstHk-l2NvevRgw7J7kD3uOT4sjPpn-0CVb5gPGy47z3wtZWY4M5InE_n1zBlBE_PnkDXBydBhU8RCzwijKQYiSGGB1ZJ5umDWXCd4l9TpeiQcsJW2IjwXiOoQxg2M-FhknAF-RmkCOdqJgywWOLw62wSNSCzT1W6cAiZQ0n/s1600/multiwolf100.png' // You can set an icon if needed
      });
      // Play message sound
      playMessageSound();
    }

  };

   useEffect(() => {
    // If the socket isn't initialized, we don't set up listeners.
    if (!socket) return;
    // Listener for when a new message is received.
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);

    // Listen for block status changes
    socket.on('user-block-status-changed', (data) => {
      setIsRestricted(data.blocked);
      LocalStorage.set('isRestricted', JSON.stringify(data.blocked));
    });
    if(isRestricted){
      socket?.emit('block-user', statusEnableDisable);
    } else {
      socket?.emit('unblock-user', statusEnableDisable);
    }

    // When the component using this hook unmounts or if `socket` or `chats` change:
    return () => {
      // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off('user-block-status-changed');
    };

  }, [socket, activeButton]);
console.log('user',user);

  return (
    <>
    {isRestricted && <AccessDenied />}
    {!isRestricted && 
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
        element={ user?.verified && (
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
      )}
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

    <Route
          path="/email-verify-otp"
          element={
            <PublicRoute>
              <EmailVerifyOtp />
            </PublicRoute>
          }
        />

    <Route
          path="/change-password"
          element={
            <PublicRoute>
              <ChangePassword />
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
    }
    </>
  );
};

// Exporting the App component to be used in other parts of the application
export default App;