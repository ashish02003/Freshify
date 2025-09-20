import { useEffect, useState } from "react";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { useLocation, useNavigate } from "react-router-dom";

const RessetPassword = () => {
  const [data, setData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const location = useLocation();

  console.log("location is", location);

  useEffect(() => {
    if (!location?.state?.data?.success) {
      navigate("/");
    }

    if (location?.state?.email) {
      setData((prev) => {
        return {
          ...prev, //yha se newpassword and confirmpassword as it is rahega bas email ko bheja ja rha hai
          email: location?.state?.email, //yha se email ko backend me bhej rhe hai
        };
      });
    }
  }, []);

  console.log("data reset is", data);

  const handleChange = (e) => {
    // const name = e.target.name; // ye name ki value dega jiska name like email,password hoga
    // const value = e.target.value; //ye value ko dega jo value as a input hum dalenge
    const { name, value } = e.target;

    setData((prev) => {
      return {
        ...prev,
        [name]: value, //agar name hai to name aur uski value
      };
    });
  };

  // console.log("data is", data);
  // console.log("name is",name)

  const allData = Object.values(data).every((el) => el);

  const [showNewPassword, setshowNewPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmitData = async (e) => {
    e.preventDefault();

    //Now send the data into the database

    try {
      const response = await Axios({
        ...SummaryApi.resetPassword,
        data: data, //yaha se backend me data bhej rhe hai
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setData({
          email: "",
          newPassword: "",
          confirmPassword: "",
        });

        navigate("/login");
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
        <p className="font-semibold  text-center">Password reset</p>
        <form className="grid gap-4  py-4" onSubmit={handleSubmitData}>
          <div className="grid gap-1  ">
            <label htmlFor="newPassword"> Enter New Password:</label>
            <div className=" bg-blue-50 p-2 border rounded flex items-center focus-within:border-green-800">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                className="w-full outline-none"
                name="newPassword"
                value={data.newPassword}
                onChange={handleChange}
                placeholder="New Password"
              />

              <div
                onClick={() => setshowNewPassword((prev) => !prev)}
                className="cursor-pointer"
              >
                {showNewPassword ? <FaEye /> : <IoMdEyeOff />}
              </div>
            </div>
          </div>

          <div className="grid gap-1  ">
            <label htmlFor="confirmPassword"> Enter confirmPassword:</label>
            <div className=" bg-blue-50 p-2 border rounded flex items-center focus-within:border-green-800">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full outline-none"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder="confirmPassword"
              />

              <div
                onClick={() => setshowConfirmPassword((prev) => !prev)}
                className="cursor-pointer"
              >
                {showConfirmPassword ? <FaEye /> : <IoMdEyeOff />}
              </div>
            </div>
          </div>

          <button
            disabled={!allData}
            className={`${
              allData ? "bg-green-700 hover:bg-green-800" : "bg-gray-500"
            }  text-white py-2 font-semibold  rounded`}
          >
            update password
          </button>
        </form>
      </div>
    </section>
  );
};

export default RessetPassword;
