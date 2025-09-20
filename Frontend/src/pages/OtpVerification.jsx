import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useRef } from "react";

const OtpVerification = () => {
  const [data, setData] = useState(["", "", "", "", "", ""]);
  const allData = data.every((el) => el);
  const navigate = useNavigate();
  const inputRef = useRef([]);
  const location = useLocation();
  // console.log("location is ", location)

  useEffect(() => {
    if(!location?.state?.email) {
      navigate("/forgot-password");
    }
  },[]);

  const handleSubmitData = async (e) => {
    e.preventDefault();

    //Now send the data into the database

    try {
      const response = await Axios({
        ...SummaryApi.forgot_password_otp_verification,
        data: {
          otp: data.join(""),
          email: location?.state?.email,
        }, //yaha se backend me data bheja rhe hai
      });

      if(response.data.error) {
        toast.error(response.data.message)
      } 
      if(response.data.success) {
        toast.success(response.data.message);
        setData(["", "", "", "", "", ""]);
        navigate("/reset-password",{
          state:{
            data : response.data, //Otp bheja ja rha hai
            email:location?.state?.email //email bheja ja rha hai
          }
        });
      }
      console.log("response", response);
    } catch (error) {
      console.log(error);
      AxiosToastError(error);
    }
  };

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-6 ">
        <p className="font-semibold  text-center">Enter OTP</p>
        <form className="grid gap-4  py-4" onSubmit={handleSubmitData}>
          <div className="grid gap-1">
            <label htmlFor="otp">Enter your OTP here</label>
            <div className="flex  items-center gap-2 justify-between mt-5 ">
              {data.map((element, index) => {
                return (
                  <input
                    key={index}
                    ref={(elem) => {
                      inputRef.current[index] = elem;
                      return elem;
                    }} // store each input in array
                    type="text"
                    id="otp"
                    value={data[index]}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log("value", value);
                      const newData = [...data]; //copy array
                      newData[index] = value;
                      setData(newData);
                      if (value && index < 5) {
                        inputRef.current[index + 1].focus();
                      }
                    }}
                    maxLength={1}
                    className="bg-blue-50  w-full max-w-16   p-2 border rounded outline-none focus:border-green-800  text-center font-semibold"
                  />
                );
              })}
            </div>
          </div>

          <button
            disabled={!allData}
            className={`${
              allData ? "bg-green-700 hover:bg-green-800" : "bg-gray-500"
            }  text-white py-2 font-semibold  rounded`}
          >
            Verify OTP
          </button>
        </form>
        <p>
          Don't have an account?
          <Link
            to={"/register"}
            className="font-semibold text-green-700 hover:text-green-800"
          >
            Register
          </Link>
        </p>
      </div>
    </section>
  );
};

export default OtpVerification;
