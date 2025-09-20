import jwt from "jsonwebtoken"
const auth = async(req,res,next)=>{

   try {
    
    const token = req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1]; 



    if(!token){

     return res.status(401).json({
         messgae:"please provide token"   
         
      })
    }

    const decode = await jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN); //ye batata hai ki jo token hai usi userID ka hai ki nhi aur ye userID return karta hai
    console.log("decode is",decode)

    //if token was expire ..token verification returns false
    
   if(!decode){

      return res.status(401).json({
            message: "unauthorized access",
            error:true,
            success:false
      })
   }
 req.userId = decode.id;
 next();

   } catch (error) {
    
   return res.status(500).json({
        message : error.message || error,
      
        success:false,
        error:true
    })
   }
}


export default auth;