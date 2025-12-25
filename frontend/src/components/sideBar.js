import React, { useEffect } from 'react'
import { app } from "../firebase/firebaseConfig"
import axios from "axios";
import { useState } from "react"
import { getAuth } from 'firebase/auth';
import './css/sideBar.css';
const SideBar = ({displayChat}) => {
    const auth = getAuth(app);
    const userId = auth.currentUser.uid;
    const [conversations, setConversations] = useState([]);
    useEffect(() => {
        const fetchConversations = async () => {
            if (!auth.currentUser) return; // user not loaded yet
            const userId = auth.currentUser.uid;
            const token = await auth.currentUser?.getIdToken();
            try {
                console.log("userId",userId)
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // not Authentication
                    },
                });
                
                setConversations(response.data.conversations);
            } catch (err) {
                console.error("Error fetching conversations:", err);
            }
        };
        
        fetchConversations();
    }, [auth]); // run when auth loads
    
    const ConvHandler = async (id) => {
        const token =await auth.currentUser?.getIdToken();
        try{
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/${userId}/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })  
            displayChat(response.data.conversationMessages);
            console.log(conversations);
        }catch(err){
            console.log("error in fetching conversation messages...");
        }
         
    }
    return (
        <div className="sidebar">

            <h3>Your Chats</h3>
            {conversations.length === 0 ? (
                <p>No conversations yet</p>
            ) : (
                <ul>
                    {conversations.map(conv => (
                        <li className="chat-title" onClick={() => ConvHandler(conv.conversationId)}>
                            {conv.title}
                        </li>
                    ))}
                </ul>
            )}

        </div>
    )
}

export default SideBar;