from pathlib import Path
import json
from playwright.sync_api import sync_playwright

root = Path(__file__).parent
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', headless=True)
    for width in (375, 768, 1920):
        page = browser.new_page(viewport={'width':width,'height':900}, accept_downloads=True)
        errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto('http://localhost:8080', wait_until='networkidle')
        page.screenshot(path=str(root / f'preview-{width}.png'), full_page=True)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Initial overflow {width}: '+page.evaluate('JSON.stringify([...document.querySelectorAll("*")].map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right})).filter(e=>e.right>innerWidth))')
        page.locator('#envelope').focus()
        page.keyboard.press('Enter')
        page.locator('.actions').wait_for(state='visible', timeout=22000)
        assert page.locator('.greeting-line.revealed').count()==6
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Letter overflow {width}'
        page.screenshot(path=str(root / f'letter-{width}.png'), full_page=True)
        with page.expect_download() as info:
            page.locator('#save').click()
        info.value.save_as(str(root / f'export-{width}.png'))
        page.locator('#replay').click()
        assert page.locator('#intro').is_visible()
        assert page.locator('.greeting-line.revealed').count()==0
        page.locator('#envelope').click(force=True)
        page.locator('.actions').wait_for(state='visible', timeout=22000)
        assert not errors, errors
        results.append({'width':width,'open':'pass','replay':'pass','png':'pass','overflow':False,'errors':errors})
        page.close()
    page=browser.new_page(reduced_motion='reduce', viewport={'width':375,'height':812})
    page.route('**/*gsap*', lambda route: route.abort())
    page.goto('http://localhost:8080')
    page.locator('#envelope').click(force=True)
    page.locator('.actions').wait_for(state='visible', timeout=3000)
    results.append({'reduced_motion':'pass'})
    page.close()
    page=browser.new_page()
    page.route('**/*gsap*', lambda route: route.abort())
    page.goto('http://localhost:8080')
    page.locator('#envelope').click(force=True)
    page.locator('.actions').wait_for(state='visible', timeout=22000)
    results.append({'GSAP_offline_fallback':'pass'})
    browser.close()
print(json.dumps(results, ensure_ascii=False, indent=2))
