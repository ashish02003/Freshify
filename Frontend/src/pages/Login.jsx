import  { useState } from "react";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import fetchUserDetails from "../utils/fetchUserDetails";
import { setUserDetails } from "../store/userSlice";
import { useDispatch } from "react-redux";





const Login = () => {
  const [data, setData] = useState({
    
    email: "",
    password: ""
    
  });

  const dispatch = useDispatch();

  

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

  const [showPassword, setshowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmitData = async (e) => {
    e.preventDefault();

    

    //Now send the data into the database

    try {
      const response = await Axios({
        ...SummaryApi.login,
        data:data   //yaha se backend me data bhej rhe hai
      })
console.log("response",response)
    if(response.data.error){
      toast.error(response.data.message)
    }

    if(response.data.success){
      toast.success(response.data.message)
      localStorage.setItem("accessToken",response.data.data.accessToken)
      localStorage.setItem("refreshToken",response.data.data.refreshToken)

      const useDetails  = await fetchUserDetails();
      dispatch(setUserDetails(useDetails.data))
      
      setData({
        email:"",
        password:""
      })

      navigate("/")
    }
      console.log("response",response);
    } catch (error) {
      console.log(error); 
      AxiosToastError(error);
    }
  };

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-6 ">
        <p className="font-semibold  text-center">Welcome back to Freshify</p>
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
          <div className="grid gap-1  ">
            <label htmlFor="password"> Password:</label>
            <div className=" bg-blue-50 p-2 border rounded flex items-center focus-within:border-green-800">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full outline-none"
                name="password"
                value={data.password}
                onChange={handleChange}
              />
 
              <div
                onClick={() => setshowPassword((prev) => !prev)}
                className="cursor-pointer"
              >
                {showPassword ? <FaEye /> : <IoMdEyeOff />}
                
              </div>
            </div>
            <Link  to={"/forgot-password"} className="block ml-auto hover:text-green-800">Forgot Password ? </Link>
          </div>
          
          <button
            disabled={!allData}
            className={`${
              allData ? "bg-green-700 hover:bg-green-800" : "bg-gray-500"
            }  text-white py-2 font-semibold  rounded`}
          >
            Login
          </button>
        </form>
        <p>Don't  have an account?  <Link to={"/register"} className="font-semibold text-green-700 hover:text-green-800">Register</Link></p>
      </div>
    </section>
  );
};

export default Login;

