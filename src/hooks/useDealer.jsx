import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const useDealer = (id, params = {}) => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const response = await apiClient.get('/products');
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const recommendedQuery = useQuery({
    queryKey: ['recommended-reorder', id],
    queryFn: async () => {
      const response = await apiClient.get(`/dealers/${id}/recommended-reorder`, { 
        params: { per_page: 1000 } 
      });
      return response.data || [];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const dealerQuery = useQuery({
    queryKey: ['dealer', id],
    queryFn: async () => {
      const response = await apiClient.get(`/dealers/${id}`);
      return {
        data: response.data.data,
        stats: response.data.stats
      };
    },
    enabled: !!id,
  });

  const ratesQuery = useQuery({
    queryKey: ['dealer-rates', id, params.ratesPage, params.ratesPerPage, params.ratesSearch],
    queryFn: async () => {
      const response = await apiClient.get(`/dealers/${id}/rates`, {
        params: {
          page: params.ratesPage,
          per_page: params.ratesPerPage,
          search: params.ratesSearch
        }
      });
      return response.data;
    },
    enabled: !!id,
    keepPreviousData: true,
  });

  const purchasesQuery = useQuery({
    queryKey: ['dealer-purchases', id, params.purchasePage, params.purchasePerPage, params.purchaseSearch, params.purchaseStartDate, params.purchaseEndDate],
    queryFn: async () => {
      const response = await apiClient.get(`/dealers/${id}/purchases`, {
        params: {
          page: params.purchasePage,
          per_page: params.purchasePerPage,
          search: params.purchaseSearch,
          start_date: params.purchaseStartDate,
          end_date: params.purchaseEndDate
        }
      });
      return response.data;
    },
    enabled: !!id,
    keepPreviousData: true,
  });

  const markDeliveredMutation = useMutation({
    mutationFn: async ({ purchaseId, status }) => {
      const response = await apiClient.put(`/purchases/${purchaseId}/mark-delivered`, {
        delivery_status: status
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Purchase marked as delivered');
      queryClient.invalidateQueries(['dealer-purchases', id]);
      queryClient.invalidateQueries(['dealer', id]);
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: async ({ purchaseId, formData }) => {
      const response = await apiClient.post(`/purchases/${purchaseId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Photos uploaded successfully');
      queryClient.invalidateQueries(['dealer-purchases', id]);
    },
    onError: (error) => {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    }
  });

  // 6. Mutation:  Stock
  const syncStockMutation = useMutation({
    mutationFn: async (purchaseId) => {
      const response = await apiClient.post(`/purchases/${purchaseId}/sync-stock`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Stock synchronized successfully');
      queryClient.invalidateQueries(['dealer-purchases', id]);
    },
    onError: (error) => {
      console.error('Error syncing stock:', error);
      toast.error(error.response?.data?.message || 'Failed to sync stock');
    }
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (purchaseData) => {
      const response = await apiClient.post(`/dealers/${id}/purchases`, purchaseData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Purchase added successfully');
      queryClient.invalidateQueries(['dealer-purchases', id]);
      queryClient.invalidateQueries(['dealer', id]);
    },
    onError: (error) => {
      console.error('Error creating purchase:', error);
      toast.error('Failed to add purchase');
    }
  });

  const createDealerMutation = useMutation({
    mutationFn: async (dealerData) => {
      const response = await apiClient.post('/dealers', dealerData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Dealer created successfully');
      queryClient.invalidateQueries(['dealers']);
    },
    onError: (error) => {
      console.error('Error creating dealer:', error);
      toast.error('Failed to create dealer');
    }
  });

  const updateDealerMutation = useMutation({
    mutationFn: async (dealerData) => {
      const response = await apiClient.put(`/dealers/${id}`, dealerData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Dealer updated successfully');
      queryClient.invalidateQueries(['dealer', id]);
      queryClient.invalidateQueries(['dealers']);
    },
    onError: (error) => {
      console.error('Error updating dealer:', error);
      toast.error('Failed to update dealer');
    }
  });

  return {
    dealer: dealerQuery.data?.data || {},
    summary: dealerQuery.data?.stats || {},
    isDealerLoading: dealerQuery.isLoading,
    
    productRates: ratesQuery.data?.data || [],
    ratesTotal: ratesQuery.data?.total || 0,
    isRatesLoading: ratesQuery.isLoading,
    
    purchaseHistory: purchasesQuery.data?.data || [],
    purchaseTotal: purchasesQuery.data?.total || 0,
    isPurchasesLoading: purchasesQuery.isLoading,

    products: productsQuery.data || [],
    isProductsLoading: productsQuery.isLoading,

    recommendedProducts: recommendedQuery.data || [],
    isRecommendedLoading: recommendedQuery.isLoading,
    
    markDelivered: markDeliveredMutation.mutateAsync,
    uploadPhotos: uploadPhotosMutation.mutateAsync,
    syncStock: syncStockMutation.mutateAsync,
    createPurchase: createPurchaseMutation.mutateAsync,
    createDealer: createDealerMutation.mutateAsync,
    updateDealer: updateDealerMutation.mutateAsync,
    
    refetchPurchases: purchasesQuery.refetch,
    refetchDealer: dealerQuery.refetch
  };
};

export default useDealer;
