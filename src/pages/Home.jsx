import React from 'react';
import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';
import Destinations from '../components/Destinations/Destinations';
import Packages from '../components/Packages/Packages';

import Blogs from '../components/Blogs/Blogs';


const Home = () => {
    return (
        <>
            <Hero />
            <Features />
            <Destinations />

            <Packages />
            <Blogs />
        </>
    );
};

export default Home;
