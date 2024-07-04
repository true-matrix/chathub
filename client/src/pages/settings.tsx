import { useGlobal } from "../context/GlobalContext";
import Sidebar from "./Common/Sidebar"
import { useAuth } from "../context/AuthContext";
import rain from '../assets/videos/rain.webm';
import email from '../assets/images/envelope.svg';
import phone from '../assets/images/phone-alt.svg'; 
import { ErrorMessage, Field, Formik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from "react";
import { LocalStorage, requestHandler } from "../utils";
import { updateProfile, updateProfileImage } from "../api";
import { useNavigate } from "react-router-dom";

interface CreateUserFormValues {
    id: string,
    name: string;
    email: string;
    phone: string;
    gender: string;
}
  
const SettingsPage = () => {
  const navigate = useNavigate();
  const { activeButton } = useGlobal();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isImageEditing, setIsImageEditing] = useState(false);
  const [imgFormData, setImgFormData] = useState(null);

  const showUserRole = (userRole : string) => {
    switch (userRole) {
      case 'admin':
        return 'Lycaon'
      case 'supremeAlpha':
        return 'Supreme Alpha'
      case 'alpha':
        return 'Alpha'
      default:
        return 'Omega'
    }
  }

  const initValues: CreateUserFormValues = {
        id: '',
        name: '',
        email:'',
        phone: '',
        gender: '',
  };
  const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        phone: Yup.string().matches(/^\d{10}$/, 'Invalid phone number').required('Phone number is required'),
        gender: Yup.string().required('Gender is required'),
  });
  const [formInititalState, setFormInitState] = useState(initValues);
