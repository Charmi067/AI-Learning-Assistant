import React from 'react'
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../../firebase/firebaseConfig"
import '../css/login.css'
const Forgot = () => {
    const navigate=useNavigate();
    const auth = getAuth(app);
    const GoogleHander=async ()=>{
                try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: "select_account" });
                    const googleUser = await signInWithPopup(auth, provider);
                    console.log(googleUser);
                    navigate('/AiDashboard');
                } catch (err) {
                    console.log(err);
                
            }
    }

    const PhoneHandler=()=>{
        navigate('/login-with-phone');
    }
    const resetPassword=()=>{
        navigate('/reset-password');
    }
    
  return (
    
    <div className='loginContainer'>
      <div className='loginBox'>
         <button  id="GoogleButton" type="button" onClick={GoogleHander}>Login with Google</button>
         <button  id="GoogleButton" type="button" onClick={PhoneHandler}>Login with Phone Number</button>
         <button  id="GoogleButton" type="button" onClick={resetPassword}>Reset Password</button>
         
         </div>
    </div>
  )
}

export default Forgot