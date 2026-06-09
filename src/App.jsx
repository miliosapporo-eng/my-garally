import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// Firebase の初期化と Storage 連携
// ============================================================================
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

// 先ほどご提示いただいた Firebase 設定を直接ここに埋め込みます
const firebaseConfig = {
    apiKey: "AIzaSyBaWABhVZPKHRPwevjv8xzy7lvWjMoWCt8",
    authDomain: "dark-side-luck.firebaseapp.com",
    projectId: "dark-side-luck",
    storageBucket: "dark-side-luck.firebasestorage.app",
    messagingSenderId: "43203104616",
    appId: "1:43203104616:web:cf3f08e99b9c8964ead0dd",
    measurementId: "G-FMGKCPQE9T"
};

// アプリの初期化
const app = initializeApp(firebaseConfig);
// Storage の初期化
const storage = getStorage(app);

// ============================================================================
// プロジェクトセクション用スライドショーコンポーネント
// ============================================================================
const ProjectSlideshow = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // Firebase Storageから画像のリストを取得
                const listRef = ref(storage, 'projects/portrait_exhibition'); 
                const res = await listAll(listRef);
                
                // 全ての画像のURLを取得
                let urls = await Promise.all(res.items.map((itemRef) => getDownloadURL(itemRef)));

                // 画像が取得できなかった場合のフォールバック（画面が真っ暗になるのを防ぐため）
                if (urls.length === 0) {
                    urls = [
                        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80"
                    ];
                }

                // 読み込んだ写真群をランダムにシャッフル
                urls = urls.sort(() => Math.random() - 0.5);
                setImages(urls);
            } catch (error) {
                console.error("Storage fetch error:", error);
                // エラー時のフォールバック画像
                setImages([
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80"
                ]);
            }
        };
        fetchImages();
    }, []);

    // 6秒ごとにスライドを切り替え
    useEffect(() => {
        if (images.length === 0) return;
        const intervalId = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 6000); 
        return () => clearInterval(intervalId);
    }, [images]);

    if (images.length === 0) return null;

    return (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none">
            {images.map((url, index) => {
                const isActive = index === currentIndex;
                const isPrevious = index === (currentIndex - 1 + images.length) % images.length;

                // エフェクトの論理構築
                // 暗闇の奥からゆっくりフェードインし、手前へフェードアウトしていく
                let slideClass = "opacity-0 scale-90 z-0 transition-all duration-[3000ms] ease-in"; // 待機状態（奥）
                if (isActive) {
                    slideClass = "opacity-40 scale-105 z-10 transition-all duration-[8000ms] ease-out"; // 表示状態（徐々に手前へ）
                } else if (isPrevious) {
                    slideClass = "opacity-0 scale-110 z-5 transition-all duration-[4000ms] ease-out"; // フェードアウト状態（さらに手前へ行きながら消える）
                }

                return (
                    <div key={url} className={`absolute inset-0 ${slideClass}`}>
                         <img src={url} alt="Portrait Exhibition" className="w-full h-full object-cover object-center" />
                    </div>
                );
            })}
        </div>
    );
};

// --- 初期写真データ（元の12枚） ---
const DEFAULT_PHOTOS = [
    { id: "1", url: "images/entry/carp.webp", fullUrl: "images/entry/carp.webp", title: "80", category: "landscape", createdAt: 1716223200000 },
    { id: "2", url: "images/entry/mtfuji.webp", fullUrl: "images/entry/mtfuji.webp", title: "The Camp", category: "landscape", createdAt: 1716223201000 },
    { id: "3", url: "images/entry/haku.webp", fullUrl: "images/entry/haku.webp", title: "HAKU", category: "nature", createdAt: 1716223202000 },
    { id: "4", url: "images/entry/yamaguchi.webp", fullUrl: "images/entry/yamaguchi.webp", title: "YAMAGUCHI", category: "journey", createdAt: 1716223203000 },
    { id: "5", url: "images/entry/hiroshima.webp", fullUrl: "images/entry/hiroshima.webp", title: "HIROSIHIMA", category: "journey", createdAt: 1716223204000 },
    { id: "6", url: "images/entry/shimane.webp", fullUrl: "images/entry/shimane.webp", title: "SHIMANE", category: "journey", createdAt: 1716223205000 },
    { id: "7", url: "images/entry/tottori.webp", fullUrl: "images/entry/tottori.webp", title: "TOTTORI", category: "journey", createdAt: 1716223206000 },
    { id: "8", url: "images/entry/hyogo.webp", fullUrl: "images/entry/hyogo.webp", title: "HYOGO", category: "journey", createdAt: 1716223207000 },
    { id: "9", url: "images/entry/niigata.webp", fullUrl: "images/entry/niigata.webp", title: "NIIGATA", category: "journey", createdAt: 1716223208000 },
    { id: "10", url: "images/entry/california.webp", fullUrl: "images/entry/california.webp", title: "CALIFORNIA", category: "journey", createdAt: 1716223209000 },
    { id: "11", url: "images/entry/yamagiwa.webp", fullUrl: "images/entry/yamagiwa.webp", title: "million dollar baby", category: "snap", createdAt: 1716223210000 },
    { id: "12", url: "images/entry/m.webp", fullUrl: "images/entry/m.webp", title: "distance", category: "snap", createdAt: 1716223211000 }
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
        >
            {children}
        </div>
    );
};

