import { adminRepository, type DashboardStats, type RevenuePoint, type UserGrowthPoint, type BestSellingTemplate } from "@/repositories/admin.repository";

export const dashboardService = {
  getStats(): Promise<DashboardStats> {
    return adminRepository.getDashboardStats();
  },

  getRevenueChart(): Promise<RevenuePoint[]> {
    return adminRepository.getMonthlyRevenue(6);
  },

  getUserGrowthChart(): Promise<UserGrowthPoint[]> {
    return adminRepository.getMonthlyUserGrowth(6);
  },

  getBestSellingTemplates(): Promise<BestSellingTemplate[]> {
    return adminRepository.getBestSellingTemplates(5);
  },
};
