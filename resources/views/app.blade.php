<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>ACT Charitable Trust | Together We Rise</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">

    @php
        $manifestPath = public_path('build/manifest.json');
        $cssFile = '/build/assets/app-v2-CxBeh.css';
        $jsFile = '/build/assets/app-CaYMRVJ6.js';
        if (file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            if (!empty($manifest['resources/css/app.css']['file'])) {
                $cssFile = '/build/' . $manifest['resources/css/app.css']['file'];
            }
            if (!empty($manifest['resources/js/app.tsx']['file'])) {
                $jsFile = '/build/' . $manifest['resources/js/app.tsx']['file'];
            }
        }
    @endphp
    <link rel="stylesheet" href="{{ $cssFile }}">
    <script type="module" src="{{ $jsFile }}"></script>
</head>
<body class="bg-[#fffdf8] text-[#183a35] antialiased selection:bg-[#f2ad3b]/30 selection:text-[#123f38]">
    <div id="root"></div>
</body>
</html>
