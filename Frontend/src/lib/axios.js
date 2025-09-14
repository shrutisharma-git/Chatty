import axios from "axios";

export const axiosInstance = axios.create({
    baseURL :  "http://localhost:6204/api",
    withCredentials : true, //send cookies with requests
})

