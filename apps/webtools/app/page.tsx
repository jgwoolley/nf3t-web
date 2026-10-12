import dynamic from 'next/dynamic';

const Nf2tApp = dynamic(() => import('../src/Nf2tApp'), { ssr: false });

export default function Home() {
  return <Nf2tApp />;
}
