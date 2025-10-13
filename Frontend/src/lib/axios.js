import axios from "axios";

const BASE_URL ="https://chatty-huz1.onrender.com/api";
export const axiosInstance = axios.create({
    baseURL :  BASE_URL,
    withCredentials : true, //send cookies with requests
})

