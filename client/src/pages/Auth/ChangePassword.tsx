import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import logoitem from "../../assets/images/full-logo.png";
import vector from "../../assets/images/auth-img.png";
import view from "../../assets/images/view.png";
import hidden from "../../assets/images/hidden.png";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { passwordStrength } from 'check-password-strength';

interface FormValues {
  email: any;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword = () => {
  const { changePasswordApi, user } = useAuth();
  const [isPasswordHide, setIsPasswordHide] = useState(true);
  const [passwordStrengthResult, setPasswordStrengthResult] = useState<{ id: number; value: string }>({ id: 0, value: '' });
  const [passwordLength, setPasswordLength] = useState(12);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const formInititalState: FormValues = {
    email: user?.email,
    newPassword: '',
    confirmPassword: ''
  };

  const PasswordSchema = Yup.object({
    newPassword: Yup.string()
      .required('New Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(30, 'Password must be 30 characters or less'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), undefined], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInititalState,
    validationSchema: PasswordSchema,
    onSubmit: async (values: any) => {
      // Handle the form submission here
      console.log('values PPP', values);
      await changePasswordApi(values);
    },
  });

  const handlePasswordHide = () => {
    setIsPasswordHide(!isPasswordHide);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    formik.setFieldValue('newPassword', newPassword);
    setPasswordStrengthResult(passwordStrength(newPassword));
  };

  const generatePassword = (length: number) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    setGeneratedPassword(password);
    formik.setFieldValue('newPassword', password);
    setPasswordStrengthResult(passwordStrength(password));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Password copied to clipboard!');
    });
  };

  return (
    <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 overflow-hidden g-0 login-page">
      <div className="w-1/3 relative px-0 bg-success p-4 align-center">
        <div className="logo">
          <img src={logoitem} alt="Logo" />
        </div>
      </div>
      <div className="w-2/3">
        <div className="flex justify-center items-center flex-col h-screen bg-white rounded-xl relative">
          <h1 className="text-3xl font-bold">Wolfpack Chat</h1>
          <div className="p-8 flex justify-center items-center gap-5 flex-col shadow-md rounded-2xl my-5 border-[1px] login bg-white">
            <h1 className="inline-flex items-center text-2xl mb-4 flex-col">
              <LockClosedIcon className="h-8 w-8 mb-2 text-success" /> Change Password
            </h1>
            <form onSubmit={formik.handleSubmit} className="w-full">
              <div className="flex items-center mb-4">
                <Input
                  type="number"
                  id="passwordLength"
                  name="passwordLength"
                  placeholder="Password Length"
                  onChange={(e) => setPasswordLength(Number(e.target.value))}
                  value={passwordLength}
                  className="mr-2"
                />
                <Button
                  type="button"
                  onClick={() => generatePassword(passwordLength)}
                >
                  Generate
                </Button>
                <Button
                  type="button"
                  onClick={() => copyToClipboard(generatedPassword)}
                  className="ml-2"
                >
                  Copy
                </Button>
              </div>

              <Input
                type={isPasswordHide ? "password" : "text"}
                id="newPassword"
                name="newPassword"
                placeholder="New Password"
                onChange={handlePasswordChange}
                onBlur={formik.handleBlur}
                value={formik.values.newPassword}
                className="mt-2"
              />
              {formik.touched.newPassword && typeof formik.errors.newPassword === 'string' ? (
                <div className='error-msg'>{formik.errors.newPassword}</div>
              ) : null}
              {passwordStrengthResult && (
                <div className={`password-strength${passwordStrengthResult.id}`}>
                  {passwordStrengthResult.value}
                </div>
              )}

              <Input
                type={isPasswordHide ? "password" : "text"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className="mt-2"
              />
              {formik.touched.confirmPassword && typeof formik.errors.confirmPassword === 'string' ? (
                <div className='error-msg'>{formik.errors.confirmPassword}</div>
              ) : null}

              <Button
                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted mt-3"
                type="button"
                onClick={handlePasswordHide}
              >
                <img
                  src={isPasswordHide ? hidden : view}
                  alt={isPasswordHide ? "Hide Password" : "Show Password"}
                  className="align-middle"
                />
              </Button>

              <Button
                fullWidth
                className="mt-3"
                type="submit"
                disabled={!formik.isValid || formik.isSubmitting}
              >
                Reset Password
              </Button>

              <small className="text-zinc-300 pl-12">
                I know my password!{" "}
                <a className="text-primary hover:underline" href="/login">
                  Login
                </a>
              </small>
            </form>
          </div>
          <div className="auth-img">
            <img src={vector} alt="Vector Image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
