SP='/tmp/claude-0/-home-user/af30580b-6d17-5f86-a327-48ef97a5e3f9/scratchpad/'
t=open(SP+'tpl.html').read()
t=t.replace('%%MAP%%',open(SP+'geo/japan_path.txt').read()).replace('%%G%%',open(SP+'G.js').read()).replace('%%PIC%%',open(SP+'pic.js').read()).replace('%%S%%',open(SP+'S.js').read()).replace('%%ENGINE%%',open(SP+'engine2.js').read())
open('/mnt/project-files/history-novel/bushi-no-yo.html','w').write(t)
print(len(t))
