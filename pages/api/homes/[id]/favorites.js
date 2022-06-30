import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  // TODO: Check if user is authenticated
  const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

  // TODO: Retrieve home ID from request
  const { id } = req.query;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { favoriteHomes: true },
  });

  // TODO: Add home to favorite
  if (req.method === 'PUT') {
    try {
        
        await prisma.user.update({
            data: {
                favoriteHomes: {
                    connect: { id: { id } },
                },
            };
        });
        res.status(200).json({ message: 'Successfully added favorite' })
    } catch (err) {
        res.status(500).json({ message: `Something went wrong: ${err}` })
    }
  }
  // TODO: Remove home from favorite
  else if (req.method === 'DELETE') {
    try {
        // const user = await prisma.user.findUnique({
        //     where: { email: session.user.email }
        // })
        await prisma.user.update({
            data: {
                favoriteHomes: {
                    disconnect: { id },
                },
            };
        });
        res.status(200).json({ message: 'Successfully removed favorite' })
    } catch (err) {
        res.status(500).json({ message: `Something went wrong: ${err}` })
    }
  }
  // HTTP method not supported!
  else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
  }
}