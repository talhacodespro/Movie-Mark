'use client';

import { Separator } from '@/components/indie/separator';
import StatusSelect from '@/components/status-select';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { GeistMono } from 'geist/font/mono';
import CustomPagination from '@/components/custom-pagination';
import Search from '@/components/search';
import SeriesTable from './series-table';
import SeriesDialog from './series-dialog';
import type { SeriesCreateInput } from '@/types/series';
import { seriesGet, seriesPost, seriesSearch } from '@/lib/api/series';
import { useSeriesStore } from '@/store/seriesStore';
import axios from 'axios';

const Page = () => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  // series store
  const { status, setStatus, page, setPage, setSearch, search } =
    useSeriesStore();

  // user session
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  // series mutation
  const seriesPostMutation = useMutation({
    mutationFn: (data: SeriesCreateInput) => seriesPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['seriesSearch'] });
      toast.success('Series added successfully!', {
        className: `${GeistMono.className}`,
      });
    },
    onError: (err) => {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : 'Failed to add series!';
      toast.error(msg, {
        className: `${GeistMono.className}`,
      });
    },
  });

  // series get
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['series', userId, status, page, search],
    queryFn: () => seriesGet({ userId, status, page, limit: 10, search }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      <section className=" flex items-center gap-x-2 mt-3 mx-2 md:mx-0">
        <Search
          search={search}
          status={status}
          setSearch={setSearch}
          placeholder="Series Name..."
          queryKey="seriesSearch"
          queryFn={({ search, status }) =>
            seriesSearch({ search, userId, status })
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
        <SeriesDialog
          open={open}
          setOpen={setOpen}
          mode="create"
          onSubmit={(data, { reset }) => {
            seriesPostMutation.mutate(
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
          isLoading={seriesPostMutation.isPending}
        />
      </section>
      <Separator gradient className="my-3" />
      <SeriesTable
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
