"""Run with Python Playwright after starting python -m http.server 8080."""
from pathlib import Path
from urllib.parse import urlencode, urlparse, parse_qs
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent
BASE = 'http://localhost:8080/'
results = []

def track_errors(page):
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    return errors

def open_letter(page):
    page.locator('#envelope').press('Enter')
    page.locator('.actions').wait_for(state='visible', timeout=35000)

def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')

def save_png(page, name):
    # Capture actual drawn text as well as the downloaded PNG dimensions.
    page.evaluate('''() => {
      window.drawnText = [];
      if (!window.originalFillText) {
        window.originalFillText = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
          window.drawnText.push(text); return window.originalFillText.call(this, text, ...args);
        };
      }
    }''')
    with page.expect_download() as download:
        page.locator('#save').click()
    target = ROOT / f'export-{name}.png'
    download.value.save_as(str(target))
    raw = target.read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'
    assert int.from_bytes(raw[16:20], 'big') == 1800
    assert int.from_bytes(raw[20:24], 'big') >= 2400
    drawn = ' '.join(page.evaluate('window.drawnText'))
    assert 'Cô Lan' in drawn and 'Minh Anh' in drawn
    assert 'Sao chép' not in drawn and 'Xem lại' not in drawn
    assert 'Happy Vietnamese' in drawn and 'chân thành cảm ơn' in drawn

with sync_playwright() as p:
    browsers = [('Chrome for Testing', {})]
    edge = Path(r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
    if edge.exists(): browsers.append(('Edge', {'executable_path': str(edge)}))
    for name, launch_args in browsers:
        browser = p.chromium.launch(headless=True, **launch_args)
        for width in (375, 768, 1920):
            context = browser.new_context(viewport={'width':width, 'height':900},
                is_mobile=width == 375, has_touch=width == 375,
                reduced_motion='no-preference' if width == 375 else 'reduce', accept_downloads=True)
            page = context.new_page(); errors = track_errors(page)
            page.goto(BASE + '?' + urlencode({'to':'Cô Lan', 'from':'Minh Anh'}), wait_until='networkidle')
            assert page.locator('.envelope-caption').inner_text() == 'Kính gửi Cô Lan'
            assert page.locator('#recipient').input_value() == 'Cô Lan'
            no_overflow(page)
            page.screenshot(path=str(ROOT / f'preview-{width}.png'), full_page=True)
            if width == 375:
                page.locator('#envelope').press('Enter')
                page.locator('#letter-view').wait_for(state='visible', timeout=8000)
                page.wait_for_function('document.querySelector(".ink-text.writing")?.textContent.length > 1')
                assert page.locator('.ink-text').first.inner_text() != 'Kính gửi Cô Lan kính yêu,'
                if name == 'Chrome for Testing':
                    page.locator('.actions').wait_for(state='visible', timeout=30000)
                else: page.locator('#skip').click()
            else: open_letter(page)
            assert page.locator('.greeting-line.revealed').count() == 6
            assert page.locator('#skip').is_hidden()
            assert page.locator('#sender-signature').inner_text() == 'Người gửi: Minh Anh'
            no_overflow(page)
            page.screenshot(path=str(ROOT / f'letter-{width}.png'), full_page=True)
            save_png(page, f'{name.replace(" ", "-")}-{width}')
            page.locator('.bouquet').press('Enter')
            assert page.locator('.bouquet.sparkling').count() == 1
            page.emulate_media(reduced_motion='reduce')
            for _ in range(3):
                page.locator('#replay').click()
                assert page.locator('.greeting-line.revealed').count() == 0
                assert page.locator('.bouquet.sparkling').count() == 0
                open_letter(page)
                assert page.locator('.ink-text').first.inner_text() == 'Kính gửi Cô Lan kính yêu,'
                assert page.locator('audio').count() == 1
            page.locator('#music').click()
            page.wait_for_function('!document.querySelector("#audio").paused')
            page.locator('#replay').click()
            assert page.evaluate('!document.querySelector("#audio").paused')
            page.locator('#music').click()
            assert page.evaluate('document.querySelector("#audio").paused')
            page.evaluate('''() => {const b=document.querySelector('#music'); b.click();b.click();}''')
            page.wait_for_timeout(150)
            assert page.evaluate('document.querySelector("#audio").paused')
            page.locator('summary').click()
            page.locator('#recipient').fill('Cô Hương'); page.locator('#sender').fill('Lớp 12A1')
            assert page.locator('.envelope-caption').inner_text() == 'Kính gửi Cô Hương'
            page.evaluate('Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("denied")}}})')
            page.locator('[data-share]').first.click()
            page.locator('#share-fallback').wait_for(state='visible')
            url = page.locator('#share-url').input_value()
            assert parse_qs(urlparse(url).query) == {'to':['Cô Hương'], 'from':['Lớp 12A1']}
            page.keyboard.press('Escape'); assert page.locator('#share-fallback').is_hidden()
            # Production URLs are generated for localhost/file previews; reopen its query locally.
            page.goto(BASE + '?' + urlparse(url).query)
            assert page.locator('#recipient').input_value() == 'Cô Hương'
            assert page.locator('#sender').input_value() == 'Lớp 12A1'
            assert not errors, errors
            results.append({'browser':name, 'width':width, 'open_write_skip_replay_png_audio_share':'PASS', 'console_errors':0})
            context.close()

        context = browser.new_context(reduced_motion='reduce', permissions=['clipboard-read','clipboard-write'])
        page=context.new_page(); errors=track_errors(page)
        page.goto(BASE + '?' + urlencode({'to':'Cô Lan', 'from':'Minh Anh'}))
        page.locator('summary').click(); page.locator('[data-share]').first.click()
        page.wait_for_function('document.querySelector("#status").textContent.includes("Đã sao chép")')
        assert parse_qs(urlparse(page.evaluate('navigator.clipboard.readText()')).query)['from'] == ['Minh Anh']
        attack='<img src=x onerror=alert(1)>'
        page.goto(BASE + '?' + urlencode({'to':attack, 'from':'A'*200+'\u202e'}))
        assert page.locator('.envelope-caption').inner_text() == 'Kính gửi ' + attack
        assert page.locator('img').count() == 0
        assert len(page.locator('#sender').input_value()) == 64
        no_overflow(page); open_letter(page); no_overflow(page)
        page.goto(BASE + '?' + urlencode({'to':'Cô Lan', 'from':'Minh Anh'})); open_letter(page)
        page.evaluate('() => {document.fonts.load=async()=>{throw Error("simulated font failure")}}')
        save_png(page, 'font-fallback')
        assert 'font dự phòng' in page.locator('#status').inner_text()
        page.evaluate('() => {window.Image=class {set src(value){queueMicrotask(()=>this.onerror())}}}')
        page.locator('#save').click()
        page.wait_for_function('!document.querySelector("#save").disabled')
        assert 'Chưa tải được hoa' in page.locator('#status').inner_text()
        assert not errors, errors
        context.close()

        context=browser.new_context()
        page=context.new_page(); errors=track_errors(page)
        page.route('**/gsap.min.js', lambda route: route.fulfill(status=200, content_type='text/javascript', body=''))
        page.goto(BASE); page.locator('#envelope').press('Space')
        page.locator('#letter-view').wait_for(state='visible', timeout=8000)
        page.locator('#skip').click(); assert page.locator('.actions').is_visible()
        assert not errors, errors
        context.close()
        results.append({'browser':name, 'clipboard_security_font_asset_errors_GSAP_fallback':'PASS'})
        browser.close()

print(json.dumps(results, ensure_ascii=False, indent=2))
