import { create } from "zustand";
import { Movie } from "../services/tmdb";

export interface Booking {
  id: string; // 예매번호: MV-YYYYMMDD-Random
  userId: string;
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  theater: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: "reserved" | "cancelled";
  createdAt: string;
}

interface BookingState {
  // 예매 진행 상태
  selectedMovie: Movie | null;
  selectedTheater: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedSeats: string[];
  
  // 예매 리스트
  bookings: Booking[];

  // 액션
  setMovie: (movie: Movie | null) => void;
  setTheater: (theater: string | null) => void;
  setDate: (date: string | null) => void;
  setTime: (time: string | null) => void;
  toggleSeat: (seat: string) => void;
  setSelectedSeats: (seats: string[]) => void;
  clearSelection: () => void;
  
  // 예매 내역 제어
  loadBookings: (userId: string) => Promise<void>;
  addBooking: (
    userId: string, 
    movie: Movie, 
    theater: string, 
    date: string, 
    time: string, 
    seats: string[], 
    totalPrice: number
  ) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; refundedPrice: number }>;
  getReservedSeats: (movieId: number, theater: string, date: string, time: string) => string[];
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedMovie: null,
  selectedTheater: null,
  selectedDate: null,
  selectedTime: null,
  selectedSeats: [],
  bookings: [],

  setMovie: (movie) => set({ selectedMovie: movie, selectedTheater: null, selectedDate: null, selectedTime: null, selectedSeats: [] }),
  setTheater: (theater) => set({ selectedTheater: theater, selectedDate: null, selectedTime: null, selectedSeats: [] }),
  setDate: (date) => set({ selectedDate: date, selectedTime: null, selectedSeats: [] }),
  setTime: (time) => set({ selectedTime: time, selectedSeats: [] }),
  
  toggleSeat: (seat) => set((state) => {
    const isSelected = state.selectedSeats.includes(seat);
    if (isSelected) {
      return { selectedSeats: state.selectedSeats.filter((s) => s !== seat) };
    } else {
      return { selectedSeats: [...state.selectedSeats, seat] };
    }
  }),
  
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),

  clearSelection: () => set({
    selectedMovie: null,
    selectedTheater: null,
    selectedDate: null,
    selectedTime: null,
    selectedSeats: []
  }),

  // REST API에서 예매 리스트 로드
  loadBookings: async (userId) => {
    try {
      const res = await fetch(`/api/bookings?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        set({ bookings: data.bookings });
      }
    } catch (e) {
      console.error("Failed to load bookings from API", e);
    }
  },

  // 예매 등록 및 결제 API 호출
  addBooking: async (userId, movie, theater, date, time, seats, totalPrice) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          movieId: movie.id,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
          theater,
          date,
          time,
          seats,
          totalPrice
        })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        alert(data.message || "예매 결제 처리에 실패했습니다.");
        return null;
      }

      const currentBookings = get().bookings;
      set({ bookings: [data.booking, ...currentBookings] });
      return data.booking;
    } catch (e) {
      console.error("Failed to add booking", e);
      return null;
    }
  },

  // 예매 취소 및 환불 API 호출
  cancelBooking: async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings?bookingId=${bookingId}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, refundedPrice: 0 };
      }

      const currentBookings = get().bookings;
      const updatedBookings = currentBookings.map((b) => 
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b
      );
      set({ bookings: updatedBookings });

      return { success: true, refundedPrice: data.refundedPrice };
    } catch (e) {
      console.error("Failed to cancel booking", e);
      return { success: false, refundedPrice: 0 };
    }
  },

  // 지정된 상영 세션의 기예약된 좌석 목록 조회
  getReservedSeats: (movieId, theater, date, time) => {
    const currentBookings = get().bookings;
    const activeBookings = currentBookings.filter(
      (b) => b.movieId === movieId &&
             b.theater === theater &&
             b.date === date &&
             b.time === time &&
             b.status === "reserved"
    );
    
    return activeBookings.reduce<string[]>((acc, b) => [...acc, ...b.seats], []);
  }
}));
