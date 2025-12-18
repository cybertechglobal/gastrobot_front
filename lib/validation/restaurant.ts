// lib/validation/restaurant.ts
import { z } from 'zod';

const phoneRegex = /^\+(\d{1,3})?[\s]{0,}[\s.-]?\(?\d{1,3}\)?([\s]{0,}[\s.-]?\d{1,4}){2,3}$/;

export const restaurantSchema = z.object({
  name: z.string().min(2, 'Ime je obavezno'),
  description: z.string().min(1, 'Opis je obavezan'),
  logo: z.any().nullable().optional(),
  email: z.string().email('Email nije validan'),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || phoneRegex.test(val),
      'Broj telefona mora biti u formatu +381651234567'
    ),
  googleReviewUrl: z.string().optional(),
  location: z.object({
    address: z.string().min(1, 'Adresa je obavezna'),
    city: z.string().min(1, 'Grad je obavezan'),
    country: z.string().min(1, 'Država je obavezna'),
    zipCode: z.string().min(1, 'Poštanski broj je obavezan'),
    lat: z.number({ required_error: 'Latitude je obavezan', invalid_type_error: 'Latitude mora biti broj' }),
    lng: z.number({ required_error: 'Longitude je obavezan', invalid_type_error: 'Longitude mora biti broj' }),
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
