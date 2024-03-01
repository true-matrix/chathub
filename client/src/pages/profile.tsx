import { useGlobal } from "../context/GlobalContext";
import Sidebar from "./Common/Sidebar"

const ProfilePage = () => {
  const { activeButton } = useGlobal();
  return (
    <>
    <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 overflow-hidden"> 
      {/* Left Sidebar Tabs */}
      <Sidebar/>

      {/* Profile Sidebar */}
      {activeButton === "profile" && <div className="w-1/3 relative ring-white overflow-y-auto px-0">
      </div>}
        <div className="w-2/3 border-l-[0.1px] border-secondary chat-background">

        </div>
      </div>
    </>
  )
}

export default ProfilePage