import ChatInterface from '@/components/ChatInterface';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <ChatInterface />
      <Footer />
    </div>
  );
}
