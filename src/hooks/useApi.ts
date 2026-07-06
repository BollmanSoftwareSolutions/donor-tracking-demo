import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api/client'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.getDashboard(),
  })
}

export function useDonors() {
  return useQuery({ queryKey: ['donors'], queryFn: () => apiClient.getDonors() })
}

export function useDonations() {
  return useQuery({
    queryKey: ['donations'],
    queryFn: () => apiClient.getDonations(),
  })
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiClient.getCampaigns(),
  })
}

export function useFunds() {
  return useQuery({ queryKey: ['funds'], queryFn: () => apiClient.getFunds() })
}

export function useReceipts() {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: () => apiClient.getReceipts(),
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
  })
}
