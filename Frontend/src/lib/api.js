import { axiosInstance } from "./axios";

export const signup =  async(signupData) => {
  const response = await axiosInstance.post("auth/signup", signupData);
  return response.data;
};

export const getAuthUser = async() =>{
  const res = await axiosInstance.get("/auth/me");
  console.log(res);
  return res.data;
};

export const completeOnboarding = async(userData) => {
  return axiosInstance.post('/auth/onboarding', userData);
}

