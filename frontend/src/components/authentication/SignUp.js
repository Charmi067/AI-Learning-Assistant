import { useState } from "react";
import { app } from "../../firebase/firebaseConfig"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../css/SignUp.css';

const auth = getAuth(app);

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const NewUser = await createUserWithEmailAndPassword(auth, email, password);
            console.log(NewUser);
            navigate('/AiDashboard');
        } catch (err) {
            console.log(err);
            alert(err.message || 'Signup error');
        }
    }
    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Create an account</h2>
                <form action="" onSubmit={submitHandler}>
                    <label htmlFor="email">E-mail:</label>
                    <input className="signup-input" value={email} id="email" name="email" type="email" onChange={(e) => { setEmail(e.target.value) }} placeholder="Enter your e-mail" />

                    <label htmlFor="password">Password:</label>
                    <input className="signup-input" value={password} id="password" name="password" type="password" onChange={(e) => { setPassword(e.target.value) }} placeholder="Create a password" />

                    <button className="signup-button" type="submit">Sign Up</button>
                </form>
                <div className="signup-footer">Already have an account? <a href="/login">Sign In</a></div>
            </div>
        </div>
    )
}

export default SignUp;