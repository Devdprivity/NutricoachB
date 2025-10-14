import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollVideoProps {
    videoSrc: string;
    className?: string;
    scrollTrigger?: string;
}

export const ScrollVideo = ({
    videoSrc,
    className = '',
    scrollTrigger = '.hero-section'
}: ScrollVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) return;

        // Configurar el video
        video.currentTime = 0;
        video.pause();

        // Esperar a que el video cargue metadata
        const onLoadedMetadata = () => {
            const videoDuration = video.duration;

            // Crear ScrollTrigger para controlar el video
            const trigger = ScrollTrigger.create({
                trigger: scrollTrigger,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onUpdate: (self) => {
                    const targetTime = self.progress * videoDuration;
                    video.currentTime = targetTime;
                    console.log('Scroll Progress:', self.progress.toFixed(2), 'Video Time:', targetTime.toFixed(2));
                },
            });

            return trigger;
        };

        let scrollTriggerInstance: ScrollTrigger | undefined;

        if (video.readyState >= 1) {
            scrollTriggerInstance = onLoadedMetadata();
        } else {
            video.addEventListener('loadedmetadata', () => {
                scrollTriggerInstance = onLoadedMetadata();
            });
        }

        // Cleanup
        return () => {
            if (scrollTriggerInstance) {
                scrollTriggerInstance.kill();
            }
        };
    }, [videoSrc, scrollTrigger]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="auto"
            >
                <source src={videoSrc} type="video/mp4" />
                Tu navegador no soporta videos HTML5.
            </video>
        </div>
    );
};
