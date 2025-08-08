// Create a server action
'use server';
import { unstable_update } from '@/auth';

export async function updateSession(newToken: string) {
  await unstable_update({ bearerToken: newToken });
}
