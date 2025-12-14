import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Trophy,
    Users,
    BarChart3,
    MessageSquare,
    Wallet,
    Target,
    Play,
    ArrowRight,
    Zap,
    Shield,
    Globe,
    ChevronDown,
    Phone,
} from "lucide-react";

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 },
};

const fadeIn = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.8 },
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration: 0.5 },
};

const staggerContainer = {
    initial: {},
    whileInView: {
        transition: { staggerChildren: 0.1 },
    },
    viewport: { once: true },
};

const staggerItem = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
};

// Features data
const features = [
    {
        icon: Trophy,
        title: "Live Auction Engine",
        description:
            "Real-time bidding with automatic increment slabs and instant updates across all devices.",
        color: "text-primary",
        glow: "group-hover:shadow-[0_0_30px_hsl(263,70%,50%,0.3)]",
    },
    {
        icon: Users,
        title: "Team & Player Management",
        description:
            "Complete roster management with bulk upload, categories, and detailed player profiles.",
        color: "text-secondary",
        glow: "group-hover:shadow-[0_0_30px_hsl(30,100%,55%,0.3)]",
    },
    {
        icon: BarChart3,
        title: "Real-time Analytics",
        description:
            "Track page views, auction activity, and user engagement with beautiful dashboards.",
        color: "text-accent",
        glow: "group-hover:shadow-[0_0_30px_hsl(142,76%,36%,0.3)]",
    },
    {
        icon: MessageSquare,
        title: "WhatsApp Notifications",
        description:
            "Automatic notifications to players when they're sold or go unsold in the auction.",
        color: "text-green-400",
        glow: "group-hover:shadow-[0_0_30px_hsl(142,76%,50%,0.3)]",
    },
    {
        icon: Wallet,
        title: "Budget Tracking",
        description:
            "Real-time budget updates for each team with remaining purse displayed instantly.",
        color: "text-yellow-400",
        glow: "group-hover:shadow-[0_0_30px_hsl(45,100%,50%,0.3)]",
    },
    {
        icon: Target,
        title: "Custom Categories",
        description:
            "Define player categories with individual base prices for organized auctions.",
        color: "text-pink-400",
        glow: "group-hover:shadow-[0_0_30px_hsl(330,80%,60%,0.3)]",
    },
];

// How it works steps
const steps = [
    {
        number: "01",
        title: "Create Tournament",
        description: "Set up your tournament with teams, budget, and player categories",
    },
    {
        number: "02",
        title: "Add Players",
        description: "Bulk upload players via CSV or add them individually",
    },
    {
        number: "03",
        title: "Start Auction",
        description: "Go live with real-time bidding and instant notifications",
    },
    {
        number: "04",
        title: "Track Results",
        description: "View detailed reports and analytics after the auction",
    },
];

// Stats
const stats = [
    { value: "500+", label: "Tournaments Hosted" },
    { value: "10K+", label: "Players Auctioned" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "User Rating" },
];

