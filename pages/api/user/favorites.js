import { prisma } from "@/lib/prisma";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { id } = req.query;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { favoriteHomes: true },
      });

    // Get the user's favorites
    if (req.method === 'GET') {
      try {
        
        
        const favorites = user.favoriteHomes.map((home) => home.id)
        console.log(favorites)
        res.status(200).json({ favorites });
      } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
      }
    }
    // HTTP method not supported!
    else {
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
    }
};
  