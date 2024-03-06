import { useState } from "react";
import { useGlobal } from "../../context/GlobalContext";
import Sidebar from "../Common/Sidebar";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import SupremeALphaPage from "./SupremeAlphaPage";
import dashboard from '../../assets/images/dashboard.svg'


const AdminDashboard = () => {
  const { tabIndex, setTabIndex } = useGlobal();

//   const [tabIndex, setTabIndex] = useState(0);
 
  return (
    <>
    <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 overflow-hidden"> 
      {/* Left Sidebar Tabs */}
      <Sidebar/>
       {/* Dashboard Sidebar */}
        <div className="w-full border-l-[0.1px] border-secondary chat-background">
       
        <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
            <TabList>
            <Tab>SupremeAlpha</Tab>
            <Tab>Title 2</Tab>
            </TabList>

            <TabPanel>
                {/* <AdminDashboard/> */}
                <SupremeALphaPage/>
            {/* <h2>Any content 2</h2> */}
            </TabPanel>
            <TabPanel>
            <h2>Any content 2</h2>
            </TabPanel>
        </Tabs>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard