import  { useState } from "react";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


const ForgotPassword = () => {
  const [data, setData] = useState({
    
    email: "",
    
  });

  

  const handleChange = (e) => {
    // const name = e.target.name; // ye name ki value dega jiska name like email,password hoga
    // const value = e.target.value; //ye value ko dega jo value as a input hum dalenge
    const { name, value } = e.target;

    setData((prev) => {
      return {
        ...prev,
        [name]: value //agar name hai to name aur uski value
      };
    });
  };

  // console.log("data is", data);
  // console.log("name is",name)

  const allData = Object.values(data).every(el => el);

  

  const navigate = useNavigate();

  const handleSubmitData = async (e) => {
    e.preventDefault();

    

    //Now send the data into the database

    try {
      const response = await Axios({
        ...SummaryApi.forgot_password,
        data:data   //yaha se backend me data bhej rhe hai
      })

    if(response.data.error){
      toast.error(response.data.message)
    }

    if(response.data.success){
      toast.success(response.data.message)
       navigate("/verification-otp",{
        state:data     // yha se hum email  bhej rhe hai otp-verification wale url par  
       })
      setData({
        email:"",
      })

     
    }
      // console.log("response",response);
    } catch (error) {
      console.log(error); 
      AxiosToastError(error);
    }
  };

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-6 ">
        <p className="font-semibold  text-center">Forgot Password</p>
        <form className="grid gap-4  py-4" onSubmit={handleSubmitData}>
        
          <div className="grid gap-1">
            <label htmlFor="name">Email:</label>
            <input
              type="email"
              id="email"
              className="bg-blue-50 p-2 border rounded outline-none focus:border-green-800"
              name="email"
              value={data.email}
              onChange={handleChange}
            
            />
          </div>
      
          <button
            disabled={!allData}
            className={`${
              allData ? "bg-green-700 hover:bg-green-800" : "bg-gray-500"
            }  text-white py-2 font-semibold  rounded`}
          >
          Send OTP
          </button>
        </form>
        <p>Already   have an account?  <Link to={"/login"} className="font-semibold text-green-700 hover:text-green-800">Login</Link></p>
      </div>
    </section>
  );
};

export default ForgotPassword;

