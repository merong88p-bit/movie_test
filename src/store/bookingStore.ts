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
  loadBookings: () => void;
  addBooking: (
    userId: string, 
    movie: Movie, 
    theater: string, 
    date: string, 
    time: string, 
    seats: string[], 
    totalPrice: number
  ) => Booking;
  cancelBooking: (bookingId: string) => { success: boolean; refundedPrice: number };
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

  // 로컬스토리지에서 예매 리스트 로드
  loadBookings: () => {
    if (typeof window !== "undefined") {
      const savedBookings = localStorage.getItem("mv_bookings");
      if (savedBookings) {
        try {
          set({ bookings: JSON.parse(savedBookings) });
        } catch (e) {
          console.error("Failed to parse bookings", e);
        }
      }
    }
  },

  // 예매 등록
  addBooking: (userId, movie, theater, date, time, seats, totalPrice) => {
    const newBooking: Booking = {
      id: "MV-" + new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 8) + "-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
      userId,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.poster_path,
      theater,
      date,
      time,
      seats,
      totalPrice,
      status: "reserved",
      createdAt: new Date().toISOString()
    };

    const currentBookings = get().bookings;
    const updatedBookings = [newBooking, ...currentBookings];
    
    set({ bookings: updatedBookings });
    if (typeof window !== "undefined") {
      localStorage.setItem("mv_bookings", JSON.stringify(updatedBookings));
    }
    
    return newBooking;
  },

  // 예매 취소
  cancelBooking: (bookingId) => {
    const currentBookings = get().bookings;
    const idx = currentBookings.findIndex((b) => b.id === bookingId);
    
    if (idx === -1) {
      return { success: false, refundedPrice: 0 };
    }

    const booking = currentBookings[idx];
    if (booking.status === "cancelled") {
      return { success: false, refundedPrice: 0 };
    }

    // 상태 업데이트
    const updatedBookings = [...currentBookings];
    updatedBookings[idx] = { ...booking, status: "cancelled" };

    set({ bookings: updatedBookings });
    if (typeof window !== "undefined") {
      localStorage.setItem("mv_bookings", JSON.stringify(updatedBookings));
    }

    return { success: true, refundedPrice: booking.totalPrice };
  },

  // 지정된 상영 세션의 기예약된 좌석 목록 조회
  getReservedSeats: (movieId, theater, date, time) => {
    const currentBookings = get().bookings;
    // 활성 상태('reserved')의 예매 중에서 해당 상영 세션과 겹치는 좌석들을 병합
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
