const multer = require ("multer")
const pdfParse = require ("pdf-parse")
const fs = require ("fs")

const express = require ("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())
const upload = multer({
    dist : "/uploads"
})

// get response

app.get("/",(req, res)=>{
    res.send("Server is running")
})

// post response

app.post("/upload",upload.single("resume"),async(req,res)=>{
   try{
    const dataBuffer = fs.readFileSync(req.file.path)
    const pdfData = await pdfParse(dataBuffer)
    
   }
   catch{

   }
})

app.listen(5000,()=>{
    console.log("Server is running on port 5000")
})

