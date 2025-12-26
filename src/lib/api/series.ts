import api from './baseUrl';
import type { SeriesCreateInput, SeriesUpdateInput } from '@/types/series';

type SeriesGetParams = {
  status: string;
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
};

export const seriesPost = async (series: SeriesCreateInput) => {
  const res = await api.post('/series', series);
  return res.data;
};

export const seriesGet = async (params: SeriesGetParams) => {
  try {
    const res = await api.get('/series', {
      params,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const seriesSearch = async ({
  search,
  userId,
  status,
}: Pick<SeriesGetParams, 'search' | 'userId' | 'status'>) => {
  try {
    const res = await api.get('/series/search', {
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

export const seriesDelete = async (id: number) => {
  try {
    const res = await api.delete(`/series/${id}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const seriesUpdate = async (id: number, movie: SeriesUpdateInput) => {
  try {
    const res = await api.patch(`/series/${id}`, movie);
    return res.data;
  } catch (err) {
    throw err;
  }
};
