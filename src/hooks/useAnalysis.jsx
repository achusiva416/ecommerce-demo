import { useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import apiClient from '../services/apiClient'
import { toast } from 'react-toastify'

const useAnalysis = ({ salesPeriod }) => {
  const queryClient = useQueryClient();


  const shortenMap = {
    karungali: 'Krg',
    rudraksha: 'Rud',
    bracelet: 'Brc',
    mala: 'Mala',
    combo: 'Cmb',
    thulasi: 'Thl',
    wood: 'Wd',
    premium: 'Prem',
    spiritual: 'Spl'
  };

  const generateShortName = (name) => {
    if (!name) return '';

    return name
        .toLowerCase()
        .split(' ')
        .map(word => shortenMap[word] || word.substring(0, 3))
        .join(' ')
        .replace(/\b\w/g, c => c.toUpperCase());
  };


    const getSellingAnalytics = useQuery({
        queryKey: ['selling-analytics', salesPeriod],
        queryFn: async () => {
        const response = await apiClient.get('/analytics/selling', { params: { period: salesPeriod } });
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

  const topSellingProducts = useQuery({
    queryKey: ['top-selling-products', salesPeriod],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/top-selling', { params: { period: salesPeriod } });
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

  const getSalesTrendData = (orders_data) => {
    if (!orders_data || orders_data.length === 0) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return orders_data.map((d) => {
        let label = "";
        let isCurrent = false;
        let scaleFactor = 1;

        switch (salesPeriod) {
        case "yearly":
            label = `${d.year}`;
            if (parseInt(d.year) === currentYear) {
                const startOfYear = new Date(currentYear, 0, 1);
                const diffDays = Math.max(1, Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)));
                const isLeap = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0);
                const totalDays = isLeap ? 366 : 365;
                scaleFactor = totalDays / diffDays;
                isCurrent = true;
            }
            break;

        case "monthly":
            label = `${monthNames[d.month - 1]} ${d.year}`;
            if (parseInt(d.year) === currentYear && parseInt(d.month) === currentMonth) {
                const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
                scaleFactor = daysInMonth / Math.max(1, currentDay);
                isCurrent = true;
            }
            break;

        case "weekly":
            label = `W${d.week} ${d.year}`;
            // Simple heuristic for current week: if it's the last item and matches current year
            // it's likely the current week being populated
            if (parseInt(d.year) === currentYear) {
                const dayOfWeek = now.getDay() || 7; // 1-7 (Mon-Sun)
                scaleFactor = 7 / dayOfWeek;
                // Since detecting exact week index is complex, we target the last item
                // if it's the current year.
            }
            break;

        case "daily":
            label = new Date(d.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short"
            });
            break;

        default:
            label = "";
        }

        const rawOrders = parseInt(d.total_orders) || 0;
        const rawRevenue = parseFloat(d.total_amount) || 0;

        // Apply projection if it's the current period and we're not at the very end
        if (isCurrent && scaleFactor > 1.05) {
            return {
                name: label,
                orders: Math.round(rawOrders * scaleFactor),
                revenue: rawRevenue * scaleFactor,
                actualOrders: rawOrders,
                actualRevenue: rawRevenue,
                isProjected: true
            };
        }

        return {
        name: label,
        orders: rawOrders,
        revenue: rawRevenue,
        };
    });
  };


  return {
    getSellingAnalytics,
    getSalesTrendData,
    topSellingProducts,
    generateShortName
  }
}

export default useAnalysis