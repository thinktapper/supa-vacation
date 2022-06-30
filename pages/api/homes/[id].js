import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
// import { useSession } from 'next-auth/react';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const ListedHome = (home = null) => {
//   const { data: session } = useSession();
//   const [isOwner, setIsOwner] = useState(false);

//   useEffect(() => {
//     (async () => {
//       if(session?.user){
//         try {
//           const owner = await axios.get(`/api/homes/${home.id}/owner`)
//           setIsOwner(owner?.id === session.user.id)
//         } catch (err) {
//           setIsOwner(false)
//         }
//       }
//     })();
//   }, [session?.user]);

//   const router = useRouter()

//   const [deleting, setDeleting] = useState(false)

//   const deleteHome = async () => {
//       let toastId;
//       try {
//         toastId = toast.loading('Deleting...');
//         setDeleting(true);
//         // Delete home from DB
//         await axios.delete(`/api/homes/${home.id}`);
//         // Redirect user
//         toast.success('Successfully deleted', { id: toastId });
//         router.push('/homes');
//       } catch (err) {
//         console.log(err);
//         toast.error('Unable to delete home', { id: toastId });
//         setDeleting(false);
//       }
//     };

//   return ( 
//     <Layout>
//           <div className="max-w-screen-lg mx-auto">
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 space-y-4">
//               <div>
//                 <h1 className="text-2xl font-semibold truncate">
//                   {home?.title ?? ''}
//                 </h1>
//                 <ol className="inline-flex items-center space-x-1 text-gray-500">
//                   <li>
//                     <span>{home?.guests ?? 0} guests</span>
//                     <span aria-hidden="true"> · </span>
//                   </li>
//                   <li>
//                     <span>{home?.beds ?? 0} beds</span>
//                     <span aria-hidden="true"> · </span>
//                   </li>
//                   <li>
//                     <span>{home?.baths ?? 0} baths</span>
//                   </li>
//                 </ol>
//               </div>
    
//               {isOwner ? (
//                 <div className="flex items-center space-x-2">
//                   <button
//                     type="button"
//                     disabled={deleting}
//                     onClick={() => router.push(`/homes/${home.id}/edit`)}
//                     className="px-4 py-1 border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition rounded-md disabled:text-gray-800 disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Edit
//                   </button>
    
//                   <button
//                     type="button"
//                     disabled={deleting}
//                     onClick={deleteHome}
//                     className="rounded-md border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white focus:outline-none transition disabled:bg-rose-500 disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1"
//                   >
//                     {deleting ? 'Deleting...' : 'Delete'}
//                   </button>
//                 </div>
//               ) : null}
//             </div>
            
//     			</div>
//     </Layout>
// );
// }


// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

// const prisma = new PrismaClient()

export default async function handler(req, res){
  // Check if user is authenticated
  const session = await getSession({ req })
  if(!session){
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  // Retrieve the authenticated user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { listedHomes: true },
  })

  // Check if authenticated user is the owner of this home
  const { id } = req.query;
  if (!user?.listedHomes?.find(home => home.id === id)) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  // Update home
  if(req.method === 'PATCH'){
    try {
        const home = await prisma.home.update({
          where: { id },
          data: req.body,
        });
        res.status(200).json(home);
      } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
      }
  }
  // Delete home
  else if(req.method === 'DELETE'){
    try {
      const home = await prisma.home.delete({
        where: { id },
      })
      // Remove image from Supabase storage
      if(home.image){
        const path = home.image.split(`${process.env.SUPABASE_BUCKET}/`)?.[1]
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([path])
      }
      res.status(200).json(home)
    } catch (err) {
      res.status(500).json({ message: 'Something went wrong' })
    }
  }
  // HTTP method not suuported!
  else{
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
  }
}