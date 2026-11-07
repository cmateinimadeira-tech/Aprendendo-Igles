"""Gera a versão do index.html para publicar no claude.ai (Artifact).

O claude.ai envolve a página num esqueleto próprio, então a versão publicada
contém só o trecho entre os marcadores ARTIFACT-* do index.html.
Uso: python3 tools/build-artifact.py <arquivo-de-saída>
"""
import re, sys, pathlib
src = (pathlib.Path(__file__).resolve().parent.parent / "index.html").read_text(encoding="utf-8")
head = src.split("<!-- ARTIFACT-START -->")[1].split("<!-- ARTIFACT-HEAD-END -->")[0]
body = src.split("<body>")[1].split("<!-- ARTIFACT-END -->")[0]
out = head.strip() + "\n" + body.strip() + "\n"
assert not re.search(r"<(!doctype|html|head|body)\b", out, re.I)
pathlib.Path(sys.argv[1]).write_text(out, encoding="utf-8")
print("ok", len(out), "bytes")
