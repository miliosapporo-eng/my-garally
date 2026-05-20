import React, { useState, useEffect, useRef } from 'react';
// Firebase SDK のインポート
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken,
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    addDoc,
    deleteDoc, 
    onSnapshot 
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'firebase/storage';

// --- 初期写真データ（Firebaseが空のとき、またはローカルシミュレーション時のデフォルト） ---
const DEFAULT_PHOTOS = [
    { id: "1", url: "images/entry/carp.png", fullUrl: "images/entry/carp.png", title: "80", category: "landscape", createdAt: 1716223200000 },
    { id: "2", url: "images/entry/mtfuji.jpg", fullUrl: "images/entry/mtfuji.jpg", title: "The Camp", category: "landscape", createdAt: 1716223201000 },
    { id: "3", url: "images/entry/haku.jpg", fullUrl: "images/entry/haku.jpg", title: "HAKU", category: "nature", createdAt: 1716223202000 },
    { id: "4", url: "images/entry/yamaguchi.jpg", fullUrl: "images/entry/yamaguchi.jpg", title: "YAMAGUCHI", category: "journey", createdAt: 1716223203000 },
    { id: "5", url: "images/entry/hiroshima.jpg", fullUrl: "images/entry/hiroshima.jpg", title: "HIROSIHIMA", category: "journey", createdAt: 1716223204000 },
    { id: "6", url: "images/entry/shimane.jpg", fullUrl: "images/entry/shimane.jpg", title: "SHIMANE", category: "journey", createdAt: 1716223205000 },
    { id: "7", url: "images/entry/tottori.jpg", fullUrl: "images/entry/tottori.jpg", title: "TOTTORI", category: "journey", createdAt: 1716223206000 },
    { id: "8", url: "images/entry/hyogo.jpg", fullUrl: "images/entry/hyogo.jpg", title: "HYOGO", category: "journey", createdAt: 1716223207000 },
    { id: "9", url: "images/entry/niigata.jpg", fullUrl: "images/entry/niigata.jpg", title: "NIIGATA", category: "journey", createdAt: 1716223208000 },
    { id: "10", url: "images/entry/california.png", fullUrl: "images/entry/california.png", title: "CALIFORNIA", category: "journey", createdAt: 1716223209000 },
    { id: "11", url: "images/entry/yamagiwa.jpg", fullUrl: "images/entry/yamagiwa.jpg", title: "million dollar baby", category: "snap", createdAt: 1716223210000 },
    { id: "12", url: "images/entry/m.jpg", fullUrl: "images/entry/m.jpg", title: "distance", category: "snap", createdAt: 1716223211000 }
];

// --- Firebase の初期化設定 ---
const appId = "dark-side-luck";
let firebaseApp = null;
let auth = null;
let db = null;
let storage = null;
let isSimulationMode = true;

try {
    if (typeof window !== 'undefined' && window.__firebase_config) {
        const firebaseConfig = JSON.parse(window.__firebase_config);
        firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(firebaseApp);
        db = getFirestore(firebaseApp);
        storage = getStorage(firebaseApp);
        isSimulationMode = false;
        console.log("Firebase 接続完了: 本番モード");
    } else {
        console.log("Firebase 設定未検出: シミュレーションモード（ローカルテスト用）");
    }
} catch (error) {
    console.warn("Firebase の初期化に失敗しました。シミュレーションモードで起動します。", error);
}

