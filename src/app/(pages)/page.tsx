'use client';

import {DotLottieReact} from '@lottiefiles/dotlottie-react';

export default function Home() {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <DotLottieReact
                src="/animations/website-under-construction.lottie"
                loop
                autoplay
                style={{width: '100%', height: 'auto'}}
            />
        </div>
    );
}
