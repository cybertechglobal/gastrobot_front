// 'use client';
// import React, { useState, useEffect, JSX } from 'react';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Bell, Check, X, Clock, Users, MapPin, Phone } from 'lucide-react';

// interface OrderItem {
//   name: string;
//   quantity: number;
//   price: number;
// }

// interface Order {
//   id: number;
//   tableNumber: number;
//   customerName: string;
//   phone: string;
//   items: OrderItem[];
//   totalAmount: number;
//   orderTime: Date;
//   status: 'pending' | 'accepted' | 'rejected';
//   specialRequests: string;
// }

// type OrderStatus = 'pending' | 'accepted' | 'rejected';

// const WaiterOrdersDashboard: React.FC = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [notifications, setNotifications] = useState<string[]>([]);

//   // Dummy data
//   const dummyOrders: Order[] = [
//     {
//       id: 1,
//       tableNumber: 5,
//       customerName: 'Marko Petrović',
//       phone: '+381 64 123 4567',
//       items: [
//         { name: 'Ćevapi sa lepinjom', quantity: 2, price: 580 },
//         { name: 'Pljeskavica', quantity: 1, price: 420 },
//         { name: 'Coca Cola', quantity: 3, price: 180 },
//       ],
//       totalAmount: 1360,
//       orderTime: new Date(Date.now() - 5 * 60000),
//       status: 'pending',
//       specialRequests: 'Bez luka u pljeskavici',
//     },
//     {
//       id: 2,
//       tableNumber: 12,
//       customerName: 'Ana Jovanović',
//       phone: '+381 63 987 6543',
//       items: [
//         { name: 'Grilovana piletina', quantity: 1, price: 750 },
//         { name: 'Pomfrit', quantity: 2, price: 300 },
//         { name: 'Ledeni čaj', quantity: 2, price: 240 },
//       ],
//       totalAmount: 1290,
//       orderTime: new Date(Date.now() - 2 * 60000),
//       status: 'pending',
//       specialRequests: '',
//     },
//     {
//       id: 3,
//       tableNumber: 8,
//       customerName: 'Stefan Nikolić',
//       phone: '+381 65 456 7890',
//       items: [
//         { name: 'Pica Margherita', quantity: 1, price: 890 },
//         { name: 'Pivo Jelen', quantity: 2, price: 360 },
//       ],
//       totalAmount: 1250,
//       orderTime: new Date(Date.now() - 1 * 60000),
//       status: 'pending',
//       specialRequests: 'Ekstra sir na pici',
//     },
//   ];

//   useEffect(() => {
//     setOrders(dummyOrders);

//     // // Simulate new order notifications
//     // const interval = setInterval(() => {
//     //   if (orders.length > 6) return;

//     //   const customerNames: string[] = [
//     //     'Milan Stojanović',
//     //     'Jelena Mitrović',
//     //     'Nikola Radović',
//     //   ];
//     //   const randomCustomer =
//     //     customerNames[Math.floor(Math.random() * customerNames.length)];

//     //   const newOrder: Order = {
//     //     id: Date.now(),
//     //     tableNumber: Math.floor(Math.random() * 20) + 1,
//     //     customerName: randomCustomer,
//     //     phone:
//     //       '+381 6' +
//     //       Math.floor(Math.random() * 10) +
//     //       ' ' +
//     //       Math.floor(Math.random() * 900 + 100) +
//     //       ' ' +
//     //       Math.floor(Math.random() * 9000 + 1000),
//     //     items: [
//     //       {
//     //         name: 'Nova porudžbina',
//     //         quantity: 1,
//     //         price: Math.floor(Math.random() * 1000 + 300),
//     //       },
//     //     ],
//     //     totalAmount: Math.floor(Math.random() * 1000 + 300),
//     //     orderTime: new Date(),
//     //     status: 'pending',
//     //     specialRequests: '',
//     //   };

//     //   setNotifications((prev) => [
//     //     ...prev,
//     //     `Nova porudžbina sa stola ${newOrder.tableNumber}!`,
//     //   ]);
//     //   setOrders((prev) => [newOrder, ...prev]);
//     // }, 15000);

//     // return () => clearInterval(interval);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleAcceptOrder = (orderId: number): void => {
//     setOrders((prev) =>
//       prev.map((order) =>
//         order.id === orderId
//           ? { ...order, status: 'accepted' as OrderStatus }
//           : order
//       )
//     );
//   };

//   const handleRejectOrder = (orderId: number): void => {
//     setOrders((prev) =>
//       prev.map((order) =>
//         order.id === orderId
//           ? { ...order, status: 'rejected' as OrderStatus }
//           : order
//       )
//     );
//   };

