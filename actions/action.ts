// Create a server action
'use server';
import { unstable_update } from '@/auth';

export async function updateSession(body: any) {
  await unstable_update(body);
}
