export const GET_BEDASH_LIST = "GET_BEDASH_LIST";
export const CONFIRM_BEDASH_SUCCESS = "CONFIRM_BEDASH_SUCCESS";
export const ADD_BEDASH_SUCCESS = "ADD_BEDASH_SUCCESS";



interface BedashItem {
  id: number;
  userName: string;
  materialType: string;
  remainingTons: number;
  status: "pending" | "completed";
  customDate: string | null;
  targetDate: string;
  createdAt: string;
}

export  interface BedashState {
  data: BedashItem[];
  loading: boolean;
  error: string | null;
}