import Terminal from '@/components/Terminal';
import MatrixRain from '@/components/MatrixRain';

export default function Home() {
  return (
    <div className="relative">
      <MatrixRain />
      <div className="relative z-10">
        <Terminal />
      </div>
    </div>
  );
}
