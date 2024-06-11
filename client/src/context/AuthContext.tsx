import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, loginUserOtp, verifyUserOtp, logoutUser, forgotPassword, verifyForgotPasswordOTP, changePassword } from "../api";
import Loader from "../components/Loader";
import { LocalStorage, requestHandler } from "../utils";
import { useSocket } from "./SocketContext";

// Create a context to manage authentication-related data and functions
const AuthContext = createContext<{
  user: any | null;
  token: string | null;
  otp: string | any;
  login: (data: { email: string; password: string }) => Promise<void>;
  sendOtp: (data: { email: string; otp: string }) => Promise<void>;
  verifyOtp: (data: { email: string; otp: string }) => Promise<void>;
  forgotPasswordAPi: (data: { email: string }) => Promise<void>;
  verifyForgotPasswordOTPApi: (data: { email: string; otp: string }) => Promise<void>;
  changePasswordApi: (data: { email: string; newPassword: string }) => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  token: null,
  otp: null,
  login: async () => {},
  sendOtp: async () => {},
  verifyOtp: async () => {},
  forgotPasswordAPi: async () => {},
  verifyForgotPasswordOTPApi: async () => {},
  changePasswordApi:  async () => {},
  logout: async () => {},
});

// Create a hook to access the AuthContext
const useAuth = () => useContext(AuthContext);

// Create a component that provides authentication-related data and functions
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [otp, setOtp] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const navigate = useNavigate();
    const { socket } = useSocket();


  // Function to handle user login
  const login = async (data: { email: string; password: string }) => {
    await requestHandler(
      async () => await loginUser(data),
      setIsLoading,
      (res) => {
        const { data } = res;
        setUser(data.user);
        setToken(data.accessToken);
        // LocalStorage.set("user", data.user);
        LocalStorage.set("token", data.accessToken);
        if(res.success === true){
          sendOtp({email: data.user.email, otp: data.user.otp})
        } else {
          navigate("/login")
        }
        // navigate("/chat"); // Redirect to the chat page after successful login
      },
      alert // Display error alerts on request failure
    );
  };

  // Function to handle send OTP
  const sendOtp = async (data: { email: string; otp: string }) => {
      await requestHandler(
        async () => await loginUserOtp(data),
        setIsLoading,
        (res) => {
        //   setOtp(data);
        // LocalStorage.set("otp", data);
          // setToken(data.accessToken);
          // LocalStorage.set("user", data.user);
          // LocalStorage.set("token", data.accessToken);
          // navigate("/chat"); // Redirect to the chat page after successful login
          if (res.success === true) {
          navigate("/verify-otp");
        }

        },
        alert // Display error alerts on request failure
      );
    };

// Function to handle verify OTP
  const verifyOtp = async (data: { email: string; otp: string }) => {
    await requestHandler(
      async () => await verifyUserOtp(data),
      setIsLoading,
      (res) => {
        const { data } = res;
        setOtp(data);
      // LocalStorage.set("otp", data);
        // setToken(data.accessToken);
        // LocalStorage.set("user", data.user);
        // LocalStorage.set("token", data.accessToken);
        // navigate("/chat"); // Redirect to the chat page after successful login
      if(res.success === true){
        LocalStorage.set("otp", data);
        setUser(data.user);
        setToken(data.accessToken);
        LocalStorage.set("user", data.user);
        LocalStorage.set("token", data.accessToken);
        socket?.on('connect', () => {
                    console.log('Yah! Connected to the socket server');
                });
        navigate("/chat");
      }

      },
      alert // Display error alerts on request failure
    );
  };

  // Function to handle forgot password request
const forgotPasswordAPi = async (data: { email: string }) => {
  await requestHandler(
    async () => await forgotPassword(data), // Your API request function
    setIsLoading,
    (res) => {
      if (res.success) {
        const { data } = res;
        setUser(data);
        // alert('OTP sent successfully to your email.');
        navigate('/email-verify-otp'); // Redirect to OTP verification page
      } else {
        alert(res.message || 'Failed to send OTP. Please try again.');
      }
    },
    alert // Display error alerts on request failure
  );
};

// Function to handle verify forgot password OTP
const verifyForgotPasswordOTPApi = async (data: { email: string; otp: string }) => {
  await requestHandler(
    async () => await verifyForgotPasswordOTP(data), // Your API request function
    setIsLoading,
    (res) => {
      const { data } = res;
      setOtp(data);
      if (res.success) {
        setUser(data);
        // alert('OTP verified successfully.');
        navigate('/change-password'); // Redirect to reset password page
      } else {
        alert(res.message || 'Failed to verify OTP. Please try again.');
      }
    },
    alert // Display error alerts on request failure
  );
};

// Function to handle change password request
const changePasswordApi = async (data: { email: string; newPassword: string }) => {
  await requestHandler(
    async () => await changePassword(data), // Your API request function
    setIsLoading,
    (res) => {
      const { data } = res;
      console.log('cp 888',res);
      
      if (res.success) {
        // alert('Password changed successfully.');
        navigate('/login'); // Redirect to login page
      } else {
        alert(res.message || 'Failed to change password. Please try again.');
      }
    },
    alert // Display error alerts on request failure
  );
};

  // // Function to handle user logout
  // const logout = async () => {
  //   await requestHandler(
  //     async () => await logoutUser(),
  //     setIsLoading,
  //     () => {
  //       setUser(null);
  //       setToken(null);
  //       LocalStorage.clear(); // Clear local storage on logout
  //       navigate("/login"); // Redirect to the login page after successful logout
  //     },
  //     alert // Display error alerts on request failure
  //   );
  // };

  const logout = async () => {
  await requestHandler(
    async () => await logoutUser(),
    setIsLoading,
    () => {
      setUser(null);
      setToken(null);
      // Exclude clearing unread messages from local storage
      const unreadMessages = LocalStorage.get('unreadMessages');
      LocalStorage.clear();
      if (unreadMessages) {
        // Restore unread messages after clearing local storage
        LocalStorage.set('unreadMessages', unreadMessages);
      }
      navigate("/login"); // Redirect to the login page after successful logout
    },
    alert // Display error alerts on request failure
  );
};


  // Check for saved user and token in local storage during component initialization
  useEffect(() => {
    setIsLoading(true);
    const _token = LocalStorage.get("token");
    const _user = LocalStorage.get("user");
    if (_token && _user?._id) {
      setUser(_user);
      setToken(_token);
    }
    setIsLoading(false);
  }, []);

  // Provide authentication-related data and functions through the context
  return (
    <AuthContext.Provider value={{ user, otp, login, sendOtp, verifyOtp, forgotPasswordAPi, verifyForgotPasswordOTPApi, changePasswordApi, logout, token }}>
      {isLoading ? <Loader /> : children} {/* Display a loader while loading */}
    </AuthContext.Provider>
  );
};

// Export the context, provider component, and custom hook
export { AuthContext, AuthProvider, useAuth };
