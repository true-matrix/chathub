import { useCallback, useEffect, useRef, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import ReactPaginate from 'react-paginate';
import {  getAllGroups } from "../../api";
import { LocalStorage, requestHandler } from "../../utils";
import moment from "moment";
import GroupChatDetailsModal from "../../components/chat/GroupChatDetailsModal";
import { ChatListItemInterface } from "../../interfaces/chat";

const PacksPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [packs, setPacks] = useState<any[]>([]);
    const [openOptions, setOpenOptions] = useState(false);
    const [openGroupInfo, setOpenGroupInfo] = useState(false);
  const [packId, setPackId] = useState("");
  
  const currentChat = useRef<ChatListItemInterface | null>(null);

  const getPacks = useCallback( async () => {
        requestHandler(
        // Call to get the list of available users.
        async () => await getAllGroups(),
        null,
        // On successful retrieval, set the users' state.
        (res) => {
            const { data } = res;
            setPacks(data || []);
        },
        alert // Use default alert for any error messages.
        );
    }, [])
  
    useEffect(() => {
      getPacks()
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
        
    const filteredData = packs?.filter((user) =>
            Object.values(user).some((value : any) =>
              value.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        
    const tableFields = [
            { key: "name", value: "Name" },
            { key: "action", value: "Action" },
            // { key: "otp-received-time", value: "OTP Received Time" },
            // { key: "otp", value: "OTP" },
            // { key: "copy-otp", value: "Copy" },
          ];
        
    const getPaginatedData = () => {
            const startIndex = currentPage * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            return filteredData?.sort((a : any, b : any) => {
              const defaultDate = '1000-01-01T00:00:00.000Z'; // A very distant past date
              const dateA = moment(a.otp_send_time || defaultDate);
              const dateB = moment(b.otp_send_time || defaultDate);
              return dateB.diff(dateA);
            })?.slice(startIndex, endIndex);;
            // return filteredUsers?.slice(startIndex, endIndex);
  };  
  const handlePackModel = (id: string) => {
              setPackId(id);
              setOpenOptions(!openOptions);
              setOpenGroupInfo(true);
    
  }
  return (
    <>
      {openGroupInfo && <GroupChatDetailsModal
        open={openGroupInfo}
        onClose={() => {
          setOpenGroupInfo(false);
        }}
        chatId={packId}
        onGroupDelete={(chatId) => {
          if (currentChat.current?._id === chatId) {
            currentChat.current = null;
            LocalStorage.remove("currentChat");
          }
        }}
      />}

            <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold py-1">Manage Packs</h2>
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
                      {packs && getPaginatedData().map((pack) => (
                        <>
                        <tr className="row"></tr>
                        <tr key={pack._id}>
                          {/* <td><img className="w-10 h-10 rounded-full" src={user.image} alt=""/></td> */}
                          <td scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white rounded-md bg-dark">
                              <img className="w-14 h-14 rounded-full" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPGIbqtNtn1yzk1w1cGmCgFstHk-l2NvevRgw7J7kD3uOT4sjPpn-0CVb5gPGy47z3wtZWY4M5InE_n1zBlBE_PnkDXBydBhU8RCzwijKQYiSGGB1ZJ5umDWXCd4l9TpeiQcsJW2IjwXiOoQxg2M-FhknAF-RmkCOdqJgywWOLw62wSNSCzT1W6cAiZQ0n/s1600/multiwolf100.png" alt="img"/>
                              <div className="ps-3">
                                  <div className="text-base font-semibold">{pack.name}</div>
                                  <div className="font-normal text-gray-500">{pack.participants?.length} membsrs</div>
                              </div>  
                            </td>
                            <td className="text-center">
                            <button onClick={() => handlePackModel(pack._id)}  className="focus:outline-none text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-4 py-2 me-2  dark:focus:ring-yellow-900" >Info</button>
                          </td>
                          {/* <td className="text-center">{user.phone ? user.phone : '-'}</td>
                          <td className="text-center">
                          {user?.otp_send_time ? <p className=" mb-0"> {getMonthDayYearTimeValue(user.otp_send_time)}</p> : <p>-</p>}
                          </td>
                          <td className="text-center">
                              <p className=" mb-0 fw-bold">{(user?.otp) ? (isCurrentTimeGreaterThanGivenTime(user?.otp_expiry_time) ? <span style={{ color: "grey" }}>Expired</span> : 
                              <span style={{ color: "#000", backgroundColor:"yellow" }}>{user?.otp}</span>) : ((user?.otp_expiry_time && user?.islogin)  ? <span style={{ color: "green" }}> 
                              Active</span> : ((user?.otp_expiry_time && user?.islogin === false) ? <span style={{ color: "red" }}>Terminate</span> : "-")) }</p>
                          </td>
                          <td className='text-center text-lg'>
                          <CopyToClipboardButton text={(user?.otp) ? (isCurrentTimeGreaterThanGivenTime(user?.otp_expiry_time) ? "Expired" : user?.otp) : (user?.otp_expiry_time ? "Expired" : "-") } />

                          </td> */}
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

export default PacksPage;