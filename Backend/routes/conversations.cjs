const firestore = require("firebase-admin/firestore")
const express = require("express")
const router = express.Router();
const { db } = require("../firebaseAdmin.cjs")

router.get('/AiDashboard/:user', async (req, res) => {
    try {
        //console.log("params",req.params);
        const userId = req.params.user;
        const convSnap = await db
            .collection("users")
            .doc(userId)
            .collection("conversations")
            .orderBy("updatedAt", "desc")
            .get();
        const conversations = convSnap.docs.map(doc => ({
            conversationId: doc.id,
            ...doc.data()
        }))
        //console.log(convSnap.docs);

        res.json({ success: true, conversations });
    } catch (err) {
        console.log("Error occured during getting conversations:", err);
        res.status(500).json("Internal server error:", err);
    }

})

module.exports=router;