console.log(isLoading);

  useEffect(() => {
    setFormInitState((prevState) => ({
      ...prevState,
            id: user._id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || '',
          }));
  }, [])
  
  const handleSubmit = async(values:any, { setSubmitting }:any) => {
        if (values?.id) {
              console.log('profile values==>',values);
              
                await requestHandler(
                  async () => await updateProfile(values.id, {
                    name: values.name,
                    // email: values.email,
                    phone: values.phone, 
                    gender: values.gender,
                  }),
                  setIsLoading,
                  () => {
                    alert("User updated successfully");

                    user.name = values.name;
                    user.phone = values.phone;
                    user.gender = values.gender;
                    LocalStorage.set("user", user);

                    navigate("/settings"); // Redirect to the login page after successful registration
                  },
                  alert // Display error alerts on request failure
                );
            } 
            setSubmitting(false);
          };
  
  const handleFileChange = (e:any) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const dataUrl = e.target.result;
        setSelectedFile(dataUrl);
        setIsImageEditing(true);
        console.log("e.target.result",dataUrl)
        console.log("file",file)
      };

      reader.readAsDataURL(file);
    }
    setImgFormData(file)
  };

  const handleImageClick = () => {
    if (!isImageEditing) {
      document.getElementById('avatar')?.click();
    }
  };


  const handleSaveClick = async () => {
    if (selectedFile) {
    console.log('imgFormData',imgFormData);
    
    const formData : any = new FormData();
    formData.append('avatar', imgFormData);

    try {
      const response = await updateProfileImage(user._id, formData);
      // Handle the response as needed
      console.log(response.data);

      const { avatar } = response.data.data;
      user.avatar.localPath = avatar.localPath;
      user.avatar.url = avatar.url;
      user.avatar._id = avatar._id;
      LocalStorage.set("user", user);
      setIsImageEditing(false);
    } catch (error) {
      // Handle errors
      console.error('Error updating profile image:', error);
      }
  }
};
  
  return (
    <>
    <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 overflow-hidden"> 
      {/* Left Sidebar Tabs */}
      <Sidebar/>
       {/* Profile Sidebar */}
       {activeButton === "settings" && <div className="w-1/3 relative ring-white overflow-y-auto px-0">
       <div className="user-details  border-b border-gray-200  container p-4">
       <video autoPlay muted loop id="myVideo" className="border-b border-gray-300">
          <source src={rain} type="video/webm"/>
          Your browser does not support HTML5 video.
        </video>
          <div>
            <div className="relative mx-auto">
              <div className="flex justify-center">
                {/* <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="" className="rounded-full mx-auto w-32 h-32 shadow-md border-4 border-white transition duration-200 transform hover:scale-110"/> */}
                <img src={user?.avatar?.url} alt="" className="rounded-full mx-auto w-32 h-32 shadow-md border-4 border-white transition duration-200 transform hover:scale-110 hover:border-animation"/>
              </div>
              <div className="mt-3">
                <h1 className="font-bold text-center text-3xl text-gray-900">{ user.name ? user.name: user?.username}</h1>
                <p className="text-center text-sm text-gray-400 font-medium">{showUserRole(user?.userRole)}</p>
                <div className="w-full">
                  <div className="mt-5 w-full flex flex-col items-center overflow-hidden text-sm">
                    <a href="#" className="w-full text-gray-600 py-2 pl-3 pr-3 w-full block">
                      <img src={email} alt="" className="h-4 inline-block mr-3"/>{user.email} 
                    </a>
                    <a href="#" className="w-full text-gray-600 py-2 pl-3 pr-3 w-full block">
                      <img src={phone} alt="" className="h-4 inline-block mr-3"/>{user.phone ? user.phone : '9876543210'} 
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-4">
          <div className="w-full">
              <div className="mt-5 w-full flex flex-col items-center overflow-hidden text-sm">
                <a href="https://truematrix.ai/contact/" className="w-full text-gray-600 py-2 pl-3 pr-3 w-full block" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 size-6 inline-block mr-3">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>
                  Help center
                </a>
              </div>
          </div>
        </div>


      </div>}

      {/* Settings */}
        <div className="w-2/3 border-l-[0.1px] border-secondary profile-settings">
        <p className="py-2 text-xl font-semibold">Settings</p>
        
        <div className="flex gap-4">
          <div className="upload-user-image flex items-center space-x-3 flex-shrink-0">
            {/* {selectedFile ? <img
              src={selectedFile}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />:<img
              src="https://tecdn.b-cdn.net/img/new/avatars/2.webp"
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />}
               <div className="mt-4">
        <label htmlFor="avatar" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">
          Upload Avatar
        </label>
        <input
          type="file"
          id="avatar"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div> */}
              <div className="cursor-pointer" onClick={handleImageClick}>
        <img
          src={isImageEditing ? selectedFile : user.avatar.url}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>
      {isImageEditing ? (
        <div>
          <button
            onClick={handleSaveClick}
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      ) : (
        <div>
          <label htmlFor="avatar" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded avatar-img">
            Upload Image
          </label>
          <input
            type="file"
            id="avatar"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      )}
          </div>
              
          {/* <div className="upload-user-image avatar-list flex items-center space-x-3 w-full overflow-hidden">
          <div className="arrow a-left"></div>

            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="1"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="2"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="3"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="4"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="5"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="6"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="7"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="8"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="9"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="10"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="11"/> 
            <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Avatar" className="w-12 h-12 rounded-full object-cover" id="12"/> 

            <div className="arrow a-right" ></div>
          </div> */}
        </div>
         
      <div className="space-y-1">
        <Formik initialValues={formInititalState} onSubmit={handleSubmit} validationSchema={validationSchema} enableReinitialize >
        {(formik) => {
              const { handleSubmit, isValid, dirty } = formik;
              return (
            <div> 
              {/* {JSON.stringify(values?.id)} */}
            <form onSubmit={handleSubmit}>
                    <div className="flex flex-col form-container">
                      

                      <label htmlFor="name" className="mb-2 block"><p className="text-sm">Name:</p></label>
                      <Field type="text" name="name" className="form-control w-full rounded-md border py-3 px-3 bg-gray-50 outline-none ring-green-600 focus:ring-1 mb-6" />
                      <ErrorMessage name="name" component="div" className="text-danger" />
                      
                      <label htmlFor="email" className="mb-2 block"><p className="text-sm">Email:</p></label>
                      <Field type="email" name="email" disabled={true} className=" mb-6 form-control w-full rounded-md border py-3 px-3 bg-gray-100 outline-none ring-green-600 focus:ring-1" />
                      <ErrorMessage name="email" component="div" className="text-danger" />
                      
                      <label htmlFor="phone" className="mb-2 block"><p className="text-sm">Phone:</p></label>
                      <Field type="text" name="phone" className=" mb-6 form-control w-full rounded-md border py-3 px-3 bg-gray-50 outline-none ring-green-600 focus:ring-1" />
                      <ErrorMessage name="phone" component="div" className="text-danger mb-6" />
                  
                      <label htmlFor="gender" className="mb-2 block"><p className="text-sm">Gender:</p></label>
                      <div>
                          <label>
                          <Field type="radio" name="gender" value="male" className="me-2"/>
                          Male
                          </label>
                          <label className="ml-4">
                          <Field type="radio" name="gender" value="female" className="me-2"/>
                          Female
                          </label>
                      </div>
                      <ErrorMessage name="gender" component="div" className="text-danger" />
                      <button type="submit" className={`rounded-md border-none bg-primary text-white text-md py-2 px-4 w-fit ms-auto ${
                !(dirty && isValid) && 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!(dirty && isValid)}
                      >
                        Update
                      </button>
                </div>
              </form>
              
            </div>
                )}}
        </Formik>
      </div>
        </div>
      </div>
    </>
  )
}

export default SettingsPage