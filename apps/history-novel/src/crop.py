from PIL import Image, ImageDraw
import os
SP = '/tmp/claude-0/-home-user/af30580b-6d17-5f86-a327-48ef97a5e3f9/scratchpad/'
os.makedirs(SP + 'pub/ch', exist_ok=True)
# key: (center x, center y, box width) as fractions of the image
B = {
 'goshirakawa': (.60, .36, .62), 'gotoba': (.47, .40, .40), 'hiromoto': (.52, .62, .30), 'kiyomori': (.42, .30, .46),
 'masako': (.53, .23, .30), 'sanetomo': (.50, .27, .42), 'yasutoki': (.50, .40, .46), 'yoritomo': (.48, .32, .32),
 'yoshitsune': (.50, .27, .36), 'mochihito': (.5, .35, .5)}
AR = 84 / 68
outs = []
for k, (cx, cy, w) in B.items():
    f = SP + 'raw/' + k + '.jpg'
    if not os.path.exists(f): continue
    im = Image.open(f); W, H = im.size
    bw = w * W; bh = bw * AR
    x0 = max(0, min(W - bw, cx * W - bw / 2)); y0 = max(0, min(H - bh, cy * H - bh / 2))
    c = im.crop((int(x0), int(y0), int(x0 + bw), int(y0 + bh))).resize((204, 252), Image.LANCZOS)
    c.save(SP + 'pub/ch/' + k + '.jpg', quality=82, optimize=True); outs.append((k, c))
sheet = Image.new('RGB', (210 * len(outs), 272), 'white'); d = ImageDraw.Draw(sheet)
for i, (k, c) in enumerate(outs):
    sheet.paste(c, (i * 210, 0)); d.text((i * 210 + 4, 256), k, fill='black')
sheet.save(SP + 'crops.png')
