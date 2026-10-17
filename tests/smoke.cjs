// Optional browser regression test. Uses synthetic records and mocked providers.
const {chromium} = require(process.env.FRAME_PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');

(async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'frame-smoke-'));
  const browser = await chromium.launch({headless: true,
    ...(process.env.FRAME_BROWSER_CHANNEL ? {channel: process.env.FRAME_BROWSER_CHANNEL} : {}),
    ignoreDefaultArgs: ['--hide-scrollbars']});
  try {
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
    const page = await context.newPage();
    const errors = [], network = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {if (/^https?:/.test(request.url())) network.push(request.url());});
    await page.route('https://**/*', route => route.abort());
    const url = pathToFileURL(path.resolve(__dirname, '..', 'FRAME.html')).href;
    await page.goto(url);
    await page.waitForFunction(() => !!db);
    await page.evaluate(() => document.fonts.ready);
    assert.match(await page.title(), /FRAME/);
    assert.equal(await page.locator('#heroAdd').isVisible(), true);
    assert.equal(await page.locator('#posters .film').count(), 0);
    assert.equal(await page.locator('#empty').isVisible(), true);
    assert.deepEqual(network, [], 'Fresh standalone startup should not contact a host');
    assert.equal(await page.locator('body').evaluate(e => getComputedStyle(e).fontFamily), 'Inter');
    assert.equal(await page.locator('body').evaluate(e => getComputedStyle(e).scrollbarWidth), 'thin');
    await page.screenshot({path: path.join(temp, 'desktop.png'), fullPage: true});
    await page.locator('#helpBtn').click();
    await page.locator('#legalNotices summary').click();
    assert.match(await page.locator('#legalNotices').innerText(), /FRAME Personal Noncommercial License/);
    assert.equal(await page.locator('#helpDialog img[alt="TMDB"]').evaluate(e => e.complete && e.naturalWidth > 0), true);
    await page.screenshot({path: path.join(temp, 'credits.png'), fullPage: true});
    await page.getByRole('button', {name: 'Close help', exact: true}).click();
    console.log('PASS fresh startup without network, empty library, embedded font/logo/licenses');

    await page.locator('#fileInput').setInputFiles([
      {name:'Sample.Film.2024.1080p.mp4', mimeType:'video/mp4', buffer:Buffer.from('synthetic fixture')},
      {name:'Sample.Series.S01E01.mkv', mimeType:'video/x-matroska', buffer:Buffer.from('synthetic fixture')},
      {name:'Sample.Series.S01E02.mkv', mimeType:'video/x-matroska', buffer:Buffer.from('synthetic fixture')}
    ]);
    await page.waitForFunction(() => items.length === 3 && !busy);
    assert.equal(await page.locator('#posters .film').count(), 2);
    const png = await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 80; c.height = 120;
      const ctx = c.getContext('2d'); ctx.fillStyle='#384653'; ctx.fillRect(0,0,80,120);
      ctx.fillStyle='#edbd63'; ctx.fillRect(15,25,50,70); return c.toDataURL();
    });
    await page.route('https://image.tmdb.org/**', route => route.fulfill({contentType:'image/png', body:Buffer.from(png.split(',')[1], 'base64')}));
    await page.route('https://api.themoviedb.org/3/**', route => route.fulfill({json:{
      id:101, title:'Provider Sample Film', release_date:'2024-01-01', overview:'TMDB synthetic synopsis',
      poster_path:'/sample.png', credits:{cast:[{id:1,name:'Example Actor',character:'Lead',profile_path:'/actor.png'}]}
    }}));
    await page.route('https://api.tvmaze.com/**', route => route.fulfill({json:{
      id:202, name:'Sample Series', premiered:'2024-01-01', summary:'<p>TVmaze synthetic synopsis</p>',
      genres:['Drama'], _embedded:{cast:[{person:{id:2,name:'Example Person'},character:{name:'Companion'}}]}
    }}));
    await page.evaluate(async () => {
      settings.token='TEST_CREDENTIAL_NEVER_A_REAL_KEY';
      await applyMetadata(groups().find(g=>g.type==='movie'), {provider:'tmdb',id:101,type:'movie'});
      await applyMetadata(groups().find(g=>g.type==='tv'), {provider:'tvmaze',id:202,type:'tv'});
    });
    assert(await page.evaluate(()=>items.find(i=>i.provider==='tmdb').metadataFetchedAt>0));
    assert(await page.evaluate(()=>art.has('https://image.tmdb.org/t/p/w185/actor.png')));
    await page.getByRole('button',{name:'Details for Sample Series',exact:true}).click();
    assert.equal(await page.locator('#episodeRows .file-row').count(),2);
    await page.locator('#editDetails').click();
    await page.locator('#editSynopsis').fill('User-edited TVmaze synthetic synopsis');
    await page.getByRole('button',{name:'Save details',exact:true}).click();
    await page.waitForFunction(()=>!document.querySelector('#editDialog').open);
    assert.match(await page.locator('#detailBody .sources').innerText(), /TVmaze.*CC BY-SA 4.0.*Edited by user/s);
    await page.getByRole('button',{name:'Close title details',exact:true}).click();

    // Browser keyboard routing is exercised with a synthetic media timeline.
    await page.evaluate(()=>{
      playItem=items.find(i=>i.type==='movie');
      Object.defineProperties(document.querySelector('#video'), {
        duration:{configurable:true,value:120},currentTime:{configurable:true,writable:true,value:20}
      });
      openDialog('#playerDialog');
    });
    await page.locator('#fullscreenBtn').focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#video').evaluate(v=>v.currentTime),30);
    await page.locator('#subtitleBtn').focus(); await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#video').evaluate(v=>v.currentTime),20);
    assert.equal(await page.evaluate(()=>!!document.fullscreenElement),false);
    await page.evaluate(()=>document.querySelector('#playerDialog').close());

    await page.locator('#settingsBtn').click();
    const downloaded = page.waitForEvent('download');
    await page.locator('#exportBtn').click();
    const backup = await downloaded;
    const exported = JSON.parse(fs.readFileSync(await backup.path(),'utf8'));
    assert.equal(exported.items.length,3);
    assert(!JSON.stringify(exported).includes('TMDB synthetic synopsis'));
    assert(!JSON.stringify(exported).includes('TEST_CREDENTIAL_NEVER_A_REAL_KEY'));
    assert(!JSON.stringify(exported).includes('Provider Sample Film'));
    assert.equal(exported.items.find(i=>i.provider==='tmdb').sourceId,101);
    assert.equal(exported.art.length,0);
    assert.match(exported.dataNotices.tvmaze.license,/by-sa\/4.0/);
    assert(exported.items.filter(i=>i.type==='tv').every(i=>i.attributions[0].modified));
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    console.log('PASS grouping, provider fetch/cache, edited TVmaze attribution, windowed key routing and safe export');

    await page.evaluate(async()=>{
      const movie=items.find(x=>x.provider==='tmdb');
      movie.metadataFetchedAt=Date.now()-151*24*60*60*1000;
      for(const [key] of art) artDates.set(key,0);
      await expireProviderData(); render();
    });
    assert.equal(await page.evaluate(()=>items.find(x=>x.provider==='tmdb').overview),undefined);
    assert.equal(await page.evaluate(()=>items.find(x=>x.provider==='tmdb').sourceId),101);
    assert.equal(await page.evaluate(()=>art.size),0);
    assert.equal(await page.evaluate(()=>validImportedItem({id:'old',folderId:'f',path:'Old.mp4',title:'Old provider title',provider:'tmdb',sourceId:99,overview:'Old data'}).overview),undefined);
    assert.equal(await page.evaluate(()=>attributionsFor({provider:'tvmaze',sourceURL:'javascript:alert(1)'})[0].url),'https://www.tvmaze.com/');
    assert.equal(await page.evaluate(()=>isExpired(Date.now()+10000)),true);
    console.log('PASS expiry, unknown-age imports, future timestamps and attribution URL validation');

    const importedContext=await browser.newContext(); const importedPage=await importedContext.newPage();
    importedPage.on('pageerror',error=>errors.push(error.message));
    await importedPage.route('https://**/*',route=>route.abort());
    await importedPage.goto(url); await importedPage.waitForFunction(()=>!!db);
    await importedPage.locator('#backupInput').setInputFiles({name:'synthetic-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
    await importedPage.waitForFunction(()=>items.length===3&&!busy);
    assert.equal(await importedPage.evaluate(()=>items.find(i=>i.type==='tv').attributions[0].modified),true);
    assert.equal(await importedPage.evaluate(()=>items.find(i=>i.provider==='tmdb').sourceId),101);
    await importedContext.close();

    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(temp,'mobile.png'),fullPage:true});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.locator('#helpBtn').click();
    if (!await page.locator('#legalNotices').evaluate(e=>e.open)) await page.locator('#legalNotices summary').click();
    assert.equal(await page.locator('#legalNotices').evaluate(e=>e.open),true);
    assert.equal(await page.evaluate(()=>document.querySelector('#helpDialog').scrollWidth>document.querySelector('#helpDialog').clientWidth),false);
    await page.screenshot({path:path.join(temp,'mobile-credits.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('PASS backup import, mobile width, legal dialog wrapping, and zero page runtime errors');
    console.log('Screenshots:',temp);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
