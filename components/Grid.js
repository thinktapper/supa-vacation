import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from '@/components/Card';
import { ExclamationIcon } from '@heroicons/react/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

const Grid = ({ homes = [] }) => {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState([])

  const isEmpty = homes.length === 0;

  useEffect(() => {
    (async () => {
      if(session?.user){
        const fetchFavorites = async () => {
          const res = await axios.get(`/api/user/favorites`)
          setFavorites(res.data.favorites)
        }

        fetchFavorites()
      }
    })();
  }, [session?.user]);

  const toggleFavorite = async id => {
    // TODO: Add/remove home from the authenticated user's favorites
    if(favorites.includes(id)){
      const res = await axios.delete(`/api/homes/${id}/favorite`)
      if(res.status === 200){
        console.log(res)
        setFavorites(favorites => favorites.filter(homeId => homeId !== id))
      }
    }else{
      const res = await axios.put(`/api/homes/${id}/favorite`)
      if(res.status === 200){
        setFavorites(favorites => [...favorites, id])
      }
    }
  };

  return isEmpty ? (
    <p className="text-amber-700 bg-amber-100 px-4 rounded-md py-2 max-w-max inline-flex items-center space-x-1">
      <ExclamationIcon className="shrink-0 w-5 h-5 mt-px" />
      <span>Unfortunately, there is nothing to display yet.</span>
    </p>
  ) : (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {homes.map(home => (
        <Card key={home.id} {...home} onClickFavorite={toggleFavorite} />
      ))}
    </div>
  );
};

Grid.propTypes = {
  homes: PropTypes.array,
};

export default Grid;
