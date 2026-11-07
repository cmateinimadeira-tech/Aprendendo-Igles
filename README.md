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

## Como usar
Abra `index.html` no navegador. O progresso fica salvo no próprio navegador.

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
`python3 tools/build-artifact.py <saída>.html` e publique junto com `data.js`, `anpad.js` e `app.js`.
Com login no claude.ai, o progresso também fica salvo numa área privada da conta; fora dele, só no navegador.
