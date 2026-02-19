import { useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "../services/apiClient"
import { toast } from "react-toastify"

const useUsers = ({ search, perPage, page, userId }) => {
    const queryClient = useQueryClient();

    const userQueryClient = useQuery({
        queryKey: ['users', { search, perPage, page }],
        queryFn: async () => {
            const response = await apiClient.get("/users", {
                params: {
                    search,
                    perPage,
                    page
                }
            });
            console.log(response.data);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: false,
        enabled: !!perPage && !!page,
    })

    const userData = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const response = await apiClient.get(`/users/${userId}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: false,
        enabled: !!userId,
    })

    const getInsightScore = (
        order_count = 0,
        review_count = 0,
        super_coins = 0
    ) => {

        const MAX_SCORE = 100;
        const baseScore = 10;
        const orderScore = Math.min(35, Math.log(order_count + 1) * 10);
        const reviewScore = Math.min(25, review_count * 5);
        const coinScore = Math.min(20, Math.sqrt(super_coins) * 2);

        let bonus = 0;

        if (order_count > 5 || review_count > 2) {
            bonus += 10;
        }

        if (super_coins > 50) {
            bonus += 10;
        }

        const total =
            baseScore +
            orderScore +
            reviewScore +
            coinScore +
            bonus;

        return `${Math.min(MAX_SCORE, Math.round(total))}%`;
    };


    const reviewQueryClient = useQuery({
        queryKey: ['reviews'],
        queryFn: async () => {
            const response = await apiClient.get(`/reviews`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: false,
    })



    return { 
        userQueryClient, 
        userData,
        getInsightScore,
        reviewQueryClient
    }
}

export default useUsers;