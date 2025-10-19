import ChatInterface from '@/components/ChatInterface';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1">
        <ChatInterface />
      </div>
      <Footer />
    </main>
  );
}
