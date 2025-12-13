const textract = require("textract");
const mammoth = require("mammoth");
const fs = require("fs");
const PDF = require("pdf-parse");
const extractText=async (mimeType,fileBuffer,fileName)=>{

    if(mimeType==="application/pdf"){
        const data = await PDF(fileBuffer);
        return data.text;
    }
    if(mimeType==="application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
        const data=await mammoth.extractRawText({ buffer: fileBuffer });
        console.log("data",data.value);
        return data.value;
    }
    if(mimeType==="application/vnd.openxmlformats-officedocument.presentationml.presentation"){
        
    }
        
    if (mimeType === "text/plain") {
        return fileBuffer.toString("utf8");
    }
    else{
        console.log("entering in last Else promise......")
    // 4️⃣ Fallback for other formats (doc, ppt, excel, etc.)
        return new Promise((resolve, reject) => {
        textract.fromBufferWithName(fileName, fileBuffer, (err, text) => {
            if (err) reject(err);
            else resolve(text);
        });
    });
    }
}
module.exports=extractText;