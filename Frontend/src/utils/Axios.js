import SummaryApi, { baseURL } from "../common/SummaryApi";
import axios from "axios";

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true, // if you're using cookies/session
});


//1>sending access token in the header
Axios.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToekn"); //local storage se access token ko le rhe hai
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`; //agar access token mil gya to to server header me bhejo bearer ke through
    }

    return config;
  },
  //agar koi error milta hai to
  (error) => {
    return Promise.reject(error);
  }
);

//2>agar access token expire ho gya then we need refreshToken
//OR extend the life span of access token with the help refresh token

Axios.interceptors.request.use(
  (response) => {
    return response; //if access token is not expire means works properly the return that response
  },
  async(error) => {
    let originRequest = error.config; //when i  was refresh the token,then again i want to send the request that's why i was store inside this here

    // originRequest.retry by default false rahta hai
    if (error.response.status == 401 && !originRequest.retry) {
      originRequest.retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      //if refresh token was available then Renew the accessToken
      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken); //yha hum ek naya access token get kr rhe hai
        if (newAccessToken) {
          originRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originRequest);
        }
        
      }
    }

    return Promise.reject(error); // may be if refresh token was not availbale in the local storage then directly send the error which is coming from the backend side
  }
);

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await Axios({
      ...SummaryApi.refreshToken,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const accessToken = response.data.data.accessToken;
    localStorage.setItem("accessToken", accessToken);

    return accessToken;
  } catch (error) {
    console.log(error);
  }
};

export default Axios;


