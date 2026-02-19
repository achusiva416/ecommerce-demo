import { useQueryClient,useQuery } from '@tanstack/react-query';
import React from 'react'
import apiClient from '../services/apiClient';

const useProducts = () => {

    const queryClient = useQueryClient();

    const stocks = useQuery({
        queryKey: ['stocks'],
        queryFn: async () => {
            const response = await apiClient.get('/stocks');
            console.log(response.data);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        onError: (error) => {
            toast.error(error.response.data.message);
            console.log(error);
        }
    })

    const getLowStockProducts = useQuery({
        queryKey: ['low-stock-products'],
        queryFn: async () => {
            const response = await apiClient.get('/low-stocks');
            console.log(response.data);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        onError: (error) => {
            toast.error(error.response.data.message);
            console.log(error);
        }
    })

    const getOutOfStockProducts = useQuery({
        queryKey: ['out-of-stock-products'],
        queryFn: async () => {
            const response = await apiClient.get('/out-of-stocks');
            console.log(response.data);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        onError: (error) => {
            toast.error(error.response.data.message);
            console.log(error);
        }
    })

    
    
    

    return {
        stocks,
        getLowStockProducts,
        getOutOfStockProducts
    }
  
}

export default useProducts;
