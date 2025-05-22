import axios from "axios";

const baseService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_URL ?? "http://localhost:3002",
});

export default baseService;
