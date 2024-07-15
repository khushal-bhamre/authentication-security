import cookieParser from 'cookie-parser';
import express from 'express';

const app = express();
const PORT = 3000;

app.use(cookieParser())

app.get('/',(req,res)=>{
    //cookie send
    res.cookie("sunnyCookie","codingsavvy");
    res.send("Cookie successfully sent!")
})

app.get('/getCookie',(req,res)=>{
    const myCookie = req.cookies.sunnyCookie;
    console.log(myCookie);
    res.send("Cookie read!")
})

app.get('/clearCookie',(req,res)=>{
    res.clearCookie("sunnyCookie");
    res.send("cookie cleared");
})



app.listen(PORT,()=>{
    console.log(`Server running on port PORT`);
})