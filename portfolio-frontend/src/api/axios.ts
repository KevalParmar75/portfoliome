import axios from "axios";

const api = axios.create({
  baseURL: "https://portfoliome-ge50.onrender.com/api/",
});

export default api;