export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [photos, setPhotos] = useState(DEFAULT_PHOTOS);

    // --- 「もっと見る」用ステート＆初期表示枚数の設定 ---
    const [isExpanded, setIsExpanded] = useState(false);
    const INITIAL_VISIBLE_COUNT = 6; // 最初は6枚表示

    // --- ブラウザ上でのJavaScriptエラー検知＆画面描画システム ---
    const [diagnosticError, setDiagnosticError] = useState(null);

    useEffect(() => {
        const handleError = (event) => {
            setDiagnosticError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error ? event.error.stack : 'No stack trace available'
            });
        };
        const handleRejection = (event) => {
            setDiagnosticError({
                message: `Promise Rejection: ${event.reason}`,
                error: event.reason ? event.reason.stack : 'No stack trace available'
            });
        };
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);

    // --- グローバルスタイルの注入 ---
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

    // フィルターされたすべての写真
    const displayedPhotos = currentFilter === 'all' ? photos : photos.filter(p => p.category === currentFilter);
    
    // 「もっと見る」状態を考慮した、実際に画面のグリッドに表示する写真
    const visiblePhotos = isExpanded ? displayedPhotos : displayedPhotos.slice(0, INITIAL_VISIBLE_COUNT);

    // フィルター切り替え時に「もっと見る」を閉じた状態にリセット
    useEffect(() => {
        setIsExpanded(false);
    }, [currentFilter]);

    // --- ライトボックスのキーボード操作 ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') setLightboxIndex(null);
            // 表示されている範囲内（visiblePhotos）でループさせる
            if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % visiblePhotos.length);
            if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + visiblePhotos.length) % visiblePhotos.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, visiblePhotos.length]);

    useEffect(() => {
        document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    }, [lightboxIndex]);

    useEffect(() => {
        const img = new Image();
        img.src = "images/yu.png";
        img.onload = () => setTimeout(() => setHeroLoaded(true), 100);
        img.onerror = () => setTimeout(() => setHeroLoaded(true), 100);
    }, []);

    return (
        <div className="min-h-screen flex flex-col antialiased selection:bg-gray-700 selection:text-white bg-black">
            
            {diagnosticError && (
                <div className="fixed inset-x-0 top-0 z-[9999] bg-red-950 border-b-4 border-red-500 text-red-100 p-6 font-mono text-sm overflow-auto max-h-[50vh]">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse">RUNTIME ERROR DETECTED</span>
                        <button onClick={() => setDiagnosticError(null)} className="ml-auto text-red-300 hover:text-white text-xs border border-red-700 px-2 py-0.5 rounded">Close Banner</button>
                    </div>
                    <p className="font-bold text-lg text-white mb-2">{diagnosticError.message}</p>
                    {diagnosticError.filename && (
                        <p className="text-red-300 mb-1">📍 File: {diagnosticError.filename} (Line: {diagnosticError.lineno}, Col: {diagnosticError.colno})</p>
                    )}
                    <pre className="bg-black/40 p-3 rounded mt-2 text-xs text-red-200 overflow-x-auto whitespace-pre-wrap">{diagnosticError.error}</pre>
                </div>
            )}

            {/* Header */}
            <header className="fixed w-full z-40 bg-black/80 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="#" className="block hover:opacity-80 transition">
                        <img src="images/logo.png" alt="Dark Side Luck Logo" className="h-8 md:h-10 w-auto object-contain" />
                    </a>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-300 hover:text-white focus:outline-none">
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                    {/* ナビゲーションにPROJECTを追加 */}
                    <nav className="hidden md:flex space-x-8 items-center tracking-wider">
                        {['GALLERY', 'CONCEPT', 'PROJECT', 'ABOUT', 'CONTACT'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-medium hover:text-gray-400 transition">{item}</a>
                        ))}
                        <a href="https://dsl.theshop.jp/" target="_blank" rel="noreferrer" className="text-xs font-medium bg-white text-gray-900 px-5 py-2 rounded-sm hover:bg-gray-200 transition flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            STORE
                        </a>
                    </nav>
                </div>
                {isMenuOpen && (
                    <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800 absolute w-full left-0">
                        <div className="flex flex-col px-6 py-6 space-y-6">
                            {['GALLERY', 'CONCEPT', 'PROJECT', 'ABOUT', 'CONTACT'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-sm tracking-wider font-medium hover:text-gray-400 transition">{item}</a>
                            ))}
                            <a href="https://dsl.theshop.jp/" target="_blank" rel="noreferrer" className="text-sm tracking-wider font-medium text-yellow-500 hover:text-yellow-400 transition flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                VISIT STORE
                            </a>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                    <img src="images/yu.webp" alt="Hero Background" className={`w-full h-full object-cover z-0 relative ${heroLoaded ? 'burn-in-loaded' : 'burn-in-init'}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-10"></div>
                </div>
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
                    <FadeInSection delay={500}><h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight brand-font">Dark Side Luck</h1></FadeInSection>
                    <FadeInSection delay={800}><p className="text-gray-300 text-lg md:text-xl font-light tracking-widest brand-font italic">captured by 430</p></FadeInSection>
                </div>
                <div className="absolute bottom-24 w-full z-20 text-center px-4">
                    <FadeInSection delay={1200}>
                        <p className="text-gray-400 text-xs md:text-sm tracking-[0.2em] leading-loose font-light">
                            瞬く前にそこに居た君の残像を見返す尊さよ。<br />
                            瞬く間に君はもうそこには居ないという儚さよ。
                        </p>
                    </FadeInSection>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="py-24 px-6 container mx-auto">
                <FadeInSection>
                    <div className="flex flex-col items-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-10 brand-font tracking-widest text-white">Selected Works</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['all', 'landscape', 'portrait', 'urban', 'snap', 'animal', 'nature', 'journey'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setCurrentFilter(filter)}
                                    className={`px-6 py-2 rounded-full border transition-all duration-300 text-xs tracking-widest font-medium ${currentFilter === filter ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-400'}`}
                                >
                                    {filter.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </FadeInSection>

                {/* ギャラリー写真グリッド */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {visiblePhotos.map((photo, index) => (
                        <FadeInSection key={`${currentFilter}-${photo.id}`} delay={(index % INITIAL_VISIBLE_COUNT) * 100}>
                            <div 
                                className="group relative overflow-hidden rounded-sm cursor-pointer bg-gray-900 aspect-[3/4] md:aspect-[4/3]"
                                onClick={() => setLightboxIndex(index)}
                            >
                                <img 
                                    src={photo.url} 
                                    alt={photo.title} 
                                    loading="lazy" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        const currentSrc = e.target.src;
                                        if (!currentSrc.endsWith('.webp') && currentSrc.includes('/images/entry/')) {
                                            const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('.'));
                                            e.target.src = `${basePath}.webp`;
                                        } else {
                                            e.target.src = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80";
                                        }
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-4">
                                    <p className="text-xs text-yellow-500 uppercase tracking-[0.2em] mb-3 font-bold brand-font">{photo.category}</p>
                                    <h3 className="text-xl font-bold text-white brand-font tracking-wide">{photo.title}</h3>
                                    <div className="mt-6 text-white border border-white/40 rounded-full p-3 hover:bg-white hover:text-black transition-colors duration-300 transform translate-y-4 group-hover:translate-y-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" /></svg>
                                    </div>
                                </div>
                            </div>
                        </FadeInSection>
                    ))}
                </div>

                {/* もっと見る（VIEW MORE）テキストリンク / ボタン */}
                {displayedPhotos.length > INITIAL_VISIBLE_COUNT && (
                    <FadeInSection delay={100} className="mt-16 flex justify-center">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="group flex flex-col items-center gap-2 text-xs tracking-[0.3em] font-medium text-gray-400 hover:text-white transition duration-300"
                        >
                            <span className="border-b border-gray-700 pb-1 group-hover:border-white transition-colors">
                                {isExpanded ? 'CLOSE / 閉じる' : 'VIEW MORE / もっと見る'}
                            </span>
                            <svg 
                                className={`w-4 h-4 transform transition-transform duration-500 ${isExpanded ? 'rotate-180 text-white' : 'text-gray-500 group-hover:text-white group-hover:translate-y-1'}`} 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </FadeInSection>
                )}
            </section>

            {/* Concept Section */}
            <section id="concept" className="relative py-32 px-6 bg-black border-t border-b border-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="images/taiga.jpg" alt="Concept" loading="lazy" className="w-full h-full object-cover blur-[4px] opacity-30 scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
                </div>
                <div className="relative z-10 container mx-auto max-w-3xl">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-5xl font-bold mb-16 brand-font tracking-[0.2em] text-center text-white leading-tight">
                            What's <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-200">Dark Side Luck</span> ?
                        </h2>
                    </FadeInSection>
                    <div className="space-y-10 text-gray-300 text-[15px] md:text-base leading-[2.2] font-light">
                        <FadeInSection delay={200}>
                            <p>Dark Side というワードを聞いたらネガティブな印象を持ってしまうかもしれませんが、ちょっと待ってください!! まぁ、確かにどっちなのかと言われればネガティブな方に分類されるのかもしれないのですが...よかったらどういう意味なのかだけでも読んで頂けたら嬉しいです。</p>
                        </FadeInSection>
                        <FadeInSection delay={200}>
                            <h3 className="text-lg md:text-xl font-medium text-white mt-12 mb-6 tracking-wide">発想のもとは「撮る」ということを言い換えるということ。</h3>
                            <p className="mb-6">この自分自身のブランドを作ろうとした時、僕はどうして、何を、どんな時にレンズを向けてシャッターを切っているのだろう。と過去これまで撮ってきた写真を数々を見返していました。幸いなことに、職業カメラマンであった期間は無いと言って等しいので、残っている写真はほぼ全て自分自身の動機 and センスによって撮られたものだったので、その分析に時間は要しませんでした。</p>
                            <p className="mb-6">僕の撮影歴の始まりはライブステージでした。そこからストリートスナップ、証明写真、ポートレート、ナイトクラブイベント、ツーリズム（風景）と多岐に広がっていきましたが、結局共通項と言えば、一般的な話「光と影」に辿り起きたのでした。</p>
                            <p className="mb-6">撮影というのは、読んで字の跨く「影を撮る」ことなのですが、影とはすなわち、光が何かしらの物体に当たった時に現れるもので、撮影者その光と影の美しさを見ているのです。</p>
                            <p>僕が切り取ってきた世界に写っていたのは、ライブステージで汗を飛び散らせて情熱を爆発させるバンドマン、あるひと夜の儚いパーティタイムを楽しむビューティフルピープル、掛け替えない幸福な時間の一瞬は…全てキラキラ輝いていました。さて、これを何と言い表そうか。</p>
                        </FadeInSection>
                        <FadeInSection delay={200}>
                            <h3 className="text-lg md:text-xl font-medium text-white mt-16 mb-6 tracking-wide">光輝くもの。尊いもの。それは愛なのかもしれない。</h3>
                            <p>僕が撮りたいと思うのは、輝かしい存在が目の前にあった時なのだということが分かりました。そして、その光輝くものは影を生む。また、同じ一辺倒の明るさの中にいては、それらは輝きを放てないでしょう。少しほの暗い方がいいのかもしれない。あるいは、完全な闇の中の方がいいのかもしれない。つまりは、暗闇の中に差し込む一筋の光。それこそが僕の撮っているものなのだ。と, 腑に落ちたのでした。僕から見た貴方はそれだけ尊いものなのです。</p>
                        </FadeInSection>
                        <FadeInSection delay={200}>
                            <div className="border-l-[1px] border-gray-600 pl-6 mt-20">
                                <h4 className="text-sm md:text-base font-bold text-gray-400 mb-6 tracking-widest brand-font">余談</h4>
                                <p className="mb-6">撮影ジャンルとしては、自分で言うとすると「（目撃した）記録」になると思います。自ら光源を作り出したり再現したりすることは無く、その日その時間その場で何に対峙してそれをどのように切り取ったのか、あるいは何を考えていたのか。を大切にしています。</p>
                                <p>ネイチャーも人物のスナップも乗り物も建物も私のテーマの対象物だと思っています。活動内容としましては、様々な理由で行きたい場所に行くことができない、思いを伝えられない。そんな人たちの代わりとなるphoto messengerをやっていこうと考えております。いつかそれ自体が私の存在した証明になるように。</p>
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* Project Section (New) */}
            <section id="project" className="relative border-b border-gray-900 overflow-hidden bg-black min-h-[85vh] flex items-center justify-center">
                
                {/* スライドショーの背景コンポーネント */}
                <ProjectSlideshow />
                
                {/* テキストを読みやすくするためのグラデーションオーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
                
                {/* テキストコンテンツ */}
                <div className="relative z-20 container mx-auto px-6 text-center max-w-4xl py-32">
                    <FadeInSection>
                        <p className="text-yellow-600 tracking-[0.4em] text-xs font-bold mb-4 uppercase">Special Exhibition</p>
                        <h2 className="text-4xl md:text-6xl font-bold mb-2 brand-font tracking-widest text-white leading-tight">
                            portrait exhibition
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 brand-font italic font-light mb-12">by 430</p>
                        <div className="w-12 h-[1px] bg-gray-600 mx-auto mb-10"></div>
                        <p className="text-gray-200 font-light leading-[2.4] tracking-widest text-[13px] md:text-base drop-shadow-lg">
                            暗闇の奥底から浮かび上がる、剥き出しの感情と静寂。<br className="hidden md:block" />
                            光と影が交錯する瞬間にのみ現れる「その人」の真実を切り取ったポートレート群。<br className="hidden md:block" />
                            視線の先に宿る物語を、どうか感じ取ってください。
                        </p>
                    </FadeInSection>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-gray-900">
                    <img src="images/519.jpg" alt="About" loading="lazy" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent md:to-black/40"></div>
                </div>
                <div className="relative z-10 container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
                        <div className="w-full md:w-5/12">
                            <FadeInSection>
                                <div className="relative group">
                                    <div className="absolute -inset-2 bg-gradient-to-tr from-gray-800 to-gray-600 opacity-20 group-hover:opacity-40 blur transition duration-700"></div>
                                    <img src="images/square.jpg" alt="Photographer 430" loading="lazy" className="relative rounded-sm shadow-2xl w-full h-auto grayscale group-hover:grayscale-0 transition duration-700" />
                                </div>
                            </FadeInSection>
                        </div>
                        <div className="w-full md:w-7/12">
                            <FadeInSection delay={200}><h2 className="text-3xl font-bold mb-8 brand-font tracking-widest text-white">Behind the Lens</h2></FadeInSection>
                            <FadeInSection delay={300}>
                                <p className="text-gray-400 leading-loose mb-8 text-[15px] md:text-base font-light">
                                    初めまして。430 (shimio)です。<br />1983年札幌生まれ。北海道在住。アクティブに動いているかと思いきや、引きこもったりする変な人。主にポートレートスナップを撮っています。共感してもらえる方々に出会えることを楽しみにしております。これはいい！と思える作品を共に創っていけるパートナーを探しています。よろしくお願いします。
                                </p>
                                <div className="text-gray-400 leading-loose mb-10 space-y-4 text-sm font-light">
                                    <div><span className="text-gray-300 font-medium tracking-widest text-xs border-b border-gray-700 pb-1 mb-2 inline-block">興味 • 関心</span><br />VIPな女の人生 ／ 無の境地 ／ 脳に補正された世界とされていない世界 ／ 人体のメカニズム</div>
                                    <div><span className="text-gray-300 font-medium tracking-widest text-xs border-b border-gray-700 pb-1 mb-2 inline-block">やっていること</span><br />ひとりブレスト ／ 常識を疑い無条件では従わない ／ エスノメソドロジー</div>
                                    <div><span className="text-gray-300 font-medium tracking-widest text-xs border-b border-gray-700 pb-1 mb-2 inline-block">やりたくないこと</span><br />群れること ／ 脳中心の判断 ／ 陰口を聞かされること</div>
                                </div>
                            </FadeInSection>
                            <FadeInSection delay={400}>
                                <div className="p-8 border border-gray-800/60 rounded-sm bg-black/40 backdrop-blur-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <h3 className="text-lg font-bold mb-2 brand-font text-white tracking-widest relative z-10">Prints & Goods</h3>
                                    <p className="text-gray-400 text-sm mb-6 font-light relative z-10">オリジナルプリントや写真集をオンラインストアで販売しています。</p>
                                    <a href="https://dsl.theshop.jp/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white border-b border-yellow-600 pb-1 hover:text-yellow-500 hover:border-yellow-400 transition-all duration-300 text-sm tracking-wider relative z-10">
                                        オンラインストアを見る 
                                        <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                                    </a>
                                </div>
                            </FadeInSection>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="relative py-32 border-b border-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="images/moon.jpg" alt="Contact" loading="lazy" className="w-full h-full object-cover opacity-30 mix-blend-luminosity scale-105" />
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
                </div>
                <div className="relative z-10 container mx-auto px-6">
                    <FadeInSection>
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6 brand-font text-white tracking-widest">Get in Touch</h2>
                            <div className="w-12 h-[1px] bg-gray-600 mx-auto mb-8"></div>
                            <p className="text-gray-300 mb-12 font-light leading-loose">撮影の依頼、コラボレーション、あるいは単なるご挨拶でも。<br />お気軽にご連絡ください。</p>
                            <div className="flex flex-col items-center gap-6">
                                <a href="mailto:DSL@design4qol.com" className="group inline-flex items-center gap-4 px-10 py-4 border border-gray-600 text-white rounded-sm hover:bg-white hover:text-black transition-all duration-500 text-sm tracking-[0.2em] brand-font overflow-hidden relative">
                                    <span className="absolute inset-0 w-full h-full -mt-1 rounded-sm opacity-30 bg-gradient-to-b from-transparent via-transparent to-black group-hover:opacity-0 transition-opacity"></span>
                                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <span className="relative z-10">CONTACT ME</span>
                                </a>
                                <a href="https://instagram.com/dark_side_luck" target="_blank" rel="noreferrer" className="group p-2 text-gray-500 hover:text-white transition duration-300 flex items-center justify-center gap-3 text-xs tracking-widest mt-4">
                                    <svg className="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                                    <span className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">FOLLOW ON INSTAGRAM</span>
                                </a>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black py-10 mt-auto border-t border-gray-900 relative z-10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs tracking-widest brand-font gap-4">
                    <p>&copy; {new Date().getFullYear()} MiLio, LLC All rights reserved.</p>
                </div>
            </footer>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={(e) => { if (e.target === e.currentTarget) setLightboxIndex(null); }}
                >
                    <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors p-2 z-50">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + visiblePhotos.length) % visiblePhotos.length); }} className="absolute left-4 md:left-8 text-gray-600 hover:text-white p-4 hidden md:block transition-transform hover:-translate-x-2 z-50">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % visiblePhotos.length); }} className="absolute right-4 md:right-8 text-gray-600 hover:text-white p-4 hidden md:block transition-transform hover:translate-x-2 z-50">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <div className="max-w-6xl w-full flex flex-col items-center justify-center">
                        <img 
                            src={visiblePhotos[lightboxIndex].fullUrl} 
                            alt={visiblePhotos[lightboxIndex].title} 
                            loading="lazy"
                            className="max-h-[85vh] max-w-full object-contain shadow-2xl rounded-sm animate-in zoom-in-95 duration-300"
                            onError={(e) => {
                                const currentSrc = e.target.src;
                                if (!currentSrc.endsWith('.webp') && currentSrc.includes('/images/entry/')) {
                                    const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('.'));
                                    e.target.src = `${basePath}.webp`;
                                }
                            }}
                        />
                        <div className="mt-6 text-center animate-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-xl text-white font-light brand-font tracking-widest">{visiblePhotos[lightboxIndex].title}</h3>
                            <p className="text-[10px] text-yellow-600/80 mt-2 uppercase tracking-[0.3em] font-bold">{visiblePhotos[lightboxIndex].category}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}