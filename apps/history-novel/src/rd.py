"""Retro Diffusion で肖像画をドット絵に変換する。キーはプロキシが X-RD-Token を付ける。
使い方: python3 rd.py <key> <style> <prompt> [--cost]"""
import base64, io, json, sys, time, uuid, urllib.request
from PIL import Image
SP = '/tmp/claude-0/-home-user/af30580b-6d17-5f86-a327-48ef97a5e3f9/scratchpad/'
API = 'https://api.retrodiffusion.ai/v2/inferences'
W, H = 128, 160
def req(url, body=None, extra=None):
    h = {'Content-Type': 'application/json'}; h.update(extra or {})
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None, headers=h, method='POST' if body is not None else 'GET')
    try:
        return json.load(urllib.request.urlopen(r, timeout=120))
    except urllib.error.HTTPError as e:
        print('HTTP', e.code, e.read()[:600].decode('utf-8', 'replace')); sys.exit(1)
key, style, prompt = sys.argv[1], sys.argv[2], sys.argv[3]
cost = '--cost' in sys.argv
im = Image.open(SP + 'pub/ch/' + key + '.jpg').convert('RGB').resize((W, H), Image.LANCZOS)
buf = io.BytesIO(); im.save(buf, 'PNG'); b64 = base64.b64encode(buf.getvalue()).decode()
body = {'prompt': prompt, 'prompt_style': style, 'width': W, 'height': H, 'num_images': 1, 'input_image': b64}
if cost: body['check_cost'] = True
else: body['async'] = True
acc = req(API, body, None if cost else {'Idempotency-Key': str(uuid.uuid4())})
if cost or 'task_id' not in acc:
    print(json.dumps(acc)[:600]); sys.exit(0)
tid = acc['task_id']
while True:
    t = req(f'{API}/tasks/{tid}')
    if t['status'] in ('pending', 'running', 'accepted', 'queued'): time.sleep(3); continue
    break
if t['status'] != 'succeeded': print(json.dumps(t)[:600]); sys.exit(1)
res = t['result']
out = SP + f'rd_{key}_{style}.png'
open(out, 'wb').write(base64.b64decode(res['base64_images'][0]))
print('saved', out, 'cost', res.get('balance_cost'), 'remaining', res.get('remaining_balance'))
