import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import apiClient from '../services/apiClient';

const useStocks = ({ productIds = [], dealerId }) => {
  const queryClient = useQueryClient();

  const getProductRate = useQuery({
    queryKey: ["product-rate", productIds, dealerId],
    queryFn: async () => {
      const res = await apiClient.get("/dealers/product-rate", { params: { productIds, dealerId } });
      console.log(res.data);
      return res.data;
    },
    enabled: !!productIds.length && !!dealerId,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  return { getProductRate };
}

export default useStocks;