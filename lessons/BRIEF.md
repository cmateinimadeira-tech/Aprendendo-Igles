# Como escrever lições novas (guia para quem gera conteúdo)

Curso de **leitura e interpretação** em inglês para um adulto brasileiro, falante de português, que fez inglês há mais de 15 anos e quer chegar ao nível da prova de Inglês da ANPAD. Foco: entender textos; gramática só quando muda o sentido.

## Onde escrever
Um arquivo por lote: `lessons/level-N.js` ou `lessons/level-N<letra>.js` (ex.: `level-2b.js`), com este formato exato:

```js
// Lições extras do nível N. Conteúdo original; pessoas, empresas e estudos são fictícios.
LESSONS.push(
  { ...lição... },
  { ...lição... },
);
```
Não use `import`/`export`. O arquivo é carregado como `<script>` depois de `data.js` e `anpad.js`.

## Formato de uma lição (níveis 1 a 4)
Copie a estrutura das lições existentes em `data.js` (`LESSONS`). Campos:
- `id`: único, kebab-case em inglês (confira que não existe em `data.js`, `anpad.js` nem nos outros arquivos de `lessons/`).
- `strategy`: uma chave de `STRATEGIES` em `data.js` (prediction, skimming, scanning, cognatos, falsos, repetidas, inferencia, referencia, conectivos, afixos, estrutura, eliminacao).
- `level`, `theme` (`"F1"`, `"Tecnologia"`, `"Economia"`, `"Cotidiano"`), `title` (em inglês, curto).
- `context`, `predict` (em português): situação e pergunta de pré-leitura.
- `cognates`: 3 a 6 palavras do texto parecidas com o português.
- O texto: `text` (string) para textos corridos, **ou** `radio` (array de `["Engineer"|"Driver", "fala"]`) para rádio de F1.
- `questions`: **6 ou 7** perguntas `{ t, q, opts, a, why }`:
  - `t`: tipo, uma chave de `QTYPES` (G ideia geral, E informação específica, D detalhe, I inferência, R referência, V vocabulário no contexto, O opinião/atitude, P propósito/organização, C conectivos).
  - Cada lição deve ter pelo menos: 1 G (normalmente a primeira), 1 R, 1 V. Do nível 3 em diante, também 1 I ou O.
  - `q` e `opts` em português, com 3 alternativas (níveis 1–2) ou 4 alternativas (níveis 3–4).
  - `a`: índice da correta. **Varie a posição** da correta entre as perguntas (não concentre em 1).
  - Distratores plausíveis: use palavras do texto em relação errada, exageros (sempre/nunca) e informações que o texto não diz. Nada de alternativa absurda.
  - A pergunta **não pode entregar a resposta** (não cite na pergunta o trecho que a responde).
  - **Uma pergunta também não pode entregar a resposta de outra.** O erro mais comum: a pergunta de vocabulário (V) pede o sentido de uma palavra que outra pergunta ou alternativa já traduziu (ex.: a V pergunta “delayed” e outra pergunta diz “por que atrasou?”). Releia o conjunto inteiro antes de terminar.
  - **Opinião/atitude (O):** a certa não pode ser sempre a única alternativa “equilibrada” contra três extremas. Inclua pelo menos um distrator também moderado, que pareça certo mas o texto desminta (ex.: inverte a ordem dos fatos ou atribui uma atitude que o texto nega).
  - `why` em português: cite o trecho do texto entre aspas e explique por que está certa; quando útil, diga por que o distrator principal está errado.
- `grammar`: `{ title, body, examples: [...] }`, **um** ponto-chave tirado do próprio texto, curto, que muda o sentido (ex.: conectivo, tempo verbal, referência, modal, grupo nominal, negação, comparativo, voz passiva, phrasal verb). Evite repetir os pontos já usados nas lições existentes do mesmo nível.
- `vocab`: 7 a 9 itens `[termo, significado em pt, exemplo]`. **O termo precisa aparecer literalmente no texto** (mesma forma, ex.: "rose", não "rise"), porque o app sublinha essas palavras no texto.
- `write`: uma pergunta curta e opcional para o aluno responder em uma frase.

## Formato das lições do nível 5 (ANPAD)
Siga `anpad.js`: `exam: true`, `theme: "ANPAD"`, `paras` (array de parágrafos), `source` (diga que é texto original e que pessoas/estudos são fictícios), perguntas em **inglês** com `qpt` (tradução em português), **5 alternativas** (A–E), `why` em português. Para citar linha, escreva `{{trecho}}` na pergunta: o trecho tem de aparecer **literalmente** no texto (o app converte em "line N"). Tipos de pergunta como na prova: propósito ("The authors state that their paper…"), detalhe ("According to the text…"), função de exemplo ("X is mentioned to illustrate…"), próxima seção, vocabulário/expressão pelo contexto, conectivo (substituir por equivalente), referência (THIS, IT, THEY, WHICH, ONE…), EXCEPT FOR, atitude do autor. 8 a 10 perguntas por lição.

## Extensão e dificuldade por nível
- Nível 1 (≈ A1): 30 a 60 palavras; frases curtas, presente simples, vocabulário muito frequente.
- Nível 2 (≈ A2): 50 a 90 palavras; passado e futuro simples, conectivos básicos.
- Nível 3 (≈ B1): 70 a 120 palavras; textos do dia a dia e do trabalho, conectivos de contraste, modais.
- Nível 4 (≈ B2): 90 a 150 palavras; reportagens e opinião, posição do autor, argumentos contrários.
- Nível 5 (≈ B2+/C1): introdução de artigo acadêmico de Administração (350–420 palavras, com citações fictícias tipo "Silva and Moreau (2019)") ou texto de revista de negócios (150–300 palavras).

## Regras de conteúdo
- Textos **originais** (não copie textos publicados). Rádio de F1 no estilo das transmissões, com equipes e pilotos genéricos ou fictícios: nunca atribua falas a pilotos reais.
- Fatos gerais corretos (termos de F1, economia e tecnologia usados com precisão).
- Inglês natural e correto; ortografia britânica ou americana, mas consistente dentro da lição.
- Português do Brasil, claro e direto.
- Varie os assuntos: não repita temas das lições existentes.

## Antes de terminar
Rode `node lessons/validate.js` (se existir) ou, no mínimo, `node -e "require('fs')"`-style: carregue `data.js`, `anpad.js` e seu arquivo num mesmo contexto com `eval` e confira que não há erro de sintaxe, que os ids são únicos, que cada termo de `vocab` aparece no texto e que cada `{{trecho}}` aparece no texto.
