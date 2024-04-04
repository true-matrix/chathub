import React, { useState, useEffect } from 'react';
import Countdown from 'react-countdown';
import moment from 'moment';
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

const VerifyOtp = () => {
    const { verifyOtp, user } = useAuth();
    const [isFocused, setIsFocused] = useState(false);
    const [targetDate, setTargetDate] = useState<null | moment.Moment>(null);
    const [hasMounted, setHasMounted] = useState(false); // Track if component has mounted
    const formInitialValues: FormValues = {
        email: user?.email,
        otp: ''
    };

    const otpSchema = Yup.object({
        otp: Yup.string()
            .matches(/^[0-9]*$/, 'Please enter only numbers')
            .min(4, 'OTP must be exactly 4 digits')
            .max(4, 'OTP must be exactly 4 digits')
            .required('OTP is required'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: formInitialValues,
        validationSchema: otpSchema,
        onSubmit: async (values, { setSubmitting }) => {
            await verifyOtp(values);
            setSubmitting(false);
            const storedUser = LocalStorage.get('user');
            const isUserPresent = storedUser !== null;
            if (isUserPresent) {
                LocalStorage.remove('targetDate');
            }
        },
    });

   useEffect(() => {
    const storedUser = LocalStorage.get('user');
    const isUserPresent = storedUser !== null;

    // Retrieve the target date from local storage only once when the component mounts
    if (!hasMounted) {
        const storedTargetDate = LocalStorage.get('targetDate');
        const parsedTargetDate = storedTargetDate ? moment(storedTargetDate) : moment().add(5, 'minutes');
        setTargetDate(parsedTargetDate);
        setHasMounted(true); // Set hasMounted to true after initial mount
    }

    const timer = setInterval(() => {
        if (!isFocused && !formik.isSubmitting && !isUserPresent && targetDate !== null) {
            const updatedTargetDate = targetDate.subtract(1, 'second');
            setTargetDate(updatedTargetDate);
            LocalStorage.set('targetDate', updatedTargetDate.toDate());
        }
    }, 1000);

    return () => clearInterval(timer);
   }, [isFocused, formik.isSubmitting, hasMounted]);
    
    const handleResendOtp = () => {
        // const storedUser = LocalStorage.get('user');
        // const isUserPresent = storedUser !== null;
        // if (isUserPresent) {
        //     LocalStorage.clear();
        // }
            LocalStorage.clear();

        // Reset the target date
        // setTargetDate(moment().add(5, 'minutes'));
        // LocalStorage.set('targetDate', moment().add(5, 'minutes').toDate());
    }

    const handleInputFocus = () => {
        setIsFocused(true);
    }

    const renderer = ({ minutes, seconds, completed }: any) => {
        if (completed) {
            return <span style={{ color: '#ec2d2d', alignItems: 'center' }}>OTP Expired!</span>;
        } else {
            return (
                <div>
                    <span>Expires in </span>&nbsp;
                    <span>{minutes}</span> min &nbsp;
                    <span>{seconds}</span> secs
                </div>
            );
        }
    };

    return (
        <>
            <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 overflow-hidden g-0 login-page" >
                <div className="w-1/3 relative px-0 bg-success p-4 align-center">
                    <div className="logo">
                        <img src={logoitem} />
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
                                Enter the OTP sent to your email
                            </p>
                            <form onSubmit={formik.handleSubmit} className="w-full">
                                <Input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    placeholder="Enter OTP"
                                    maxLength={4}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    onFocus={handleInputFocus} 
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
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="online-indicator"><span className={"blink"}></span></div>&nbsp;
                                {targetDate !== null && (
                                    <Countdown
                                        date={targetDate.toDate()}
                                        intervalDelay={0}
                                        precision={3}
                                        renderer={renderer}
                                    />
                                )}
                            </div>
                            <small className="text-zinc-300 pl-12">
                                Didn&apos;t receive the OTP?{" "}
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
