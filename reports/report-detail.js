document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('footer-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Click-to-play: thumbnail → iframe
    document.querySelectorAll('.report-video-thumb').forEach(thumb => {
        thumb.addEventListener('click', e => {
            e.preventDefault();
            const videoId = thumb.dataset.videoId;
            if (!videoId) return;

            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            iframe.className = 'report-video-iframe';

            thumb.replaceWith(iframe);
        });
    });

    // Auto-size report artifact iframes
    document.querySelectorAll('.report-artifact-embed').forEach(iframe => {
        function resize() {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                    iframe.style.height = doc.documentElement.scrollHeight + 'px';
                }
            } catch (e) {
                iframe.style.height = '1200px';
            }
        }

        iframe.addEventListener('load', () => {
            resize();
            setTimeout(resize, 300);
        });
    });
});
