import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import PopularLocations from '../components/PopularLocations';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-neutral-900 dark:text-white font-display antialiased min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Hero />
                <HowItWorks />
                <PopularLocations />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
