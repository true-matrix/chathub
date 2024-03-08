import { useGlobal } from "../context/GlobalContext";
import Sidebar from "./Common/Sidebar"
import { useAuth } from "../context/AuthContext";
import rain from '../assets/videos/rain.webm';
import email from '../assets/images/envelope.svg';
import phone from '../assets/images/phone-alt.svg'; 

const SettingsPage = () => {
  const { activeButton } = useGlobal();
  const {user} = useAuth();  
  
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
                <h1 className="font-bold text-center text-2xl text-gray-900">{user?.username || (user.name ? user.name: `Shakir Ali`)}</h1>
                <p className="text-center text-sm text-gray-400 font-medium">{user?.userRole} hello</p>
                <div className="w-full">
                  <div className="mt-5 w-full flex flex-col items-center overflow-hidden text-sm">
                    <a href="#" className="w-full text-gray-600 py-2 pl-3 pr-3 w-full block">
                      <img src={phone} alt="" className="h-4 inline-block mr-3"/>{user.email} 
                    </a>
                    <a href="#" className="w-full text-gray-600 py-2 pl-3 pr-3 w-full block">
                      <img src={email} alt="" className="h-4 inline-block mr-3"/>9876543210 
                      {/* <span className="text-gray-500 text-xs">49 min ago</span> */}
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
            <img
              src="https://tecdn.b-cdn.net/img/new/avatars/2.webp"
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <button 
            >
              Upload Image
            </button>
          </div>
          <div className="upload-user-image avatar-list flex items-center space-x-3 w-full overflow-hidden">
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
          </div>
        </div>
         
      <div className="space-y-1">
        <div className="rounded-xl border bg-white"> 
          <div className="flex flex-col space-y-3 px-3 py-8 sm:px-10">
            <label className="block">
              <p className="text-sm">Name</p>
              <input className="w-full rounded-md border py-2 px-2 bg-gray-50 outline-none ring-blue-600 focus:ring-1" type="text" value="Shakir Ali" />
            </label>
            <label className="block">
              <p className="text-sm">Email</p>
              <input className="w-full rounded-md border py-2 px-2 bg-gray-50 outline-none ring-blue-600 focus:ring-1" type="email" value="shakir.ali@company.com" />
            </label>
            <label className="block">
              <p className="text-sm">Team</p>
              <select className="w-full rounded-md border py-2 px-2 bg-gray-50 outline-none ring-blue-600 focus:ring-1" name="team" value="UI/UX Design">
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="UI/UX Design">Marketing</option>
                <option value="UI/UX Design">Engineering</option>
              </select>
            </label>
            <button className="mt-4 mr-auto rounded-lg bg-blue-600 px-10 py-2 text-white">Save</button>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  )
}

export default SettingsPage