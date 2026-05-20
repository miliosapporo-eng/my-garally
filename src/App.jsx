import React, { useState, useEffect, useRef } from 'react';
import { 
    Menu, X, ShoppingBag, Instagram, Mail, 
    Maximize2, ChevronLeft, ChevronRight 
} from 'lucide-react';

// --- 写真データ ---
const photos = [
    { id: 1, url: "images/entry/carp.png", fullUrl: "images/entry/carp.png", title: "80", category: "landscape" },
    { id: 2, url: "images/entry/mtfuji.jpg", fullUrl: "images/entry/mtfuji.jpg", title: "The Camp", category: "landscape" },
    { id: 3, url: "images/entry/haku.jpg", fullUrl: "images/entry/haku.jpg", title: "HAKU", category: "nature" },
    { id: 4, url: "images/entry/yamaguchi.jpg", fullUrl: "images/entry/yamaguchi.jpg", title: "YAMAGUCHI", category: "journey" },
    { id: 5, url: "images/entry/hiroshima.jpg", fullUrl: "images/entry/hiroshima.jpg", title: "HIROSIHIMA", category: "journey" },
    { id: 6, url: "images/entry/shimane.jpg", fullUrl: "images/entry/shimane.jpg", title: "SHIMANE", category: "journey" },
    { id: 7, url: "images/entry/tottori.jpg", fullUrl: "images/entry/tottori.jpg", title: "TOTTORI", category: "journey" },
    { id: 8, url: "images/entry/hyogo.jpg", fullUrl: "images/entry/hyogo.jpg", title: "HYOGO", category: "journey" },
    { id: 9, url: "images/entry/niigata.jpg", fullUrl: "images/entry/niigata.jpg", title: "NIIGATA", category: "journey" },
    { id: 10, url: "images/entry/california.png", fullUrl: "images/entry/california.png", title: "CALIFORNIA", category: "journey" },
    { id: 11, url: "images/entry/yamagiwa.jpg", fullUrl: "images/entry/yamagiwa.jpg", title: "million dollar baby", category: "snap" },
    { id: 12, url: "images/entry/m.jpg", fullUrl: "images/entry/m.jpg", title: "distance", category: "snap" }
];

// --- スクロールアニメーション用コンポーネント ---
const FadeInSection = ({ children, delay = 0, className = "" }) => {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef();
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); 
        const currentRef = domRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);
    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >{children}</div>
    );
};

