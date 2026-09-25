export interface HotelChangedEvent {
  id: string;
  name: string;
  description: string | null;
  address: string;
  cityId: string;
  city: string;
  country: string;
  location: { lat: number; lon: number } | null;
  amenityCodes: string[];
  priceFrom: number | null;
  maxCapacity: number | null;
  roomTypeCount: number;
  active: boolean;
  updatedAt: string;
}

export type HotelDocument = Omit<HotelChangedEvent, 'active'>;

export const isSearchable = (hotel: HotelChangedEvent) =>
  hotel.active && hotel.roomTypeCount > 0;

export const toDocument = (hotel: HotelChangedEvent): HotelDocument => ({
  id: hotel.id,
  name: hotel.name,
  description: hotel.description,
  address: hotel.address,
  cityId: hotel.cityId,
  city: hotel.city,
  country: hotel.country,
  location: hotel.location,
  amenityCodes: hotel.amenityCodes,
  priceFrom: hotel.priceFrom,
  maxCapacity: hotel.maxCapacity,
  roomTypeCount: hotel.roomTypeCount,
  updatedAt: hotel.updatedAt,
});
