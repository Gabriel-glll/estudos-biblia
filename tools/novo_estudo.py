"""Cria estudos/<slug>.html com os versículos do capítulo já preenchidos (Bíblia Livre, CC BY).

Uso: python -I tools/novo_estudo.py "Isaías" 13
Depois é só preencher introdução, blocos anotados, palavras, curiosidade e fontes.
"""
import json, os, sys, unicodedata, datetime

VPL = os.path.expanduser(r"~/Documents/claude/biblia-fontes/blivre/porbr2018_vpl.txt")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LIVROS = [("Gênesis","GEN"),("Êxodo","EXO"),("Levítico","LEV"),("Números","NUM"),("Deuteronômio","DEU"),
("Josué","JOS"),("Juízes","JDG"),("Rute","RUT"),("1 Samuel","1SA"),("2 Samuel","2SA"),("1 Reis","1KI"),("2 Reis","2KI"),
("1 Crônicas","1CH"),("2 Crônicas","2CH"),("Esdras","EZR"),("Neemias","NEH"),("Ester","EST"),("Jó","JOB"),("Salmos","PSA"),
("Provérbios","PRO"),("Eclesiastes","ECC"),("Cantares","SNG"),("Isaías","ISA"),("Jeremias","JER"),("Lamentações","LAM"),
("Ezequiel","EZK"),("Daniel","DAN"),("Oseias","HOS"),("Joel","JOL"),("Amós","AMO"),("Obadias","OBA"),("Jonas","JON"),
("Miqueias","MIC"),("Naum","NAM"),("Habacuque","HAB"),("Sofonias","ZEP"),("Ageu","HAG"),("Zacarias","ZEC"),("Malaquias","MAL"),
("Mateus","MAT"),("Marcos","MRK"),("Lucas","LUK"),("João","JHN"),("Atos","ACT"),("Romanos","ROM"),("1 Coríntios","1CO"),
("2 Coríntios","2CO"),("Gálatas","GAL"),("Efésios","EPH"),("Filipenses","PHP"),("Colossenses","COL"),("1 Tessalonicenses","1TH"),
("2 Tessalonicenses","2TH"),("1 Timóteo","1TI"),("2 Timóteo","2TI"),("Tito","TIT"),("Filemom","PHM"),("Hebreus","HEB"),
("Tiago","JAS"),("1 Pedro","1PE"),("2 Pedro","2PE"),("1 João","1JN"),("2 João","2JN"),("3 João","3JN"),("Judas","JUD"),("Apocalipse","REV")]

def norm(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn").replace(" ", "")

def main():
    livro, cap = sys.argv[1], int(sys.argv[2])
    nome, cod = next((n, c) for n, c in LIVROS if norm(n) == norm(livro) or norm(n).startswith(norm(livro)))
    pref = f"{cod} {cap}:"
    versos = {}
    for ln in open(VPL, encoding="utf-8"):
        if ln.startswith(pref):
            ref, txt = ln.rstrip("\n").split(" ", 2)[1:]
            versos[int(ref.split(":")[1])] = txt.strip()
    if not versos:
        sys.exit(f"Capítulo não encontrado: {pref}")
    slug = f"{norm(nome)}-{cap}"
    dest = os.path.join(ROOT, "estudos", f"{slug}.html")
    dados = {
        "livro": nome, "capitulo": cap, "titulo": "", "subtitulo": "",
        "data": datetime.date.today().strftime("%d/%m/%Y"),
        "capa": {"src": "", "credito": ""},
        "introducao": {"autor": {"titulo": "", "texto": ""}, "destinatarios": {"titulo": "", "texto": ""},
                       "epoca": {"titulo": "", "texto": ""}, "lingua": {"titulo": "", "texto": ""},
                       "contexto": {"titulo": "", "paragrafos": [], "imagem": None}},
        "linhaDoTempo": [],
        "versos": versos,
        "paragrafos": [f"1-{max(versos)}"],
        "notaVersao": "",
        "blocos": [], "palavras": [], "curiosidade": None, "paraLevar": None, "fontes": [],
    }
    html = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{nome} {cap} · Estudos Bíblicos</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/estudo.css"></head>
<body><div id="app"></div>
<script>window.ESTUDO = {json.dumps(dados, ensure_ascii=False, indent=1)};</script>
<script src="../assets/estudo.js"></script></body></html>
"""
    if os.path.exists(dest):
        sys.exit(f"Já existe: {dest}")
    open(dest, "w", encoding="utf-8").write(html)
    print(dest, len(versos), "versículos")

main()
