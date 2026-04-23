import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = async () => {
    try {
      const data = await api.getFeed();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading feed...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-md mx-auto mt-6 flex flex-col gap-4 pb-20">
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No contacts yet. Be the first to add one!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-300 rounded overflow-hidden">
            {/* Added-by header */}
            <div className="p-3 font-semibold text-sm border-b border-gray-100">
              {post.username}
            </div>

            {/* Contact details */}
            <div className="p-4 flex flex-col gap-2">
              <p className="text-base font-bold">{post.name}</p>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-500 mr-1">Phone:</span>
                {post.phoneNumber}
              </p>
              {post.address && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-500 mr-1">Address:</span>
                  {post.address}
                </p>
              )}
              {post.createdAt && (
                <p className="text-xs text-gray-400 mt-1 uppercase">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
