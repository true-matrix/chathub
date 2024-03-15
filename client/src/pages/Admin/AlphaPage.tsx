import { useCallback, useEffect, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import ReactPaginate from 'react-paginate';
import { addAlpha, getAllAlphas, getUserById, updateAlpha, deleteAlpha } from "../../api";
import { requestHandler } from "../../utils";
import { ErrorMessage, Field, Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { confirmAlert } from "react-confirm-alert";
import { ConfirmAlert } from "../../components/ConfirmAlert";
import { generateUniqueId } from "../../commonhelper";

interface CreateUserFormValues {
    username: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    userRole:string;
    addedBy:string | null;
    parentId:string | null;
    gender: string;
    aiStatus: string; // active inactive status
    role: string; 
  }


const AlphaPage = () => {
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
    let uid = generateUniqueId();

    const initValues : CreateUserFormValues = {
        username: uid,
        name: '',
        email:'',
        password: '',
        phone: '',
        userRole: 'alpha',
        parentId: user._id,
        addedBy: user._id,
        aiStatus: 'active', // active inactive status
        gender: '',
        role: 'USER'
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
  console.log(selectedId);
  console.log(isLoading);
  

    // Function to retrieve available users.
    const getUsers = useCallback( async () => {
        requestHandler(
        // Call to get the list of available users.
        async () => await getAllAlphas(),
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

  
    const itemsPerPage = 4; // Number of items per page
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
      const onYes = useCallback(async (id:string) => {
        await requestHandler(
          async () => await deleteAlpha(id),
          setIsLoading,
          () => {
            alert("User deleted successfully!");
            getUsers();
            navigate("/dashboard"); // Redirect to the login page after successful registration
          },
          alert // Display error alerts on request failure
        );
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
                  async () => await updateAlpha(values._id, {
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
                async () => await addAlpha({
                  username: values.username,
                  name: values.name,
                  email: values.email,
                  password: values.password,
                  phone: values.phone, 
                  userRole: values.userRole,
                  addedBy: values.addedBy, 
                  parentId: values.parentId, 
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
    <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Manage Alpha</h2>
                  <button className="rounded-md border-none bg-primary text-white text-md py-2 px-4 flex flex-shrink-0" onClick={handleAddUser}>Add New Alpha</button>
                </div>
                
                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border p-2 w-full rounded-lg text-md py-3 px-5 focus:outline-none"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>

                {/* Table */}
                <div className="table-container">
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
                        <>
                        <tr className="row"></tr> 
                        <tr key={user._id}>
                          {/* <td><img className="w-10 h-10 rounded-full" src={user.image} alt=""/></td> */}
                          <td scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                              <img className="w-10 h-10 rounded-full" src={user.avatar.url} alt="img"/>
                              <div className="ps-3">
                                  <div className="text-base font-semibold">{user.name || user.username }</div>
                                  <div className="font-normal text-gray-500">{user.email}</div>
                              </div>  
                          </td>
                          <td className="text-center">{user.phone ? user.phone : '9876543210'}</td>
                          <td className={`text-center ${user.verified ? 'text-green-500' : 'text-red-500'}`}>
                              {user.verified ? 'Active' : 'Inactive'}
                            </td>
                          <td className="text-center">
                            <button className="focus:outline-none text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-4 py-2 me-2  dark:focus:ring-yellow-900" onClick={()=>handleUpdateUser(user._id)}  >Edit</button>
                            <button className="focus:outline-none text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" onClick={()=>handleDelete(user._id)}>Delete</button>
                          </td>
                        </tr>
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

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
  {/* Create User Modal */}
  { isCreateUserModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
          <Formik initialValues={formInititalState} onSubmit={handleSubmit} validationSchema={validationSchema} enableReinitialize >
        {(formik) => {
              const { handleSubmit } = formik;
              return (
          <div className="relative bg-white rounded-md update-popup">
            <h2 className="mb-4">{!isEditing ?  'Add New Alpha' : 'Update Alpha'}</h2>
            {/* {JSON.stringify(values)} */}
            <form onSubmit={handleSubmit} className="p-5">
              <div className="mb-4">
                <label htmlFor="name">Name:</label>
                <Field type="text" name="name" className="block w-full rounded-xl outline outline-[1px] outline-zinc-400 border-0 py-3 px-4 font-light" />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </div>
              <div className="mb-4">
                <label htmlFor="email">Email:</label>
                <Field type="email" name="email" className="block w-full rounded-xl outline outline-[1px] outline-zinc-400 border-0 py-3 px-4 font-light" disabled={isEditing ? true : false}/>
                 <ErrorMessage name="email" component="div" className="text-danger" />
              </div>
              <>{!isEditing && <><div className="mb-4">
                <label htmlFor="password">Password:</label>
                <Field type={"password"} name="password" className="block w-full rounded-xl outline outline-[1px] outline-zinc-400 border-0 py-3 px-4 font-light pe-5" />
                 <ErrorMessage name="password" component="div" className="text-danger" />
              </div>
              </>}</>
              <div className="mb-4">
                <label htmlFor="phone">Phone:</label>
                 <Field type="text" name="phone" className="block w-full rounded-xl outline outline-[1px] outline-zinc-400 border-0 py-3 px-4 font-light" />
                 <ErrorMessage name="phone" component="div" className="text-danger" />
              </div>
              <div className="mb-4">
                <label htmlFor="gender">Gender:</label>
                <div>
                    <label>
                    <Field type="radio" name="gender" value="male"  className="me-2"/>
                    Male
                    </label>
                    <label className="ml-4">
                    <Field type="radio" name="gender" value="female"  className="me-2"/>
                    Female
                    </label>
                </div>
                <ErrorMessage name="gender" component="div" className="text-danger" />
                </div>
              {/* Add other form fields similarly */}
              <div className="mb-4 ms-auto w-fit">
               
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-md border-none  bg-gray-500 text-white px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border-none bg-primary text-white text-md py-2 px-4 ml-2"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
)}}
</Formik>
        </div>
      )} 

    </>
  )
}

export default AlphaPage;