// Importing necessary components and hooks
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FULL_LOGO from "../assets/images/full-logo.png";
import AUTH_IMG from "../assets/images/auth-img.png"


interface FormValues {
    email: string;
    password: string;
  }
// Component for the Login page
const LoginPage = () => {
    // Accessing the login function from the AuthContext
    const { login } = useAuth();
    const [isPasswordHide, setIsPasswordHide] = useState(false);
    
  const formInititalState : FormValues = {
    email: '',
    password: ''
  };
  const LoginSchema = Yup.object({
    email: Yup.string().email("Invalid Email").required('Username is required'),
    password: Yup.string().required('Password is required'),
  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInititalState,
    validationSchema:LoginSchema,
    onSubmit: async (values) => {
      // Handle the form submission here
    //  await onLogin({ url: `auth/login`, payload: values });
    await login(values);

    },
  });
const handlePasswordHide = () => {
    setIsPasswordHide(!isPasswordHide)
}

  return (
    <>

        <div className="auth-bg">
        <div className="container-fluid p-0">
        <div className="row g-0">
            <div className="col-xl-3 col-lg-4">
            <div className="p-4 pb-0 p-lg-5 pb-lg-0 auth-logo-section">
                <div className="text-white-50">
                <img
                    src={FULL_LOGO}
                    alt=""
                    className="img-fluid"
                    style={{ maxWidth: 200, width: "100%" }}
                />
                </div>
                <div className="mt-auto">
                <img
                    src={AUTH_IMG}
                    alt=""
                    className="auth-img"
                />
                </div>
            </div>
            </div>
            {/* end col */}
            <div className="col-xl-9 col-lg-8">
            <div className="authentication-page-content">
                <div className="d-flex flex-column h-100 px-4 pt-4">
                <div className="row justify-content-center my-auto">
                    <div className="col-sm-8 col-lg-6 col-xl-5 col-xxl-4">
                    <div className="py-md-5 py-4">
                        <div className="text-center mb-5">
                        <h3>Welcome Back !</h3>
                        <p className="text-muted">
                            Sign in to continue to Truechat.
                        </p>
                        </div>
                        <form onSubmit={formik.handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">
                            email
                            </label>
                            <input
                            type="text"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="Enter email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            />
                            {formik.touched.email && formik.errors.email ? (
                                <div className='error-msg'>{formik.errors.email}</div>
                                ) : null}
                        </div>
                        <div className="mb-3">
                            <div className="position-relative auth-pass-inputgroup mb-3">
                            <input
                                type={ isPasswordHide ? "text" : "password"}
                                className="form-control pe-5"
                                id="password"
                                name="password"
                                placeholder="Enter Password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password ? (
                                <div className='error-msg'>{formik.errors.password}</div>
                                ) : null}
                            <button
                                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                type="button"
                                onClick={handlePasswordHide}
                            >
                                <i className="ri-eye-fill align-middle" />
                            </button>
                            </div>
                        </div>
                        {/* <div className="form-check form-check-info font-size-16">
                            <input
                            className="form-check-input"
                            type="checkbox"
                            id="remember-check"
                            />
                            <label
                            className="form-check-label font-size-14"
                            htmlFor="remember-check"
                            >
                            Remember me
                            </label>
                        </div> */}
                        <div className="text-center mt-4">
                            <button className="btn btn-primary w-100" type="submit">
                            Log In
                            </button>
                        </div>
                        </form>
                        {/* end form */}
                        {/* <div className="mt-5 text-center text-muted">
                        <p>
                            Don't have an account ?{" "}
                            <NavLink to={'/register'} className="fw-medium text-decoration-none" >Register</NavLink>
                        </p>
                        </div> */}
                    </div>
                    </div>
                    {/* end col */}
                </div>
                {/* end row */}
                <div className="row">
                    <div className="col-xl-12">
                    <div className="text-center text-muted p-4">
                        <p className="mb-0">
                        © Truematrix 2023
                        <a />
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
        </div>
    </>
  );
};

export default LoginPage;
