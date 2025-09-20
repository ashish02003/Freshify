import  { useState } from "react";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const [showPassword, setshowPassword] = useState(false);
  const [showconfirmPassword, setshowconfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmitData = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      toast.error("password and confirm password must be the same!!😒");
      return;
    }

    //Now send the data into the database

    try {
      const response = await Axios({
        ...SummaryApi.register,
        data:data //yaha se backend me data bhej rhe hai
      })

    if(response.data.error){
      toast.error(response.data.message)
    }

    if(response.data.success){
      toast.success(response.data.message)
      setData({
        name:"",
        email:"",
        password:"",
        confirmPassword:""
      })

      navigate("/login")
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
        <p className="font-semibold  text-center">Welcome to Freshify</p>
        <form className="grid gap-4  mt-6" onSubmit={handleSubmitData}>
          <div className="grid gap-1">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              autoFocus
              className="bg-blue-50 p-2 border rounded outline-none  focus:border-green-800"
              name="name"
              value={data.name}
              placeholder="Enter your name"
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="name">Email:</label>
            <input
              type="email"
              id="email"
              className="bg-blue-50 p-2 border rounded outline-none focus:border-green-800"
              name="email"
              placeholder="Enter your  valid Email ID"
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
          </div>




          <div className="grid gap-1  ">
            <label htmlFor="confirmPassword"> Confirm Password:</label>
            <div className=" bg-blue-50 p-2 border rounded flex items-center focus-within:border-green-800">
              <input
                type={showconfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full outline-none"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
              />
            
              <div
                onClick={() => setshowconfirmPassword((prev) => !prev)}
                className="cursor-pointer"
              >
                {showconfirmPassword ? <FaEye /> : <IoMdEyeOff />}
              </div>
            </div>
          </div>
          <button
            disabled={!allData}
            className={`${
              allData ? "bg-green-700 hover:bg-green-800" : "bg-gray-500"
            }  text-white py-2 font-semibold my-3  rounded tracking-wide`}
          >
                Register
          </button>

        </form>
        <p>Already have an account?   <Link to={"/login"} className="font-semibold text-green-700 hover:text-green-800">Login</Link></p>
      </div>
      
    </section>
  );
};

export default Register;
