import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Check, 
  Home, 
  Compass, 
  Bookmark, 
  User, 
  ArrowRight, 
  Maximize2, 
  Sun, 
  Layout, 
  Palette, 
  DollarSign, 
  Layers, 
  RefreshCw,
  Menu,
  X,
  CheckCircle2,
  LogOut,
  ChevronDown,
  Settings
} from 'lucide-react';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanelNew';
import ExploreTab from './components/ExploreTab';

// --- THEME & CONFIG ---
const COLORS = {
  bg: '#F4EFEA',
  card: '#FFFFFF',
  primary: '#C26A43',
  primaryHover: '#A85734',
  textPrimary: '#2E2E2E',
  textSecondary: '#7A7A7A',
  border: '#E8E2DC',
  accentBg: '#FFF7F3'
};

const STEPS = [
  { id: 'room', label: 'Room', icon: <Home size={16} /> },
  { id: 'style', label: 'Style', icon: <Compass size={16} /> },
  { id: 'colors', label: 'Colors', icon: <Palette size={16} /> },
  { id: 'budget', label: 'Budget', icon: <DollarSign size={16} /> },
  { id: 'details', label: 'Details', icon: <Layers size={16} /> }
];

const ROOMS = [
  { id: 'living', title: 'Living Room', desc: 'The heart of your home for gathering and comfort.', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=300&fit=crop' },
  { id: 'bedroom', title: 'Bedroom', desc: 'A personal sanctuary designed for rest and peace.', img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=300&fit=crop' },
  { id: 'kitchen', title: 'Kitchen', desc: 'Functional elegance for culinary creativity.', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=300&fit=crop' },
  { id: 'bathroom', title: 'Bathroom', desc: 'Spa-like tranquility for your daily rituals.', img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop' },
  { id: 'office', title: 'Home Office', desc: 'Distraction-free environment for deep work.', img: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=400&h=300&fit=crop' },
  { id: 'dining', title: 'Dining Room', desc: 'Sophisticated space for shared meals.', img: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&h=800&fit=crop&auto=format' },
];

const STYLES = [
  {
    id: 'modern',
    title: 'Modern',
    desc: 'Clean lines, neutral colors, and sleek finishes',
    img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&h=400&fit=crop',
    color: '#2C2420',
  },
  {
    id: 'minimalist',
    title: 'Minimalist',
    desc: 'Less is more - serene spaces with purposeful design',
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&h=400&fit=crop',
    color: '#8B7355',
  },
  {
    id: 'scandi',
    title: 'Scandinavian',
    desc: 'Light wood, soft textiles, and cozy functionality',
    img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500&h=400&fit=crop',
    color: '#A89078',
  },
  {
    id: 'bohemian',
    title: 'Bohemian',
    desc: 'Eclectic patterns, rich textures, and vibrant energy',
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop',
    color: '#C4704C',
  },
];

const MOODS = [
  { id: 'warm', title: 'Warm Neutrals', colors: ['#E6D5B8', '#D1B000', '#F4EFEA'] },
  { id: 'cool', title: 'Cool Tones', colors: ['#A3C1AD', '#778899', '#F0F8FF'] },
  { id: 'earth', title: 'Earth Tones', colors: ['#8B4513', '#BC8F8F', '#DEB887'] },
  { id: 'mono', title: 'Monochrome', colors: ['#2E2E2E', '#7A7A7A', '#FFFFFF'] },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = Landing, 1-5 = Steps, 6 = Results
  const [currentView, setCurrentView] = useState('design'); // 'design' or 'explore'
  const [selections, setSelections] = useState({
    room: null,
    style: null,
    mood: null,
    budget: null,
    size: 'Medium',
    priority: 'Comfort',
    lighting: 'Natural Light'
  });
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('aura_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('Loaded user from localStorage:', parsedUser);
      setUser(parsedUser);
    }
  }, []);

  const handleAuth = (userData) => {
    console.log('Setting user:', userData);
    setUser(userData);
    localStorage.setItem('aura_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aura_user');
  };

  // Auto-scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const updateSelection = (key, value) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));

  // --- RENDERING LOGIC ---

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: COLORS.bg, color: COLORS.textPrimary }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentStep(0)}>
            <div className="w-8 h-8 bg-[#C26A43] rounded-full flex items-center justify-center text-white font-serif italic text-xl">A</div>
            <span className="font-serif text-2xl tracking-tight font-medium">Aura</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-sm tracking-wide uppercase">
            <button onClick={() => { setCurrentView('design'); setCurrentStep(0); }} className="hover:text-[#C26A43] transition">Home</button>
            <button onClick={() => { setCurrentView('design'); setCurrentStep(1); }} className={`hover:text-[#C26A43] transition ${currentView === 'design' && currentStep >= 1 ? 'border-b-2 border-[#C26A43] pb-1' : ''}`}>Design</button>
            <button onClick={() => { setCurrentView('explore'); }} className={`hover:text-[#C26A43] transition ${currentView === 'explore' ? 'border-b-2 border-[#C26A43] pb-1' : ''}`}>Explore</button>
            <button className="hover:text-[#C26A43] transition">Saved</button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-black/5 rounded-full transition md:hidden" onClick={() => setIsNavOpen(!isNavOpen)}>
              {isNavOpen ? <X /> : <Menu />}
            </button>
            {user ? (
              <div className="hidden sm:flex items-center gap-3 bg-zinc-50 pl-4 pr-2 py-1.5 rounded-full border border-zinc-100">
                <span className="text-sm font-bold">{user.name} ({user.email})</span>
                {user.isAdmin && (
                  <button 
                    onClick={() => {
                      console.log('Settings button clicked, user:', user);
                      setIsAdminPanelOpen(true);
                    }}
                    className="p-2 hover:bg-zinc-200 rounded-full transition"
                    title="Admin Panel"
                  >
                    <Settings size={16} />
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-zinc-200 rounded-full transition"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:block bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuth={handleAuth}
      />

      {/* Admin Panel */}
      <AdminPanel 
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        user={user}
      />

      {/* Mobile Nav Overlay */}
      {isNavOpen && (
        <div className="fixed inset-0 z-40 bg-white p-12 flex flex-col gap-8 text-2xl font-serif md:hidden">
          <button onClick={() => { setCurrentView('design'); setCurrentStep(0); setIsNavOpen(false); }}>Home</button>
          <button onClick={() => { setCurrentView('design'); setCurrentStep(1); setIsNavOpen(false); }}>Design</button>
          <button onClick={() => { setCurrentView('explore'); setIsNavOpen(false); }}>Explore</button>
          <button onClick={() => setIsNavOpen(false)}>Saved</button>
          {user ? (
            <button onClick={() => { handleLogout(); setIsNavOpen(false); }} className="text-[#C26A43]">Sign Out</button>
          ) : (
            <button onClick={() => { setIsAuthModalOpen(true); setIsNavOpen(false); }} className="text-[#C26A43]">Sign In</button>
          )}
        </div>
      )}

      {/* View Switcher */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentView === 'explore' ? (
          <ExploreTab />
        ) : currentStep === 0 ? (
          <LandingView onStart={() => setCurrentStep(1)} onExplore={() => setCurrentView('explore')} />
        ) : currentStep <= 5 ? (
          <OnboardingFlow 
            step={currentStep} 
            totalSteps={5} 
            selections={selections}
            onUpdate={updateSelection}
            onNext={nextStep}
            onPrev={prevStep}
            onFinish={() => setCurrentStep(6)}
          />
        ) : (
          <ResultsView 
            selections={selections} 
            user={user}
            onReset={() => setCurrentStep(0)} 
            onAuthRequired={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Footer (Minimal) */}
      <footer className="py-12 border-t border-black/5 text-center text-xs text-zinc-400 uppercase tracking-widest">
        &copy; 2024 Aura Home — Private Design Studio
      </footer>
    </div>
  );
}

// --- VIEWS ---

function LandingView({ onStart, onExplore }) {
  const featuredImage =
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop';

  return (
    <div className="space-y-24 animate-in fade-in duration-700">
      <div className="max-w-3xl">
        <p className="text-[#C26A43] font-semibold tracking-widest uppercase text-xs mb-6">Personalized AI Interiors</p>
        <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] mb-8">Design your <br /> dream space.</h1>
        <p className="text-xl text-zinc-500 max-w-xl leading-relaxed mb-10">
          Aura uses advanced spatial intelligence to curate bespoke interior designs tailored to your unique architectural footprint and aesthetic soul.
        </p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={onStart}
            className="group flex items-center gap-3 bg-[#C26A43] text-white px-10 py-5 rounded-full text-lg font-medium hover:bg-[#A85734] transition shadow-xl shadow-[#C26A43]/20"
          >
            Start Designing <ArrowRight className="group-hover:translate-x-2 transition" />
          </button>
          <button 
            onClick={onExplore}
            className="px-10 py-5 rounded-full text-lg font-medium border border-black/10 hover:bg-white transition"
          >
            Explore Styles
          </button>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[36px] border border-white/40 bg-gradient-to-br from-[#2b211b] via-[#3b2c23] to-[#17110d] p-4 sm:p-6 lg:p-8 shadow-2xl shadow-black/20">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#c26a43]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#f6b38b]/10 blur-3xl" />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">Bohemian Frontend Display</p>
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl">Eclectic layers, soulful warmth</h2>
            <p className="max-w-lg text-sm text-white/80 sm:text-base">
              Artistic textures, earthy tones, and curated character inspired by Bohemian interiors.
            </p>
          </div>
          <div className="overflow-hidden rounded-[26px] border border-white/20 bg-black/20 shadow-xl shadow-black/30">
            <img
              src={featuredImage}
              alt="Modern living room interior"
              className="h-64 w-full object-cover sm:h-72 lg:h-80"
            />
          </div>
        </div>
      </section>

      <div className="relative">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden h-64 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=300&fit=crop"
                alt="Modern living room"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-3xl overflow-hidden h-48 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=250&fit=crop"
                alt="Minimalist bedroom"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="rounded-3xl overflow-hidden h-48 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=250&fit=crop"
                alt="Scandinavian kitchen"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-3xl overflow-hidden h-64 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
                alt="Bohemian interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingFlow({ step, totalSteps, selections, onUpdate, onNext, onPrev, onFinish }) {
  const currentStepInfo = STEPS[step - 1];

  return (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-200 -z-10" />
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-2 bg-[#F4EFEA] px-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              i + 1 < step ? 'bg-zinc-800 text-white' : 
              i + 1 === step ? 'bg-[#C26A43] text-white scale-110 shadow-lg shadow-[#C26A43]/20' : 
              'bg-white text-zinc-400 border border-zinc-200'
            }`}>
              {i + 1 < step ? <Check size={18} /> : s.icon}
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${i + 1 === step ? 'text-black' : 'text-zinc-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-12">
        <h2 className="text-4xl font-serif mb-4">
          {step === 1 && "What room are you designing?"}
          {step === 2 && "Choose your aesthetic style"}
          {step === 3 && "Set the color mood"}
          {step === 4 && "What is your budget range?"}
          {step === 5 && "Tell us about the details"}
        </h2>
        <p className="text-zinc-500">Step {step} of {totalSteps} — Your vision is coming to life.</p>
      </div>

      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROOMS.map(room => (
              <SelectionCard 
                key={room.id}
                title={room.title}
                desc={room.desc}
                img={room.img}
                fallbackImg={room.img}
                selected={selections.room === room.id}
                onClick={() => onUpdate('room', room.id)}
              />
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STYLES.map(style => (
              <SelectionCard 
                key={style.id}
                title={style.title}
                desc={style.desc}
                img={style.img}
                fallbackImg={style.img}
                accentColor={style.color}
                aspect="aspect-[3/4]"
                selected={selections.style === style.id}
                onClick={() => onUpdate('style', style.id)}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOODS.map(mood => (
              <div 
                key={mood.id}
                onClick={() => onUpdate('mood', mood.id)}
                className={`p-8 rounded-[24px] bg-white cursor-pointer transition-all border-2 ${
                  selections.mood === mood.id ? 'border-[#C26A43] bg-[#FFF7F3]' : 'border-transparent hover:shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">{mood.title}</h3>
                  {selections.mood === mood.id && <CheckCircle2 className="text-[#C26A43]" />}
                </div>
                <div className="flex gap-2 h-16">
                  {mood.colors.map(c => (
                    <div key={c} className="flex-1 rounded-xl" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectionCard title="Budget Friendly" desc="Aesthetic results with standard materials. ($5k - $15k)" selected={selections.budget === 'friendly'} onClick={() => onUpdate('budget', 'friendly')} />
            <SelectionCard title="Moderate" desc="Elevated finishes and custom accents. ($15k - $40k)" selected={selections.budget === 'moderate'} onClick={() => onUpdate('budget', 'moderate')} />
            <SelectionCard title="Premium" desc="High-end designer pieces and unique surfaces. ($40k - $100k)" selected={selections.budget === 'premium'} onClick={() => onUpdate('budget', 'premium')} />
            <SelectionCard title="Luxury" desc="Full bespoke customization and rare materials. ($100k+)" selected={selections.budget === 'luxury'} onClick={() => onUpdate('budget', 'luxury')} />
          </div>
        )}

        {step === 5 && (
          <div className="bg-white p-10 rounded-[32px] space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest font-bold text-zinc-400">Room Size</label>
                <div className="flex flex-col gap-2">
                  {['Small', 'Medium', 'Large', 'Extra Large'].map(size => (
                    <button 
                      key={size}
                      onClick={() => onUpdate('size', size)}
                      className={`px-4 py-3 rounded-xl text-left border transition ${selections.size === size ? 'border-[#C26A43] bg-[#FFF7F3] text-[#C26A43]' : 'border-zinc-100 hover:bg-zinc-50'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest font-bold text-zinc-400">Main Priority</label>
                <div className="flex flex-col gap-2">
                  {['Comfort', 'Aesthetics', 'Functionality', 'Storage'].map(p => (
                    <button 
                      key={p}
                      onClick={() => onUpdate('priority', p)}
                      className={`px-4 py-3 rounded-xl text-left border transition ${selections.priority === p ? 'border-[#C26A43] bg-[#FFF7F3] text-[#C26A43]' : 'border-zinc-100 hover:bg-zinc-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest font-bold text-zinc-400">Lighting Style</label>
                <div className="flex flex-col gap-2">
                  {['Natural Light', 'Warm Ambient', 'Bright Modern', 'Layered'].map(l => (
                    <button 
                      key={l}
                      onClick={() => onUpdate('lighting', l)}
                      className={`px-4 py-3 rounded-xl text-left border transition ${selections.lighting === l ? 'border-[#C26A43] bg-[#FFF7F3] text-[#C26A43]' : 'border-zinc-100 hover:bg-zinc-50'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-16 pt-8 border-t border-black/5">
        <button 
          onClick={onPrev}
          className="px-8 py-4 rounded-full font-medium hover:bg-white transition flex items-center gap-2"
        >
          Back
        </button>
        <button 
          onClick={step === totalSteps ? onFinish : onNext}
          className="bg-[#C26A43] text-white px-10 py-4 rounded-full font-medium hover:bg-[#A85734] transition flex items-center gap-2 shadow-lg shadow-[#C26A43]/20"
        >
          {step === totalSteps ? 'Generate Design' : 'Continue'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function ResultsView({ selections, user, onReset, onAuthRequired }) {
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const selectedRoom = ROOMS.find((room) => room.id === selections.room) || ROOMS[0];
  const selectedStyle = STYLES.find((style) => style.id === selections.style) || STYLES[0];
  const toHeroImage = (url) => `${url.split('?')[0]}?w=1200&auto=format&fit=crop`;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    setIsSaved(true);
    // Mock save logic
    console.log('Saving design for user:', user.email);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-zinc-200 rounded-full animate-spin border-t-[#C26A43]" />
          <div className="absolute inset-0 flex items-center justify-center font-serif italic text-2xl">A</div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-2">Curating your space...</h2>
          <p className="text-zinc-400 max-w-xs mx-auto">Analyzing lighting patterns, material textures, and spatial flow based on your preferences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-4">Your Bespoke {selections.room}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge label={selections.style} />
            <Badge label={selections.budget} />
            <Badge label={selections.priority} />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onReset} className="flex items-center gap-2 px-6 py-3 rounded-full border border-black/10 hover:bg-white transition">
            <RefreshCw size={18} /> Regenerate
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaved}
            className={`px-8 py-3 rounded-full font-medium transition flex items-center gap-2 ${
              isSaved ? 'bg-green-600 text-white' : 'bg-[#C26A43] text-white hover:bg-[#A85734] shadow-lg shadow-[#C26A43]/20'
            }`}
          >
            {isSaved ? <><Check size={18} /> Saved</> : 'Save Design'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative group overflow-hidden rounded-[32px] shadow-2xl">
          <img
            src={toHeroImage(selectedRoom.img)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt={`${selectedRoom.title} interior concept`}
          />
          <div className="absolute top-6 left-6">
             <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl">Option Alpha</div>
          </div>
          <button className="absolute bottom-6 right-6 p-4 bg-white rounded-full shadow-2xl hover:scale-110 transition">
            <Maximize2 size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-[32px] overflow-hidden shadow-lg h-64 md:h-auto">
            <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-[32px] overflow-hidden shadow-lg h-64 md:h-auto">
            <img src="https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-[32px] bg-white p-8 col-span-2 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4">Material Palette</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                Based on your {selections.mood} selection, we recommend raw white oak flooring, brushed bronze hardware, and hand-woven linen textiles.
              </p>
            </div>
            <div className="flex gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border border-zinc-100 shadow-sm" style={{ backgroundColor: MOODS.find(m => m.id === selections.mood)?.colors?.[i-1] || '#ccc' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPERS ---

function SelectionCard({ title, desc, img, fallbackImg, selected, onClick, aspect = "aspect-square", accentColor = '#C26A43' }) {
  return (
    <div 
      onClick={onClick}
      className={`group relative overflow-hidden bg-white rounded-[24px] cursor-pointer transition-all duration-300 border-2 ${
        selected ? 'border-[#C26A43] shadow-2xl shadow-[#C26A43]/10 translate-y-[-4px]' : 'border-transparent hover:shadow-xl hover:translate-y-[-2px]'
      }`}
    >
      {img && (
        <div className={`${aspect} overflow-hidden`}>
          <img
            src={img}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImg || img;
            }}
          />
          {selected && (
            <div className="absolute top-4 right-4 text-white p-1 rounded-full shadow-lg" style={{ backgroundColor: accentColor }}>
              <Check size={16} />
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        {!img && selected && (
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">{title}</h3>
            <CheckCircle2 size={20} className="text-[#C26A43]" />
          </div>
        )}
        {!(!img && selected) && <h3 className="font-bold text-lg mb-1">{title}</h3>}
        <p className="text-zinc-500 text-sm leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function Badge({ label }) {
  if (!label) return null;
  return (
    <span className="px-4 py-1.5 bg-black/5 rounded-full text-[10px] uppercase tracking-widest font-bold text-zinc-600">
      {label}
    </span>
  );
}
