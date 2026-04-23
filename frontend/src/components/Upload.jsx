import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Upload({ onUploadSuccess }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch CSRF token for the form on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      const token = await api.getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrf();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address || !phoneNumber) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.upload(name, address, phoneNumber, csrfToken);
      setName('');
      setAddress('');
      setPhoneNumber('');
      onUploadSuccess();
    } catch (err) {
      setError(err.message);
      // Refresh token on failure
      const newToken = await api.getCsrfToken();
      setCsrfToken(newToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 bg-white border border-gray-300 p-6 rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">New Contact</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Hidden CSRF input within the form */}
        <input type="hidden" name="_csrf" value={csrfToken} />

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border rounded p-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border rounded p-2 text-sm focus:outline-none focus:border-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded font-semibold text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Add Contact'}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-4 text-center">{error}</p>}
    </div>
  );
}
