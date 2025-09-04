// pages/api/dashboard.ts
import type { NextApiRequest, NextApiResponse } from "next";

const EXPRESS_API = "http://localhost:1337"; // or your deployed backend

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(`${EXPRESS_API}/dashboard`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
}
