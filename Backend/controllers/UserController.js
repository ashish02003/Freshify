import userModelCollection from "../Models/UserModel.js";
import sendEmail from "../config/sendEmail.js";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import bcryptjs from "bcryptjs";

import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import uploadImageClodinary from "../utils/uploadImageCloudinary.js";
import generatedOtp from "../utils/generatedOtp.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from "jsonwebtoken"


// A : Register controller

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "provide name,email,password",
        error: true,
        success: false,
      });
    }

    // 1. if all field name,email,password was provided,,,for that check this "email" is present in my database

    const user = await userModelCollection.findOne({ email });
    if (user) {
      return res.json({
        message: "already registered Email",
        error: true,
        success: false,
      });
    }

    // 2.hash the password

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // 3. new user register in our database

    const payload = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModelCollection(payload);
    const saveNewUser = await newUser.save();

    // 4. verification Email
    const verifyEmailURL = `${process.env.FRONTEND_URL}/verify-email?code=${saveNewUser?._id}`; //abhi ke liye user ki ID he code rakh lete hai

    const verifyEmail = await sendEmail({
      sendTo: email,
      subject: " Verify Email From Freshify",
      html: verifyEmailTemplate({
        name,
        url: verifyEmailURL,
      }),
    });

    return res.json({
      message: "user register successfully!!🎉🎉🤗Please check your Email for verify ",
      error: false,
      success: true,
      data: saveNewUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// B : verification of email
export async function verifyEmailController(req, res) {
  try {
    const { code } = req.body;

    const user = await userModelCollection.findOne({ _id: code });

    if (!user) {
      res.status(400).json({
        messgae: "Invalid code!!😒",
        success: false,
        error: true,
      });
    }

    const updateUser = await userModelCollection.updateOne(
      { _id: code },
      { verify_email: true }
    );

    res.json({
      message: "Verify Email Done",
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: true,
    });
  }
}

// C : Login Controller

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "provide Email and password",
        error: true,
        success: false,
      });
    }

    //1.now check the Email Id is available in my dataBase or Not
    const user = await userModelCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: " User Not Registered  || invalid EmailID",
        success: false,
        error: true,
      });
    }

    // 2.if account is suspended or inactive then

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "please contact to admin",
        success: false,
        error: true,
      });
    }

    //3.  user Registered  hai then
    //CHECK Password

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return res.status(400).json({
        message: "please Check your password...wrong password!!",
        success: false,
        error: true,
      });
    }

    // 4. if Email aur password dono database me hai tab token generate karo

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    const updateUser = await userModelCollection.findByIdAndUpdate(user?._id,{
      last_login_date:new Date()
    })

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie("accessToken", accessToken, cookiesOption); //send the token inside the user  cookie
    res.cookie("refreshToken", refreshToken, cookiesOption); //send the token inside the user  cookie

    return res.json({
      message: "Login Successfully!!🎉🎉🤗",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

// D : Logout controller

export async function logoutController(req, res) {
  try {
    const userid = req.userId; //coming from middleware
    console.log("userid is", userid);
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    //ab jo user Login karega wahi to Logout karega n😎

    const removeRefreshToken = await userModelCollection.findByIdAndUpdate(
      userid,
      { refresh_token: "" }
    );

    return res.json({
      message: "Logout Successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      messsage: error.message || error,
      error: true,
      success: false,
    });
  }
}

// E : upload user avatar

export async function uploadAvatar(req, res) {
  try {
    //we can't get the image directly BCZ image will be the some file format ....so for getting the image file we use multer
    const userId = req.userId; //coming from auth middlware
    const image = req.file; //coming from multer middlware
    console.log("image", image);

    const upload = await uploadImageClodinary(image);
    const updateUSer = await userModelCollection.findByIdAndUpdate(userId, {
      avatar: upload.url,
    });
    return res.json({
      message: "upload profile",
      data: {
        _id: userId,
        avatar: upload.url,
      },
    });
  } catch (error) {
    return res.status(500).json({
      messgae: error.messgae || error,
      success: false,
      error: true,
    });
  }
}

// F : update User Details

export async function updateUserDetails(req, res) {
  try {
    const userId = req.userId; // coming from auth middleware
    const { name, email, mobile, password } = req.body;

    let hashedPassword = "";

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashedPassword = await bcryptjs.hash(password, salt);
    }

    const updateUser = await userModelCollection.updateOne(
      { _id: userId },
      {
        //if name is provided by the user in the req.body then name will be update in our database,,,,if not provide it will not be updated

        ...(name && { name: name }),
        ...(email && { email: email }),
        ...(mobile && { mobile: mobile }),
        ...(password && { password: hashedPassword }),
      }
    );

    return res.json({
      message: "updated user successfully!!🤗🤗",
      error: false,
      success: true,
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

// G : forgot password if user has not login

export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    //check karo ki wo emailID hamre database me present hai ki nhi
    const user = await userModelCollection.findOne({ email });
                                                          
    if (!user) {
      return res.status(400).json({
        message: "Email is Not valid",
        error: true,
        success: false,
      });
    }

    const otp = generatedOtp();
    const expireTime = new Date() + 60 * 60 * 1000; // Now it is converted into 1 hours

    const update = await userModelCollection.findByIdAndUpdate(user._id, {
      forgot_password_otp:otp,
      forgot_password_expiry: new Date(expireTime).toISOString(),

    });

    await sendEmail({
      sendTo: email,
      subject: "Forgot Password From Freshify",
      html: forgotPasswordTemplate({
        name: user.name,
        otp: otp,
        
      }),
    });

    return res.json({
      message: "check your Email",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

// H : verify forgot password otp

export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        messgae: "please provide the field email and otp",
        success: false,
        error: true,
      });
    }
  
    //ab check karo ki user ne jo  email enter kiya hai...wo email hamare database me present hai ki nhi
    const user = await userModelCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }
         
  
    //now check OTP is expired or not

    const currentTime = new Date().toISOString();

    if (user.forgot_password_expiry < currentTime) {
      return res.status(400).json({
        message: "OTP is Expired",
        success: false,
        error: true,
      });
    }
       
    //Now if OTP is not expire then check the OTP is present in our database or not

    if (otp !== user.forgot_password_otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        success: false,
        error: true,
      });
    }

    //if otp is not expire
    //otp ==user.forgot_password_otp


    //if OTP has verified then remove it from the database

    const updateUser = await userModelCollection.findByIdAndUpdate(user?._id,{
      forgot_password_otp:"",
      forgot_password_expiry:""
    })
    return res.status(200).json({
      error: false,
      message: "verify OTP successfully",
      success: true,
      
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

// I : reset password

export async function resetPassword(req, res) {

  try {
    const { email, newPassword, confirmPassword } = req.body;

    if ((!email, !newPassword, !confirmPassword)) {
      return res.status(400).json({
        message: "provide the field email,newPassword,confirmPassword",
        error: true,
        success: false,
      });
    }
  
    const user = await userModelCollection.findOne({ email });
  
    if (!user) {
      return res.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "newPassword and Confirm Password must be the  same",
        success: false,
        error: true,
      });
    }
  
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
  
    const update = await userModelCollection.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });
  
    return res.json({
      message: "Password updated successfully!!",
      error: false,
      success: true,
    });
  } catch (error) {

       return res.status(500).json({
        message: error.message||error,
        success:false,
        error:true
       })
  }
 
}
// J: Refresh Token

