import { useCallback, useContext, useEffect, useState } from "react";
import { useGlobal } from "../../context/GlobalContext";
import Sidebar from "../Common/Sidebar";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ReactPaginate from 'react-paginate';
import IMG_1 from '../../assets/images/users/avatar-7.jpg'
import IMG_2 from '../../assets/images/users/avatar-8.jpg'
import IMG_3 from '../../assets/images/users/avatar-9.jpg'
import { addUser, getAvailableUsers, getAllSupremeAlphas, getUserById, updateUser } from "../../api";
import { requestHandler } from "../../utils";
import { ErrorMessage, Field, Formik, useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { confirmAlert } from "react-confirm-alert";
import { ConfirmAlert } from "../../components/ConfirmAlert";

interface CreateUserFormValues {
    name: string;
    email: string;
    password: string;
    phone: string;
    userRole:string;
    addedBy:string | null;
    gender: string;
    aiStatus: string; // active inactive status
    role: string; // active inactive status
  }


const SupremeALphaPage = () => {
    const { tabIndex } = useGlobal();
    const navigate = useNavigate();
    const {user} = useAuth()
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateUserModalOpen, setCreateUserModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<any>("");
    const [isLoading, setIsLoading] = useState(false);
    const initValues : CreateUserFormValues = {
        name: '',
        email:'',
        password: '',
        phone: '',
        userRole: 'supremeAlpha',
        addedBy: user._id,
        aiStatus: 'active', // active inactive status
        gender: '',
        role: 'USER'

        // name: selectedUser[0]?.name || '',
        // email: selectedUser[0]?.email || '',
        // password: '',  // Add your logic for password if needed
        // phone: selectedUser[0]?.phone || '',
        // userRole: 'supremeAlpha',
        // addedBy: user._id,
        // aiStatus: 'active',
        // gender: selectedUser[0]?.gender || '',
      };
      const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        phone: Yup.string().matches(/^\d{10}$/, 'Invalid phone number').required('Phone number is required'),
        // userRole: Yup.string().required('Role is Required'),
        gender: Yup.string().required('Gender is required'),
      });
    
      const [formInititalState, setFormInitState] = useState(initValues);

    // Function to retrieve available users.
    const getUsers = useCallback( async () => {
        requestHandler(
        // Call to get the list of available users.
        async () => await getAllSupremeAlphas(),
        null,
        // On successful retrieval, set the users' state.
        (res) => {
            const { data } = res;
            setUsers(data || []);
        },
        alert // Use default alert for any error messages.
        );
    },[])

    useEffect(() => {
        getUsers();
      }, []);

  
    const itemsPerPage = 2; // Number of items per page
    // const pageCount = Math.ceil(users?.length / itemsPerPage);
  

  
    const handleCloseModal = () => {
      setCreateUserModalOpen(false);
    };

    useEffect(() => {
        if (selectedUser) {
          setFormInitState((prevState) => ({ ...prevState, ...selectedUser }));
        }
      }, [selectedUser]);
    const handleAddUser = () => {
        setSelectedId("")
        setIsEditing(false);
        setFormInitState(initValues)
        setCreateUserModalOpen(true);
      }

    const handleUpdateUser = async (id:string) =>{
        setSelectedId(id)
        setIsEditing(true);
        console.log('update',id);
        requestHandler(
            // Call to get the list of available users.
            async () => await getUserById(id),
            null,
            // On successful retrieval, set the users' state.
            (res) => {
                const { data } = res;
        //   setFormInitState((prevState) => ({ ...prevState, ...data }));
          setFormInitState((prevState) => ({
            ...prevState,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            gender: data.gender || '',
          }));

                setSelectedUser(data || []);
            },
            alert // Use default alert for any error messages.
            );
        setCreateUserModalOpen(true);
      }
      
    //   useEffect(() => {
    //     if (selectedUser) {
    //       const clientInfo : any = {...selectedUser};
    //       if (clientInfo) {
    //         setFormInitState((_) => ({ ..._, ...selectedUser}));
    //       }
    //     }
    //   }, [selectedUser, selectedId,isEditing]);
      const onYes = useCallback((id:string) => {
        // onDeleteUser({ url : `auth/${id}`})
        // onAllUsers({ url : `user/get-all-supreme-alphas`})
        console.log('delete=>',id);
        
    }, []);
      const handleDelete = useCallback((id:string) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <ConfirmAlert onClose={onClose} onYes={() => onYes(id)} heading="Are you sure?" subHeading={"You want to delete?"} onCloseText="Close" onSubmitText="Delete" />
                );
            }
        });
        }, []);

    const handleSubmit = async(values:any, { setSubmitting }:any) => {
            if (values?._id) {
              if (values._id) {
                await requestHandler(
                  async () => await updateUser(values._id, {
                    name: values.name,
                    // email: values.email,
                    phone: values.phone, 
                    gender: values.gender,
                  }),
                  setIsLoading,
                  () => {
                    alert("User updated successfully");
                    getUsers();
                    navigate("/dashboard"); // Redirect to the login page after successful registration
                  },
                  alert // Display error alerts on request failure
                );
              }
            } else{
              await requestHandler(
                async () => await addUser({
                  name: values.name,
                  email: values.email,
                  password: values.password,
                  phone: values.phone, 
                  userRole: values.userRole,
                  addedBy: values.addedBy, 
                  aiStatus: values.aiStatus, 
                  gender: values.gender,
                  role: values.role,
                }),
                setIsLoading,
                () => {
                  alert("Account created successfully! Go ahead and login.");
                  getUsers();
                  navigate("/dashboard"); // Redirect to the login page after successful registration
                },
                alert // Display error alerts on request failure
              );
            }

            setCreateUserModalOpen(false);
            setSubmitting(false);
          };

    const handlePageClick = ({ selected } : any) => {
            setCurrentPage(selected);
          };
        
    const handleSearch = (e : any) => {
            const query = e.target.value;
            setSearchQuery(query);
            setCurrentPage(0); // Reset to the first page when performing a new search
          };
        
    const filteredData = users?.filter((user) =>
            Object.values(user).some((value : any) =>
              value.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        
    const tableFields = [
          //   { key: "image", value: "Image" },
            { key: "name", value: "Name" },
          //   { key: "email", value: "Email" },
            { key: "phone", value: "Phone No." },
            { key: "status", value: "Status" },
            { key: "actions", value: "Actions" },
          ];
        
          const startIndex = currentPage * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const currentData = filteredData.slice(startIndex, endIndex);      
  return (
    <>
  {/* Create User Modal */}
  {isCreateUserModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
          <Formik initialValues={formInititalState} onSubmit={handleSubmit} validationSchema={validationSchema} enableReinitialize >
        {(formik) => {
              const { handleSubmit } = formik;
              return (
          <div className="relative bg-white p-8 rounded-md">
            <h2 className="text-2xl mb-4">{!isEditing ?  'Add New Supreme Alpha' : 'Update Supreme Alpha'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name">Name:</label>
                {/* <input
                  type="text"
                  id="name"
                  name="name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                /> */}
                <Field type="text" name="name" className="form-control" />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </div>
              <div className="mb-4">
                <label htmlFor="email">Email:</label>
                {/* <input
                  type="text"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                /> */}
                <Field type="email" name="email" className="form-control" disabled={isEditing ? true : false}/>
                 <ErrorMessage name="email" component="div" className="text-danger" />
              </div>
              <>{!isEditing && <><div className="mb-4">
                <label htmlFor="password">Password:</label>
                {/* <input
                  type="text"
                  id="password"
                  name="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                /> */}
                <Field type={"password"} name="password" className="form-control pe-5" />
                 <ErrorMessage name="password" component="div" className="text-danger" />
              </div>
              </>}</>
              <div className="mb-4">
                <label htmlFor="phone">Phone:</label>
                {/* <input
                  type="text"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.phone}
                /> */}
                 <Field type="text" name="phone" className="form-control" />
                 <ErrorMessage name="phone" component="div" className="text-danger" />
              </div>
              <div className="mb-4">
                <label htmlFor="gender">Gender:</label>
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
                </div>
              {/* Add other form fields similarly */}
              <div className="mb-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white px-4 py-2 ml-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
)}}
</Formik>
        </div>
      )}


    <div className="flex justify-between items-center mb-4">
                  <h2>Manage Supreme Alpha</h2>
                  <button className="bg-green-500 text-white px-4 py-2" onClick={handleAddUser}>Add New Supreme Alpha</button>
                </div>

                
                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border p-2 w-full"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>

                {/* Table */}
                <table className="table-fixed w-full">
                  <thead style={{ backgroundColor: '#e2e8f0' }}>
                    <tr>
                      {tableFields.map(field => (
                        <th key={field.key}>{field.value}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((user,index) => (
                      <tr key={user._id} style={{ backgroundColor: index % 2 === 0 ? '#f7fafc' : 'white' }}>
                        {/* <td><img className="w-10 h-10 rounded-full" src={user.image} alt=""/></td> */}
                        <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                            <img className="w-10 h-10 rounded-full" src={user.avatar.url} alt="img"/>
                            <div className="ps-3">
                                <div className="text-base font-semibold">{user.username || user.name}</div>
                                <div className="font-normal text-gray-500">{user.email}</div>
                            </div>  
                        </th>
                        <td>9876543210</td>
                        <td>inactive</td>
                        <td>
                          <button className="bg-blue-500 text-white px-2 py-1 mr-2" onClick={()=>handleUpdateUser(user._id)}  >Edit</button>
                          <button className="bg-red-500 text-white px-2 py-1" onClick={()=>handleDelete(user._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <ReactPaginate
                    previousLabel={"Previous"}
                    nextLabel={"Next"}
                    pageCount={Math.ceil(filteredData.length / itemsPerPage)}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    previousLinkClassName={"pagination__link"}
                    nextLinkClassName={"pagination__link"}
                    disabledClassName={"pagination__link--disabled"}
                    activeClassName={"pagination__link--active"}
                />
    </>
  )
}

export default SupremeALphaPage