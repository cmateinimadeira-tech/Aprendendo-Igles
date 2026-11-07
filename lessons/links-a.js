// Banco do treino de palavras de ligação (níveis 2–3). Frases originais.
LINK_WORDS.push(
  { w: "and", pt: "e", rel: "adição", level: 2, tip: "Soma duas ideias ou ações do mesmo lado, sem oposição nem causa." },
  { w: "but", pt: "mas", rel: "contraste", level: 2, tip: "Liga duas ideias opostas ou uma ideia a algo inesperado; costuma vir no meio da frase, depois de vírgula." },
  { w: "so", pt: "então, por isso", rel: "consequência", level: 2, tip: "Introduz o resultado; a causa vem antes. Não confunda com “so that” (para que)." },
  { w: "because", pt: "porque", rel: "causa", level: 2, tip: "Introduz a causa (uma frase com verbo). O resultado costuma vir antes." },
  { w: "because of", pt: "por causa de", rel: "causa", level: 3, tip: "Como “because”, mas seguido de substantivo, não de frase: because of the rain." },
  { w: "or", pt: "ou; senão", rel: "alternativa", level: 2, tip: "Alternativa: uma coisa ou outra. Depois de uma ordem, quer dizer “senão”: Hurry, or you'll be late." },
  { w: "then", pt: "depois, em seguida; então", rel: "sequência", level: 2, tip: "Marca o próximo passo de uma sequência. Em “if… then” quer dizer “então”." },
  { w: "after that", pt: "depois disso", rel: "sequência", level: 2, tip: "Mostra que um fato vem depois do que foi dito antes; costuma abrir a frase, com vírgula." },
  { w: "first", pt: "primeiro, em primeiro lugar", rel: "sequência", level: 2, tip: "Abre uma lista de passos ou argumentos; espere um “then”, “next” ou “finally” depois." },
  { w: "finally", pt: "por fim; finalmente", rel: "sequência", level: 2, tip: "Marca o último passo de uma lista ou algo que acontece depois de muita espera." },
  { w: "when", pt: "quando", rel: "tempo", level: 2, tip: "Diz em que momento algo acontece; também introduz perguntas (When…?)." },
  { w: "while", pt: "enquanto", rel: "tempo", level: 2, tip: "Duas ações ao mesmo tempo. Em textos formais também pode marcar contraste (= ao passo que)." },
  { w: "until", pt: "até (que)", rel: "tempo", level: 2, tip: "Marca o ponto em que algo para: wait until 5 = espere até as 5." },
  { w: "before", pt: "antes (de)", rel: "tempo", level: 2, tip: "O fato da frase com “before” acontece depois do outro: Read it before you sign = leia, depois assine." },
  { w: "after", pt: "depois (de/que)", rel: "tempo", level: 2, tip: "O fato da frase com “after” acontece primeiro: After the meeting ended, we left." },
  { w: "if", pt: "se", rel: "condição", level: 2, tip: "Introduz uma condição; o resultado só acontece se ela for verdadeira." },
  { w: "unless", pt: "a menos que, a não ser que", rel: "condição", level: 3, tip: "= if… not. “Unless sales improve” = se as vendas NÃO melhorarem. Cuidado para não ler como “if”." },
  { w: "although", pt: "embora", rel: "concessão", level: 3, tip: "Apresenta um fato que não impede o outro: embora X, Y acontece mesmo assim." },
  { w: "even though", pt: "mesmo que, apesar de que", rel: "concessão", level: 3, tip: "Como “although”, porém mais forte: destaca que o resultado é surpreendente." },
  { w: "however", pt: "porém, no entanto", rel: "contraste", level: 2, tip: "Introduz uma ideia que vai contra a anterior; costuma vir no início da frase, seguido de vírgula." },
  { w: "instead", pt: "em vez disso", rel: "contraste", level: 3, tip: "Troca uma coisa por outra: a primeira não acontece, a segunda acontece no lugar dela. Vem sozinho, no início ou no fim da frase." },
  { w: "instead of", pt: "em vez de", rel: "contraste", level: 3, tip: "Seguido de substantivo ou verbo com -ing: instead of driving. O que vem depois dele NÃO acontece." },
  { w: "for example", pt: "por exemplo", rel: "exemplo", level: 2, tip: "Apresenta um caso concreto da ideia geral dita antes." },
  { w: "such as", pt: "como, tal como", rel: "exemplo", level: 2, tip: "Introduz exemplos dentro da frase, logo depois de um substantivo: devices such as phones." },
  { w: "as well as", pt: "além de, assim como", rel: "adição", level: 3, tip: "Soma um item ao outro (= and also). Não confunda com a comparação “as well as” = tão bem quanto (she sings as well as you)." },
  { w: "also", pt: "também", rel: "adição", level: 2, tip: "Acrescenta uma informação; costuma ficar antes do verbo principal ou depois de “is/are”." },
  { w: "too", pt: "também", rel: "adição", level: 2, tip: "= também, no fim da frase: I like it too. Antes de adjetivo muda de sentido: too expensive = caro demais." },
  { w: "both… and", pt: "tanto… quanto; os dois", rel: "adição", level: 2, tip: "Soma dois elementos e destaca que vale para os dois: both cheap and fast." },
  { w: "either… or", pt: "ou… ou", rel: "alternativa", level: 3, tip: "Duas alternativas e só uma delas: either today or tomorrow. Depois de “either”, espere um “or”." },
  { w: "so that", pt: "para que", rel: "finalidade", level: 3, tip: "Introduz o objetivo, com sujeito e verbo (muitas vezes com can/could). Diferente de “so” (por isso)." },
  { w: "in order to", pt: "para, a fim de", rel: "finalidade", level: 3, tip: "Introduz o objetivo, seguido de verbo no infinitivo: in order to save money." },
  { w: "since", pt: "já que, como; desde", rel: "causa", level: 3, tip: "No início da frase e sem data, costuma ser causa (= já que). Com data ou período (since 2020) é “desde”." },
  { w: "as a result", pt: "como resultado, por isso", rel: "consequência", level: 3, tip: "Abre a frase do efeito; a causa está na frase anterior." },
  { w: "still", pt: "ainda assim; ainda", rel: "concessão", level: 3, tip: "No início, com vírgula, = ainda assim (concessão). Antes do verbo ou do adjetivo, = ainda (algo continua)." },
  { w: "yet", pt: "ainda (não); já (em perguntas)", rel: "tempo", level: 3, tip: "Em frases negativas, no fim: not yet = ainda não (mas deve acontecer). Em perguntas, = já: Have you finished yet?" },
  { w: "already", pt: "já", rel: "tempo", level: 2, tip: "Algo aconteceu antes do esperado ou antes de outro fato." },
  { w: "almost", pt: "quase", rel: "grau", level: 2, tip: "Chegou perto, mas não aconteceu: almost won = não ganhou." },
  { w: "hardly", pt: "mal, quase não", rel: "grau", level: 3, tip: "Sentido negativo, apesar da cara: hardly = quase nada. Não tem nada a ver com “hard” (duro, difícil)." },
  { w: "only", pt: "só, apenas", rel: "grau", level: 2, tip: "Restringe e sugere que é pouco: only 10% = só 10%." },
  { w: "just", pt: "acabou de; só, apenas", rel: "tempo", level: 2, tip: "Com “have/has”, = acabou de (tempo). Antes de substantivo ou número, = só, apenas." }
);
LINK_ITEMS.push(
  // and
  { id: "and-1", w: "and", level: 2, kind: "lacuna", s: "She finished the report on Friday, ___ she sent it to her boss the same day.", opts: ["although", "and", "because", "unless"], a: 1, why: "São duas ações do mesmo lado, uma depois da outra, sem oposição nem causa: adição → and." },
  { id: "and-2", w: "and", level: 2, kind: "relacao", s: "The team hired two engineers and bought new laptops for everyone.", opts: ["causa", "contraste", "adição", "condição"], a: 2, why: "“and” soma duas ações da equipe (contratou + comprou); uma não explica nem contraria a outra." },

  // but
  { id: "but-1", w: "but", level: 2, kind: "lacuna", s: "The hotel was very cheap, ___ the rooms were clean and quiet.", opts: ["so", "because", "if", "but"], a: 3, why: "Hotel barato faz esperar quartos ruins; a segunda parte quebra essa expectativa: contraste → but." },
  { id: "but-2", w: "but", level: 2, kind: "sentido", s: "The driver was fast in practice, but he crashed early in the race.", q: "O que a frase diz sobre a corrida?", opts: ["Ele bateu, apesar de ter sido rápido no treino", "Ele bateu porque foi rápido demais no treino", "Ele também foi rápido na corrida", "Ele não largou na corrida"], a: 0, why: "“but” opõe as duas partes: foi bem no treino, mas bateu na corrida. Não diz que uma coisa causou a outra." },

  // so
  { id: "so-1", w: "so", level: 2, kind: "lacuna", s: "Our train was cancelled, ___ we took a taxi to the airport.", opts: ["so", "because", "although", "unless"], a: 0, why: "Pegar um táxi é o resultado de o trem ter sido cancelado: consequência → so. “because” inverteria a ordem causa → efeito." },
  { id: "so-2", w: "so", level: 2, kind: "relacao", s: "Interest rates went up, so many families stopped buying new cars.", opts: ["contraste", "consequência", "causa", "exemplo"], a: 1, why: "A causa (juros subiram) vem antes; “so” introduz o efeito (famílias pararam de comprar)." },

  // because
  { id: "because-1", w: "because", level: 2, kind: "sentido", s: "Ana left the meeting early because her son was sick.", q: "Por que Ana saiu cedo da reunião?", opts: ["Ela saiu, embora o filho estivesse doente", "O filho ficou doente porque ela saiu", "Porque o filho estava doente", "Para o filho ir à reunião"], a: 2, why: "O que vem depois de “because” é a causa: o filho doente explica a saída." },
  { id: "because-2", w: "because", level: 2, kind: "lacuna", s: "We missed the start of the race ___ the traffic was terrible.", opts: ["because", "although", "so", "unless"], a: 0, why: "O trânsito ruim explica por que perdemos a largada: causa → because. Com “so”, o trânsito viraria efeito." },

  // because of
  { id: "because-of-1", w: "because of", level: 3, kind: "lacuna", s: "Our flight to Recife was delayed ___ the heavy rain.", opts: ["instead of", "because of", "such as", "as well as"], a: 1, why: "A chuva explica o atraso, e depois do espaço vem um substantivo (the heavy rain): causa → because of." },
  { id: "because-of-2", w: "because of", level: 3, kind: "relacao", s: "Because of the new tax, imported phones are more expensive this year.", opts: ["finalidade", "condição", "concessão", "causa"], a: 3, why: "O novo imposto é o motivo de os celulares estarem mais caros: “because of” + substantivo = causa." },

  // or
  { id: "or-1", w: "or", level: 2, kind: "lacuna", s: "You can pay by card now, ___ you can pay in cash when you arrive.", opts: ["so", "or", "because", "although"], a: 1, why: "São duas formas de pagar e você escolhe uma: alternativa → or." },
  { id: "or-2", w: "or", level: 2, kind: "sentido", s: "Send the file today or the client will cancel the order.", q: "O que acontece se o arquivo não for enviado hoje?", opts: ["O cliente cancela mesmo se o arquivo for enviado", "O cliente faz um pedido maior", "O cliente cancela o pedido", "O arquivo é enviado porque o cliente cancelou"], a: 2, why: "Depois de uma ordem (Send…), “or” = senão: se não enviar, o cliente cancela." },

  // then
  { id: "then-1", w: "then", level: 2, kind: "lacuna", s: "Turn off the computer. ___, unplug it and wait ten seconds.", opts: ["As a result", "For example", "Then", "However"], a: 2, why: "São instruções em ordem (desligue → tire da tomada): sequência → Then." },
  { id: "then-2", w: "then", level: 2, kind: "relacao", s: "The driver changed his tyres, and then he set the fastest lap of the race.", opts: ["sequência", "contraste", "condição", "exemplo"], a: 0, why: "“then” coloca os fatos em ordem: primeiro trocou os pneus, depois fez a volta mais rápida." },

  // after that
  { id: "after-that-1", w: "after that", level: 2, kind: "sentido", s: "The company cut its prices in March. After that, sales doubled.", q: "Quando as vendas dobraram?", opts: ["Antes do corte de preços", "Depois do corte de preços", "Ao mesmo tempo que o corte", "Em vez do corte de preços"], a: 1, why: "“After that” = depois disso: primeiro o corte em março, depois as vendas dobraram." },
  { id: "after-that-2", w: "after that", level: 2, kind: "lacuna", s: "I check my email at 8 a.m. ___, I have a short meeting with my team.", opts: ["However", "For example", "As a result", "After that"], a: 3, why: "A frase descreve a rotina em ordem (8h e-mail, depois reunião), sem oposição nem causa: sequência → After that." },

  // first
  { id: "first-1", w: "first", level: 2, kind: "lacuna", s: "___, download the app and create an account. Then choose a password.", opts: ["However", "First", "For example", "As a result"], a: 1, why: "O “Then” da frase seguinte mostra que é uma lista de passos; o primeiro passo abre com First." },
  { id: "first-2", w: "first", level: 2, kind: "relacao", s: "First, the engineers test the car in a wind tunnel; later, they test it on the track.", opts: ["causa", "adição", "sequência", "concessão"], a: 2, why: "“First” e “later” organizam as etapas em ordem: sequência." },

  // finally
  { id: "finally-1", w: "finally", level: 2, kind: "sentido", s: "We tested the new app for six months. Finally, we launched it in October.", q: "O que a frase diz sobre o lançamento?", opts: ["Aconteceu antes dos testes", "Aconteceu apesar de os testes terem falhado", "Foi cancelado por causa dos testes", "Aconteceu por último, depois de meses de testes"], a: 3, why: "“Finally” marca o último passo, depois de uma longa espera: primeiro seis meses de testes, por fim o lançamento." },
  { id: "finally-2", w: "finally", level: 2, kind: "lacuna", s: "Mix the flour and the eggs, add the milk, and ___ put the cake in the oven.", opts: ["finally", "instead", "also", "still"], a: 0, why: "É o último passo de uma receita (misture, adicione e… asse): sequência → finally." },

  // when
  { id: "when-1", w: "when", level: 2, kind: "lacuna", s: "My phone always gets hot ___ I play games on it.", opts: ["although", "when", "unless", "so"], a: 1, why: "A frase diz em que momento o celular esquenta (always… ao jogar): tempo → when." },
  { id: "when-2", w: "when", level: 2, kind: "relacao", s: "When the safety car came out, all the drivers slowed down.", opts: ["contraste", "finalidade", "tempo", "exemplo"], a: 2, why: "“When” indica o momento em que os pilotos reduziram: quando o safety car entrou." },

  // while
  { id: "while-1", w: "while", level: 2, kind: "lacuna", s: "Someone rang the doorbell ___ I was cooking dinner.", opts: ["while", "because", "although", "so that"], a: 0, why: "“was cooking” mostra uma ação em andamento; a campainha tocou no meio dela: tempo → while (enquanto)." },
  { id: "while-2", w: "while", level: 2, kind: "sentido", s: "While the mechanics changed the tyres, the driver drank some water.", q: "Quando o piloto bebeu água?", opts: ["Depois que os mecânicos terminaram", "Em vez de trocar os pneus", "Porque os pneus foram trocados", "Ao mesmo tempo em que os pneus eram trocados"], a: 3, why: "“While” = enquanto: as duas ações acontecem ao mesmo tempo." },

  // until
  { id: "until-1", w: "until", level: 2, kind: "lacuna", s: "Please wait here ___ the doctor calls your name.", opts: ["until", "although", "because", "so"], a: 0, why: "A espera termina quando o médico chamar: tempo (ponto final) → until." },
  { id: "until-2", w: "until", level: 2, kind: "sentido", s: "He worked at the same bank until he was 40.", q: "O que a frase diz sobre o trabalho dele no banco?", opts: ["Começou a trabalhar lá aos 40 anos", "Trabalhou lá até os 40 e depois saiu", "Trabalhou lá porque tinha 40 anos", "Ainda trabalha lá hoje"], a: 1, why: "“until” marca o fim: o trabalho no banco durou até os 40 anos, não começou nessa idade." },

  // before
  { id: "before-1", w: "before", level: 2, kind: "sentido", s: "Always read the contract carefully before you sign it.", q: "Qual é a ordem recomendada?", opts: ["Assinar e depois ler", "Ler só se for assinar", "Ler primeiro e depois assinar", "Assinar porque já leu"], a: 2, why: "A ação com “before” (sign) vem depois: primeiro ler, depois assinar." },
  { id: "before-2", w: "before", level: 2, kind: "lacuna", s: "Charge the battery ___ you leave the house in the morning.", opts: ["although", "unless", "so", "before"], a: 3, why: "É preciso carregar a bateria primeiro e sair depois: tempo → before." },

  // after
  { id: "after-1", w: "after", level: 2, kind: "lacuna", s: "We went out for dinner ___ the meeting ended.", opts: ["after", "although", "unless", "so that"], a: 0, why: "Primeiro a reunião terminou, depois saímos para jantar: tempo → after." },
  { id: "after-2", w: "after", level: 2, kind: "relacao", s: "After the strike ended, the factory went back to normal production.", opts: ["concessão", "exemplo", "finalidade", "tempo"], a: 3, why: "“After” situa os fatos no tempo: a fábrica voltou ao normal depois do fim da greve." },

  // if
  { id: "if-1", w: "if", level: 2, kind: "lacuna", s: "___ it rains on Sunday, the race will start behind the safety car.", opts: ["If", "Although", "Until", "Because"], a: 0, why: "“will start” mostra uma possibilidade futura que depende da chuva: condição → If." },
  { id: "if-2", w: "if", level: 2, kind: "sentido", s: "If you finish the course, the company will pay for it.", q: "Quando a empresa paga o curso?", opts: ["Mesmo que você não termine", "Para que você comece o curso", "Só se você terminar o curso", "Sempre, antes do início do curso"], a: 2, why: "“If” cria uma condição: o pagamento depende de você terminar o curso." },

  // unless
  { id: "unless-1", w: "unless", level: 3, kind: "sentido", s: "The store will close next year unless sales improve.", q: "Em que situação a loja vai fechar?", opts: ["Se as vendas melhorarem", "Mesmo que as vendas melhorem", "Porque as vendas melhoraram", "Se as vendas não melhorarem"], a: 3, why: "“unless” = if… not: a loja fecha se as vendas NÃO melhorarem." },
  { id: "unless-2", w: "unless", level: 3, kind: "lacuna", s: "You can't enter the building ___ you have an ID card.", opts: ["unless", "because", "although", "when"], a: 0, why: "Ter crachá é a única exceção à proibição (“can't enter”): condição negativa → unless (a menos que)." },

  // although
  { id: "although-1", w: "although", level: 3, kind: "lacuna", s: "___ his car was slower than the others, he won the race.", opts: ["Because", "If", "Although", "When"], a: 2, why: "Carro mais lento faz esperar derrota, mas ele venceu: um fato que não impediu o outro → Although (embora)." },
  { id: "although-2", w: "although", level: 3, kind: "relacao", s: "Although the job pays well, she decided to leave the company.", opts: ["concessão", "causa", "finalidade", "adição"], a: 0, why: "O bom salário seria motivo para ficar, mas não impediu a saída: concessão (embora)." },

  // even though
  { id: "even-though-1", w: "even though", level: 3, kind: "sentido", s: "Even though prices went up, people kept buying the new phone.", q: "O que aconteceu com as compras do celular?", opts: ["Pararam por causa da alta dos preços", "Continuaram, apesar da alta dos preços", "Continuaram por causa da alta dos preços", "Os preços subiram porque as pessoas pararam de comprar"], a: 1, why: "“Even though” = mesmo que: a alta dos preços não impediu as compras (kept buying)." },
  { id: "even-though-2", w: "even though", level: 3, kind: "lacuna", s: "She went to work on Monday ___ she had a bad cold.", opts: ["even though", "because", "so that", "until"], a: 0, why: "Um resfriado forte seria motivo para ficar em casa, mas ela foi trabalhar mesmo assim: concessão → even though." },

  // however
  { id: "however-1", w: "however", level: 2, kind: "lacuna", s: "The new app is fast. ___, it uses a lot of battery.", opts: ["However", "Because", "For example", "So"], a: 0, why: "A segunda frase traz um ponto negativo depois de um positivo: contraste → However (porém)." },
  { id: "however-2", w: "however", level: 2, kind: "sentido", s: "Sales went up in May. However, profits fell.", q: "Pela frase, o que aconteceu com os lucros?", opts: ["Caíram por causa da alta nas vendas", "Subiram junto com as vendas", "Não mudaram", "Caíram, apesar da alta nas vendas"], a: 3, why: "“However” marca contraste: as vendas subiram, mas os lucros caíram. A frase não diz que uma coisa causou a outra." },

  // instead
  { id: "instead-1", w: "instead", level: 3, kind: "lacuna", s: "Don't take the bus to the stadium. ___, take the metro; it's much faster.", opts: ["Also", "As a result", "For example", "Instead"], a: 3, why: "“Don't take the bus” + outra opção no lugar: o metrô substitui o ônibus → Instead (em vez disso)." },
  { id: "instead-2", w: "instead", level: 3, kind: "relacao", s: "He didn't drive to work this week. Instead, he rode his bike.", opts: ["causa", "contraste", "tempo", "exemplo"], a: 1, why: "“Instead” troca uma coisa pela outra: não foi de carro, foi de bicicleta no lugar. É um tipo de contraste." },

  // instead of
  { id: "instead-of-1", w: "instead of", level: 3, kind: "lacuna", s: "Many people now use their phones ___ credit cards to pay in shops.", opts: ["because of", "instead of", "such as", "after"], a: 1, why: "O celular ocupa o lugar do cartão na hora de pagar: substituição → instead of (em vez de)." },
  { id: "instead-of-2", w: "instead of", level: 3, kind: "sentido", s: "The bank decided to improve its app instead of opening new branches.", q: "O que o banco decidiu fazer?", opts: ["Abrir novas agências e também melhorar o app", "Abrir agências para melhorar o app", "Melhorar o app e não abrir novas agências", "Abrir agências porque melhorou o app"], a: 2, why: "O que vem depois de “instead of” NÃO acontece: o banco melhora o app no lugar de abrir agências." },

  // for example
  { id: "for-example-1", w: "for example", level: 2, kind: "lacuna", s: "Many companies now use AI. ___, some banks use it to answer customers.", opts: ["However", "Instead", "As a result", "For example"], a: 3, why: "A segunda frase dá um caso concreto (bancos) da ideia geral (muitas empresas usam IA): exemplo → For example." },
  { id: "for-example-2", w: "for example", level: 2, kind: "relacao", s: "Some Brazilian cities have good public transport. For example, Curitiba has fast bus lanes.", opts: ["exemplo", "consequência", "contraste", "condição"], a: 0, why: "Curitiba é um caso concreto de “cidades com bom transporte”: exemplo." },

  // such as
  { id: "such-as-1", w: "such as", level: 2, kind: "lacuna", s: "The shop sells small devices ___ headphones, chargers and smart watches.", opts: ["instead of", "because of", "such as", "after"], a: 2, why: "Fones, carregadores e relógios são exemplos de “small devices”: exemplo dentro da frase → such as." },
  { id: "such-as-2", w: "such as", level: 2, kind: "sentido", s: "Fruits such as bananas and oranges are cheap at the market this month.", q: "O que a frase diz sobre bananas e laranjas?", opts: ["Estão baratas por causa das outras frutas", "São exemplos de frutas baratas este mês", "São as únicas frutas caras este mês", "Estão caras, ao contrário das outras frutas"], a: 1, why: "“such as” introduz exemplos: bananas e laranjas são exemplos de frutas que estão baratas." },

  // as well as
  { id: "as-well-as-1", w: "as well as", level: 3, kind: "lacuna", s: "The new phone has a better camera ___ a bigger battery.", opts: ["as well as", "instead of", "because of", "such as"], a: 0, why: "São duas vantagens do celular somadas (câmera + bateria): adição → as well as." },
  { id: "as-well-as-2", w: "as well as", level: 3, kind: "sentido", s: "The team will hire a designer as well as two programmers.", q: "Quantas pessoas a equipe vai contratar?", opts: ["Duas: só os programadores", "Uma: um designer em vez de dois programadores", "Nenhuma, por causa dos custos", "Três: um designer e dois programadores"], a: 3, why: "“as well as” = além de: soma o designer aos dois programadores." },

  // also
  { id: "also-1", w: "also", level: 2, kind: "lacuna", s: "The online course is cheap. It is ___ short, so you can finish it in a week.", opts: ["hardly", "still", "also", "instead"], a: 2, why: "Mais uma vantagem soma-se à primeira (barato + curto), e o “so you can finish in a week” confirma que é curto: adição → also." },
  { id: "also-2", w: "also", level: 2, kind: "relacao", s: "The app tracks your spending. It also helps you plan a monthly budget.", opts: ["contraste", "condição", "exemplo", "adição"], a: 3, why: "“also” acrescenta outra função do app (acompanha gastos + ajuda no orçamento): adição." },

  // too
  { id: "too-1", w: "too", level: 2, kind: "lacuna", s: "Marta speaks Spanish at work, and she speaks French ___.", opts: ["instead", "too", "still", "then"], a: 1, why: "O “and” soma as duas línguas; no fim da frase, também = too." },
  { id: "too-2", w: "too", level: 2, kind: "sentido", s: "My brother loves watching F1, and my father does too.", q: "Quem gosta de assistir à F1?", opts: ["O irmão e o pai", "Só o irmão", "Só o pai", "O pai gosta porque o irmão gosta"], a: 0, why: "“does too” = também gosta: o pai se soma ao irmão." },

  // both… and
  { id: "both-and-1", w: "both… and", level: 2, kind: "relacao", s: "Both the driver and the team were fined after the race.", opts: ["contraste", "adição", "causa", "finalidade"], a: 1, why: "“Both… and” soma os dois: o piloto e a equipe foram multados." },
  { id: "both-and-2", w: "both… and", level: 2, kind: "sentido", s: "This course is useful both for students and for managers.", q: "Para quem o curso é útil?", opts: ["Só para estudantes", "Para gerentes, em vez de estudantes", "Para estudantes e também para gerentes", "Para nenhum dos dois grupos"], a: 2, why: "“both… and” = tanto… quanto: vale para os dois grupos." },

  // either… or
  { id: "either-or-1", w: "either… or", level: 3, kind: "sentido", s: "On Fridays, you can either work from home or come to the office.", q: "O que você pode fazer às sextas?", opts: ["Trabalhar de casa e também ir ao escritório", "Nem trabalhar de casa nem ir ao escritório", "Ir ao escritório porque trabalha de casa", "Escolher uma das duas opções: casa ou escritório"], a: 3, why: "“either… or” = ou… ou: duas alternativas e você escolhe uma." },
  { id: "either-or-2", w: "either… or", level: 3, kind: "lacuna", s: "Either the company lowers its prices, ___ it will lose customers to cheaper apps.", opts: ["but", "so", "or", "because"], a: 2, why: "A pista é o “Either” no início: ele sempre pede um “or” depois (ou baixa os preços, ou perde clientes)." },

  // so that
  { id: "so-that-1", w: "so that", level: 3, kind: "lacuna", s: "I left home early ___ I could get a good seat at the stadium.", opts: ["although", "until", "unless", "so that"], a: 3, why: "Conseguir um bom lugar é o objetivo de sair cedo; “could” depois do espaço é típico de finalidade → so that (para que)." },
  { id: "so-that-2", w: "so that", level: 3, kind: "relacao", s: "The company changed the app so that older people can use it easily.", opts: ["consequência", "finalidade", "causa", "contraste"], a: 1, why: "“so that” + can = para que: mostra o objetivo da mudança. Só “so”, sem “that”, seria consequência." },

  // in order to
  { id: "in-order-to-1", w: "in order to", level: 3, kind: "sentido", s: "The team tested a new rear wing in order to reduce drag on the straights.", q: "Por que a equipe testou a nova asa?", opts: ["Para diminuir o arrasto nas retas", "Porque o arrasto já tinha diminuído", "Apesar de querer diminuir o arrasto", "Em vez de diminuir o arrasto"], a: 0, why: "“in order to” + verbo = para: diminuir o arrasto é o objetivo do teste, não a causa." },
  { id: "in-order-to-2", w: "in order to", level: 3, kind: "relacao", s: "In order to save money, the company moved to a smaller office.", opts: ["causa", "concessão", "finalidade", "tempo"], a: 2, why: "“In order to” + verbo (save) indica o objetivo da mudança: finalidade (para economizar)." },

  // since
  { id: "since-1", w: "since", level: 3, kind: "lacuna", s: "___ the shops were closed on Sunday, we ordered our food online.", opts: ["Although", "Since", "Unless", "Until"], a: 1, why: "As lojas fechadas explicam por que pedimos online: causa → Since (já que)." },
  { id: "since-2", w: "since", level: 3, kind: "sentido", s: "Since you already know Excel, you can start with the advanced course.", q: "Por que você pode começar pelo curso avançado?", opts: ["Porque já sabe Excel", "Apesar de não saber Excel", "Para aprender Excel do zero", "Desde o dia em que aprendeu Excel"], a: 0, why: "Sem data nem período depois dele, “Since” no início é causa (= já que), não “desde”." },

  // as a result
  { id: "as-a-result-1", w: "as a result", level: 3, kind: "relacao", s: "The factory closed for two weeks. As a result, car sales fell in June.", opts: ["causa", "consequência", "contraste", "exemplo"], a: 1, why: "A causa está na primeira frase (fábrica fechada); “As a result” abre o efeito (vendas caíram)." },
  { id: "as-a-result-2", w: "as a result", level: 3, kind: "lacuna", s: "It rained heavily during qualifying. ___, most drivers chose wet tyres.", opts: ["As a result", "However", "For example", "Instead"], a: 0, why: "Escolher pneus de chuva é o efeito da chuva forte: consequência → As a result." },

  // still
  { id: "still-1", w: "still", level: 3, kind: "sentido", s: "The phone is very expensive. Still, millions of people buy it every year.", q: "Qual é a ideia da frase?", opts: ["As pessoas compram o celular porque ele é caro", "As pessoas ainda não compraram o celular", "As pessoas compram o celular, mesmo ele sendo caro", "O celular ficou mais barato"], a: 2, why: "No início, com vírgula, “Still” = ainda assim: o preço alto não impede as compras." },
  { id: "still-2", w: "still", level: 3, kind: "lacuna", s: "It's 10 p.m., and my boss is ___ working on the report.", opts: ["yet", "instead", "still", "almost"], a: 2, why: "“10 p.m.” é tarde: a ação continua, não parou → still (ainda)." },

  // yet
  { id: "yet-1", w: "yet", level: 3, kind: "lacuna", s: "The new office isn't ready ___, so we're working from home this month.", opts: ["too", "instead", "yet", "for example"], a: 2, why: "Frase negativa (isn't) + algo que deve acontecer depois: no fim, “ainda não” → yet." },
  { id: "yet-2", w: "yet", level: 3, kind: "sentido", s: "I haven't read the new contract from the bank yet.", q: "O que a pessoa diz sobre o contrato?", opts: ["Já leu o contrato", "Nunca vai ler o contrato", "Leu o contrato duas vezes", "Ainda não leu, mas pretende ler"], a: 3, why: "“haven't… yet” = ainda não: não leu até agora, mas a leitura é esperada." },

  // already
  { id: "already-1", w: "already", level: 2, kind: "lacuna", s: "Don't buy the tickets for Sunday. I've ___ bought them online.", opts: ["hardly", "already", "still", "instead"], a: 1, why: "“Don't buy” porque a compra já aconteceu: tempo (antes do esperado) → already." },
  { id: "already-2", w: "already", level: 2, kind: "sentido", s: "The race had already started when we arrived at the track.", q: "O que aconteceu primeiro?", opts: ["Chegamos antes de a corrida começar", "A corrida começou porque chegamos", "A corrida começou antes de chegarmos", "A corrida ainda não tinha começado"], a: 2, why: "“had already started” = já tinha começado: a largada veio antes da nossa chegada." },

  // almost
  { id: "almost-1", w: "almost", level: 2, kind: "sentido", s: "The young driver almost won his first race last Sunday.", q: "O piloto ganhou a corrida?", opts: ["Sim, ganhou com facilidade", "Não, mas chegou muito perto de ganhar", "Sim, ganhou por pouco", "Não, e ficou longe da vitória"], a: 1, why: "“almost won” = quase ganhou: chegou perto, mas não venceu." },
  { id: "almost-2", w: "almost", level: 2, kind: "lacuna", s: "The battery is ___ empty, so charge your laptop now.", opts: ["almost", "also", "hardly", "instead"], a: 0, why: "“so charge your laptop now” mostra urgência: a bateria está quase acabando → almost." },

  // hardly
  { id: "hardly-1", w: "hardly", level: 3, kind: "sentido", s: "I could hardly hear the speaker because the room was so noisy.", q: "A pessoa conseguiu ouvir o palestrante?", opts: ["Ouviu tudo muito bem", "Ouviu bem, apesar do barulho", "Quase não conseguiu ouvir", "Não foi à palestra"], a: 2, why: "“hardly” = quase não; o barulho da sala (“so noisy”) confirma. Não tem a ver com “hard”." },
  { id: "hardly-2", w: "hardly", level: 3, kind: "lacuna", s: "The new manager is very quiet; she ___ speaks in meetings.", opts: ["also", "instead", "then", "hardly"], a: 3, why: "“very quiet” (muito calada) leva a “quase não fala”: grau negativo → hardly." },

  // only
  { id: "only-1", w: "only", level: 2, kind: "sentido", s: "Only 10% of the workers use the new system every day.", q: "O que a frase sugere sobre o novo sistema?", opts: ["Poucos funcionários o usam", "A maioria dos funcionários o usa", "Pelo menos 10%, talvez muito mais, o usam", "Todos os funcionários o usam"], a: 0, why: "“Only” = só, apenas: indica que 10% é pouco." },
  { id: "only-2", w: "only", level: 2, kind: "lacuna", s: "The hotel was really cheap: we paid ___ 50 dollars a night.", opts: ["also", "only", "instead", "still"], a: 1, why: "“really cheap” pede um valor baixo: só 50 dólares → only." },

  // just
  { id: "just-1", w: "just", level: 2, kind: "sentido", s: "The meeting has just started, so you can still join it.", q: "Quando a reunião começou?", opts: ["Há muitas horas", "Ainda vai começar amanhã", "Já terminou", "Agora há pouco"], a: 3, why: "“has just started” = acabou de começar; por isso “you can still join”." },
  { id: "just-2", w: "just", level: 2, kind: "lacuna", s: "Don't worry, it's ___ a small mistake; you can fix it in a minute.", opts: ["also", "instead", "still", "just"], a: 3, why: "“Don't worry” e “small mistake” mostram que é pouca coisa: só, apenas → just." }
);