export async function refreshToken(req,res){

  try {
    
   const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]; 

   if(!refreshToken){
     return res.status(400).json({

     message : "Invalid refresh token",
     error:true,
     success: false

     })
   }

   console.log("refreshToken",refreshToken)
  //  ab token mil gya hai to token ko verify karte hain--------verify the token

   const verifyRefreshToken  = jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN);
   console.log("verifyRefreshToken",verifyRefreshToken);

   if(!verifyRefreshToken){

    return res.status(400).json({
        message : "Token is expire",
        error:true,
        success:false

    })
   }
  
   //if verify token is not expire then generate a new accessToken and send to the client side

   const userId = verifyRefreshToken._id ;
   const newAccessToken = await generatedAccessToken(userId);

   const cookiesOption = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res.cookie("accessToken", newAccessToken, cookiesOption);

  return res.json({
    messgae : "new access token is generated!!",
    error:false,
    success:true,
    data :{
      accessToken: newAccessToken
    }
  })



  } catch (error) {
    
    return res.status(500).json({

      message : error.message || error,
      success:false,
      error:true
    })
  }
}

//H : get Login user Details

export async function userDetails(request,response){


  try {
    
    const userId = request.userId;
    const user = await userModelCollection.findById(userId).select('-password -refresh_token') //yha password aur refresh_token nhi chahiye eslye .select hai

    return response.json({
message:"user Details",
data:user,
error:false,
success:true

    })
  } catch (error) {
    
     return res.status(500).json({
        message: "something is wrong ",
        success:false,
        error:true
       })
  }
}