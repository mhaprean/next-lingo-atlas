import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center bg-transparent">
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Master new languages with <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Lingo Atlas</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Your personal companion for building vocabulary, tracking progress, and achieving fluency faster than ever. Focus on what matters: the words.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link 
            href="/admin" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/account/settings" 
            className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-full shadow transition-all border border-gray-200 dark:border-gray-700"
          >
            Sign In / Sign Up
          </Link>
        </div>
      </div>
      
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
        <FeatureCard 
          title="Curated Word Lists" 
          description="Access premade groups or build your own lists to focus on relevant vocabulary." 
          icon="📚"
        />
        <FeatureCard 
          title="Adaptive Review" 
          description="Our algorithm ensures you review terms just when you're about to forget them." 
          icon="🧠"
        />
        <FeatureCard 
          title="Track Progress" 
          description="Visual charts and statistics to keep you motivated on your language journey." 
          icon="📈"
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="text-4xl mb-6 bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-2xl flex items-center justify-center">{icon}</div>
      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}