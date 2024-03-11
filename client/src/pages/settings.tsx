import { useGlobal } from "../context/GlobalContext";
import Sidebar from "./Common/Sidebar"
import { useAuth } from "../context/AuthContext";
import rain from '../assets/videos/rain.webm';
import email from '../assets/images/envelope.svg';
import phone from '../assets/images/phone-alt.svg'; 
import { ErrorMessage, Field, Formik, useFormik } from 'formik';
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
  
  // const handleFileChange = (e:any) => {
  //   // Get the selected file from the input
  //   const file = e.target.files[0];
  //   // setSelectedFile(file);
  //   setSelectedFile(file);
  //   console.log('file',file);

  //   // const file = e.target.files[0];
  //   // if (file) {
  //   //   const reader = new FileReader();

  //   //   reader.onload = (e:any) => {
  //   //     const dataUrl = e.target.result;
  //   //     setSelectedFile(dataUrl);
  //   //   };

  //   //   reader.readAsDataURL(file);
  //   // }

  //   // const existingState = { ...userProfile };
  //   // setFormInititalState({...existingState, avatar: file});
  //   // setIsImageSelected(true)
    
  // };
  // const handleFileChange = (e:any) => {
  //   const file = e.target.files[0];

  //   if (file) {
  //     const reader = new FileReader();

  //     reader.onload = (e:any) => {
  //       setSelectedFile(e.target.result);
  //     };

  //     reader.readAsDataURL(file);
  //   }
  // };

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

  // const handleSaveClick = () => {
  //   // Add your save logic here
  //   // This is just a placeholder, you might want to save the image to your server or perform other actions.
  //   alert('Image saved!');
  //   setIsImageEditing(false);
  // };

  const handleSaveClick = async () => {
    if (selectedFile) {
    console.log('imgFormData',imgFormData);
    
    const formData : any = new FormData();
    formData.append('avatar', imgFormData);

    try {
      const response = await updateProfileImage(user._id, formData);

      // Handle the response as needed
      console.log(response.data);
      setIsImageEditing(false);
    } catch (error) {
      // Handle errors
      console.error('Error updating profile image:', error);
    }
  }
};
  // const handleSaveClick = async () => {
  //   if (selectedFile) {
  //     const formData = new FormData();
  //     formData.append('profileImage', selectedFile);

  //     try {
  //       const response = await axios.post('/api/profileimage', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       });

  //       // Handle the response as needed
  //       console.log(response.data);
  //       setIsImageEditing(false);
  //     } catch (error) {
  //       // Handle errors
  //       console.error('Error updating profile image:', error);
  //     }
  //   }
  // };

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
                <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="" className="rounded-full mx-auto w-32 h-32 shadow-md border-4 border-white transition duration-200 transform hover:scale-110"/>
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
          src={selectedFile || 'https://tecdn.b-cdn.net/img/new/avatars/2.webp'}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>
      {isImageEditing ? (
        <div className="mt-4">
          <button
            onClick={handleSaveClick}
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <label htmlFor="avatar" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">
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
              const { values, handleSubmit, isValid, dirty, setFieldValue } = formik;
              return (
            <div className="rounded-xl border bg-white"> 
              {/* {JSON.stringify(values?.id)} */}
            <form onSubmit={handleSubmit}>
                    <div className="flex flex-col space-y-3 px-3 py-8 sm:px-10">
                      {/* <label htmlFor="image" className="block"><p className="text-sm">Image:</p></label>
                      <Field type="file" name="image" accept="image/*" onChange={(event:any) => setFieldValue('avatar', event.currentTarget.files[0])} className="form-control" />
                      <ErrorMessage name="image" component="div" className="text-danger" /> */}

                      <label htmlFor="name" className="block"><p className="text-sm">Name:</p></label>
                      <Field type="text" name="name" className="form-control w-full rounded-md border py-2 px-2 bg-gray-50 outline-none ring-blue-600 focus:ring-1" />
                      <ErrorMessage name="name" component="div" className="text-danger" />
                      
                      <label htmlFor="email" className="block"><p className="text-sm">Email:</p></label>
                      <Field type="email" name="email" disabled={true} className="form-control w-full rounded-md border py-2 px-2 bg-gray-100 outline-none ring-blue-600 focus:ring-1" />
                      <ErrorMessage name="email" component="div" className="text-danger" />
                      
                      <label htmlFor="phone" className="block"><p className="text-sm">Phone:</p></label>
                      <Field type="text" name="phone" className="form-control w-full rounded-md border py-2 px-2 bg-gray-50 outline-none ring-blue-600 focus:ring-1" />
                      <ErrorMessage name="phone" component="div" className="text-danger" />
                  
                      <label htmlFor="gender" className="block"><p className="text-sm">Gender:</p></label>
                      <div>
                          <label>
                          <Field type="radio" name="gender" value="male" />
                          Male
                          </label>
                          <label className="ml-4">
                          <Field type="radio" name="gender" value="female" />
                          Female
                          </label>
                      </div>
                      <ErrorMessage name="gender" component="div" className="text-danger" />
                      <button type="submit" className={`mt-4 ml-auto rounded-lg bg-blue-600 px-10 py-2 text-white ${
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