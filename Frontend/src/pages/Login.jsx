

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

  const [isLoading, setIsLoading] = useState(false); // Loading state
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
    setIsLoading(true); // Start loading
    // console.log("Loading started"); // Debug log

    try {
      const response = await Axios({
        ...SummaryApi.login,
        data:data   //yaha se backend me data bhej rhe hai
      })
      
      // console.log("Response received:", response); // Debug log

      if(response.data.error){
        // console.log("Error case"); // Debug log
        toast.error(response.data.message)
        setIsLoading(false); // Stop loading on error
        return;
      }

      if(response.data.success){
        // console.log("Success case"); // Debug log
        toast.success(response.data.message)
        localStorage.setItem("accessToken",response.data.data.accessToken)
        localStorage.setItem("refreshToken",response.data.data.refreshToken)

        const useDetails  = await fetchUserDetails();
        dispatch(setUserDetails(useDetails.data))
        
        setData({
          email:"",
          password:""
        })

        // Keep loading state until navigation completes
        setTimeout(() => {
          // console.log("Navigating and stopping loading"); // Debug log
          navigate("/")
          setIsLoading(false);
        },); // Small delay to show success state
      } else {
        // Handle case where response doesn't have error or success
        // console.log("Unexpected response"); // Debug log
        setIsLoading(false);
      }
    } catch (error) {
      // console.log("Catch block executed:", error); // Debug log
      AxiosToastError(error);
      setIsLoading(false); // Stop loading on error
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
              disabled={isLoading} // Disable input during loading
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
                disabled={isLoading} // Disable input during loading
              />
 
              <div
                onClick={() => !isLoading && setshowPassword((prev) => !prev)}
                className={`cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {showPassword ? <FaEye /> : <IoMdEyeOff />}
              </div>
            </div>
            <Link  
              to={"/forgot-password"} 
              className={`block ml-auto hover:text-green-800 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              Forgot Password ?
            </Link>
          </div>
          
          <button
            disabled={!allData || isLoading}
            className={`${
              allData && !isLoading ? "bg-green-700 hover:bg-green-800" : "bg-gray-500"
            }  text-white py-2 font-semibold rounded flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p>Don't  have an account?  <Link to={"/register"} className="font-semibold text-green-700 hover:text-green-800">Register</Link></p>
      </div>
    </section>
  );
};

export default Login;