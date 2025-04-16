import { API_BASE_URL } from "@/constants/constants";
import axios from "axios";

export async function fetchCsrfToken(): Promise<string> {
  const res = await axios.get(`${API_BASE_URL}/user/csrf-token`, {
    withCredentials: true,
  });
  return res.data.csrfToken;
}
