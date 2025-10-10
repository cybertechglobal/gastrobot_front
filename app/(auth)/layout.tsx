import Image from 'next/image';
import logo from '@/public/logo.svg';
import logoPart from '@/public/gastrobot_part.png';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full relative overflow-hidden">
      <header className="p-6">
        <Image src={logo} alt="logo" width={150} priority />
      </header>

      <div className="flex items-center justify-center w-full h-[calc(100%-83px)]">
        {children}
      </div>

      <div className="absolute left-0 right-0 bottom-0 w-full overflow-hidden h-28 md:h-50 2xl:h-66">
        <Image
          src={logoPart}
          alt="logo watermark"
          fill
          className='object-cover'
        />
      </div>
    </div>
  );
}
