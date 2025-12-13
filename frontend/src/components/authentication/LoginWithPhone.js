import {useState,useEffect} from 'react'
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth'
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/firebaseConfig"
import { useNavigate } from 'react-router-dom'
import '../css/login.css'
const LoginWithPhone = () => {
    const auth = getAuth(app);
    const navigate=useNavigate();
    const [PhNumber, setPhNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setconfirmationResult] = useState(null);
    useEffect(() => {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'abc', {
            'size': 'invisible',
            callback: (response) => {
                console.log("Recaptcha Verified");
            }
        })
        window.recaptchaVerifier.render();
    },)

    const sendOtp = async () => {
        try {
            const varifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, PhNumber, varifier);
            setconfirmationResult(confirmation);
            console.log("OTP sent");
        } catch (err) {
            console.log("Error during OTP send", err);
        }
    }

    const VerifyOtp = async () => {
        try {
            if (confirmationResult == null) return;
            const res = await confirmationResult.confirm(otp)
            console.log("User logged in with phone number", res);
            alert('OTP verified successfully!');
            navigate('/AiDashboard');
        } catch (err) {
            console.log("Error during OTP verification", err);
        }
    }
    return (
        <>
             <div className='loginContainer'>
                <div className='loginBox'>
            <h2>Phone Number Login</h2>
            <input value={PhNumber} onChange={(e) => setPhNumber(e.target.value)} placeholder="Enter Your Phone Number" /><br /><br />
            <div id='abc'></div>
            <button type="button" onClick={sendOtp}>Login with Phone Number</button>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" /><br /><br />
            <button type="button" onClick={VerifyOtp}>Verify OTP</button>
            </div>
            </div>
        </>
    )
}

export default LoginWithPhone