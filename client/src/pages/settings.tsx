import { useState } from "react";
import { useGlobal } from "../context/GlobalContext";
import Sidebar from "./Common/Sidebar"
import { useAuth } from "../context/AuthContext";

const SettingsPage = () => {
  const { activeButton } = useGlobal();
  const {user} = useAuth();

  const showUserRole = (userRole : string) => {
    switch (userRole) {
      case 'admin':
        return 'Lycaon'
      case 'supremeAlpha':
        return 'Supreme Alpha'
      case 'alpha':
        return 'alpha'
      default:
        return 'omega'
    }
  }
  
  return (
    <>
    <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 overflow-hidden"> 
      {/* Left Sidebar Tabs */}
      <Sidebar/>
       {/* Profile Sidebar */}
       {activeButton === "settings" && <div className="w-1/3 relative ring-white overflow-y-auto px-0">
       <div className="container p-4">
          <div>
            <div className="bg-white relative shadow rounded-lg mx-auto">
              <div className="flex justify-center">
                <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="" className="rounded-full mx-auto w-32 h-32 shadow-md border-4 border-white transition duration-200 transform hover:scale-110"/>
              </div>
              <div className="mt-5">
                <h1 className="font-bold text-center text-3xl text-gray-900">{user?.username || (user.name ? user.name: `Shakir Ali`)}</h1>
                <p className="text-center text-sm text-gray-400 font-medium">{showUserRole(user?.userRole)}</p>
                <div className="w-full">
                  <div className="mt-5 w-full flex flex-col items-center overflow-hidden text-sm">
                    <a href="#" className="w-full border-t border-gray-100 text-gray-600 py-4 pl-6 pr-3 w-full block hover:bg-gray-100 transition duration-150">
                      <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt="" className="rounded-full h-6 shadow-md inline-block mr-2"/>{user.email} 
                    </a>
                    <a href="#" className="w-full border-t border-gray-100 text-gray-600 py-4 pl-6 pr-3 w-full block hover:bg-gray-100 transition duration-150">
                      <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt="" className="rounded-full h-6 shadow-md inline-block mr-2"/>{user.phone ? user.phone : '9876543210'} 
                      {/* <span className="text-gray-500 text-xs">49 min ago</span> */}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
       {/* <div className="container mx-auto my-60">
        <div>

            <div className="bg-white relative shadow rounded-lg w-5/6 md:w-5/6  lg:w-4/6 xl:w-3/6 mx-auto">
                <div className="flex justify-center">
                        <img src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="" className="rounded-full mx-auto absolute -top-20 w-32 h-32 shadow-md border-4 border-white transition duration-200 transform hover:scale-110"/>
                </div>
                
                <div className="mt-16">
                    <h1 className="font-bold text-center text-3xl text-gray-900">Shakir Ali</h1>
                    <p className="text-center text-sm text-gray-400 font-medium">UI/UX Design</p>
                    <p>
                        <span>
                            
                        </span>
                    </p>
                    <div className="my-5 px-6">
                        <a href="#" className="text-gray-200 block rounded-lg text-center font-medium leading-6 px-6 py-3 bg-gray-900 hover:bg-black hover:text-white">Connect with <span className="font-bold">@pantazisoft</span></a>
                    </div>
                    <div className="flex justify-between items-center my-5 px-6">
                        <a href="" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition duration-150 ease-in font-medium text-sm text-center w-full py-3">Facebook</a>
                        <a href="" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition duration-150 ease-in font-medium text-sm text-center w-full py-3">Twitter</a>
                        <a href="" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition duration-150 ease-in font-medium text-sm text-center w-full py-3">Instagram</a>
                        <a href="" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition duration-150 ease-in font-medium text-sm text-center w-full py-3">Email</a>
                    </div>

                    <div className="w-full">
                        <h3 className="font-medium text-gray-900 text-left px-6">Recent activites</h3>
                        <div className="mt-5 w-full flex flex-col items-center overflow-hidden text-sm">
                            <a href="#" className="w-full border-t border-gray-100 text-gray-600 py-4 pl-6 pr-3 w-full block hover:bg-gray-100 transition duration-150">
                                <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt="" className="rounded-full h-6 shadow-md inline-block mr-2"/>
                                    Updated his status
                                    <span className="text-gray-500 text-xs">24 min ago</span>
                            </a>

                            <a href="#" className="w-full border-t border-gray-100 text-gray-600 py-4 pl-6 pr-3 w-full block hover:bg-gray-100 transition duration-150">
                                <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt="" className="rounded-full h-6 shadow-md inline-block mr-2"/>
                                    Added new profile picture
                                    <span className="text-gray-500 text-xs">42 min ago</span>
                            </a>

                            <a href="#" className="w-full border-t border-gray-100 text-gray-600 py-4 pl-6 pr-3 w-full block hover:bg-gray-100 transition duration-150">
                                <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt="" className="rounded-full h-6 shadow-md inline-block mr-2"/>
                                Posted new article in <span className="font-bold">#Web Dev</span>
                                <span className="text-gray-500 text-xs">49 min ago</span>
                            </a>

                            <a href="#" className="w-full border-t border-gray-100 text-gray-600 py-4 pl-6 pr-3 w-full block hover:bg-gray-100 transition duration-150">
                                <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt="" className="rounded-full h-6 shadow-md inline-block mr-2"/>
                                Edited website settings
                                <span className="text-gray-500 text-xs">1 day ago</span>
                            </a>

                            <a href="#" className="w-full border-t border-gray-100 text-gray-600 py-4 pl-6 pr-3 w-full block hover:bg-gray-100 transition duration-150 overflow-hidden">
                                <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt="" className="rounded-full h-6 shadow-md inline-block mr-2"/>
                                Added new rank
                                <span className="text-gray-500 text-xs">5 days ago</span>
                            </a>
                            
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div> */}
      </div>}

      {/* Settings */}
        <div className="w-2/3 border-l-[0.1px] border-secondary chat-background">
        <p className="py-2 text-xl font-semibold">Settings</p>
        <div className="flex items-center space-x-4">
      <img
        src="https://tecdn.b-cdn.net/img/new/avatars/2.webp"
        alt="Avatar"
        className="w-12 h-12 rounded-full object-cover"
      />
      <button
        // onClick={handleChangeImage}
        className="px-3 py-1 bg-blue-500 text-white rounded-md focus:outline-none hover:bg-blue-600"
      >
        Change Image
      </button>
    </div>
      <div className="space-y-1">
        <div className="rounded-md border bg-white">
          <div className="flex w-full items-center px-6 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            <span> Shakir Ali</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto h-5 w-5 cursor-pointer text-gray-400 active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div className="flex flex-col space-y-3 px-4 py-6 sm:px-10">
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
            <button className="mt-4 ml-auto rounded-lg bg-blue-600 px-10 py-2 text-white">Save</button>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  )
}

export default SettingsPage