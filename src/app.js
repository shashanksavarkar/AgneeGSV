const MODULES = [
  'modules/runtime-context.js',
  'modules/campus-geo.js',
  'modules/campus-scene.js',
  'modules/festival-scene.js',
  'modules/camera-effects.js',
  'modules/places.js',
  'modules/earth-ui.js',
  'modules/landing-and-loop.js'
];

async function loadApplication() {
  try {
    const sources = await Promise.all(MODULES.map(async path => {
      const response = await fetch(`src/${path}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Unable to load ${path} (${response.status})`);
      return response.text();
    }));
    const runApplication = new Function(
      'const WMURI = window.WMURI; const WMI = window.WMI;\n' + sources.join('\n\n')
    );
    // Ensure canvas and view exist in DOM before initializing WebGL
    let waited = 0;
    while ((!document.getElementById('c') || !document.getElementById('view')) && waited < 10000) {
      await new Promise(r => setTimeout(r, 50));
      waited += 50;
    }
    if (!document.getElementById('c')) {
      throw new Error('Canvas element #c not found in DOM');
    }
    runApplication();
  } catch (error) {
    console.error('Agnee application failed to load.', error);
    const loader = document.getElementById('load');
    if (loader) {
      loader.innerHTML = '<div class="ld fallback"><b>3D view unavailable</b><span>The campus preview could not load. You can still browse the fest details below.</span><button type="button" onclick="location.reload()">Retry 3D view</button></div>';
      loader.style.opacity = '1';
      loader.style.display = 'grid';
    }
  }
}

loadApplication();