//   const clearNotifications = (): void => {
//     setNotifications([]);
//   };

//   const formatTime = (date: Date): string => {
//     const now = new Date();
//     const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

//     if (diffInMinutes < 1) return 'Upravo sada';
//     if (diffInMinutes === 1) return 'Pre 1 minut';
//     if (diffInMinutes < 60) return `Pre ${diffInMinutes} minuta`;
//     return date.toLocaleTimeString('sr-RS', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const getStatusBadge = (status: OrderStatus): JSX.Element => {
//     switch (status) {
//       case 'pending':
//         return (
//           <Badge
//             variant="outline"
//             className="bg-yellow-50 text-yellow-700 border-yellow-200"
//           >
//             Na čekanju
//           </Badge>
//         );
//       case 'accepted':
//         return (
//           <Badge
//             variant="outline"
//             className="bg-green-50 text-green-700 border-green-200"
//           >
//             Prihvaćeno
//           </Badge>
//         );
//       case 'rejected':
//         return (
//           <Badge
//             variant="outline"
//             className="bg-red-50 text-red-700 border-red-200"
//           >
//             Odbijeno
//           </Badge>
//         );
//       default:
//         return <Badge variant="outline">Nepoznato</Badge>;
//     }
//   };

//   const pendingOrders: Order[] = orders.filter(
//     (order) => order.status === 'pending'
//   );
//   const processedOrders: Order[] = orders.filter(
//     (order) => order.status !== 'pending'
//   );

//   return (
//     <div className="min-h-screen p-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-4xl font-bold mb-2">Porudžbine</h1>
//             <p>Upravljaj porudžbinamas iz restorana</p>
//           </div>

//           {/* Notifications */}
//           <div className="relative">
//             <Button
//               variant="outline"
//               size="lg"
//               onClick={clearNotifications}
//               className="relative"
//             >
//               <Bell className="w-5 h-5 mr-2" />
//               Notifikacije
//               {notifications.length > 0 && (
//                 <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-6 h-6 rounded-full flex items-center justify-center text-xs">
//                   {notifications.length}
//                 </Badge>
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* Notifications Alert */}
//         {notifications.length > 0 && (
//           <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-300">
//             <Bell className="h-4 w-4 text-orange-600" />
//             <AlertDescription className="text-orange-800">
//               {notifications[notifications.length - 1]}
//             </AlertDescription>
//           </Alert>
//         )}

//         {/* Pending Orders Section */}
//         <div className="mb-8">
//           <h2 className="text-2xl font-semibold mb-4 flex items-center">
//             <Clock className="w-6 h-6 mr-2 text-yellow-600" />
//             Porudžbine na čekanju ({pendingOrders.length})
//           </h2>

//           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//             {pendingOrders.map((order: Order) => (
//               <Card
//                 key={order.id}
//                 className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-400"
//               >
//                 <CardHeader className="pb-3">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-lg font-semibold ">
//                       Sto {order.tableNumber}
//                     </CardTitle>
//                     {getStatusBadge(order.status)}
//                   </div>
//                   <CardDescription className="flex items-center space-x-4 text-sm">
//                     <span className="flex items-center">
//                       <Users className="w-4 h-4 mr-1" />
//                       {order.customerName}
//                     </span>
//                     <span className="flex items-center">
//                       <Clock className="w-4 h-4 mr-1" />
//                       {formatTime(order.orderTime)}
//                     </span>
//                   </CardDescription>
//                 </CardHeader>

//                 <CardContent className="pb-4">
//                   <div className="space-y-3">
//                     <div className="flex items-center text-sm ">
//                       <Phone className="w-4 h-4 mr-2" />
//                       {order.phone}
//                     </div>

//                     <div className="space-y-2">
//                       <h4 className="font-medium ">Stavke:</h4>
//                       {order.items.map((item: OrderItem, index: number) => (
//                         <div
//                           key={index}
//                           className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-950 p-2 rounded"
//                         >
//                           <span>
//                             {item.quantity}x {item.name}
//                           </span>
//                           <span className="font-medium">{item.price} RSD</span>
//                         </div>
//                       ))}
//                     </div>

//                     {order.specialRequests && (
//                       <div className="mt-3 p-3  rounded-lg border border-blue-100">
//                         <h5 className="font-medium  text-sm mb-1">
//                           Posebni zahtevi:
//                         </h5>
//                         <p className=" text-sm">{order.specialRequests}</p>
//                       </div>
//                     )}

