const CACHE_NAME = 'global-notes-v2';
const ASSETS = [
    './',
    './index.html',
    './CSS/index.css',
    './JS/notesApp.js',
    './JS/storage.js',
    './JS/noteManager.js',
    './JS/renderer.js',
    './JS/eventHandlers.js',
    './JS/formattingToolbar.js',
    './JS/mediaManager.js',
    './JS/authButtons.js',
    './JS/exportImport.js',
    './JS/aiAssistant.js',
    './JS/themeManager.js',
    './JS/filterSearchSort.js',
    './JS/layoutManager.js',
    './JS/smartCalendar.js',
    './JS/profileManager.js',
    './JS/slashCommands.js',
    './JS/folderManager.js',
    './JS/audioRecorder.js',
    './JS/sketchPad.js',
    './JS/utilities.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
