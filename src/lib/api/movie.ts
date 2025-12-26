import type { MovieCreateInput, MovieUpdateInput } from '@/types/movie';
import api from './baseUrl';

type MovieGetParams = {
  status: string;
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
};

export const moviePost = async (movie: MovieCreateInput) => {
  const res = await api.post('/movie', movie);
  return res.data;
};

export const movieGet = async (params: MovieGetParams) => {
  try {
    const res = await api.get('/movie', {
      params,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const movieSearch = async ({
  search,
  userId,
  status,
}: Pick<MovieGetParams, 'search' | 'userId' | 'status'>) => {
  try {
    const res = await api.get('/movie/search', {
      params: {
        search,
        userId,
        status,
      },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const movieDelete = async (id: number) => {
  try {
    const res = await api.delete(`/movie/${id}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const movieUpdate = async (id: number, movie: MovieUpdateInput) => {
  try {
    const res = await api.patch(`/movie/${id}`, movie);
    return res.data;
  } catch (err) {
    throw err;
  }
};
