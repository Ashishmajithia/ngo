<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>ACT Charitable Trust | Rising Hope for Children (REG.NO.220)</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">

    @php
        $manifestPath = public_path('build/manifest.json');
        $cssFile = '/build/assets/app-JJz-A3l9.css';
        $jsFile = '/build/assets/app--7pUVzuY.js';
        $preloadChunks = [];
        if (file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            if (!empty($manifest['resources/css/app.css']['file'])) {
                $cssFile = '/build/' . $manifest['resources/css/app.css']['file'];
            }
            if (!empty($manifest['resources/js/app.tsx']['file'])) {
                $jsFile = '/build/' . $manifest['resources/js/app.tsx']['file'];
                if (!empty($manifest['resources/js/app.tsx']['imports'])) {
                    foreach ($manifest['resources/js/app.tsx']['imports'] as $impKey) {
                        if (!empty($manifest[$impKey]['file'])) {
                            $preloadChunks[] = '/build/' . $manifest[$impKey]['file'];
                        }
                    }
                }
            }
        }
    @endphp
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
    <link rel="preload" href="{{ $cssFile }}" as="style">
    <link rel="stylesheet" href="{{ $cssFile }}">
    <link rel="modulepreload" href="{{ $jsFile }}">
    @foreach($preloadChunks as $chunk)
    <link rel="modulepreload" href="{{ $chunk }}">
    @endforeach




    <script type="module" src="{{ $jsFile }}"></script>
</head>
<body class="bg-[#fffdf8] text-[#183a35] antialiased selection:bg-[#f2ad3b]/30 selection:text-[#123f38]">
    <div id="root">
        <div id="act-initial-loader" style="position:fixed;inset:0;background-color:#123f38;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;">
            <div style="position:relative;width:96px;height:96px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;">
                <div style="position:absolute;inset:0;border-radius:50%;border:4px solid rgba(242,173,59,0.25);border-top-color:#f2ad3b;animation:actSpin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;"></div>
                <img src="/uploads/act_official_logo.jpg" alt="ACT Charitable Trust" style="width:72px;height:72px;border-radius:50%;object-fit:contain;background:#fff;padding:4px;box-shadow:0 8px 24px rgba(0,0,0,0.4);" onerror="this.style.display='none'">
            </div>
            <h2 style="font-family:'Playfair Display',Georgia,serif;color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;letter-spacing:-0.02em;text-align:center;">ACT Charitable Trust</h2>
            <p style="font-family:'Plus Jakarta Sans',sans-serif;color:#f2ad3b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;margin:0;text-align:center;">Rising Hope for Children</p>
            <div style="margin-top:20px;width:140px;height:3px;background:rgba(255,255,255,0.15);border-radius:99px;overflow:hidden;position:relative;">
                <div style="position:absolute;top:0;bottom:0;background:#f2ad3b;border-radius:99px;animation:actBar 1.2s ease-in-out infinite;"></div>
            </div>
            <style>
                @keyframes actSpin { to { transform: rotate(360deg); } }
                @keyframes actBar {
                    0% { left: -40%; width: 40%; }
                    50% { left: 30%; width: 60%; }
                    100% { left: 100%; width: 40%; }
                }
            </style>
            <script>
                // Auto-dismiss safety: ensures green loader never spins indefinitely
                setTimeout(function() {
                    var loader = document.getElementById('act-initial-loader');
                    if (loader) {
                        loader.style.opacity = '0';
                        loader.style.transition = 'opacity 0.4s ease';
                        setTimeout(function() { if (loader && loader.parentNode) loader.remove(); }, 400);
                    }
                }, 2000);

                // Auto-recover if browser cached stale deployment chunk
                window.addEventListener('error', function(e) {
                    if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                        if (!sessionStorage.getItem('act_chunk_retry')) {
                            sessionStorage.setItem('act_chunk_retry', '1');
                            window.location.reload();
                        }
                    }
                }, true);
            </script>
        </div>
    </div>
</body>
</html>
