# Aprendendo Inglês

Curso de inglês focado em **leitura e interpretação**, com método próprio e ritmo adaptado ao aluno.

## O método
Combina três abordagens:
- **Inglês Instrumental**: estratégias de leitura (cognatos, ideia geral, inferência pelo contexto).
- **Leitura graduada**: textos curtos e reais, um pouco acima do nível do aluno. Temas: rádio da Fórmula 1, tecnologia, economia e cotidiano.
- **Revisão espaçada** do vocabulário (1, 3, 7, 14 e 30 dias).

A gramática entra só quando muda o sentido do texto: um ponto curto por lição, tirado do próprio texto.
Escrita e fala aparecem de forma dosada e opcional (áudio do texto e uma frase de resumo).

## Estrutura de cada lição
1. Antes de ler: contexto, previsão e cognatos
2. Leitura: palavras sublinhadas mostram o significado ao toque
3. Perguntas de interpretação, em português, com explicação
4. Um ponto de gramática
5. Vocabulário, que entra na revisão
6. Extra opcional: escrever uma frase

**Ritmo:** uma lição conta como concluída com 80% ou mais de acertos. Abaixo disso, o aluno relê e tenta de novo.
Cada nível (1 a 4) é liberado ao concluir 2 lições do nível anterior. O aluno escolhe os temas que preferir.

## Arquivos
- `index.html`: página e estilos
- `app.js`: lógica (teste, lições, revisão, progresso)
- `data.js`: conteúdo (teste de nivelamento, lições dos níveis 1 a 4, glossário da F1, guia)
- `anpad.js`: nível 5, com lições no formato da prova de Inglês da ANPAD
- `lessons/level-N.js`, `level-Nb.js`…: lotes de lições (hoje 8 no nível 1, 16 nos níveis 2 e 3, 8 no nível 4 e 6 no nível 5)
- `game.js`: gamificação (XP, meta diária, sequência, conquistas) e meta de aprendizagem com previsão
- `lessons/BRIEF.md` e `lessons/validate.js`: regras para escrever lições e validador (`node lessons/validate.js -v`)

## Como usar
Abra `index.html` no navegador. O progresso fica salvo no próprio navegador.

## Teste de nivelamento
4 textos (níveis 1 a 4), 5 perguntas cada, 4 alternativas embaralhadas a cada aplicação, mais a opção “Não sei”.
Nos textos 3 e 4 as perguntas são em inglês. Em cada resposta o aluno indica se entendeu no texto ou deduziu:
acerto com certeza vale 1 ponto, por dedução 0,5. O nível exige 3,5 de 5 pontos, em sequência.
Depois, as lições ajustam o nível: se as duas primeiras lições do nível de partida ficarem abaixo de 80% na
primeira tentativa, o app sugere descer um nível.

## Fundamentação
- **Níveis 1 a 4 ≈ A1, A2, B1 e B2 do CEFR** (Quadro Europeu Comum de Referência), usando os descritores de leitura da grade de autoavaliação do Conselho da Europa.
- **Estratégias de leitura** (predição, skimming, scanning, cognatos, falsos cognatos, palavras repetidas, inferência, referência, conectivos, afixos), tiradas de ementas de Inglês Instrumental do IFPB, do IFCE, da UFC e da UNIVASF. A abordagem vem do Projeto Nacional de Inglês Instrumental (PUC-SP, coordenado por M. A. Celani).
- **Tipos de pergunta** (ideia geral, informação específica, detalhe, inferência, referência, vocabulário no contexto, opinião/atitude) e alternativas que repetem palavras do texto sem estarem certas, conforme o guia de leitura do Cambridge B1 Preliminary.
- **Cobertura de vocabulário:** segundo a pesquisa de Nation e outros, a leitura independente fica viável com 95 a 98% das palavras conhecidas. O app mostra quanto do texto o aluno entendeu sem consultar.

## Nível 5: formato ANPAD
Criado a partir da análise de provas de Inglês da ANPAD de 2010 (fevereiro, junho e setembro).
- Textos do mesmo gênero da prova: introdução de artigo acadêmico de Administração, coluna de revista e notícia de negócios. Os textos são **originais**; pessoas, empresas e estudos citados são fictícios.
- Linhas numeradas, perguntas em inglês com 5 alternativas (A–E) e tradução opcional das perguntas.
- Tipos de pergunta da prova: propósito, detalhe, função de exemplos, próxima seção, vocabulário e expressões, conectivos, referência e EXCEPT FOR.
- As provas originais não fazem parte do repositório.

