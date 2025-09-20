import { Resend } from 'resend';
import dotenv from "dotenv";
dotenv.config()
 
if(!process.env.RESEND_API){
     console.log("provide the RESEND_API in process.env file")
}
const resend = new Resend(process.env.RESEND_API);

const sendEmail = async({sendTo,subject,html})=>{

    try {
        
        const { data, error } = await resend.emails.send({
           
            from: 'Freshify <no-reply@adstech.it>', // use your verified domain
            to: sendTo,
            subject: subject, // subject is like forgot password ,verification
            html:html,        // means template which type of template we want to send
          });

          if (error) {
            return console.error({ error });
          }
         
          return data

          
    } catch (error) {
       console.log(error) 
    }

}



export default sendEmail