export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [currentFilter, setCurrentFilter] = useState('all');

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        const style = document.createElement('style');
        style.textContent = `
            body { font-family: 'Zen Kaku Gothic New', sans-serif; background-color: #000; color: #f3f4f6; }
            h1, h2, h3, .brand-font { font-family: 'Montserrat', sans-serif; }
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: #000; }
            ::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
            .burn-in-init { filter: brightness(3) contrast(2) grayscale(1) blur(8px); opacity: 0; transform: scale(1.1); }
            .burn-in-loaded { filter: brightness(1) contrast(1) grayscale(0) blur(0px); opacity: 0.5; transform: scale(1); transition: filter 3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 2s ease-out, transform 4s ease-out; }
            html { scroll-behavior: smooth; }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(link);
            document.head.removeChild(style);
        };
    }, []);

    const displayedPhotos = currentFilter === 'all' ? photos : photos.filter(p => p.category === currentFilter);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % displayedPhotos.length);
            if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + displayedPhotos.length) % displayedPhotos.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, displayedPhotos.length]);

    useEffect(() => {
        if (lightboxIndex !== null) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
    }, [lightboxIndex]);

    const [heroLoaded, setHeroLoaded] = useState(false);
    useEffect(() => {
        const img = new Image();
        img.src = "images/yu.png";
        img.onload = () => setTimeout(() => setHeroLoaded(true), 100);
        img.onerror = () => setTimeout(() => setHeroLoaded(true), 100);
    }, []);

    return (
        <div className="min-h-screen flex flex-col antialiased selection:bg-gray-700 selection:text-white">
            {/* Header */}
            <header className="fixed w-full z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="#" className="block hover:opacity-80 transition">
                        <img src="images/logo.png" alt="Dark Side Luck Logo" className="h-8 md:h-10 w-auto object-contain" />
                    </a>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-300">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <nav className="hidden md:flex space-x-8 items-center tracking-wider">
                        {['GALLERY', 'CONCEPT', 'ABOUT', 'CONTACT'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-medium hover:text-gray-400 transition">{item}</a>
                        ))}
                        <a href="https://dsl.theshop.jp/" target="_blank" rel="noreferrer" className="text-xs font-medium bg-white text-gray-900 px-5 py-2 rounded-sm hover:bg-gray-200 transition flex items-center gap-2">
                            <ShoppingBag size={14} /> STORE
                        </a>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 bg-black">
                    <img src="images/yu.png" alt="Hero" className={`w-full h-full object-cover ${heroLoaded ? 'burn-in-loaded' : 'burn-in-init'}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                </div>
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
                    <FadeInSection delay={500}>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight brand-font">Dark Side Luck</h1>
                    </FadeInSection>
                    <FadeInSection delay={800}>
                        <p className="text-gray-300 text-lg md:text-xl font-light tracking-widest brand-font italic">captured by 430</p>
                    </FadeInSection>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="py-24 px-6 container mx-auto">
                <FadeInSection>
                    <div className="flex flex-col items-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-10 brand-font tracking-widest text-white text-center leading-relaxed">
                            Selected Works
                        </h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['all', 'landscape', 'portrait', 'urban', 'snap', 'nature', 'journey'].map((filter) => (
                                <button key={filter} onClick={() => setCurrentFilter(filter)} className={`px-6 py-2 rounded-full border transition-all text-xs tracking-widest ${currentFilter === filter ? 'bg-white text-black' : 'border-gray-700 text-gray-400'}`}>
                                    {filter.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </FadeInSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedPhotos.map((photo, index) => (
                        <FadeInSection key={photo.id} delay={index * 100}>
                            <div className="group relative overflow-hidden rounded-sm cursor-pointer aspect-[3/4] md:aspect-[4/3]" onClick={() => setLightboxIndex(index)}>
                                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                    <h3 className="text-xl font-bold text-white brand-font">{photo.title}</h3>
                                    <Maximize2 size={18} className="mt-4 text-white" />
                                </div>
                            </div>
                        </FadeInSection>
                    ))}
                </div>
            </section>

            {/* Concept Section */}
            <section id="concept" className="relative py-32 px-6 bg-black border-t border-gray-900">
                <div className="relative z-10 container mx-auto max-w-3xl text-gray-300 leading-[2.2] font-light">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-5xl font-bold mb-16 brand-font tracking-[0.2em] text-center text-white">What is Dark Side Luck?</h2>
                        <p className="mb-10">Dark Side というワードにネガティブな印象を持つかもしれませんが、撮影とはすなわち「影を撮る」こと。光が物体に当たった時に現れるその影の美しさを私は見つめています。</p>
                        <p className="mb-10">暗闇の中に差し込む一筋の光。それこそが僕の撮っているもの。僕から見た貴方はそれだけ尊いものなのです。</p>
                    </FadeInSection>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="relative py-24 bg-gray-900/50">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="w-full md:w-5/12">
                            <img src="images/square.jpg" alt="430" className="rounded-sm grayscale hover:grayscale-0 transition duration-700 w-full" />
                        </div>
                        <div className="w-full md:w-7/12">
                            <h2 className="text-3xl font-bold mb-8 brand-font tracking-widest text-white">Behind the Lens</h2>
                            <p className="text-gray-400 leading-loose mb-8">1983年札幌生まれ。北海道在住。主にポートレートスナップを撮影。共感し合えるパートナーとの出会いを楽しみにしています。</p>
                            <a href="https://instagram.com/dark_side_luck" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white border-b border-gray-600 pb-1">
                                <Instagram size={18} /> Instagram
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-32 bg-black border-t border-gray-900 text-center">
                <FadeInSection>
                    <h2 className="text-3xl font-bold mb-6 brand-font tracking-widest">Get in Touch</h2>
                    <p className="text-gray-400 mb-12 max-w-lg mx-auto">撮影依頼やコラボレーション等、お気軽にご連絡ください。</p>
                    <a href="mailto:DSL@design4qol.com" className="inline-flex items-center gap-4 px-10 py-4 border border-gray-600 text-white hover:bg-white hover:text-black transition-all brand-font tracking-[0.2em]">
                        <Mail size={16} /> CONTACT ME
                    </a>
                </FadeInSection>
            </section>

            {/* Footer */}
            <footer className="bg-black py-10 border-t border-gray-900 text-center text-gray-600 text-xs tracking-widest">
                <p>&copy; {new Date().getFullYear()} MiLio, LLC All rights reserved.</p>
            </footer>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
                    <img src={displayedPhotos[lightboxIndex].fullUrl} className="max-h-[85vh] max-w-full object-contain" />
                    <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-gray-500"><X size={36} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + displayedPhotos.length) % displayedPhotos.length); }} className="absolute left-4 text-white/40 hover:text-white"><ChevronLeft size={48} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % displayedPhotos.length); }} className="absolute right-4 text-white/40 hover:text-white"><ChevronRight size={48} /></button>
                </div>
            )}
        </div>
    );
}