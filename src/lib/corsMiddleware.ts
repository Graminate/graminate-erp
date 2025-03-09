import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

// Initialize the CORS middleware
const cors = Cors({
  origin: "*", // Allows all origins. Change this to your frontend URL for security.
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed request methods
});

// Helper function to run middleware in Next.js API routes
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default cors;
