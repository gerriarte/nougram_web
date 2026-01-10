import { useEffect, useRef } from 'react';

export const useDynamicFavicon = () => {
    const originalFavicon = useRef<string | null>(null);

    useEffect(() => {
        // Store original favicon
        const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (link) {
            originalFavicon.current = link.href;
        }

        const setDynamicFavicon = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                // Draw background circle (Brand Primary)
                ctx.fillStyle = '#006D71';
                ctx.beginPath();
                ctx.arc(16, 16, 16, 0, 2 * Math.PI);
                ctx.fill();

                // Draw $ sign
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', 16, 17); // Slightly adjusted vertical alignment

                // Draw Notification Badge (Red)
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(26, 6, 6, 0, 2 * Math.PI); // Top right
                ctx.fill();

                // Draw '1' inside badge
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('1', 26, 7); // Center in badge

                const newIcon = canvas.toDataURL('image/png');
                const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;

                // Create link if not exists (though it should)
                if (link) {
                    link.href = newIcon;
                } else {
                    const newLink = document.createElement('link');
                    newLink.rel = 'icon';
                    newLink.href = newIcon;
                    document.head.appendChild(newLink);
                }
            }
        };

        const restoreFavicon = () => {
            if (originalFavicon.current) {
                const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                if (link) {
                    link.href = originalFavicon.current;
                }
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setDynamicFavicon();
                document.title = '(1) Nueva Cotización'; // Optional: change title to grab attention too? User didn't ask but "notification" implies it. Stick to favicon for now as requested.
            } else {
                restoreFavicon();
                // document.title = originalTitle; // If we changed title
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            restoreFavicon();
        };
    }, []);
};