## Acesso pelo celular
O app foi pensado para o smartphone: barra de abas inferior, alternativas em cartões grandes e significado das palavras numa faixa no rodapé.
Ele é publicado no claude.ai (Artifact privado). Para atualizar a versão publicada, gere a página com
`python3 tools/build-artifact.py <saída>.html` e publique junto com `data.js`, `anpad.js`, `app.js` e `lessons/level-*.js`.
Com login no claude.ai, o progresso também fica salvo numa área privada da conta; fora dele, só no navegador.

## Tempo de leitura (fluência)
Na primeira tentativa de cada lição o app mede o tempo ativo (pausas longas e app em segundo plano não contam),
as palavras por minuto até a primeira resposta e quantas vezes o aluno volta ao texto depois de começar a responder.
Metas internas do curso: 40, 60, 80, 100 e 120 palavras/min nos níveis 1 a 5. Lição com 80% e leitura fluente
recebe ★ (dominada). O botão "Ver texto" abre o texto numa folha sobreposta, sem rolar a página.

## App instalável (PWA)
O curso também funciona como app instalado no celular, em tela cheia (no Android some até a barra de status; no iPhone a barra da hora continua, por limitação do sistema) e offline (`manifest.webmanifest`, `sw.js`, `icons/`).
Endereço, depois de ativar o GitHub Pages: https://cmateinimadeira-tech.github.io/Aprendendo-Igles/

Para ativar (uma vez): no GitHub, **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
escolha a branch `ccr-3a3cdf2f-i5jonk` e a pasta `/ (root)`, e salve. Em 1 a 2 minutos o endereço fica no ar.

Instalação: Android (Chrome) → menu ⋮ → **Instalar app**; iPhone (Safari) → **Compartilhar → Adicionar à Tela de Início**.
O progresso do app instalado é separado do claude.ai: use **Início → Transferir progresso** para levar de um para o outro.
Ao mudar arquivos do app, aumente a versão em `CACHE` no `sw.js`.

## Produção de lições (banco de questões)
Cada lote passa por: produção seguindo `lessons/BRIEF.md` → validador automático (`node lessons/validate.js -v`) →
revisão independente às cegas (`node lessons/blind.js <arquivos>` gera a versão sem gabarito; o revisor responde,
depois compara com `--key` e corrige ambiguidades) → teste de todas as lições no navegador → publicação.
Lotes 2b, 2c, 3b e 3c: 56/56 e 56/56 de concordância às cegas, com 7 correções no total.

## Gamificação e metas
XP: +10 por acerto na 1ª tentativa, +2 ao refazer, +20 por lição dominada (★), +3/+1 por palavra revisada, +25 pela meta do dia.
Meta diária: leve (1 lição + 10 revisões), regular (2 + 15) ou intensa (4 + 20); cumprir mantém a sequência de dias.
Meta de aprendizagem: nível-alvo e data opcional; o caminho exige 75% das lições de cada nível, e o app prevê a data de
chegada pelo ritmo das últimas 2 semanas.

## Palavras com pesos diferentes
Para quem fala português, ~70–75% da Academic Word List são cognatos de origem latina (fáceis); conectivos, palavras de função
e phrasal verbs são o gargalo. Por isso:
- `lessons/vocab-tags.js` classifica cada palavra (ligação, função, phrasal, verbo, adjetivo/advérbio, substantivo, expressão;
  fácil, cognato, falso cognato; prioridade 1–3). Palavras fáceis ficam fora da revisão, cognatos voltam espaçados e as
  fundamentais vêm primeiro.
- `words.js` + `lessons/links-a.js` e `links-b.js`: treino de palavras de ligação (80 palavras, 160 questões dos tipos lacuna,
  relação, sentido e equivalente no estilo ANPAD), com revisão espaçada por questão. Revisão às cegas: 80/80 e 80/80.
- Nos textos das lições, as palavras de ligação ficam com sublinhado próprio e são listadas antes da leitura.

## Leitura extensiva, minutos fora do app e missões
- `reading/r-level*.js`: 22 textos (níveis 2–4) de 3–4 parágrafos sobre tecnologia, aprender inglês, economia e curiosidades,
  escritos com o vocabulário da NGSL do nível (cobertura ≥ 95%) e palavras de ligação; revisados quanto a fatos e inglês.
- `ngsl.js`: New General Service List 1.2 (Browne, Culligan & Phillips, CC BY-SA 4.0), usada para estimar quanto do texto o
  aluno conhece (NGSL da faixa + palavras já aprendidas + cognatos). O app recomenda o texto mais perto de 96%.
- Releitura espaçada (2, 4 ou 10 dias, conforme a dificuldade) com comparação de velocidade.
- Registro de minutos de inglês fora do app e três missões diárias (ler um texto é fixa).
- Produção de novos textos: `reading/BRIEF.md` + `node reading/check.js -v`.
