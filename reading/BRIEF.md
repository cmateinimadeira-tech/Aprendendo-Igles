# Como escrever textos de leitura extensiva

Objetivo: textos para ler **com fluência e prazer**, quase sem consultar palavras, que **reciclem as palavras mais frequentes do inglês e as palavras de ligação**. O aluno é um adulto brasileiro (nível A2/B1, meta: prova de Inglês da ANPAD). A pesquisa (Nation) indica que a leitura extensiva funciona quando o leitor conhece 95–98% das palavras.

## Formato
Um arquivo por lote em `reading/r-<nome>.js`:

```js
// Leitura extensiva — nível N. Textos originais.
READINGS.push(
  {
    id: "r3-why-batteries-get-tired",
    level: 3,
    topic: "Tecnologia",            // "Tecnologia" | "Aprender inglês" | "Economia" | "Curiosidades"
    title: "Why do phone batteries get tired?",
    paras: ["Parágrafo 1…", "Parágrafo 2…", "Parágrafo 3…"],
    gloss: [["lithium", "lítio"], ["charge", "carga / carregar"]],   // palavras fora da faixa do nível, com tradução
    check: { q: "Qual é a ideia principal do texto?", opts: ["…", "…", "…"], a: 0 }   // uma pergunta leve, em português
  },
);
```

## Regras de vocabulário (verificadas por `node reading/check.js -v`)
- **Cobertura ≥ 95%**: quase todas as palavras devem estar na NGSL (`ngsl.js`) até a faixa do nível — nível 2: 1.000 palavras mais frequentes; nível 3: 1.600; nível 4: 2.200; nível 5: 2.809. Cognatos transparentes (information, technology…) e nomes próprios contam como conhecidos.
- Palavras fora da faixa: no máximo 5 por texto, **todas no `gloss`** com tradução.
- **Palavras de ligação**: pelo menos 4 diferentes da lista `LINK_WORDS` (arquivos `lessons/links-a.js` e `links-b.js`) do nível do texto ou do nível seguinte, usadas com naturalidade (however, although, so that, instead, unless, while, still, even though, as a result, for example…). Repita as mais importantes ao longo do lote.
- Prefira verbos e expressões frequentes do dia a dia (get, make, take, keep, turn out, find out) — o vocabulário germânico que o aluno precisa fixar.

## Extensão
- Nível 2: 3 parágrafos, 140–200 palavras no total, frases curtas.
- Nível 3: 3–4 parágrafos, 200–280 palavras.
- Nível 4: 4 parágrafos, 280–360 palavras.

## Conteúdo
- Temas: curiosidades de tecnologia, como aprender inglês (memória, hábitos, leitura), economia do dia a dia, curiosidades gerais (ciência, história, F1).
- **Fatos corretos e bem estabelecidos.** Não invente estatísticas, datas, nomes ou citações. Se não tiver certeza de um número, use formulações gerais ("most", "about half", "for many years"). Nada de afirmações duvidosas apresentadas como fato.
- Tom leve, interessante, com uma ideia central clara por texto. Inglês natural; ortografia consistente dentro do texto.
- `check`: uma única pergunta de ideia geral, 3 alternativas, em português, sem pegadinhas.
- Português do Brasil nas glosas e na pergunta.