//                     <div className="pt-2 border-t border-slate-200">
//                       <div className="flex justify-between items-center">
//                         <span className="font-semibold ">Ukupno:</span>
//                         <span className="text-xl font-bold ">
//                           {order.totalAmount} RSD
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>

//                 <CardFooter className="flex space-x-3 pt-4">
//                   <Button
//                     onClick={() => handleAcceptOrder(order.id)}
//                     className="flex-1 bg-green-600 hover:bg-green-700 text-white"
//                   >
//                     <Check className="w-4 h-4 mr-2" />
//                     Prihvati
//                   </Button>
//                   <Button
//                     onClick={() => handleRejectOrder(order.id)}
//                     variant="outline"
//                     className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
//                   >
//                     <X className="w-4 h-4 mr-2" />
//                     Odbij
//                   </Button>
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         </div>

//         {/* Processed Orders Section */}
//         {processedOrders.length > 0 && (
//           <div>
//             <h2 className="text-2xl font-semibold  mb-4">
//               Obrađene porudžbine ({processedOrders.length})
//             </h2>

//             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//               {processedOrders.map((order: Order) => (
//                 <Card
//                   key={order.id}
//                   className={`shadow-md border-0 opacity-75 border-l-4 ${
//                     order.status === 'accepted'
//                       ? 'border-l-green-400'
//                       : 'border-l-red-400'
//                   }`}
//                 >
//                   <CardHeader className="pb-3">
//                     <div className="flex items-center justify-between">
//                       <CardTitle className="text-lg font-semibold ">
//                         Sto {order.tableNumber}
//                       </CardTitle>
//                       {getStatusBadge(order.status)}
//                     </div>
//                     <CardDescription className="flex items-center space-x-4 text-sm">
//                       <span className="flex items-center">
//                         <Users className="w-4 h-4 mr-1" />
//                         {order.customerName}
//                       </span>
//                       <span className="flex items-center">
//                         <Clock className="w-4 h-4 mr-1" />
//                         {formatTime(order.orderTime)}
//                       </span>
//                     </CardDescription>
//                   </CardHeader>

//                   <CardContent>
//                     <div className="flex justify-between items-center">
//                       <span className="">Ukupno:</span>
//                       <span className="font-bold ">
//                         {order.totalAmount} RSD
//                       </span>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         )}

//         {orders.length === 0 && (
//           <div className="text-center py-12">
//             <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
//               <MapPin className="w-12 h-12 " />
//             </div>
//             <h3 className="text-xl font-semibold  mb-2">Nema porudžbina</h3>
//             <p className="">Nove porudžbine će se pojaviti ovde kada stignu.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default WaiterOrdersDashboard;

'use client';
import React, { useState, useEffect, JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Check, X, Clock, Users, Phone, ChefHat, Utensils } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  tableNumber: number;
  customerName: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  orderTime: Date;
  status: 'pending' | 'accepted' | 'rejected';
  specialRequests: string;
}

type OrderStatus = 'pending' | 'accepted' | 'rejected';

const WaiterOrdersDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Dummy data
  const dummyOrders: Order[] = [
    {
      id: 1,
      tableNumber: 5,
      customerName: 'Marko Petrović',
      phone: '+381 64 123 4567',
      items: [
        { name: 'Ćevapi sa lepinjom', quantity: 2, price: 580 },
        { name: 'Pljeskavica', quantity: 1, price: 420 },
        { name: 'Coca Cola', quantity: 3, price: 180 },
      ],
      totalAmount: 1360,
      orderTime: new Date(Date.now() - 8 * 60000),
      status: 'pending',
      specialRequests: 'Bez luka u pljeskavici',
    },
    {
      id: 2,
      tableNumber: 12,
      customerName: 'Ana Jovanović',
      phone: '+381 63 987 6543',
      items: [
        { name: 'Grilovana piletina', quantity: 1, price: 750 },
        { name: 'Pomfrit', quantity: 2, price: 300 },
        { name: 'Ledeni čaj', quantity: 2, price: 240 },
      ],
      totalAmount: 1290,
      orderTime: new Date(Date.now() - 3 * 60000),
      status: 'pending',
      specialRequests: '',
    },
    {
      id: 3,
      tableNumber: 8,
      customerName: 'Stefan Nikolić',
      phone: '+381 65 456 7890',
      items: [
        { name: 'Pica Margherita', quantity: 1, price: 890 },
        { name: 'Pivo Jelen', quantity: 2, price: 360 },
      ],
      totalAmount: 1250,
      orderTime: new Date(Date.now() - 1 * 60000),
      status: 'pending',
      specialRequests: 'Ekstra sir na pici',
    },
    {
      id: 4,
      tableNumber: 3,
      customerName: 'Milica Đorđević',
      phone: '+381 69 111 2233',
      items: [
        { name: 'Riba sa roštilja', quantity: 1, price: 1200 },
        { name: 'Grčka salata', quantity: 1, price: 450 },
      ],
      totalAmount: 1650,
      orderTime: new Date(Date.now() - 12 * 60000),
      status: 'accepted',
      specialRequests: 'Medium kuvana riba',
    },
    {
      id: 5,
      tableNumber: 15,
      customerName: 'Nikola Stojanović',
      phone: '+381 60 555 7777',
      items: [
        { name: 'Burger sa krompirićem', quantity: 2, price: 1100 },
      ],
      totalAmount: 1100,
      orderTime: new Date(Date.now() - 20 * 60000),
      status: 'rejected',
      specialRequests: '',
    },
  ];

  useEffect(() => {
    setOrders(dummyOrders);
  }, []);

  const handleAcceptOrder = (orderId: number): void => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'accepted' as OrderStatus }
          : order
      )
    );
  };

  const handleRejectOrder = (orderId: number): void => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'rejected' as OrderStatus }
          : order
      )
    );
  };

  const clearNotifications = (): void => {
    setNotifications([]);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Upravo sada';
    if (diffInMinutes === 1) return 'Pre 1 minut';
    if (diffInMinutes < 60) return `Pre ${diffInMinutes} minuta`;
    return date.toLocaleTimeString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: OrderStatus): JSX.Element => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-gray-900 text-white font-medium px-3 py-1">
            Na čekanju
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-gray-100 text-gray-900 font-medium px-3 py-1 border border-gray-300">
            Prihvaćeno
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-gray-100 text-gray-600 font-medium px-3 py-1 border border-gray-300">
            Odbijeno
          </Badge>
        );
      default:
        return <Badge variant="outline">Nepoznato</Badge>;
    }
  };

  const getUrgencyIndicator = (orderTime: Date) => {
    const minutesAgo = Math.floor((new Date().getTime() - orderTime.getTime()) / 60000);
    if (minutesAgo > 8) {
      return <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-900 rounded-full"></div>;
    }
    return null;
  };

  const pendingOrders: Order[] = orders.filter(
    (order) => order.status === 'pending'
  ).sort((a, b) => b.orderTime.getTime() - a.orderTime.getTime());

  const processedOrders: Order[] = orders.filter(
    (order) => order.status !== 'pending'
  );

  // Stats
  const totalOrders = orders.length;
  const totalPending = pendingOrders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Clean Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white dark:text-gray-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Porudžbine
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Upravljaj porudžbinamas iz restorana</p>
              </div>
            </div>

            {/* Clean Notifications */}
            <Button
              variant="outline"
              onClick={clearNotifications}
              className="relative bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifikacije
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center text-xs font-medium">
                  {notifications.length}
                </div>
              )}
            </Button>
          </div>

          {/* Minimal Stats */}
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ukupno porudžbina</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalPending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Na čekanju</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">RSD danas</div>
            </div>
          </div>
        </div>

        {/* Notifications Alert */}
        {notifications.length > 0 && (
          <Alert className="mb-8 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <Bell className="h-4 w-4" />
            <AlertDescription>
              {notifications[notifications.length - 1]}
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Na čekanju ({pendingOrders.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingOrders.map((order: Order) => (
                <Card
                  key={order.id}
                  className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  {getUrgencyIndicator(order.orderTime)}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Sto {order.tableNumber}
                      </CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {order.customerName}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(order.orderTime)}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 mr-2" />
                      {order.phone}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Stavke:</h4>
                      {order.items.map((item: OrderItem, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <span className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium text-gray-900 dark:text-white mr-2">
                              {item.quantity}×
                            </span>
                            {item.name}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.price} RSD
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.specialRequests && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                          Posebni zahtevi:
                        </h5>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {order.specialRequests}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Ukupno:</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {order.totalAmount} RSD
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Prihvati
                    </Button>
                    <Button
                      onClick={() => handleRejectOrder(order.id)}
                      variant="outline"
                      className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Odbij
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Processed Orders */}
        {processedOrders.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Obrađene ({processedOrders.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {processedOrders.map((order: Order) => (
                <Card
                  key={order.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium text-gray-900 dark:text-white">
                        Sto {order.tableNumber}
                      </CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                      {order.customerName} • {formatTime(order.orderTime)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {order.totalAmount} RSD
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Utensils className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nema porudžbina
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Nove porudžbine će se pojaviti ovde kada stignu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterOrdersDashboard;
