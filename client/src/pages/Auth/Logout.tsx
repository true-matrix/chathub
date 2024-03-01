import { useCallback } from "react";
// import { useStoreActions, useStoreState, useStoreDispatch } from '@store';
import { ConfirmAlert } from "../../components/ConfirmAlert";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
// import { useLocation } from "react-router-dom";
import logout_img from '../../assets/images/logout.svg'
// import { requestHandler } from "../../utils";
import { useAuth } from "../../context/AuthContext";

export const Logout = () => {
    const { logout } = useAuth();
    // const [loadingLogout, setLoadingLogout] = useState(false)
    const onYes = useCallback(async() => {
        // await dispatch(setIsAdmin(false))
        // await dispatch(setIsAdminView(false))
        // await logout({ url: `auth/logout` });
        await logout();
        console.log('logout');
    }, []);
    const logoutMe = useCallback(() => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <>
                    
                    <ConfirmAlert onClose={onClose} onYes={() => onYes()} heading="Are you sure?" subHeading={"You want to logout?"} onCloseText="Close" onSubmitText="Logout" />
                    </>
                );
            }
        });
    }, []);
  return (
    <>
    { 
       <div onClick={() => logoutMe()} className="custom-pointer">Logout <img src={logout_img} /></div> 
    }
    </>
  )
}
