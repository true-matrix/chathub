// Importing necessary components and hooks
import { LockClosedIcon } from "@heroicons/react/20/solid";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useAuth } from "../../context/AuthContext";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import logoitem from "../../assets/images/full-logo.png";
import vector from "../../assets/images/auth-img.png";
import { LocalStorage } from "../../utils";


interface FormValues {
    email: any;
    otp: string;
  }
// Component for the Login page
const VerifyOtp = () => {
    // Accessing the login function from the AuthContext
    const { verifyOtp, user } = useAuth();
    
    const formInititalState : FormValues = {
        email: user?.email,
        otp: ''
      };
    const otpSchema = Yup.object({
        // email: Yup.string().email('Invalid email').required('Email is required'),
        otp: Yup.string()
        .matches(/^[0-9]*$/, 'Please enter only numbers')
        .min(4, 'OTP must be exactly 4 digits')
        .max(4, 'OTP must be exactly 4 digits')
        .required('OTP is required'),
      });
      const formik = useFormik({
        enableReinitialize: true,
        initialValues: formInititalState,
        validationSchema:otpSchema,
        onSubmit: async (values) => {
          // Handle the form submission here
          await verifyOtp(values);
        // console.log("otp values=>",values);
        },
      });
const handleResendOtp = () => {
        LocalStorage.clear(); // Clear local storage on logout
}

  return (
    <>

<div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 overflow-hidden g-0 login-page" >
      <div className="w-1/3 relative px-0 bg-success p-4 align-center">
        <div className="logo">
        <img src={logoitem}/>
        </div>  

      </div>
      <div className="w-2/3">
          <div className="flex justify-center items-center flex-col h-screen bg-white rounded-xl relative"> 
            <h1 className="text-3xl font-bold">Wolfpack Chat</h1>

            <div className="p-8 flex justify-center items-center gap-5 flex-col shadow-md rounded-2xl my-5 border-[1px] login bg-white">
              <h1 className="inline-flex items-center text-2xl mb-4 flex-col">
                <LockClosedIcon className="h-8 w-8 mb-2 text-success" /> OTP Verification
              </h1>
              <p className="inline-flex items-center text-md text-success mb-2 flex-col">
                 Enter the OTP send to email
              </p>
              {/* <Button
                // fullWidth
                className="mt-3"
                type="button"
                disabled
              >Enter the OTP send to email</Button> */}
              {/* Input for entering the email */}
            <form onSubmit={formik.handleSubmit} className="w-full">

              <Input
                type="text"
                id="otp"
                name="otp"
                placeholder="Enter OTP"
                maxLength={4}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.otp}
              />
              {formik.touched.otp && formik.errors.otp ? (
                                <div className='error-msg'>{formik.errors.otp}</div>
                                ) : null}
              <Button
                fullWidth
                className="mt-3"
                type="submit"
                disabled={!formik.dirty || formik.isSubmitting}
              >
                Login
              </Button>
              </form>
              {/* Link to the registration page */}
              <small className="text-zinc-300 pl-12">
                Don&apos;t get otp !{" "}
                <a className="text-primary hover:underline" href="/login">
                    <button onClick={handleResendOtp}>Resend OTP</button>
                </a>
              </small>
            
            </div>
            <div className="auth-img">
              <img src={vector} alt="" />
            </div>
          </div>
      </div>
    </div>
    </>
  );
};

export default VerifyOtp;
