import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const user = await pb.collection('users').getOne(userId, { $autoCancel: false });
        setProfile(user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (data) => {
    setUpdating(true);
    setError(null);

    try {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'avatar' && data[key] instanceof File) {
            formData.append('avatar', data[key]);
          } else if (key !== 'avatar') {
            formData.append(key, data[key]);
          }
        }
      });

      const updated = await pb.collection('users').update(userId, formData, { $autoCancel: false });
      setProfile(updated);
      return { success: true, data: updated };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };

  const updatePassword = async (oldPassword, newPassword) => {
    setUpdating(true);
    setError(null);

    try {
      await pb.collection('users').update(userId, {
        oldPassword,
        password: newPassword,
        passwordConfirm: newPassword
      }, { $autoCancel: false });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    updatePassword,
    refetch: () => {
      setLoading(true);
      pb.collection('users').getOne(userId, { $autoCancel: false })
        .then(setProfile)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  };
}