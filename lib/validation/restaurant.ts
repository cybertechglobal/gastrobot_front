// lib/validation/restaurant.ts
import { z } from 'zod';

export const restaurantSchema = z.object({
  name: z.string().min(2, 'Ime je obavezno'),
  description: z.string().min(1, 'Opis je obavezan'),
  logo: z.any().nullable().optional(),
  email: z.string().email('Email nije validan'),
  phoneNumber: z.string().optional(),
  location: z.object({
    address: z.string().min(1, 'Adresa je obavezna'),
    city: z.string().min(1, 'Grad je obavezan'),
    country: z.string().min(1, 'Država je obavezna'),
    zipCode: z.string().min(1, 'Poštanski broj je obavezan'),
    lat: z.string().optional(),
    lng: z.string().optional(),
  }),
  hours: z.array(
    z.object({
      day: z.string(),
      open: z.boolean(),
      from: z.string(),
      to: z.string(),
    })
  ),
  onlineOrdering: z.boolean(),
  allowReservations: z.boolean(),
});
