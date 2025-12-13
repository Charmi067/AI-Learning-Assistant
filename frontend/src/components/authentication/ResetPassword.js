import {useState} from 'react'
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../../firebase/firebaseConfig"
import '../css/login.css'
const auth = getAuth(app);
const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const forgotPasswordHandler = async (e) => {
        e.preventDefault();
        if (!email) {
            alert('Please enter your email above to receive a password reset link.');
            return;
        }
        try {
            console.log("email:",email);
            await sendPasswordResetEmail(auth, email,{
                url:"http://127.0.0.1:3001/Login"
            });
            alert("If this email is registered, you will receive a password reset link.");
        } catch (err) {
            console.error('Password reset error', err);
            alert('Error sending password reset email: ' + (err.message || err));
        }
    }
   
    return (
        <>
            <div className='loginContainer'>
                <div className='loginBox'>
            <h1>Reset Your Password</h1>
            <label htmlFor="email">E-mail:</label><br />
            <input value={email} type="email" onChange={(e) => { setEmail(e.target.value) }} placeholder="Enter Your E-Mail" /><br /><br />
            <button type="button" onClick={forgotPasswordHandler}>Send Password Reset Email</button>
            
                </div>
            </div>
        </>
    )
}

export default ResetPassword