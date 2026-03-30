import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, appAPI } from '../services/api';
import heroImage from '../assets/hero_education.png';
import featureLiveClasses from '../assets/feature_live_classes.png';
import featureCertificates from '../assets/feature_certificates.png';
import featureSchedule from '../assets/feature_schedule.png';

// ─── colour tokens matching the app's index.css ──────────────────────────────
const C = {
    bg: '#0f172a',
    bgAlt: '#1a1f35',
    bgCard: 'rgba(30,41,59,0.85)',
    border: 'rgba(71,85,105,0.5)',
    primary: '#3b82f6',
    primaryDk: '#1e40af',
    primaryLt: '#60a5fa',
    secondary: '#8b5cf6',
    secDk: '#5b21b6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    textBase: '#f3f4f6',
    textMuted: '#9ca3af',
    textDim: '#6b7280',
};

// emoji fallback icons per course category keywords
const COURSE_EMOJIS = ['💻', '🎨', '📊', '📱', '🔒', '🚀', '📐', '🧪', '🌐', '🎯', '📚', '🤖'];

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [countersStarted, setCountersStarted] = useState(false);
    const [counts, setCounts] = useState({ students: 0, courses: 0, satisfaction: 0, teachers: 0 });
    const [targetStats, setTargetStats] = useState({ students: 12500, courses: 450, satisfaction: 98, teachers: 150 });
    const [dbCourses, setDbCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const statsRef = useRef(null);

    // ─── fetch courses from DB ────────────────────────────────────────────────
    useEffect(() => {
        appAPI.getStatistics().then(res => {
            const stats = res.data?.data || res.data || {};
            if (stats && typeof stats === 'object') setTargetStats(stats);
        }).catch(() => { });

        courseAPI.findAll(1, 50)
            .then(res => {
                const all = res.data?.data || res.data || [];
                // shuffle and take 6
                const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 6);
                setDbCourses(shuffled);
            })
            .catch(() => setDbCourses([]))
            .finally(() => setCoursesLoading(false));
    }, []);

    // ─── scroll effects ────────────────────────────────────────────────────────
    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 70);
            const ids = ['home', 'features', 'courses', 'testimonials', 'contact'];
            for (const id of ids) {
                const el = document.getElementById('lp-' + id);
                if (el) {
                    const r = el.getBoundingClientRect();
                    if (r.top <= 100 && r.bottom >= 100) { setActiveSection(id); break; }
                }
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ─── counter animation ─────────────────────────────────────────────────────
    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !countersStarted) {
                setCountersStarted(true);
                const targets = targetStats;
                let step = 0; const steps = 60;
                const id = setInterval(() => {
                    step++;
                    const p = 1 - Math.pow(1 - step / steps, 3);
                    setCounts({
                        students: Math.floor(p * targets.students),
                        courses: Math.floor(p * targets.courses),
                        satisfaction: Math.floor(p * targets.satisfaction),
                        teachers: Math.floor(p * targets.teachers),
                    });
                    if (step >= steps) { clearInterval(id); setCounts(targets); }
                }, 2000 / steps);
            }
        }, { threshold: 0.3 });
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, [countersStarted, targetStats]);

    // ─── navigation helper ─────────────────────────────────────────────────────
    const go = (path) => navigate(path);
    const scrollTo = (id) => {
        const el = document.getElementById('lp-' + id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    // any CTA button respects login state
    const ctaAction = () => go(isAuthenticated ? '/dashboard' : '/register');
    const loginAction = () => go(isAuthenticated ? '/dashboard' : '/login');

    const safeTargetStats = {
        students: Number(targetStats?.students ?? 0),
        courses: Number(targetStats?.courses ?? 0),
        satisfaction: Number(targetStats?.satisfaction ?? 0),
        teachers: Number(targetStats?.teachers ?? 0),
    };

    // ─── data ──────────────────────────────────────────────────────────────────
    const features = [
        { img: featureLiveClasses, title: 'حصص مباشرة تفاعلية', color: C.primary, desc: 'تعلّم مع أساتذتك مباشرةً في بيئة تفاعلية مجهزة بأحدث التقنيات. اطرح أسئلتك وشارك في النقاشات فورًا.' },
        { emoji: '📝', title: 'اختبارات وكويزات', color: C.secondary, desc: 'نظام امتحانات وكويزات شامل لتقييم مستواك بشكل دائم وملخصات بعد كل حصة لمتابعة مستواك خطوة بخطوة.' },
        { img: featureSchedule, title: 'جدول ذكي مرن', color: C.success, desc: 'نظام جدولة متطور يتكيف مع وقتك. تابع حصصك وواجباتك واختباراتك في مكان واحد بكل سهولة.' },
        { emoji: '💬', title: 'دعم دائم 24/7', color: C.danger, desc: 'فريق دعم متخصص جاهز للمساعدة في أي وقت. خاصية الدردشة المباشرة تُقرّبك من أساتذتك وزملائك.' },
        { emoji: '📊', title: 'تتبع تقدمك لحظة بلحظة', color: C.warning, desc: 'لوحة تحكم ذكية تُظهر لك مستوى تقدمك ودرجاتك وإحصاءاتك بشكل بصري واضح وجميل.' },
        { emoji: '🔒', title: 'منصة آمنة وموثوقة', color: C.primaryLt, desc: 'بياناتك محمية بأعلى معايير الأمان. ادفع بثقة واستمتع بتجربة تعلم خالية من القلق.' },
    ];

    const testimonials = [
        { name: 'أحمد محمد', role: 'مطوّر برمجيات', rating: 5, text: 'المنصة رائعة جداً! المحتوى عالي الجودة والمدربون محترفون. استطعت الحصول على وظيفتي الحلم بعد إتمام دورة تطوير الويب.' },
        { name: 'سارة أحمد', role: 'مصممة UX/UI', rating: 5, text: 'أفضل منصة تعليمية جربتها. الجدول المرن والحصص المسجلة ساعدتني على التعلم في وقتي. شهادة التصميم فتحت لي أبوابًا كثيرة.' },
        { name: 'محمد علي', role: 'محلل بيانات', rating: 5, text: 'دورة علم البيانات كانت شاملة وعملية. الأساتذة يشرحون بأسلوب ممتع. أنصح كل من يريد مستقبلًا في التقنية بالانضمام.' },
    ];

    // ─── render ────────────────────────────────────────────────────────────────
    return (
        <div style={S.page} dir="rtl">

            {/* ══════════════════════ NAV ══════════════════════ */}
            <nav style={{ ...S.nav, ...(scrolled ? S.navScrolled : {}) }}>
                <div style={S.navInner}>
                    {/* logo */}
                    <div style={S.logo}>
                        <span style={{ fontSize: 26 }}>🎓</span>
                        <span style={{ fontWeight: 900, fontSize: 20, color: scrolled ? C.primaryLt : '#fff' }}>مركز التعليم</span>
                    </div>

                    {/* links */}
                    <div style={S.navLinks}>
                        {[['home', 'الرئيسية'], ['features', 'المميزات'], ['courses', 'الدورات'], ['testimonials', 'آراء الطلاب'], ['contact', 'تواصل']].map(([id, label]) => (
                            <button key={id} onClick={() => scrollTo(id)}
                                style={{
                                    ...S.navLink,
                                    color: scrolled ? (activeSection === id ? C.primary : C.textMuted) : (activeSection === id ? '#fff' : 'rgba(255,255,255,0.75)'),
                                    background: activeSection === id && scrolled ? `rgba(59,130,246,0.12)` : 'transparent',
                                    borderBottom: activeSection === id ? `2px solid ${scrolled ? C.primary : '#fff'}` : '2px solid transparent',
                                    fontWeight: activeSection === id ? 700 : 500,
                                }}
                            >{label}</button>
                        ))}
                    </div>

                    {/* actions */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button id="lp-login" onClick={loginAction}
                            style={{ ...S.navBtn, background: 'transparent', border: `1.5px solid ${scrolled ? C.primary : 'rgba(255,255,255,0.5)'}`, color: scrolled ? C.primary : '#fff' }}>
                            {isAuthenticated ? 'لوحة التحكم' : 'تسجيل الدخول'}
                        </button>
                        <button id="lp-cta-nav" onClick={ctaAction}
                            style={{ ...S.navBtn, background: `linear-gradient(135deg,${C.primary},${C.primaryLt})`, border: 'none', color: '#fff', boxShadow: `0 4px 14px rgba(59,130,246,0.4)` }}>
                            {isAuthenticated ? '← ادخل للداشبورد' : 'ابدأ مجاناً ✨'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ══════════════════════ HERO ══════════════════════ */}
            <section id="lp-home" style={S.hero}>
                {/* animated bg blobs */}
                <div style={{ ...S.blob, top: '-15%', right: '-8%', background: 'rgba(59,130,246,0.18)', animationDelay: '0s' }} />
                <div style={{ ...S.blob, bottom: '-15%', left: '-8%', background: 'rgba(139,92,246,0.15)', animationDelay: '3s', width: 550, height: 550 }} />
                <div style={{ ...S.blob, top: '45%', left: '35%', background: 'rgba(16,185,129,0.08)', animationDelay: '6s', width: 300, height: 300 }} />

                <div style={S.heroInner}>
                    {/* text */}
                    <div style={S.heroText}>
                        <div style={S.badge}>🌟 منصة التعليم المتطور #1 في مصر</div>
                        <h1 style={S.heroTitle}>
                            ابدأ رحلتك{' '}
                            <span style={S.gradientText}>التعليمية</span>
                            <br />معنا اليوم
                        </h1>
                        <p style={S.heroSub}>
                            استمتع بتجربة تعليمية فريدة مع أفضل المدربين والدورات المتخصصة.
                            طوّر مهاراتك واحصل على شهادات معتمدة تفتح لك آفاقًا جديدة.
                        </p>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
                            <button id="lp-hero-start" onClick={ctaAction}
                                style={S.heroBtnPrimary}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px rgba(16,185,129,0.45)`; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(16,185,129,0.35)`; }}
                            >🚀 {isAuthenticated ? 'اذهب للوحة التحكم' : 'ابدأ التعلم الآن'}</button>
                            <button id="lp-hero-courses" onClick={() => scrollTo('courses')}
                                style={S.heroBtnSecondary}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            >← استعرض الدورات</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ position: 'relative', width: 120, height: 40 }}>
                                {['👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻'].map((em, i) => (
                                    <span key={i} style={{ position: 'absolute', top: 0, right: i * 26, width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', border: '2.5px solid rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{em}</span>
                                ))}
                            </div>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>+{safeTargetStats.students.toLocaleString('ar-EG')} طالب نشط يثق بنا</span>
                        </div>
                    </div>

                    {/* image */}
                    <div style={{ position: 'relative', animation: 'lpFadeUp 0.9s ease 0.25s both' }}>
                        <div style={{ position: 'absolute', inset: -20, background: `radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)`, borderRadius: 28, filter: 'blur(16px)' }} />
                        <img src={heroImage} alt="منصة التعليم" style={{ width: '100%', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 }} />
                        <div style={{ ...S.floatCard, top: '14%', left: -28, animationDelay: '0s' }}>
                            <span style={{ fontSize: 22 }}>📈</span>
                            <div><div style={{ fontWeight: 700, color: C.textBase, fontSize: 13 }}>نسبة النجاح</div><div style={{ color: C.success, fontWeight: 900, fontSize: 22 }}>98%</div></div>
                        </div>
                        <div style={{ ...S.floatCard, bottom: '14%', right: -28, animationDelay: '1.5s' }}>
                            <span style={{ fontSize: 22 }}>🏆</span>
                            <div><div style={{ fontWeight: 700, color: C.textBase, fontSize: 13 }}>دورات متاحة</div><div style={{ color: C.primaryLt, fontWeight: 900, fontSize: 22 }}>{safeTargetStats.courses}+</div></div>
                        </div>
                    </div>
                </div>

                <div style={S.scrollDot} onClick={() => scrollTo('stats')} />
            </section>

            {/* ══════════════════════ STATS ══════════════════════ */}
            <section id="lp-stats" ref={statsRef} style={S.statsSection}>
                <div style={S.container}>
                    <div style={S.statsGrid}>
                        {[
                            { v: counts.students.toLocaleString('ar-EG') + '+', label: 'طالب نشط', icon: '👨‍🎓', c: C.primary },
                            { v: counts.courses + '+', label: 'دورة تدريبية', icon: '📚', c: C.secondary },
                            { v: counts.satisfaction + '%', label: 'نسبة الرضا', icon: '⭐', c: C.success },
                            { v: counts.teachers + '+', label: 'مدرب خبير', icon: '👨‍🏫', c: C.warning },
                        ].map((s, i) => (
                            <div key={i} style={S.statCard}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3)`; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = S.statCard.boxShadow; }}>
                                <div style={{ width: 64, height: 64, borderRadius: 16, background: s.c + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 30 }}>{s.icon}</div>
                                <div style={{ fontSize: 38, fontWeight: 900, color: s.c, marginBottom: 6 }}>{s.v}</div>
                                <div style={{ fontSize: 15, color: C.textMuted, fontWeight: 600 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════ FEATURES ══════════════════════ */}
            <section id="lp-features" style={S.section}>
                <div style={S.container}>
                    <SectionHeader badge="💡 لماذا نحن؟" title="مميزات تجعلك تختارنا" sub="نوفر لك كل ما تحتاجه لرحلة تعليمية ناجحة ومتكاملة" />
                    <div style={S.grid3}>
                        {features.map((f, i) => (
                            <div key={i} style={S.featureCard}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = f.color + '70'; e.currentTarget.style.boxShadow = `0 24px 48px rgba(0,0,0,0.4)`; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = S.featureCard.boxShadow; }}>
                                <div style={{ width: 68, height: 68, borderRadius: 18, background: f.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                                    {f.img ? <img src={f.img} alt={f.title} style={{ width: 48, height: 48, objectFit: 'contain' }} /> : <span style={{ fontSize: 36 }}>{f.emoji}</span>}
                                </div>
                                <div style={{ height: 3, width: 40, borderRadius: 2, background: f.color, marginBottom: 16 }} />
                                <h3 style={{ fontSize: 19, fontWeight: 700, color: C.textBase, marginBottom: 10 }}>{f.title}</h3>
                                <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.8 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════ COURSES ══════════════════════ */}
            <section id="lp-courses" style={{ ...S.section, background: `linear-gradient(135deg, ${C.bgAlt} 0%, #1e1b4b 100%)` }}>
                <div style={S.container}>
                    <SectionHeader badge="📚 دوراتنا" title="الدورات الأكثر شعبيةً" sub="اختر من بين مجموعة واسعة من الدورات المتخصصة في مجالات التقنية والتصميم والأعمال" />
                    {coursesLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 18 }}>
                            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
                            جاري تحميل الدورات...
                        </div>
                    ) : dbCourses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted }}>
                            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                            لا توجد دورات متاحة حالياً
                        </div>
                    ) : (
                        <div style={S.grid3}>
                            {dbCourses.map((course, i) => {
                                const emoji = COURSE_EMOJIS[i % COURSE_EMOJIS.length];
                                const accent = [C.primary, C.secondary, C.success, C.warning, C.danger, C.primaryLt][i % 6];
                                return (
                                    <div key={course.id || i} style={S.courseCard}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'; e.currentTarget.style.borderColor = accent + '60'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = C.border; }}>
                                        {/* top colour strip */}
                                        <div style={{ height: 4, background: `linear-gradient(90deg,${accent},${accent}88)` }} />
                                        <div style={{ padding: '28px 24px' }}>
                                            <div style={{ fontSize: 52, marginBottom: 16, textAlign: 'center' }}>{emoji}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <span style={{ background: accent + '25', color: accent, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                                                    {course.category || 'تدريبي'}
                                                </span>
                                                {i === 0 && <span style={{ background: C.success + '25', color: C.success, padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>الأكثر مبيعًا</span>}
                                            </div>
                                            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textBase, marginBottom: 10, lineHeight: 1.4 }}>
                                                {course.title || course.name || 'دورة تدريبية'}
                                            </h3>
                                            {course.description && (
                                                <p style={{
                                                    fontSize: 13, color: C.textMuted, lineHeight: 1.7, marginBottom: 14,
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                }}>
                                                    {course.description}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
                                                <span style={{ fontSize: 20, fontWeight: 900, color: accent }}>
                                                    {course.price ? `${Number(course.price).toLocaleString('ar-EG')} ج.م` : 'مجاني'}
                                                </span>
                                                <span style={{ fontSize: 12, color: C.textDim }}>
                                                    {course._count?.enrollments ?? course.enrollments?.length ?? 0} طالب
                                                </span>
                                            </div>
                                            <button
                                                id={`lp-course-${i}`}
                                                onClick={() => go(isAuthenticated ? '/courses' : '/login')}
                                                style={{ ...S.courseBtn, borderColor: accent + '60', color: accent }}
                                                onMouseEnter={e => { e.currentTarget.style.background = accent + '20'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                {isAuthenticated ? 'عرض الدورة ←' : 'سجّل للانضمام ←'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: 48 }}>
                        <button id="lp-all-courses" onClick={() => go(isAuthenticated ? '/courses' : '/login')}
                            style={S.btnGlass}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.transform = 'none'; }}>
                            استعرض كل الدورات →
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
            <section style={S.section}>
                <div style={S.container}>
                    <SectionHeader badge="⚡ كيف تبدأ؟" title="ابدأ في 3 خطوات فقط" sub="العملية أبسط مما تتخيل!" />
                    <div style={S.grid3}>
                        {[
                            { step: '١', icon: '📝', title: 'سجّل حسابك', desc: 'أنشئ حسابك مجانًا في أقل من دقيقة، لا بطاقة ائتمانية مطلوبة.' },
                            { step: '٢', icon: '🎯', title: 'اختر دورتك', desc: 'تصفّح مئات الدورات في مجالات متنوعة واختر ما يناسب هدفك.' },
                            { step: '٣', icon: '🏆', title: 'تعلّم واحصل على شهادتك', desc: 'أكمل الدورة، اجتز الاختبارات، واحصل على شهادتك المعتمدة.' },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '32px 20px', position: 'relative' }}>
                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg,${C.primary},${C.primaryLt})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, margin: '0 auto 16px', boxShadow: `0 8px 20px rgba(59,130,246,0.35)` }}>{s.step}</div>
                                <div style={{ fontSize: 36, marginBottom: 14 }}>{s.icon}</div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.textBase, marginBottom: 10 }}>{s.title}</h3>
                                <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.8 }}>{s.desc}</p>
                                {i < 2 && <div style={{ position: 'absolute', top: '22%', left: -16, fontSize: 24, color: C.border, fontWeight: 900 }}>→</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
            <section id="lp-testimonials" style={{ ...S.section, background: `linear-gradient(135deg,${C.bgAlt},${C.bg})` }}>
                <div style={S.container}>
                    <SectionHeader badge="💬 آراء الطلاب" title="ماذا يقول طلابنا؟" sub="آلاف الطلاب حققوا أهدافهم معنا" />
                    <div style={S.grid3}>
                        {testimonials.map((t, i) => (
                            <div key={i} style={S.testimonialCard}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = `rgba(59,130,246,0.4)`; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = C.border; }}>
                                <div style={{ position: 'absolute', top: 12, right: 20, fontSize: 56, color: `rgba(59,130,246,0.12)`, fontFamily: 'Georgia,serif', lineHeight: 1 }}>"</div>
                                <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.8, marginBottom: 18, position: 'relative', zIndex: 1 }}>{t.text}</p>
                                <div style={{ fontSize: 14, marginBottom: 16 }}>{'⭐'.repeat(t.rating)}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg,${C.primary},${C.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 900 }}>{t.name.charAt(0)}</div>
                                    <div><div style={{ fontWeight: 700, color: C.textBase, fontSize: 14 }}>{t.name}</div><div style={{ fontSize: 12, color: C.textDim }}>{t.role}</div></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════ CTA ══════════════════════ */}
            <section id="lp-contact" style={S.ctaSection}>
                <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '-40%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', filter: 'blur(60px)' }} />
                <div style={{ ...S.container, position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <h2 style={{ fontSize: 38, fontWeight: 900, color: C.textBase, marginBottom: 14, lineHeight: 1.3 }}>هل أنت مستعد لبدء رحلتك التعليمية؟</h2>
                    <p style={{ fontSize: 17, color: C.textMuted, lineHeight: 1.8, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
                        انضم إلى أكثر من {safeTargetStats.students.toLocaleString('ar-EG')} طالب نجحوا في تحقيق أهدافهم المهنية معنا.
                        {!isAuthenticated && <><br />سجّل الآن واستمتع بأول دورة مجانًا!</>}
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
                        <button id="lp-cta-main" onClick={ctaAction}
                            style={{ ...S.heroBtnPrimary, fontSize: 17, padding: '16px 44px' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                            🎓 {isAuthenticated ? 'اذهب للوحة التحكم' : 'سجّل مجاناً الآن'}
                        </button>
                        {!isAuthenticated && (
                            <button id="lp-cta-login" onClick={() => go('/login')} style={S.heroBtnSecondary}>
                                لديك حساب؟ سجّل الدخول
                            </button>
                        )}
                    </div>
                    {!isAuthenticated && (
                        <div style={{ color: C.textDim, fontSize: 13, fontWeight: 500 }}>
                            <span>✅ بدون بطاقة ائتمانية</span>
                            <span style={{ margin: '0 14px', opacity: 0.4 }}>|</span>
                            <span>✅ إلغاء الاشتراك في أي وقت</span>
                            <span style={{ margin: '0 14px', opacity: 0.4 }}>|</span>
                            <span>✅ شهادات معتمدة</span>
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════════════════ FOOTER ══════════════════════ */}
            <footer style={S.footer}>
                <div style={S.container}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 40, marginBottom: 48 }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: C.textBase, marginBottom: 14 }}>🎓 مركز التعليم</div>
                            <p style={{ color: C.textDim, lineHeight: 1.8, fontSize: 14, marginBottom: 20 }}>منصة تعليمية رائدة تسعى لتقديم أفضل تجربة تعلّم من خلال دورات متخصصة ومدربين محترفين.</p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {['📘', '🐦', '📷', '💼'].map((ic, i) => (
                                    <button key={i} style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: '50%', fontSize: 16, cursor: 'pointer' }}>{ic}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: C.textBase, marginBottom: 18 }}>روابط سريعة</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {[['home', 'الرئيسية'], ['features', 'المميزات'], ['courses', 'الدورات'], ['testimonials', 'آراء الطلاب']].map(([id, lb]) => (
                                    <li key={id} style={{ marginBottom: 10 }}>
                                        <button onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 14, cursor: 'pointer', fontFamily: "'Cairo',sans-serif", padding: 0 }}>{lb}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: C.textBase, marginBottom: 18 }}>الدعم</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {['مركز المساعدة', 'الأسئلة الشائعة', 'سياسة الخصوصية', 'الشروط والأحكام'].map(it => (
                                    <li key={it} style={{ color: C.textMuted, fontSize: 14, marginBottom: 10 }}>{it}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: C.textBase, marginBottom: 18 }}>تواصل معنا</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {['📧 support@center.edu', '📞 01118606952', '📍 القاهرة، مصر', '🕐 السبت – الخميس: 9ص – 9م'].map(it => (
                                    <li key={it} style={{ color: C.textMuted, fontSize: 14, marginBottom: 10 }}>{it}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, textAlign: 'center', color: C.textDim, fontSize: 13 }}>
                        © {new Date().getFullYear()} مركز التعليم المتطور – جميع الحقوق محفوظة | صُنع بكل ❤️ في مصر
                    </div>
                </div>
            </footer>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        @keyframes lpBlobFloat { 0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(25px,-25px) scale(1.04)}66%{transform:translate(-18px,18px) scale(0.96)} }
        @keyframes lpFloatCard { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }
        @keyframes lpFadeUp { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)} }
        @keyframes lpScrollBounce { 0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)} }
        * { box-sizing: border-box; }
        #lp-home * { font-family: 'Cairo', sans-serif !important; }
      `}</style>
        </div>
    );
};

// ─── small reusable header ─────────────────────────────────────────────────────
const SectionHeader = ({ badge, title, sub }) => (
    <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <span style={{ display: 'inline-block', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderRadius: 50, padding: '5px 18px', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{badge}</span>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: '#f3f4f6', marginBottom: 12 }}>{title}</h2>
        <p style={{ fontSize: 17, color: '#6b7280', maxWidth: 540, margin: '0 auto' }}>{sub}</p>
    </div>
);

// ─── styles ──────────────────────────────────────────────────────────────────
const S = {
    page: { fontFamily: "'Cairo',sans-serif", margin: 0, padding: 0, overflowX: 'hidden', background: C.bg, direction: 'rtl', color: C.textBase },

    // nav
    nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '14px 0', backdropFilter: 'blur(20px)', background: 'rgba(15,23,42,0.2)', borderBottom: '1px solid transparent', transition: 'all 0.3s ease' },
    navScrolled: { background: 'rgba(15,23,42,0.97)', borderBottom: `1px solid rgba(71,85,105,0.5)`, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', padding: '10px 0' },
    navInner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
    logo: { display: 'flex', alignItems: 'center', gap: 10 },
    navLinks: { display: 'flex', gap: 4, alignItems: 'center' },
    navLink: { background: 'transparent', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 14, transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif" },
    navBtn: { borderRadius: 50, padding: '9px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Cairo',sans-serif" },

    // hero
    hero: { minHeight: '100vh', background: `linear-gradient(135deg,${C.bg} 0%,#1e1b4b 50%,${C.bgAlt} 100%)`, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 78 },
    blob: { position: 'absolute', width: 600, height: 600, borderRadius: '50%', filter: 'blur(90px)', animation: 'lpBlobFloat 9s ease-in-out infinite' },
    heroInner: { maxWidth: 1200, margin: '0 auto', padding: '60px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 2, width: '100%', animation: 'lpFadeUp 0.8s ease' },
    heroText: { color: '#fff' },
    badge: { display: 'inline-block', background: 'rgba(59,130,246,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 50, padding: '7px 20px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 20 },
    heroTitle: { fontSize: 50, fontWeight: 900, lineHeight: 1.2, marginBottom: 18 },
    gradientText: { background: `linear-gradient(135deg,${C.primaryLt},${C.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    heroSub: { fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.85, marginBottom: 32 },
    heroBtnPrimary: { background: `linear-gradient(135deg,${C.success},#059669)`, color: '#fff', border: 'none', borderRadius: 50, padding: '15px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 24px rgba(16,185,129,0.35)`, transition: 'all 0.3s ease', fontFamily: "'Cairo',sans-serif" },
    heroBtnSecondary: { background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.85)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 50, padding: '13px 30px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif" },
    floatCard: { position: 'absolute', background: 'rgba(30,41,59,0.9)', backdropFilter: 'blur(16px)', border: `1px solid rgba(59,130,246,0.3)`, borderRadius: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', animation: 'lpFloatCard 3s ease-in-out infinite', zIndex: 2, fontFamily: "'Cairo',sans-serif" },
    scrollDot: { position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: 10, height: 20, borderRadius: 5, background: 'rgba(255,255,255,0.3)', animation: 'lpScrollBounce 1.5s ease-in-out infinite', cursor: 'pointer', zIndex: 3 },

    // stats
    statsSection: { background: C.bgCard, backdropFilter: 'blur(10px)', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '64px 0' },
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 },
    statCard: { textAlign: 'center', padding: '28px 16px', borderRadius: 20, background: 'rgba(30,41,59,0.6)', border: `1px solid ${C.border}`, transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },

    // sections
    section: { padding: '88px 0', background: C.bg },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 },
    featureCard: { background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '32px 26px', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', cursor: 'default' },

    // courses
    courseCard: { background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
    courseBtn: { width: '100%', marginTop: 16, background: 'transparent', border: `1.5px solid`, borderRadius: 12, padding: '11px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif" },
    btnGlass: { background: 'rgba(59,130,246,0.1)', color: C.primaryLt, border: `1.5px solid rgba(59,130,246,0.3)`, borderRadius: 50, padding: '14px 44px', fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Cairo',sans-serif" },

    // testimonials
    testimonialCard: { background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '32px 26px', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' },

    // cta
    ctaSection: { padding: '96px 0', background: `linear-gradient(135deg,#0f0e1a,#1a1830)`, position: 'relative', overflow: 'hidden', textAlign: 'center' },

    // footer
    footer: { background: '#080812', borderTop: `1px solid ${C.border}`, padding: '56px 0 20px', color: C.textBase },
};

export default LandingPage;
