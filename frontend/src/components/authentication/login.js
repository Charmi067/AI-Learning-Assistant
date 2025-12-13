import { app } from "../../firebase/firebaseConfig"
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import '../css/login.css';
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";
const auth = getAuth(app);
export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const LoginHandler = async (e) => {
        e.preventDefault();
        try {
            const existingUser = await signInWithEmailAndPassword(auth, email, password);
            console.log(existingUser);
            navigate('/AiDashboard');
        } catch (err) {
            console.log(err);
        }
    }
   
    
    return (
        <>
            <div className="loginContainer"> 
            <div className="loginBox">
                <h1>Welcome Back! Restore Your Access</h1>  
            <form onSubmit={LoginHandler}>
                <label htmlFor="email">E-mail:</label><br />
                <input value={email} type="email" onChange={(e) => { setEmail(e.target.value) }} placeholder="Enter Your E-Mail" /><br /><br />
                <label htmlFor="password">Password:</label><br />
                <input value={password} type="password" onChange={(e) => { setPassword(e.target.value) }} placeholder="Enter Your Password" /><br /><br />
                <button type="submit" id="LoginButton">Login</button><br /><br />
                <a id="forgot" href="/forgot">Forgot Password?</a>
                
            </form>
            </div>
            </div>
        </>
    )
}
