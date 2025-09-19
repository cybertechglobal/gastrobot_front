'use client';
import { useSocket } from '@/hooks/useSocket';

export default function RealtimeClient() {
  useSocket();
  return null;
}
