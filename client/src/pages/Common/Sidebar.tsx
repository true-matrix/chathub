// import React, { useEffect } from 'react'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { NavLink } from 'react-router-dom';
import { Logout } from '../Auth/Logout';

import logo from '../../assets/images/wolflogo.svg'
import chat from '../../assets/images/chat.svg'
import profile from '../../assets/images/user-profile.svg'
import dashboard from '../../assets/images/dashboard.svg'
import { useGlobal } from '../../context/GlobalContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { activeButton, setActiveButton, setTabIndex } = useGlobal();
  const {user} = useAuth();

  // const handleButtonClick = (buttonId : string) => {  
  //   // if(buttonId !== "chat") {
  //   //     setActiveButton(buttonId === activeButton ? "chat" : buttonId);
  //   // }
  //   if(buttonId === "chat"){
  //       setActiveButton(buttonId);
  //   }
  //   if(buttonId === "contacts" || buttonId === "profile" || buttonId === "settings"){
  //     setActiveButton(buttonId);
  //   }
  //   else {
  //       setActiveButton("chat")
  //   }
  // };
  
  const handleDashboardButton = () => {
    setActiveButton('dashboard');
    setTabIndex(0);
  }
  const handleContextMenu = (e : any) => {
    e.preventDefault();
  };
  const capitalizeName = (fullName: string) => {
    const names = fullName.split(' ');
    let firstNameInitial, lastNameInitial;
  // Handle cases where the name has 3 or more characters
    if (names.length > 1) {
      firstNameInitial = names[0].charAt(0).toUpperCase();
      lastNameInitial = names[names.length - 1].charAt(0).toUpperCase();
    } else {
      // Handle cases where the name has less than 3 characters
      firstNameInitial = names[0].charAt(0).toUpperCase();
      lastNameInitial = '';
    }
    return firstNameInitial + lastNameInitial;
    }

  return (
    <>
    <div className="flex-shrink-0 tabs-sidebar"> 
        <div className="side-menu-icons"> 
            <div className="navbar-brand-box">
              <a className="logo" href="/chat" onContextMenu={handleContextMenu}><span className="logo-sm"><img src={logo} alt="Logo" className="img-fluid"/></span>
              </a>
            </div>

            <div className="flex-lg-column my-0 sidemenu-navigation">
              <ul className="nav nav-icons" role="tablist">
                <li className="nav-item">
                  {/* <a className={activeButton === 'chat' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveButton('chat')} href="/chat">
                    <img src={chat} />
                  </a> */}
                  <NavLink to="/chat" className={activeButton === 'chat' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveButton('chat')} onContextMenu={handleContextMenu}  data-bs-toggle="pill" role="tab">
                  <img src={chat} />
                  {/* <span className="badge">
              {props.data}
            </span> */}
                  </NavLink>
                </li>  
                <li className="nav-item">
                  {/* <a className="nav-link" href="/settings">
                     <img src={setting} /> 
                  </a> */}
                  <NavLink to="/settings" className={activeButton === 'settings' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveButton('settings')} onContextMenu={handleContextMenu}  data-bs-toggle="pill" role="tab">
                                <img src={profile} />
                 </NavLink>
                </li>

                {(user?.userRole === "admin" || user?.userRole === "supremeAlpha" || user?.userRole === "alpha") && <li className="nav-item">
                <NavLink to="/dashboard" className={activeButton === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => handleDashboardButton()} onContextMenu={handleContextMenu}  data-bs-toggle="pill" role="tab">
                                <img src={dashboard} />
                 </NavLink>
                </li>}

                <li className="nav-item dropdown profile-user-dropdown mt-auto"> 
                <Popup trigger={
                  <button
                    className="profile-user rounded-full bg-primary text-white text-md py-3 px-4 border-2 border-green-500 transition duration-200 transform hover:scale-110"
                    title={user?.name}
                  >
                    {capitalizeName(user?.name)}
                      {/* {user?.name.length <= 6 ? user?.name : user?.name.slice(0, 6) + "..." } */}
                  </button>
                  // <button className="nav-link dropdown-toggle bg-white rounded-full" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-describedby="popup-78477">
                  //               <img crossOrigin="anonymous" src={user?.avatar?.url} alt="" className="profile-user rounded-full border-2"/>
                  // </button>
                } position="top left" closeOnDocumentClick>
                        <div className='user-image-poppup'>
                            {/* <Link to={'/profile'} className="dropdown-item d-flex align-items-center justify-content-between" onContextMenu={handleContextMenu}>Profile <img src={profile} /> </Link > */}
                            {/* <Link to={'/settings'} className="dropdown-item d-flex align-items-center justify-content-between" onContextMenu={handleContextMenu}>Settings <img src={setting} /> </Link> */}
                            {/* <Link to={'/'} className="dropdown-item d-flex align-items-center justify-content-between">Change Password <i className="bx bx-lock-open text-muted ms-1"></i></Link> */}
                            <div className="dropdown-divider"></div>
                            <div className='dropdown-item'><Logout /></div>
                        </div>
                  </Popup>
                </li>
              </ul>
            </div>

        </div> 
      </div>
    </>
  )
}

export default Sidebar