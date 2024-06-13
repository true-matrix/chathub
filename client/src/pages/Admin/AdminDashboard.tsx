import { useGlobal } from "../../context/GlobalContext";
import Sidebar from "../Common/Sidebar";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import SupremeALphaPage from "./SupremeAlphaPage";
import { useAuth } from "../../context/AuthContext";
import AlphaPage from "./AlphaPage";
import OmegaPage from "./OmegaPage";
import OtpPage from "./OtpPage";
import PacksPage from "./PacksPage";
import PROtpPage from "./PROtpPage";


const AdminDashboard = () => {
  const { tabIndex, setTabIndex } = useGlobal();
  const {user} = useAuth();


//   const [tabIndex, setTabIndex] = useState(0);
 
  return (
    <>
    <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 overflow-hidden"> 
      {/* Left Sidebar Tabs */}
      <Sidebar/>
       {/* Dashboard Sidebar */}
        <div className="w-full border-l-[0.1px] border-secondary chat-background p-5">
       
        <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
            <TabList>
            {user?.userRole === "admin" &&<Tab>SupremeAlpha</Tab>}
            {user?.userRole === "supremeAlpha" && <Tab>Alpha</Tab>}
            {(user?.userRole === "supremeAlpha" || user?.userRole === "alpha") && <Tab>Omega</Tab>}
            {user?.userRole === "supremeAlpha" && <Tab>Packs</Tab>}
            {user?.userRole === "supremeAlpha" && <Tab>PR OTP</Tab>}
            <Tab>Login OTP</Tab>
            </TabList>

            {user?.userRole === "admin" &&<TabPanel>
                <SupremeALphaPage/>
            </TabPanel>}
            {user?.userRole === "supremeAlpha" && <TabPanel>
                <AlphaPage/>
            </TabPanel>}
            {(user?.userRole === "supremeAlpha" || user?.userRole === "alpha") && <TabPanel>
                <OmegaPage/>
            </TabPanel>}
            {user?.userRole === "supremeAlpha" && <TabPanel>
                <PacksPage/>
            </TabPanel>}
            {user?.userRole === "supremeAlpha" && <TabPanel>
                <PROtpPage/>
            </TabPanel>}
            <TabPanel>
              <OtpPage/>
            </TabPanel>
        </Tabs>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard