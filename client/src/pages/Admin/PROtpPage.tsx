import { useCallback, useEffect, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import ReactPaginate from 'react-paginate';
import {getPROTPsApi } from "../../api";
import { requestHandler } from "../../utils";
import {  getMonthDayYearTimeValue, isCurrentTimeGreaterThanGivenTime } from "../../commonhelper";
import { CopyToClipboardButton } from "../../components/CopyToClipboardButton";
import moment from "moment";

const PROtpPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<any[]>([]);

    // Function to retrieve available users.
    const getUsers = useCallback( async () => {
        requestHandler(
        // Call to get the list of available users.
        async () => await getPROTPsApi(),
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
            { key: "requested-at", value: "Requested At" },
            { key: "status", value: "Status" },
            { key: "otp", value: "OTP" },
          ];
        
    const getPaginatedData = () => {
            const startIndex = currentPage * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            return filteredData?.sort((a : any, b : any) => {
              const defaultDate = '1000-01-01T00:00:00.000Z'; // A very distant past date
              const dateA = moment(a.pr_otp_send_time || defaultDate);
              const dateB = moment(b.pr_otp_send_time || defaultDate);
              return dateB.diff(dateA);
            })?.slice(startIndex, endIndex);;
          };  
  return (
    <>

            <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold py-1">Manage Password Reset OTP</h2>
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
                    <thead>
                      <tr>
                        {tableFields.map(field => (
                          <th key={field.key}>{field.value}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users && getPaginatedData().map((user) => (
                        <>
                        <tr className="row"></tr>
                        <tr key={user._id}>
                          {/* <td><img className="w-10 h-10 rounded-full" src={user.image} alt=""/></td> */}
                          <td scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white rounded-md bg-dark">
                              <img className="w-14 h-14 rounded-full" src={user.avatar.url} alt="img"/>
                              <div className="ps-3">
                                  <div className="text-base font-semibold">{user.name || user.username }</div>
                                  <div className="font-normal text-gray-500">{user.email}</div>
                              </div>  
                          </td>
                          <td className="text-center">
                          {user?.pr_otp_send_time ? <p className=" mb-0"> {getMonthDayYearTimeValue(user.pr_otp_send_time)}</p> : <p>-</p>}
                          </td>
                          {/* <td className="text-center"> 
                              <p className=" mb-0 fw-bold">{(user?.pr_otp) ? (isCurrentTimeGreaterThanGivenTime(user?.otp_expiry_time) ? <span style={{ color: "grey" }}>Expired</span> : 
                              <span style={{ color: "#000"}}>Pending</span>) : ((user?.otp_expiry_time && user?.islogin)  ? <span style={{ color: "green" }}> 
                              Active</span> : ((user?.otp_expiry_time && user?.islogin === false) ? <span style={{ color: "red" }}>Terminated</span> : "-")) }</p>
                          </td> */}
                          <td className='text-center text-lg'>
                            <div className="flex items-center justify-center gap-2">
                                 {user?.pr_otp ? 
                                 (isCurrentTimeGreaterThanGivenTime(user?.pr_otp_expiry_time) ? <span style={{ color: "grey" }}>Expired</span> : <span style={{ color: "green" }}> 
                                 Active</span>) : 
                                 (user?.pr_otp_expiry_time ? <span style={{ color: "red" }}> 
                                 Used</span> : '-') } 
                            </div>
                             

                          </td>
                          <td className='text-center text-lg'>
                            <div className="flex items-center justify-center gap-2">
                                 {user?.pr_otp ? <span style={{ color: "#000", backgroundColor: "yellow",minWidth:"45px" }}>{user?.pr_otp}</span> : <span style={{minWidth:"45px"}}>-</span> } <CopyToClipboardButton text={(user?.pr_otp) ? (isCurrentTimeGreaterThanGivenTime(user?.pr_otp_expiry_time) ? "Expired" : user?.pr_otp) : (user?.pr_otp_expiry_time ? "Expired" : "-") } />
                            </div>
                             

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
    </>
  )
}

export default PROtpPage;