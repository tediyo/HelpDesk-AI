import ChatInterface from '@/components/ChatInterface';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <ChatInterface />
      <Footer />
    </div>
  );
}
