
require("dotenv").config()
const multer = require ("multer")
const { PDFParse } = require ("pdf-parse")
const fs = require ("fs")
const express = require ("express")
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json())
const upload = multer({
    dest : "uploads/"
})
const {
    GoogleGenerativeAI
} = require("@google/generative-ai")

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// get response

app.get("/",(req, res)=>{
    res.send("Server is running")
})

// post response

app.post("/upload",upload.single("resume"),async(req,res)=>{
   try{
    const dataBuffer = fs.readFileSync(req.file.path)
    const parser = new PDFParse({ data: dataBuffer })
    const pdfData = await parser.getText()
    const resumeText = pdfData.text
    const model = genAi.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json"
        }
    })
    const result = await model.generateContent(`

You are an ATS resume analyzer.

Return ONLY valid JSON.

IMPORTANT:
- strengths MUST be an array
- weaknesses MUST be an array
- missing_skills MUST be an array
- improvements MUST be an array

Example format:

{
  "score": 82,
  "feedback": "Strong frontend profile with decent project experience.",
  "strengths": [
    "Good React projects",
    "Clean resume structure"
  ],
  "weaknesses": [
    "No internship experience"
  ],
  "missing_skills": [
    "AWS",
    "Docker"
  ],
  "improvements": [
    "Add measurable project outcomes",
    "Improve skills section"
  ]
}

Resume text:

${resumeText}

`)
    const aiResponse = result.response.text()
    const parsedResponse = JSON.parse(aiResponse)
    console.log(parsedResponse)
    
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
    }

    res.json({
        score: parsedResponse.score,
        feedback: parsedResponse.feedback,
        strengths: parsedResponse.strengths,
        weaknesses: parsedResponse.weaknesses,
        missing_skills: parsedResponse.missing_skills,
        improvements: parsedResponse.improvements
    })
   }
   catch(error){
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
    }
    console.log(error)
    res.status(500).json({
        error: "PDF processing failed"
    })
   }
})

app.listen(5000,()=>{
    console.log("Server is running on port 5000")
})


