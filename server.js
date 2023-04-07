// Complete Events Exercise
const {createServer}=require('http');
const { appendFile }=require("fs");
const path=require("path");
const{EventEmitter}=require("events");
const PORT=5001;
const Newsletter=new EventEmitter();

const server=createServer((request, response)=>{
    const{url,method}=request; 
    const chunks=[];
    request.on("error",(err)=>{
        console.error(err);
        response.statusCode=404;
        response.setHeader("Content-Type","application/json");
        response.write(JSON.stringify({msg:"Invalid request 404!"}));
        response.end();
    });

    request.on("data",(chunk)=>{
        chunks.push(chunk)
        console.log(chunks)
    })
    request.on("end",()=>{
        if(url==="/newsletter_signup"&&method==="POST"){
            const body=JSON.parse(Buffer.concat(chunks).toString());
            const signup=`${body.username}, ${body.email}\n`;
            Newsletter.emit("new user!",signup,response);
            response.setHeader("Content-Type","application/json");
            response.write(
                JSON.stringify({msg:"successfully added user"})
            );
            response.end();

        }else if(url==="/newsletter_signup"&&method==="GET"){
            response.setHeader("content-Type","text/html");
            const readStream=createReadStream(
                path.join(__dirname,"index.html")
            )
            readStream.pipe(response);
        }else{
            response.statusCode=400;
            response.setHeader("content-Type","application/json");
            response.write(JSON.stringify({msg:"not a valid endpoint"}));
            response.end();
        }
    })
})
server.listen(PORT,()=>console.log("Server listening at"+PORT))


Newsletter.on("new user!",(username,response)=>{
    appendFile(
        path.join(__dirname,"./assets/users.csv"),
        username,
        (err)=>{
            if(err){
                Newsletter.emit('error',err,response);
                return;
            }
            console.log("The file was updated")
        }
    )
})


Newsletter.on("error",(err,response)=>{
    console.error(err);
    response.statusCode=500;
    response.setHeader("content-type","application/json")
    response.write(JSON.stringify({msg:"there was an error in creating new movie"}))
    response.end();
})