export default function Home() {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                className="relative min-h-screen flex items-center justify-center overflow-hidden"
                style={{ opacity: heroOpacity }}
            >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "50px 50px",
                    }}
                />

                <motion.div
                    className="relative z-10 container mx-auto px-4 text-center"
                    style={{ y: heroY, scale: heroScale }}
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
                    >
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">The Future of Sports Auctions</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6 leading-tight px-2"
                    >
                        <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                            Run Stunning
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                            Live Auctions
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-4"
                    >
                        The all-in-one platform to manage tournaments, teams, and real-time player auctions
                        with instant WhatsApp notifications.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
                    >
                        <Button
                            size="lg"
                            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_0_30px_hsl(263,70%,50%,0.4)] hover:shadow-[0_0_40px_hsl(263,70%,50%,0.6)] transition-all duration-300"
                            onClick={() => navigate("/tournaments")}
                        >
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-primary/30 hover:bg-primary/10"
                            onClick={() => {
                                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            Watch Demo
                        </Button>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-muted-foreground"
                        >
                            <ChevronDown className="w-8 h-8" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Demo Video Section */}
            <section id="demo" className="py-16 md:py-24 relative">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeInUp} className="text-center mb-8 md:mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
                            See It In <span className="text-primary">Action</span>
                        </h2>
                        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                            Watch how easy it is to run a professional auction
                        </p>
                    </motion.div>

                    <motion.div {...scaleIn} className="max-w-5xl mx-auto">
                        <Card className="overflow-hidden bg-card/50 backdrop-blur border-primary/20 shadow-2xl">
                            <CardContent className="p-0">
                                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group cursor-pointer">
                                    {/* Placeholder for video - replace with actual video */}
                                    <div className="absolute inset-0 bg-[url('/stadium-bg.jpg')] bg-cover bg-center opacity-30" />
                                    <div className="relative z-10 text-center">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_50px_hsl(263,70%,50%,0.5)] group-hover:shadow-[0_0_70px_hsl(263,70%,50%,0.7)] transition-all duration-300"
                                        >
                                            <Play className="w-6 h-6 sm:w-10 sm:h-10 text-white ml-1" />
                                        </motion.div>
                                        <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted-foreground">Click to play demo</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div {...fadeInUp} className="text-center mb-10 md:mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
                            Everything You <span className="text-secondary">Need</span>
                        </h2>
                        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                            Powerful features designed for seamless auction management
                        </p>
                    </motion.div>

                    <motion.div
                        {...staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature, index) => (
                            <motion.div key={index} {...staggerItem}>
                                <Card
                                    className={`group h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-500 ${feature.glow}`}
                                >
                                    <CardContent className="p-6">
                                        <div
                                            className={`w-14 h-14 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 md:py-24 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeInUp} className="text-center mb-10 md:mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
                            How It <span className="text-accent">Works</span>
                        </h2>
                        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                            Get started in minutes with our simple 4-step process
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-6 sm:left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent" />

                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className={`relative flex items-center mb-8 md:mb-12 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                        }`}
                                >
                                    {/* Step Number */}
                                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg sm:text-2xl font-black shadow-[0_0_30px_hsl(263,70%,50%,0.4)] z-10">
                                        {step.number}
                                    </div>

                                    {/* Content */}
                                    <div
                                        className={`ml-16 sm:ml-24 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"
                                            }`}
                                    >
                                        <Card className="bg-card/50 backdrop-blur border-border/50">
                                            <CardContent className="p-4 sm:p-6">
                                                <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">{step.title}</h3>
                                                <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 md:py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        {...staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                {...staggerItem}
                                className="text-center"
                            >
                                <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1 sm:mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-muted-foreground text-sm sm:text-lg">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        {...fadeIn}
                        className="flex flex-wrap justify-center items-center gap-8 opacity-60"
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-6 h-6" />
                            <span className="font-medium">Secure & Private</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-6 h-6" />
                            <span className="font-medium">Works Everywhere</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-6 h-6" />
                            <span className="font-medium">Lightning Fast</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/20 rounded-full blur-3xl" />

                <motion.div {...scaleIn} className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 md:mb-6 px-2">
                        Ready to Run Your
                        <br />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            First Auction?
                        </span>
                    </h2>
                    <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-10 px-4">
                        Join hundreds of tournament organizers who trust Auctioner for their player auctions.
                    </p>

                    {/* Contact Info */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <a
                            href="tel:8208214607"
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-all"
                        >
                            <Phone className="w-5 h-5 text-accent" />
                            <span className="font-semibold">Call: 8208214607</span>
                        </a>
                    </div>

                    <Button
                        size="lg"
                        className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-[0_0_40px_hsl(263,70%,50%,0.4)] hover:shadow-[0_0_60px_hsl(263,70%,50%,0.6)] transition-all duration-300"
                        onClick={() => navigate("/tournaments")}
                    >
                        View Tournaments
                        <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-8 md:py-12 border-t border-border/50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-primary" />
                            <span className="text-xl font-bold">Auctioner</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <a href="tel:8208214607" className="hover:text-primary transition-colors">8208214607</a>
                        </div>
                        <div className="text-muted-foreground text-sm">
                            © {new Date().getFullYear()} Auctioner. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
