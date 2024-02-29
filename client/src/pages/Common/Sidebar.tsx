import React, { useEffect } from 'react'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logout } from '../Auth/Logout';

import logo from '../../assets/images/wolflogo.svg'
import chat from '../../assets/images/chat.svg'
import profile from '../../assets/images/user-profile.svg'
import setting from '../../assets/images/user-setting.svg'
import dashboard from '../../assets/images/dashboard.svg'
import user_image from '../../assets/images/users/avatar-1.jpg'
import { useGlobal } from '../../context/GlobalContext';

const Sidebar = () => {
  const { activeButton, setActiveButton } = useGlobal();
  const handleButtonClick = (buttonId : string) => {  
    // if(buttonId !== "chat") {
    //     setActiveButton(buttonId === activeButton ? "chat" : buttonId);
    // }
    if(buttonId === "chat"){
        setActiveButton(buttonId);
    }
    if(buttonId === "contacts" || buttonId === "profile" || buttonId === "settings"){
      setActiveButton(buttonId);
    }
    else {
        setActiveButton("chat")
    }
  };
  const handleContextMenu = (e : any) => {
    e.preventDefault();
  };

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
                  <NavLink to="/chat" className={activeButton === 'chat' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveButton('chat')} onContextMenu={handleContextMenu} id="pills-user-tab" data-bs-toggle="pill" role="tab">
                                <img src={chat} />
                  </NavLink>
                </li> 
                <li className="nav-item">
                {/* <a className={activeButton === 'profile' ? 'nav-link active' : 'nav-link'} onClick={() => handleButtonClick('profile')} href="/profile">
                    <img src={profile} />
                  </a> */}
                  {/* <OverlayTrigger 
                            delay={{ hide: 150, show: 100 }} 
                            overlay={(props) => ( 
                            <Tooltip {...props}> 
                                Profile 
                            </Tooltip> 
                            )} 
                            placement="right" 
                            > */}
                                <NavLink to="/profile" className={activeButton === 'profile' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveButton('profile')} onContextMenu={handleContextMenu} id="pills-user-tab" data-bs-toggle="pill" role="tab">
                                <img src={profile} />
                                </NavLink>
                  {/* </OverlayTrigger>  */}
                </li>
                <li className="nav-item">
                  {/* <a className="nav-link" href="/settings">
                     <img src={setting} /> 
                  </a> */}
                  <NavLink to="/settings" className={activeButton === 'settings' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveButton('settings')} onContextMenu={handleContextMenu} id="pills-user-tab" data-bs-toggle="pill" role="tab">
                                <img src={setting} />
                 </NavLink>
                </li>

                <li className="nav-item mt-auto">
                  <a className="nav-link" href="#" onContextMenu={handleContextMenu}>
                    <img src={dashboard} /> 
                  </a>
                </li>
                <li className="nav-item dropdown profile-user-dropdown">
                  {/* <button className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-describedby="popup-78477">
                    <img src={user_image} alt="" className="profile-user rounded-full"/>
                  </button> */}
                  <Popup trigger={<button className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-describedby="popup-78477">
                                <img crossOrigin="anonymous" src={user_image} alt="" className="profile-user rounded-full"/>
                            </button>} position="top left" closeOnDocumentClick>
                        <div>
                            <Link to={'/profile'} className="dropdown-item d-flex align-items-center justify-content-between" onContextMenu={handleContextMenu}>Profile <img src={profile} /> </Link >
                            <Link to={'/settings'} className="dropdown-item d-flex align-items-center justify-content-between" onContextMenu={handleContextMenu}>Settings <img src={setting} /> </Link>
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