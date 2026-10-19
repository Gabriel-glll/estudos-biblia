"""Aplica o conteúdo de um JSON ao estudo (mantém os versículos já gerados) e atualiza estudos/lista.js.

Uso: python -I tools/montar.py isaias-13 conteudo.json
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug, src = sys.argv[1], sys.argv[2]
path = os.path.join(ROOT, "estudos", f"{slug}.html")
html = open(path, encoding="utf-8").read()
m = re.search(r"window\.ESTUDO = (\{.*?\});</script>", html, re.S)
dados = json.loads(m.group(1))
novo = json.load(open(src, encoding="utf-8"))
novo.pop("versos", None)
dados.update(novo)
html = html[:m.start(1)] + json.dumps(dados, ensure_ascii=False, indent=1) + html[m.end(1):]
html = re.sub(r"<title>.*?</title>", f"<title>{dados['livro']} {dados['capitulo']} · Estudos Bíblicos</title>", html)
open(path, "w", encoding="utf-8").write(html)

# lista do índice
lp = os.path.join(ROOT, "estudos", "lista.js")
lista = re.search(r"window\.ESTUDOS = (\[.*?\]);", open(lp, encoding="utf-8").read(), re.S).group(1)
itens = json.loads(lista) if lista.strip("[] \n") else []
item = {"slug": slug, "ref": f"{dados['livro']} {dados['capitulo']}", "titulo": dados["titulo"],
        "data": dados["data"], "capa": dados["capa"]["src"].replace("../", "")}
itens = [i for i in itens if i["slug"] != slug] + [item]
open(lp, "w", encoding="utf-8").write(
    "// Um item por estudo, em ordem cronológica (o índice mostra o mais recente primeiro)\nwindow.ESTUDOS = "
    + json.dumps(itens, ensure_ascii=False, indent=1) + ";\n")
print("ok", path)
