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
    @if(!empty($initialContent))
    <script id="server-initial-content" type="application/json">{!! json_encode($initialContent, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES) !!}</script>
    @endif
    @if(!empty($initialBlogs))
    <script id="server-initial-blogs" type="application/json">{!! json_encode($initialBlogs, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES) !!}</script>
    @endif

    <script type="module" src="{{ $jsFile }}"></script>
</head>
<body class="bg-[#fffdf8] text-[#183a35] antialiased selection:bg-[#f2ad3b]/30 selection:text-[#123f38]">
    <div id="root"></div>
</body>
</html>
