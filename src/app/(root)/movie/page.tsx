'use client';

import { Separator } from '@/components/indie/separator';
import StatusSelect from '@/components/status-select';
import { useState } from 'react';
import MovieDialog from './movie-dialog';
import MovieTable from './movie-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movieGet, moviePost, movieSearch } from '@/lib/api/movie';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { GeistMono } from 'geist/font/mono';
import { useMovieStore } from '@/store/movieStore';
import CustomPagination from '@/components/custom-pagination';
import Search from '@/components/search';
import type { MovieCreateInput } from '@/types/movie';
import axios from 'axios';

const Page = () => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  // movie store
  const { status, setStatus, page, setPage, setSearch, search } =
    useMovieStore();

  // user session
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  // movie mutation
  const moviePostMutation = useMutation({
    mutationFn: async (data: MovieCreateInput) => moviePost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie'] });
      queryClient.invalidateQueries({ queryKey: ['movieSearch'] });
      toast.success('Movie added successfully!', {
        className: `${GeistMono.className}`,
      });
    },
    onError: (err) => {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : 'Failed to add movie!';
      toast.error(msg, {
        className: `${GeistMono.className}`,
      });
      console.error(err);
    },
  });

  // movie get
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['movie', userId, status, page, search],
    queryFn: () => movieGet({ userId, status, page, limit: 10, search }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      <section className=" flex items-center gap-x-2 mt-3 mx-2 md:mx-0">
        <Search
          search={search}
          setSearch={setSearch}
          status={status}
          placeholder="Movie Name..."
          queryKey="movieSearch"
          queryFn={({ search, status }) =>
            movieSearch({ search, userId, status })
          }
          setPage={setPage}
        />
        <StatusSelect
          className="*:not-first:mt-2 flex-1 basis-0 select-none"
          value={status}
          onChange={setStatus}
          setPage={setPage}
          allOptions
        />
        <MovieDialog
          open={open}
          setOpen={setOpen}
          mode="create"
          onSubmit={(data, { reset }) => {
            moviePostMutation.mutate(
              {
                ...data,
                userId,
              },
              {
                onSuccess: () => {
                  reset();
                },
              }
            );
          }}
          isLoading={moviePostMutation.isPending}
        />
      </section>
      <Separator gradient className="my-3" />
      <MovieTable
        data={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
      />
      <Separator gradient className="my-3" />
      <div className="mx-2 md:mx-0">
        <CustomPagination
          currentPage={page}
          totalPages={data?.meta?.totalPages || 1}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
};

export default Page;