// --- スクロールアニメーション用コンポーネント (FadeInUp) ---
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
    const [currentView, setCurrentView] = useState('portfolio'); // 'portfolio' | 'admin_login' | 'admin_dashboard'
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [heroLoaded, setHeroLoaded] = useState(false);
    
    // データ管理用のステート
    const [photos, setPhotos] = useState(DEFAULT_PHOTOS);
    const [authUser, setAuthUser] = useState(null);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    
    // アップロードフォーム用ステート
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadCategory, setUploadCategory] = useState('landscape');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgressMsg, setUploadProgressMsg] = useState('');

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

    // --- 1. 認証の初期化 & カスタムトークン/匿名サインインの優先処理 (RULE 3) ---
    useEffect(() => {
        if (isSimulationMode) {
            // シミュレーションモード: ローカルストレージからデータをロード
            const cached = localStorage.getItem('dsl_cached_photos');
            if (cached) {
                setPhotos(JSON.parse(cached));
            }
            return;
        }

        const initAuthAndSync = async () => {
            try {
                // RULE 3 に従い、__initial_auth_token が存在する場合はカスタムトークンを最優先で使用
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                    console.log("カスタムトークンによるサインイン完了");
                } else {
                    await signInAnonymously(auth);
                    console.log("匿名サインイン完了");
                }
            } catch (err) {
                console.error("サインインに失敗しました:", err);
            }
        };

        initAuthAndSync();

        // 認証状態の監視
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser(user);
                // 匿名ユーザーではなく、メールログインしている場合は直接ダッシュボードへ
                if (!user.isAnonymous) {
                    setCurrentView('admin_dashboard');
                }
            } else {
                setAuthUser(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // --- 2. Firestoreからのリアルタイムデータ受信 (RULE 1 & 2) ---
    useEffect(() => {
        if (isSimulationMode) return;
        if (!authUser) return; // 認証が完了するまでデータ取得を待機 (RULE 3)

        // 厳格なセキュリティパスを使用 (RULE 1)
        const photosCollection = collection(db, 'artifacts', appId, 'public', 'data', 'photos');

        // リアルタイムリスナーの設置
        const unsubscribeSnapshot = onSnapshot(photosCollection, (snapshot) => {
            if (snapshot.empty) {
                // 【点滅バグの原因を徹底修正】
                // 一般閲覧者の権限では書き込めない自動書き込み(setDoc)を完全に排除し、安全にデフォルト配列をセットします
                console.log("Firestore空状態検出: ローカル初期データを使用します");
                setPhotos(DEFAULT_PHOTOS);
            } else {
                const loadedPhotos = [];
                snapshot.forEach((doc) => {
                    loadedPhotos.push({ id: doc.id, ...doc.data() });
                });
                
                // 複雑なorderByを使用せず、メモリ上で作成日時順（昇順）にソート (RULE 2)
                loadedPhotos.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
                setPhotos(loadedPhotos);
            }
        }, (error) => {
            console.error("Firestoreの読み込み中にエラーが発生しました:", error);
            // エラー時（未認証タイミングなど）もバグを防ぐためにフォールバック
            setPhotos(DEFAULT_PHOTOS);
        });

        return () => unsubscribeSnapshot();
    }, [authUser]);

    // フィルター処理
    const displayedPhotos = currentFilter === 'all' 
        ? photos 
        : photos.filter(p => p.category === currentFilter);

    // --- ライトボックスのキーボード操作 ---
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

    // 【スクロールバグ修正】ライトボックス表示時のみスクロールロックする
    useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [lightboxIndex]);

    // --- ヒーロー画像のロード検知 ---
    useEffect(() => {
        const img = new Image();
        img.src = "images/yu.png";
        img.onload = () => setTimeout(() => setHeroLoaded(true), 100);
        img.onerror = () => setTimeout(() => setHeroLoaded(true), 100);
    }, []);

    // --- 管理者ログイン処理 ---
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (isSimulationMode) {
            // シミュレーション用ダミーログイン (admin@dsl.com / password)
            if (adminEmail === 'admin@dsl.com' && adminPassword === 'password') {
                setAuthUser({ email: 'admin@dsl.com', isAnonymous: false });
                setCurrentView('admin_dashboard');
            } else {
                setLoginError('シミュレーション用ログイン情報: admin@dsl.com / passwordを入力してください。');
            }
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            setCurrentView('admin_dashboard');
        } catch (err) {
            setLoginError('ログインに失敗しました。メールアドレスまたはパスワードが正しくありません。');
        }
    };

    // --- 管理者ログアウト処理 ---
    const handleAdminLogout = async () => {
        if (isSimulationMode) {
            setAuthUser(null);
            setCurrentView('portfolio');
            return;
        }

        try {
            await signOut(auth);
            await signInAnonymously(auth); // 閲覧用に匿名に戻す
            setCurrentView('portfolio');
        } catch (err) {
            console.error("ログアウト中にエラーが発生しました:", err);
        }
    };

    // --- 写真アップロード処理 ---
    const handlePhotoUpload = async (e) => {
        e.preventDefault();
        if (!uploadTitle.trim()) return alert("タイトルを入力してください。");
        if (!selectedFile && !isSimulationMode) return alert("写真ファイルを選択してください。");

        setIsUploading(true);
        setUploadProgressMsg('写真を安全にアップロード中...');

        const newId = Date.now().toString();
        const timestamp = Date.now();

        if (isSimulationMode) {
            // シミュレーションモード: 選択されたファイルをBase64またはダミーURLに変換してローカルストレージへ保存
            const handleSimulate = (fileUrl) => {
                const newPhoto = {
                    id: newId,
                    url: fileUrl,
                    fullUrl: fileUrl,
                    title: uploadTitle,
                    category: uploadCategory,
                    createdAt: timestamp
                };
                const updatedPhotos = [...photos, newPhoto];
                setPhotos(updatedPhotos);
                localStorage.setItem('dsl_cached_photos', JSON.stringify(updatedPhotos));
                
                // フォームリセット
                setUploadTitle('');
                setSelectedFile(null);
                setIsUploading(false);
                alert("【シミュレーション】写真をアップロードしました！");
            };

            if (selectedFile) {
                const reader = new FileReader();
                reader.onloadend = () => handleSimulate(reader.result);
                reader.readAsDataURL(selectedFile);
            } else {
                // ファイル未選択時はプレースホルダー
                handleSimulate("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80");
            }
            return;
        }

        try {
            // 1. Firebase Storage にファイルをアップロード
            const fileRef = ref(storage, `artifacts/${appId}/photos/${newId}_${selectedFile.name}`);
            const uploadResult = await uploadBytes(fileRef, selectedFile);
            const downloadUrl = await getDownloadURL(uploadResult.ref);

            // 2. Firestoreにメタデータを保存 (Strict Path: RULE 1)
            const photoData = {
                id: newId,
                url: downloadUrl,
                fullUrl: downloadUrl,
                title: uploadTitle,
                category: uploadCategory,
                createdAt: timestamp,
                storagePath: fileRef.fullPath // 後で削除するために保存パスも記録
            };

            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'photos', newId), photoData);

            // フォームリセット
            setUploadTitle('');
            setSelectedFile(null);
            // ファイルインプットをクリア
            const fileInput = document.getElementById('photo-file-input');
            if (fileInput) fileInput.value = '';

            setIsUploading(false);
            alert("写真をクラウドに公開しました！");
        } catch (err) {
            console.error("アップロードエラー:", err);
            alert("アップロードに失敗しました。権限や設定を確認してください。");
            setIsUploading(false);
        }
    };

    // --- 写真削除処理 ---
    const handleDeletePhoto = async (photo) => {
        if (!confirm(`写真「${photo.title}」を削除してもよろしいですか？`)) return;

        if (isSimulationMode) {
            const updatedPhotos = photos.filter(p => p.id !== photo.id);
            setPhotos(updatedPhotos);
            localStorage.setItem('dsl_cached_photos', JSON.stringify(updatedPhotos));
            alert("写真を削除しました。");
            return;
        }

        try {
            // 1. Firestore からメタデータを削除 (Strict Path: RULE 1)
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'photos', photo.id));

            // 2. Storageから画像本体を削除 (パスが登録されている場合)
            if (photo.storagePath) {
                const fileRef = ref(storage, photo.storagePath);
                await deleteObject(fileRef);
            }
            alert("クラウドから写真を削除しました。");
        } catch (err) {
            console.error("削除エラー:", err);
            alert("削除に失敗しました。");
        }
    };

    return (
        <div className="min-h-screen flex flex-col antialiased selection:bg-gray-700 selection:text-white bg-black">
            
            {/* ポートフォリオ通常表示モード */}
            {currentView === 'portfolio' && (
                <>
                    {/* --- Header --- */}
                    <header className="fixed w-full z-40 bg-black/80 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
                        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                            <a href="#" className="block hover:opacity-80 transition">
                                <img src="images/logo.png" alt="Dark Side Luck Logo" className="h-8 md:h-10 w-auto object-contain" />
                            </a>
                            
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-300 hover:text-white focus:outline-none">
                                {isMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>

                            <nav className="hidden md:flex space-x-8 items-center tracking-wider">
                                {['GALLERY', 'CONCEPT', 'ABOUT', 'CONTACT'].map((item) => (
                                    <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-medium hover:text-gray-400 transition">{item}</a>
                                ))}
                                <a href="https://dsl.theshop.jp/" target="_blank" rel="noreferrer" className="text-xs font-medium bg-white text-gray-900 px-5 py-2 rounded-sm hover:bg-gray-200 transition flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    STORE
                                </a>
                            </nav>
                        </div>

                        {/* Mobile Menu */}
                        {isMenuOpen && (
                            <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800 absolute w-full left-0">
                                <div className="flex flex-col px-6 py-6 space-y-6">
                                    {['GALLERY', 'CONCEPT', 'ABOUT', 'CONTACT'].map((item) => (
                                        <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-sm tracking-wider font-medium hover:text-gray-400 transition">{item}</a>
                                    ))}
                                    <a href="https://dsl.theshop.jp/" target="_blank" rel="noreferrer" className="text-sm tracking-wider font-medium text-yellow-500 hover:text-yellow-400 transition flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        VISIT STORE
                                    </a>
                                </div>
                            </div>
                        )}
                    </header>

                    {/* --- Hero Section --- */}
                    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                            <img 
                                src="images/yu.png" 
                                alt="Hero Background" 
                                className={`w-full h-full object-cover z-0 relative ${heroLoaded ? 'burn-in-loaded' : 'burn-in-init'}`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-10"></div>
                        </div>

                        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
                            <FadeInSection delay={500}>
                                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight brand-font">
                                    Dark Side Luck
                                </h1>
                            </FadeInSection>
                            <FadeInSection delay={800}>
                                <p className="text-gray-300 text-lg md:text-xl font-light tracking-widest brand-font italic">
                                    captured by 430
                                </p>
                            </FadeInSection>
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

                    {/* --- Gallery Section --- */}
                    <section id="gallery" className="py-24 px-6 container mx-auto">
                        <FadeInSection>
                            <div className="flex flex-col items-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold mb-10 brand-font tracking-widest text-white">Selected Works</h2>
                                
                                <div className="flex flex-wrap justify-center gap-3">
                                    {['all', 'landscape', 'portrait', 'urban', 'snap', 'animal', 'nature', 'journey'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setCurrentFilter(filter)}
                                            className={`px-6 py-2 rounded-full border transition-all duration-300 text-xs tracking-widest font-medium
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {displayedPhotos.map((photo, index) => (
                                <FadeInSection key={`${currentFilter}-${photo.id}`} delay={index * 100}>
                                    <div 
                                        className="group relative overflow-hidden rounded-sm cursor-pointer bg-gray-900 aspect-[3/4] md:aspect-[4/3]"
                                        onClick={() => setLightboxIndex(index)}
                                    >
                                        <img 
                                            src={photo.url} 
                                            alt={photo.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-4">
                                            <p className="text-xs text-yellow-500 uppercase tracking-[0.2em] mb-3 font-bold brand-font">{photo.category}</p>
                                            <h3 className="text-xl font-bold text-white brand-font tracking-wide">{photo.title}</h3>
                                            <div className="mt-6 text-white border border-white/40 rounded-full p-3 hover:bg-white hover:text-black transition-colors duration-300 transform translate-y-4 group-hover:translate-y-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </FadeInSection>
                            ))}
                        </div>
                    </section>

                    {/* --- Concept Section --- */}
                    <section id="concept" className="relative py-32 px-6 bg-black border-t border-b border-gray-900 overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img src="images/taiga.jpg" alt="Concept" className="w-full h-full object-cover blur-[4px] opacity-30 scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
                        </div>

                        <div className="relative z-10 container mx-auto max-w-3xl">
                            <FadeInSection>
                                <h2 className="text-3xl md:text-5xl font-bold mb-16 brand-font tracking-[0.2em] text-center text-white leading-tight">
                                    What's<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-200">Dark Side Luck</span> ?
                                </h2>
                            </FadeInSection>
                            
                            <div className="space-y-10 text-gray-300 text-[15px] md:text-base leading-[2.2] font-light">
                                <FadeInSection delay={200}>
                                    <p>
                                        Dark Side というワードを聞いたらネガティブな印象を持ってしまうかもしれませんが、ちょっと待ってください!! まぁ、確かにどっちなのかと言われればネガティブな方に分類されるのかもしれないのですが...よかったらどういう意味なのかだけでも読んで頂けたら嬉しいです。
                                    </p>
                                </FadeInSection>

                                <FadeInSection delay={200}>
                                    <h3 className="text-lg md:text-xl font-medium text-white mt-12 mb-6 tracking-wide">発想のもとは「撮る」ということを言い換えるということ。</h3>
                                    <p className="mb-6">
                                        この自分自身のブランドを作ろうとした時、僕はどうして、何を、どんな時にレンズを向けてシャッターを切っているのだろう。と過去これまで撮ってきた写真を数々を見返していました。幸いなことに、職業カメラマンであった期間は無いと言って等しいので、残っている写真はほぼ全て自分自身の動機 and センスによって撮られたものだったので、その分析に時間は要しませんでした。
                                    </p>
                                    <p className="mb-6">
                                        僕の撮影歴の始まりはライブステージでした。そこからストリートスナップ、証明写真、ポートレート、ナイトクラブイベント、ツーリズム（風景）と多岐に広がっていきましたが、結局共通項と言えば、一般的な話「光と影」に辿り着いたのでした。
                                    </p>
                                    <p className="mb-6">
                                        撮影というのは、読んで字の如く「影を撮る」ことなのですが、影とはすなわち、光が何かしらの物体に当たった時に現れるもので、撮影者はその光と影の美しさを見ているのです。
                                    </p>
                                    <p>
                                        僕が切り取ってきた世界に写っていたのは、ライブステージで汗を飛び散らせて情熱を爆発させるバンドマン、あるひと夜の儚いパーティタイムを楽しむビューティフルピープル、掛け替えない幸福な時間の一瞬は…全てキラキラ輝いていました。さて、これを何と言い表そうか。
                                    </p>
                                </FadeInSection>

                                <FadeInSection delay={200}>
                                    <h3 className="text-lg md:text-xl font-medium text-white mt-16 mb-6 tracking-wide">光輝くもの。尊いもの。それは愛なのかもしれない。</h3>
                                    <p>
                                        僕が撮りたいと思うのは、輝かしい存在が目の前にあった時なのだということが分かりました。そして、その光輝くものは影を生む。また、同じ一辺倒の明るさの中にいては、それらは輝きを放てないでしょう。少しほの暗い方がいいのかもしれない。あるいは、完全な闇の中の方がいいのかもしれない。つまりは、暗闇の中に差し込む一筋の光。それこそが僕の撮っているものなのだ。と, 腑に落ちたのでした。僕から見た貴方はそれだけ尊いものなのです。
                                    </p>
                                </FadeInSection>

                                <FadeInSection delay={200}>
                                    <div className="border-l-[1px] border-gray-600 pl-6 mt-20">
                                        <h4 className="text-sm md:text-base font-bold text-gray-400 mb-6 tracking-widest brand-font">余談</h4>
                                        <p className="mb-6">
                                            撮影ジャンルとしては、自分で言うとすると「（目撃した）記録」になると思います。自ら光源を作り出したり再現したりすることは無く、その日その時間その場で何に対峙してそれをどのように切り取ったのか、あるいは何を考えていたのか。を大切にしています。
                                        </p>
                                        <p className="mb-6">
                                            生涯最初で最後の群写真作品として「<a href="https://1500.design4qol.com/" target="_blank" rel="noreferrer" className="text-white border-b border-gray-600 hover:text-yellow-500 hover:border-yellow-500 transition duration-300 pb-1">1500 portraits project</a>」を展開中です。<br />
                                            「存在の証明」をテーマに活動していこうと思っております。
                                        </p>
                                        <p>
                                            ネイチャーも人物のスナップも乗り物も建物も私のテーマの対象物だと思っています。活動内容としましては、様々な理由で行きたい場所に行くことができない、思いを伝えられない。そんな人たちの代わりとなるphoto messengerをやっていこうと考えております。いつかそれ自体が私の存在した証明になるように。
                                        </p>
                                    </div>
                                </FadeInSection>
                            </div>
                        </div>
                    </section>

                    {/* --- About Section --- */}
                    <section id="about" className="relative py-24 overflow-hidden">
                        <div className="absolute inset-0 z-0 bg-gray-900">
                            <img src="images/serabi.jpg" alt="About" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent md:to-black/40"></div>
                        </div>

                        <div className="relative z-10 container mx-auto px-6">
                            <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
                                <div className="w-full md:w-5/12">
                                    <FadeInSection>
                                        <div className="relative group">
                                            <div className="absolute -inset-2 bg-gradient-to-tr from-gray-800 to-gray-600 opacity-20 group-hover:opacity-40 blur transition duration-700"></div>
                                            <img 
                                                src="images/square.jpg" 
                                                alt="Photographer 430" 
                                                className="relative rounded-sm shadow-2xl w-full h-auto grayscale group-hover:grayscale-0 transition duration-700"
                                            />
                                        </div>
                                    </FadeInSection>
                                </div>
                                
                                <div className="w-full md:w-7/12">
                                    <FadeInSection delay={200}>
                                        <h2 className="text-3xl font-bold mb-8 brand-font tracking-widest text-white">Behind the Lens</h2>
                                    </FadeInSection>
                                    
                                    <FadeInSection delay={300}>
                                        <p className="text-gray-400 leading-loose mb-8 text-[15px] md:text-base font-light">
                                            初めまして。430 (shimio)です。<br />
                                            1983年札幌生まれ。北海道在住。アクティブに動いているかと思いきや、引きこもったりする変な人。主にポートレートスナップを撮っています。共感してもらえる方々に出会えることを楽しみにしております。これはいい！と思える作品を共に創っていけるパートナーを探しています。よろしくお願いします。
                                        </p>
                                        
                                        <div className="text-gray-400 leading-loose mb-10 space-y-4 text-sm font-light">
                                            <div><span className="text-gray-300 font-medium tracking-widest text-xs border-b border-gray-700 pb-1 mb-2 inline-block">興味 • 関心</span><br />VIPな女 of ライフ ／ 無の境地 ／ 脳に補正された世界とされていない世界 ／ 人体のメカニズム</div>
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
                                                <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                                                </svg>
                                            </a>
                                        </div>
                                    </FadeInSection>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- Contact Section --- */}
                    <section id="contact" className="relative py-32 border-b border-gray-900 overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img src="images/519.jpg" alt="Contact" className="w-full h-full object-cover opacity-30 mix-blend-luminosity scale-105" />
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
                        </div>

                        <div className="relative z-10 container mx-auto px-6">
                            <FadeInSection>
                                <div className="max-w-2xl mx-auto text-center">
                                    <h2 className="text-3xl font-bold mb-6 brand-font text-white tracking-widest">Get in Touch</h2>
                                    <div className="w-12 h-[1px] bg-gray-600 mx-auto mb-8"></div>
                                    <p className="text-gray-300 mb-12 font-light leading-loose">
                                        撮影の依頼、コラボレーション、あるいは単なるご挨拶でも。<br />
                                        お気軽にご連絡ください。
                                    </p>
                                    
                                    <div className="flex flex-col items-center gap-6">
                                        <a href="mailto:DSL@design4qol.com" className="group inline-flex items-center gap-4 px-10 py-4 border border-gray-600 text-white rounded-sm hover:bg-white hover:text-black transition-all duration-500 text-sm tracking-[0.2em] brand-font overflow-hidden relative">
                                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-sm opacity-30 bg-gradient-to-b from-transparent via-transparent to-black group-hover:opacity-0 transition-opacity"></span>
                                            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="relative z-10">CONTACT ME</span>
                                        </a>

                                        {/* Instagramの導線 */}
                                        <a href="https://instagram.com/dark_side_luck" target="_blank" rel="noreferrer" className="group p-2 text-gray-500 hover:text-white transition duration-300 flex items-center justify-center gap-3 text-xs tracking-widest mt-4">
                                            <svg className="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                            </svg>
                                            <span className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">FOLLOW ON INSTAGRAM</span>
                                        </a>
                                    </div>
                                </div>
                            </FadeInSection>
                        </div>
                    </section>

                    {/* --- Footer --- */}
                    <footer className="bg-black py-10 mt-auto border-t border-gray-900 relative z-10">
                        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs tracking-widest brand-font gap-4">
                            <p>&copy; {new Date().getFullYear()} MiLio, LLC All rights reserved.</p>
                            <button 
                                onClick={() => setCurrentView('admin_login')} 
                                className="text-gray-700 hover:text-gray-400 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Admin Login
                            </button>
                        </div>
                    </footer>

                    {/* --- Lightbox Modal --- */}
                    {lightboxIndex !== null && (
                        <div 
                            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={(e) => { if (e.target === e.currentTarget) setLightboxIndex(null); }}
                        >
                            <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors p-2 z-50">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + displayedPhotos.length) % displayedPhotos.length); }} 
                                className="absolute left-4 md:left-8 text-gray-600 hover:text-white p-4 hidden md:block transition-transform hover:-translate-x-2 z-50"
                            >
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % displayedPhotos.length); }} 
                                className="absolute right-4 md:right-8 text-gray-600 hover:text-white p-4 hidden md:block transition-transform hover:translate-x-2 z-50"
                            >
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            
                            <div className="max-w-6xl w-full flex flex-col items-center justify-center">
                                <img 
                                    src={displayedPhotos[lightboxIndex].fullUrl} 
                                    alt={displayedPhotos[lightboxIndex].title} 
                                    className="max-h-[85vh] max-w-full object-contain shadow-2xl rounded-sm animate-in zoom-in-95 duration-300"
                                />
                                <div className="mt-6 text-center animate-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="text-xl text-white font-light brand-font tracking-widest">{displayedPhotos[lightboxIndex].title}</h3>
                                    <p className="text-[10px] text-yellow-600/80 mt-2 uppercase tracking-[0.3em] font-bold">{displayedPhotos[lightboxIndex].category}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* --- 管理者ログイン画面 --- */}
            {currentView === 'admin_login' && (
                <div className="min-h-screen flex items-center justify-center px-4 bg-black">
                    <div className="max-w-md w-full bg-gray-900/60 border border-gray-800 p-8 rounded-sm backdrop-blur-md">
                        <div className="text-center mb-8">
                            <img src="images/logo.png" alt="Logo" className="h-8 mx-auto mb-6 object-contain" />
                            <h2 className="text-xl font-bold tracking-widest text-white brand-font">ADMIN LOGIN</h2>
                            {isSimulationMode && (
                                <p className="text-yellow-600 text-xs mt-2 font-medium">※ローカル・シミュレーションモードで起動中</p>
                            )}
                        </div>
                        
                        <form onSubmit={handleAdminLogin} className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 tracking-wider mb-2">EMAIL ADDRESS</label>
                                <input 
                                    type="email" 
                                    value={adminEmail} 
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    placeholder={isSimulationMode ? "admin@dsl.com" : "email@example.com"}
                                    className="w-full bg-black border border-gray-800 px-4 py-3 rounded-sm text-sm text-white focus:outline-none focus:border-white transition-colors"
                                    required 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-400 tracking-wider mb-2">PASSWORD</label>
                                <input 
                                    type="password" 
                                    value={adminPassword} 
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder={isSimulationMode ? "password" : "••••••••"}
                                    className="w-full bg-black border border-gray-800 px-4 py-3 rounded-sm text-sm text-white focus:outline-none focus:border-white transition-colors"
                                    required 
                                />
                            </div>

                            {loginError && (
                                <p className="text-red-500 text-xs leading-relaxed text-center">{loginError}</p>
                            )}

                            <div className="flex gap-4 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setCurrentView('portfolio')}
                                    className="flex-1 py-3 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition text-xs tracking-widest font-medium rounded-sm"
                                >
                                    CANCEL
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-3 bg-white text-black hover:bg-gray-200 transition text-xs tracking-widest font-bold rounded-sm"
                                >
                                    LOGIN
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- 管理者ダッシュボード (写真の追加・削除) --- */}
            {currentView === 'admin_dashboard' && (
                <div className="min-h-screen bg-black text-gray-100 flex flex-col">
                    {/* ダッシュボードヘッダー */}
                    <header className="bg-gray-950 border-b border-gray-900 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img src="images/logo.png" alt="Logo" className="h-8 object-contain" />
                            <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-0.5 rounded-full font-medium tracking-wide">
                                {isSimulationMode ? "Simulation Mode" : "Cloud Production Connected"}
                            </span>
                        </div>
                        <button 
                            onClick={handleAdminLogout} 
                            className="text-xs border border-gray-800 hover:border-gray-500 px-4 py-2 rounded-sm text-gray-400 hover:text-white transition flex items-center gap-2 font-medium tracking-wider"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            LOGOUT
                        </button>
                    </header>

                    <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 左：新規写真追加フォーム */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-sm backdrop-blur-md sticky top-6">
                                <h3 className="text-lg font-bold tracking-widest mb-6 text-white brand-font border-b border-gray-800 pb-3">ADD NEW PHOTO</h3>
                                
                                <form onSubmit={handlePhotoUpload} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 tracking-wider mb-2">PHOTO FILE</label>
                                        <div className="relative border-2 border-dashed border-gray-800 hover:border-gray-600 rounded-sm p-4 text-center cursor-pointer transition-colors bg-black/40">
                                            <input 
                                                id="photo-file-input"
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                required={!isSimulationMode}
                                            />
                                            <div className="space-y-2">
                                                <svg className="w-8 h-8 mx-auto text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 .375 0 11-.75 0 .375 .375 0 01.75 0z" />
                                                </svg>
                                                <p className="text-xs text-gray-300 font-medium">
                                                    {selectedFile ? selectedFile.name : "ファイルを選択またはドラッグ＆ドロップ"}
                                                </p>
                                                <p className="text-[10px] text-gray-500">JPG, PNG, WEBP (最大 10MB)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 tracking-wider mb-2">TITLE</label>
                                        <input 
                                            type="text" 
                                            value={uploadTitle} 
                                            onChange={(e) => setUploadTitle(e.target.value)}
                                            placeholder="例: YAMAGUCHI, HAKU"
                                            className="w-full bg-black border border-gray-800 px-4 py-3 rounded-sm text-sm text-white focus:outline-none focus:border-white transition-colors"
                                            required 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 tracking-wider mb-2">CATEGORY</label>
                                        <select 
                                            value={uploadCategory} 
                                            onChange={(e) => setUploadCategory(e.target.value)}
                                            className="w-full bg-black border border-gray-800 px-4 py-3 rounded-sm text-sm text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
                                        >
                                            <option value="landscape">LANDSCAPE</option>
                                            <option value="portrait">PORTRAIT</option>
                                            <option value="urban">URBAN</option>
                                            <option value="snap">SNAP</option>
                                            <option value="animal">ANIMAL</option>
                                            <option value="nature">NATURE</option>
                                            <option value="journey">JOURNEY</option>
                                        </select>
                                    </div>

                                    {isUploading ? (
                                        <div className="text-center py-4">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-white mb-2"></div>
                                            <p className="text-xs text-gray-400 font-medium">{uploadProgressMsg}</p>
                                        </div>
                                    ) : (
                                        <button 
                                            type="submit" 
                                            className="w-full py-3.5 bg-white text-black hover:bg-gray-200 transition text-xs tracking-widest font-bold rounded-sm flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            UPLOAD & PUBLISH
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* 右：現在公開されている写真の一覧・管理 */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-900/20 border border-gray-800 p-6 rounded-sm backdrop-blur-md">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
                                    <h3 className="text-lg font-bold tracking-widest text-white brand-font">CURRENT PHOTOS ({photos.length})</h3>
                                    <span className="text-[10px] text-gray-500 font-medium tracking-wider">LATEST FIRST</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {photos.slice().reverse().map((photo) => (
                                        <div key={photo.id} className="bg-black border border-gray-900 rounded-sm overflow-hidden flex flex-col group">
                                            <div className="aspect-[4/3] w-full bg-gray-950 overflow-hidden relative">
                                                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                                                <span className="absolute top-3 left-3 bg-black/80 border border-gray-800 text-[9px] font-bold text-yellow-500 px-2.5 py-1 rounded-full tracking-wider uppercase">
                                                    {photo.category}
                                                </span>
                                            </div>
                                            
                                            <div className="p-4 flex justify-between items-center gap-4">
                                                <div className="truncate">
                                                    <h4 className="text-sm font-bold text-white truncate brand-font">{photo.title}</h4>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">ID: {photo.id}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeletePhoto(photo)}
                                                    className="p-2 border border-gray-900 hover:border-red-900 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-sm transition-all duration-300"
                                                    title="この写真を削除"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}