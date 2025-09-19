'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFcm } from '@/hooks/useFcm';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';

export function NotificationPermission() {
  const { permission, requestPermissionAndToken } = useFcm({ auto: true });
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleInfo, setIsVisibleInfo] = useState(false);

  useEffect(() => {
    setIsVisible(permission === 'default');
    setIsVisibleInfo(permission === 'denied');
  }, [permission]);

  const handleRequest = async () => {
    await requestPermissionAndToken();
    setIsVisible(false);
  };

  if (!session?.user) return null;

  if (isVisibleInfo) {
    return (
      <div className="fixed bottom-5 z-[11] left-1/2 -translate-x-1/2 transform w-[80vw]">
        <Card className="relative mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => setIsVisibleInfo(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardHeader>
            <CardTitle>Tvoje notifikacije su iskljucene</CardTitle>
            <CardDescription>
              Aktivirajte notifikacije da ne propustite nove porudžbine i
              rezervacije.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isVisible || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed bottom-5 z-[11] left-1/2 -translate-x-1/2 transform w-[80vw]">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Omogući notifikacije</CardTitle>
          <CardDescription>
            Da bi primali notifikacije o novim porudzbinama i rezervacijama
            potrebno je da omogucite notifikacije.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRequest}>Omogući notifikacije</Button>
        </CardContent>
      </Card>
    </div>
  );
}
