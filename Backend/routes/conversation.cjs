const express = require("express")
const router = express.Router();
const {db} = require("../firebaseAdmin.cjs");
router.get("/:userId/:conversationId", async (req, res) => {
    try {
        console.log(req.params)
        const { userId, conversationId } = req.params;
       
        const convSnap = await db
            .collection("users")
            .doc(userId)
            .collection("conversations")
            .doc(conversationId)
            .collection("messages")
            .orderBy("Timestamp", "asc")
            .get();

        const conversationMessages = convSnap.docs.map(doc => ({
            messageId: doc.id,
            ...doc.data()
        }))
        console.log(convSnap.docs)
        res.json({success:true,conversationMessages})

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
})

module.exports=router;