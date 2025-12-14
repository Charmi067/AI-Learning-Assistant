import './css/AiDashboard.css'
import { getAuth } from "firebase/auth";
import { app } from "../firebase/firebaseConfig"
import axios from "axios";
import { useEffect, useState } from "react"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import Sidebar from './sideBar';
const auth = getAuth(app);
const Storage = getStorage(app);
const db = getFirestore(app);
const AiDashboard = () => {
  let data;
  const [conversationId, setConversationId] = useState("")
  const [lastFileId, setLastFileId] = useState(null);
  const [isUploading,setIsUploading] = useState(false);
  const UploadToFirebase = async (e) => {

    try{
    setIsUploading(true);
    const token = await auth.currentUser.getIdToken();
    const file = e.target.files[0];
    const getFileHash = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join(" ");
        return hashHex;
    }
    const fileHash = await getFileHash(file);
    
    const q = query(
      collection(db, `metaDatas/${auth.currentUser.uid}/files`),
      where("fileHash", "==", fileHash)
    );
    
    const result = await getDocs(q);

   if (!result.empty) {
      const existing = result.docs[0].data();
      setLastFileId(existing.fileId);
      alert("File already uploaded. Using existing file.");
      return;
    }

      console.log("Uploading to everywhere-------",token)
      
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
          headers: {
            "Authorization": `Bearer ${token}`  // optional
          }
        });
        data = await response.data;
        setLastFileId(data.fileId);

      //Upload same pdf to firebase storage
      const storageRef = ref(Storage, `pdfs/${auth.currentUser.uid}/${file.fileName}`);
      await uploadBytes(storageRef, file);

      // save file metadata to firestore
      await addDoc(collection(db, `metaDatas/${auth.currentUser.uid}/files`), {
        uid: auth.currentUser.uid,
        fileName: file.name,
        storagePath: `pdfs/${auth.currentUser.uid}/${file.name}`,
        fileHash: fileHash,
        uploadedAt: new Date(),
        fileId: data.fileId
      });
      console.log("🐦‍🔥 file is uploaded to qdrant,firestore , fireStorage");
      alert("🔥🐦‍🔥 Document is Successfully Loaded..!!")
    } catch (err) {
      console.log("Error uploading file ...", err);
    }finally{
      setIsUploading(false);
    }
    }
  


  const [prompt, setPrompt] = useState("");
  const [ans, setAns] = useState("");
  const SubmitHandler = async (e) => {
    e.preventDefault();

    console.log("conversationId", conversationId);
    const token = await auth.currentUser?.getIdToken();
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/AiDashboard/ask`, {
      userId: auth.currentUser.uid,
      que: prompt,
      fileId: lastFileId,
      conversationId: conversationId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const data = response.data;
    //console.log(data.answer);
    setPrompt(" ")

    setAns(`
      <div style="margin-bottom:10px;">
      <strong>You:</strong> ${prompt}
      </div>
      
      <div style="margin-top:10px;">
      <strong>AI:</strong> ${data.answer}
      </div>
      `);
  }

  useEffect(() => {
    startNewChat();
  }, [])
  const startNewChat = () => {
    const newId = crypto.randomUUID();  // Built-in in browsers
    setConversationId(newId);
    setAns("");         // clear chatbox
    setPrompt("");      // clear input
    //console.log("New conversation:", newId);
  };

  const displayChat = (messages) => {
    //printing messages data to the element
    console.log("messages:", messages);
    const html = messages.map(msg => `<p><b>${msg.role} : </b> ${msg.content}</P>`).join("\n");
    setAns(html);
  }

  return (
    <div>

      <h1 className='Header'>Welcome to AI Dashboard</h1>
      <div className='AiBox'>
        <button onClick={startNewChat}>+ New Chat</button>

        <div
          className="ChatBox"
          dangerouslySetInnerHTML={{ __html: ans }}
        ></div>

        <input id='fileInput' onChange={UploadToFirebase} type='file' />

        <form className='InputBox'>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className='TextArea'
            placeholder='Type your text here...'
          ></textarea>

          <button onClick={SubmitHandler} disabled={isUploading}>{isUploading ? "Uploading... please wait" : "Send"}</button>
        </form>

      </div>
      <div>
        <Sidebar displayChat={displayChat} />
      </div>
    </div>

  )
}

export default AiDashboard