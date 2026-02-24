import React from 'react';
import Hero from '../components/Hero/Hero';
import AboutUs from '../components/AboutUs/AboutUs';
import Destinations from '../components/Destinations/Destinations';
import Packages from '../components/Packages/Packages';

import Blogs from '../components/Blogs/Blogs';


const Home = () => {
    return (
        <>
            <Hero />
            <AboutUs />
            <Destinations />

            <Packages />
            <Blogs />
        </>
    );
};

export default Home;
