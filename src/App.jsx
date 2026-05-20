import React, { useState, useEffect, useRef } from 'react';
import { 
    Menu, X, ShoppingBag, ArrowUpRight, Instagram, Mail, 
    Maximize2, ChevronLeft, ChevronRight 
} from 'lucide-react';

// --- 写真データ (ANIMAL カテゴリー対応) ---
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

// --- スクロールフェードインコンポーネント (ReactのIntersectionObserver活用) ---
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

    // --- Google FontsをReactから動的にリンク登録 ---
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    // --- ヒーロー画像の焼き込みエフェクト用ロード検知 ---
    useEffect(() => {
        const img = new Image();
        img.src = "images/yu.png";
        img.onload = () => setTimeout(() => setHeroLoaded(true), 100);
        img.onerror = () => setTimeout(() => setHeroLoaded(true), 100);
    }, []);

    // フィルター処理
    const displayedPhotos = currentFilter === 'all' 
        ? photos 
        : photos.filter(p => p.category === currentFilter);

    // --- ライトボックスのキーボード・スクロール固定操作 ---
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
        else document.body.style.overflow = '';
    }, [lightboxIndex]);

    return (
        <div className="min-h-screen flex flex-col antialiased selection:bg-gray-700 selection:text-white bg-black text-gray-100">
            
            {/* --- Header --- */}
            <header className="fixed w-full z-40 bg-black/90 backdrop-blur-sm border-b border-gray-800 transition-all duration-300" id="header">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="#" className="block hover:opacity-80 transition">
                        <img src="images/logo.png" alt="MY LENS Logo" className="h-8 md:h-10 w-auto object-contain" />
                    </a>
                    
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-300 hover:text-white">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* デスクトップナビゲーション（LINKSを完全に削除） */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        {['GALLERY', 'CONCEPT', 'ABOUT', 'CONTACT'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium hover:text-gray-400 transition tracking-wider">{item}</a>
                        ))}
                        <a href="https://dsl.theshop.jp/" target="_blank" rel="noreferrer" className="text-sm font-medium bg-white text-gray-900 px-4 py-2 rounded-sm hover:bg-gray-200 transition flex items-center gap-2">
                            <ShoppingBag size={16} /> STORE
                        </a>
                    </nav>
                </div>

                {/* モバイルナビゲーション（LINKSを完全に削除） */}
                {isMenuOpen && (
                    <div className="md:hidden bg-black border-t border-gray-800 absolute w-full left-0">
                        <div className="flex flex-col px-6 py-4 space-y-4">
                            {['GALLERY', 'CONCEPT', 'ABOUT', 'CONTACT'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium hover:text-gray-400 transition">{item}</a>
                            ))}
                            <a href="https://dsl.theshop.jp/" target="_blank" rel="noreferrer" className="text-sm font-medium text-yellow-500 hover:text-yellow-400 transition flex items-center gap-2">
                                <ShoppingBag size={16} /> VISIT STORE
                            </a>
                        </div>
                    </div>
                )}
            </header>

            {/* --- Hero Section --- */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                    <img 
                        src="images/yu.png" 
                        alt="Hero Background" 
                        className={`w-full h-full object-cover z-0 relative transition-all duration-1000 ${
                            heroLoaded 
                                ? 'filter brightness-100 contrast-100 grayscale-0 blur-none opacity-50 scale-100' 
                                : 'filter brightness-200 contrast-200 grayscale-100 blur-md opacity-0 scale-110'
                        }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                </div>

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-16">
                    <FadeInSection delay={500}>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight brand-font">
                            Dark Side Luck
                        </h1>
                    </FadeInSection>
                    <FadeInSection delay={800}>
                        <p className="text-gray-300 text-lg md:text-xl mb-10 font-light max-w-2xl mx-auto leading-relaxed">
                            captured by 430
                        </p>
                    </FadeInSection>
                </div>

                <div className="absolute bottom-24 w-full z-20 text-center px-4">
                    <FadeInSection delay={1200}>
                        <p className="text-gray-400 text-xs md:text-sm tracking-[0.15em] leading-loose font-light">
                            瞬く前にそこに居た君の残像を見返す尊さよ。<br />
                            瞬く間に君はもうそこには居ないという儚さよ。
                        </p>
                    </FadeInSection>
                </div>
            </section>

            {/* --- Gallery Section --- */}
            <section id="gallery" className="py-20 px-6 container mx-auto">
                <FadeInSection>
                    <div className="flex flex-col items-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 brand-font">Selected Works</h2>
                        
                        {/* フィルターボタン（ANIMALを完備） */}
                        <div className="flex flex-wrap justify-center gap-4">
                            {['all', 'landscape', 'portrait', 'urban', 'snap', 'animal', 'nature', 'journey'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setCurrentFilter(filter)}
                                    className={`px-6 py-2 rounded-full border transition-all duration-300 text-sm tracking-wide font-medium
                                        ${currentFilter === filter 
                                            ? 'bg-white text-black border-white' 
                                            : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-400'}`}
                                >
                                    {filter.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </FadeInSection>

                {/* 写真グリッド */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedPhotos.map((photo, index) => (
                        <FadeInSection key={`${currentFilter}-${photo.id}`} delay={index * 100}>
                            <div 
                                className="group relative overflow-hidden rounded-sm cursor-pointer bg-gray-900 aspect-[3/4] md:aspect-[4/3]"
                                onClick={() => setLightboxIndex(index)}
                            >
                                <img 
                                    src={photo.url} 
                                    alt={photo.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-4">
                                    <p className="text-xs text-yellow-500 uppercase tracking-widest mb-2 font-bold">{photo.category}</p>
                                    <h3 className="text-xl font-bold text-white brand-font tracking-wide">{photo.title}</h3>
                                    <div className="mt-4 text-white border border-white/50 rounded-full p-2 hover:bg-white hover:text-black transition">
                                        <Maximize2 size={18} />
                                    </div>
                                </div>
                            </div>
                        </FadeInSection>
                    ))}
                </div>
            </section>

            {/* --- Concept Section --- */}
            <section id="concept" className="relative py-24 px-6 bg-black border-t border-b border-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="images/taiga.jpg" alt="Concept Background" className="w-full h-full object-cover blur-[3px] opacity-40 scale-105" />
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>

                <div className="relative z-10 container mx-auto max-w-4xl text-center">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-5xl font-bold mb-12 brand-font tracking-widest text-white leading-tight">
                            What is <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-200">Dark Side Luck</span> ?
                        </h2>
                    </FadeInSection>
                    
                    <div className="space-y-6 text-gray-400 text-base md:text-lg leading-loose font-light text-left">
                        <FadeInSection delay={200}>
                            <p>
                                Dark Side というワードを聞いたらネガティブな印象を持ってしまうかもしれませんが、ちょっと待ってください!! まぁ、確かにどっちなのかと言われればネガティブな方に分類されるのかもしれないのですが...よかったらどういう意味なのかだけでも読んで頂けたら嬉しいです。
                            </p>
                        </FadeInSection>

                        <FadeInSection delay={300}>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-200 mt-12 mb-4">発想のもとは「撮る」ということを言い換えるということ。</h3>
                            <p className="mb-4">
                                この自分自身のブランドを作ろうとした時、僕はどうして、何を、どんな時にレンズを向けてシャッターを切っているのだろう。と過去これまで撮ってきた写真を数々を見返していました。幸いなことに、職業カメラマンであった期間は無いと言って等しいので、残っている写真はほぼ全て自分自身の動機とセンスによって撮られたものだったので、その分析に時間は要しませんでした。
                            </p>
                            <p className="mb-4">
                                僕の撮影歴の始まりはライブステージでした。そこからストリートスナップ、証明写真、ポートレート、ナイトクラブイベント、ツーリズム（風景）と多岐に広がっていきましたが、結局共通項と言えば、一般的な話「光と影」に辿り端いたのでした。
                            </p>
                            <p className="mb-4">
                                撮影というのは、読んで字の落とし込みなのですが、影とはすなわち、光が何かしらの物体に当たった時に現れるもので、撮影者はその光と影の美しさを見ているのです。
                            </p>
                            <p>
                                僕が切り取ってきた世界に写っていたのは、ライブステージで汗を飛び散らせて情熱を爆発させるバンドマン、あるひと夜の儚いパーティタイムを楽しむビューティフルピープル、掛け替えない幸福な時間の一瞬は…全てキラキラ輝いていました。さて、これを何と言い表そうか。
                            </p>
                        </FadeInSection>

                        <FadeInSection delay={400}>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-200 mt-12 mb-4">光輝くもの。尊いもの。それは愛なのかもしれない。</h3>
                            <p>
                                僕が撮りたいと思うのは、輝かしい存在が目の前にあった時なのだということが分かりました。そして、その光輝くものは影を生む。また、同じ一辺倒の明るさの中にいては、それらは輝きを放てないでしょう。少しほの暗い方がいいのかもしれない。或いは、完全な闇の中の方がいいのかもしれない。つまりは、暗闇の中に差し込む一筋の光。それこそが僕の撮っているものなのだ。と、腑に落ちたのでした。僕から見た貴方はそれだけ尊いものなのです。
                            </p>
                        </FadeInSection>

                        <FadeInSection delay={500}>
                            <h4 className="text-lg md:text-xl font-bold text-gray-300 mt-12 mb-4 border-l-2 border-gray-600 pl-4">余談</h4>
                            <p className="mb-4">
                                撮影ジャンルとしては、自分で言うとすると「（目撃した）記録」になると思います。自ら光源を作り出したり再現したりすることは無く、その日その時間その場で何に対峙してそれをどのように切り取ったのか、あるいは何を考えていたのか。を大切にしています。
                            </p>
                            <p className="mb-4">
                                生涯最初で最後の群写真作品として「<a href="https://1500.design4qol.com/" target="_blank" rel="noreferrer" className="text-white border-b border-gray-600 hover:text-yellow-500 hover:border-yellow-500 transition duration-300">1500 portraits project</a>」を展開中です。<br />
                                「存在の証明」をテーマに活動していこうと思っております。
                            </p>
                            <p>
                                ネーチャーも人物のスナップも乗り物も建物も私のテーマの対象物だと思っています。活動内容としましては、様々な理由で行きたい場所に行くことができない、思いを伝えられない。そんな人たちの代わりとなるphoto messengerをやっていこうと考えております。いつかそれ自体が私の存在した証明になるように。
                            </p>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* --- About Section --- */}
            <section id="about" className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-gray-900">
                    <img src="images/serabi.jpg" alt="About Background" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
                        <div className="w-full md:w-1/2">
                            <FadeInSection>
                                <img src="images/square.jpg" alt="Photographer" className="rounded-lg shadow-2xl w-full h-auto grayscale hover:grayscale-0 transition duration-700" />
                            </FadeInSection>
                        </div>
                        <div className="w-full md:w-1/2">
                            <FadeInSection delay={200}>
                                <h2 className="text-3xl font-bold mb-6 brand-font">Behind the Lens</h2>
                                <p className="text-gray-400 leading-relaxed mb-4">
                                    初めまして。430 (shimio)です。<br />
                                    1983年札幌生まれ。北海道在住。アクティブに動いているかと思いきや、引きこもったりする変な人。主にポートレートスナップを撮っています。共感してもらえる方々に出会えることを楽しみにしております。これはいい！と思える作品を共に創っていけるパートナーを探しています。よろしくお願いします。
                                </p>
                                <div className="text-gray-400 leading-relaxed mb-8 space-y-3 text-sm md:text-base">
                                    <p><span className="text-gray-300 font-bold">【興味 • 関心】</span><br />VIPな女の人生／無の境地／脳に補正された世界とされていない世界／人体のメカニズム</p>
                                    <p><span className="text-gray-300 font-bold">【やっていること】</span><br />ひとりブレスト／常識を疑い無条件では従わない／エスノメソドロジー</p>
                                    <p><span className="text-gray-300 font-bold">【やりたくないこと】</span><br />群れること／脳中心の判断／陰口を聞かされること</p>
                                </div>

                                <div className="mb-8 p-6 border border-gray-700 rounded-sm bg-black/40">
                                    <h3 className="text-xl font-bold mb-2 brand-font text-white">Prints & Goods</h3>
                                    <p className="text-gray-400 text-sm mb-4">オリジナルプリントや写真集をオンラインストアで販売しています。</p>
                                    <a href="https://dsl.theshop.jp/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white border-b border-yellow-500 pb-1 hover:text-yellow-500 transition">
                                        オンラインストアを見る <ArrowUpRight size={16} />
                                    </a>
                                </div>
                            </FadeInSection>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Contact Section --- */}
            <section id="contact" className="relative py-20 border-b border-gray-800 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="images/519.jpg" alt="Contact Background" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6">
                    <div className="max-w-2xl mx-auto text-center">
                        <FadeInSection>
                            <h2 className="text-3xl font-bold mb-8 brand-font text-white">Get in Touch</h2>
                            <p className="text-gray-300 mb-10">
                                撮影の依頼、コラボレーション、あるいは単なるご挨拶でも。<br />
                                お気軽にご連絡ください。
                            </p>
                            
                            <div className="flex flex-col items-center gap-8">
                                <a href="mailto:DSL@design4qol.com" className="inline-flex items-center gap-3 px-10 py-4 border border-white text-white rounded-none hover:bg-white hover:text-black transition duration-300 text-lg tracking-wider">
                                    <Mail /> CONTACT ME
                                </a>

                                {/* Instagramの導線を美しくここに統合 */}
                                <a href="https://instagram.com/dark_side_luck" target="_blank" rel="noreferrer" className="group p-2 text-gray-500 hover:text-white transition duration-300 flex items-center justify-center gap-3 text-xs tracking-widest mt-4">
                                    <Instagram className="w-6 h-6 opacity-60 group-hover:opacity-100 transition duration-300" />
                                    <span className="opacity-60 group-hover:opacity-100 transition duration-300">FOLLOW ON INSTAGRAM</span>
                                </a>
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="bg-black py-8 border-t border-gray-800 mt-auto">
                <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} MiLio, LLC All rights reserved.</p>
                </div>
            </footer>

            {/* --- Lightbox Modal --- */}
            {lightboxIndex !== null && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setLightboxIndex(null); }}
                >
                    <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white p-2">
                        <X size={40} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + displayedPhotos.length) % displayedPhotos.length); }} 
                        className="absolute left-4 md:left-8 text-gray-400 hover:text-white p-4 hidden md:block group"
                    >
                        <ChevronLeft size={40} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % displayedPhotos.length); }} 
                        className="absolute right-4 md:right-8 text-gray-400 hover:text-white p-4 hidden md:block group"
                    >
                        <ChevronRight size={40} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="max-w-7xl max-h-[90vh] w-full flex flex-col items-center justify-center">
                        <img 
                            src={displayedPhotos[lightboxIndex].fullUrl} 
                            alt={displayedPhotos[lightboxIndex].title} 
                            className="max-h-[85vh] max-w-full object-contain shadow-2xl rounded-sm"
                        />
                        <div className="mt-4 text-center">
                            <h3 className="text-xl text-white font-medium brand-font">{displayedPhotos[lightboxIndex].title}</h3>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest">{displayedPhotos[lightboxIndex].category}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}