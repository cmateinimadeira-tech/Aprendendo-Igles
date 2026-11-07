// Leitura extensiva — nível 4. Textos originais.
READINGS.push(
  {
    id: "r4-how-your-phone-finds-you",
    level: 4,
    topic: "Tecnologia",
    title: "How does your phone know where you are?",
    paras: [
      "When you open a map on your phone, a small blue dot shows where you are, often within a few meters. Most people imagine that the phone sends a signal up to space and waits for an answer. In fact, the opposite is true. A GPS receiver never sends anything; it only listens. Around the Earth, about thirty satellites travel along fixed paths, and each one keeps sending out a simple message: its position and the exact time the message left.",
      "The trick is in the timing. Radio signals travel at the speed of light, so a message from a satellite takes only a tiny part of a second to arrive. By measuring this delay, the phone can calculate how far away each satellite is. One distance alone is not enough, whereas several distances together point to a single place. Due to small errors in the cheap clock inside the phone, the receiver needs signals from at least four satellites: three to find the position and one more to correct the time. In other words, GPS is really a system for measuring time very precisely.",
      "This precision matters more than most users realize. A clock error of just one millionth of a second would move the blue dot by about 300 meters, because light travels that far in that time. Moreover, the satellite clocks have to be adjusted for effects predicted by Einstein's theory of relativity: time runs at a slightly different speed high above the Earth, where gravity is weaker and the satellites move very fast. Without these corrections, the errors would grow by several kilometers every day.",
      "Nevertheless, GPS has clear limits. Inside buildings or between tall towers, signals from space are weak or blocked, and the dot starts to jump around. As a result, modern phones combine GPS with other clues, such as nearby Wi-Fi networks and mobile phone towers, which also help them find a position faster. On the other hand, this mix of methods means that a phone can often estimate its location even where no satellite signal reaches it, for example inside a shopping center."
    ],
    gloss: [["satellites", "satélites"], ["satellite", "satélite"], ["receiver", "receptor"]],
    check: { q: "Qual é a ideia principal do texto?", opts: ["O GPS calcula a posição medindo com muita precisão o tempo que os sinais dos satélites levam para chegar.", "O celular envia sinais aos satélites e espera uma resposta para saber onde está.", "O GPS funciona melhor dentro de prédios do que ao ar livre."], a: 0 }
  },
  {
    id: "r4-the-cloud-is-a-building",
    level: 4,
    topic: "Tecnologia",
    title: "The cloud is not in the sky",
    paras: [
      "Every time you save a photo \"to the cloud\", watch a series online or send a message, your data travels to a very real place: a data center. These are huge buildings full of computers called servers, arranged in long rows and connected by kilometers of cables. The word \"cloud\" suggests something light and invisible, whereas the reality is concrete, steel and the constant noise of fans. Large technology companies run many of these centers in different parts of the world.",
      "The main reason for this design is reliability. When you upload a file, it is usually copied to several machines, often in different cities. Therefore, if one hard disk fails or a whole building loses power, your file is still safe somewhere else. In other words, the cloud works because it never trusts a single computer. This is also why popular online services rarely disappear completely, despite the fact that individual machines break down every day.",
      "Running so many computers has a cost. Servers turn electricity into heat, and too much heat can damage them, so data centers spend a large part of their energy on cooling. Due to this problem, companies often look for places with cheap electricity and a cool climate; some centers have been built in northern countries such as Finland, Sweden and Ireland, where cold air from outside can help keep the machines at a safe temperature. Moreover, many centers use large amounts of water for cooling, which has become a topic of public debate in dry regions.",
      "The growth of artificial intelligence has made this question even more important, because training and running large AI models requires enormous computing power. As a result, energy companies, governments and environmental groups now follow the expansion of data centers closely. Nevertheless, the cloud also brings benefits: sharing big, well-managed centers is usually more efficient than having every small company keep its own servers in a back room. The next time you save a file, remember that it has a physical home, and that home needs electricity."
    ],
    gloss: [["servers", "servidores"], ["cooling", "resfriamento"], ["upload", "enviar (para a internet)"]],
    check: { q: "Qual é a ideia principal do texto?", opts: ["A 'nuvem' é formada por grandes prédios cheios de computadores, que precisam de muita energia e refrigeração.", "A 'nuvem' guarda os arquivos em satélites, longe da Terra.", "Os data centers estão desaparecendo por causa da inteligência artificial."], a: 0 }
  },
  {
    id: "r4-why-reading-a-lot-works",
    level: 4,
    topic: "Aprender inglês",
    title: "Why reading a lot beats memorizing lists",
    paras: [
      "Many adult learners try to build their vocabulary by memorizing long lists of words. This method feels productive, and it can help at the beginning. Nevertheless, researchers who study language learning have pointed out its limits: a word learned alone in a list is easy to forget, and knowing its translation does not mean knowing how to use it. In real texts, a word always comes with company, that is, the verbs, nouns and prepositions that usually appear around it.",
      "Extensive reading offers a different path. Instead of studying difficult texts slowly with a dictionary, the learner reads large amounts of easy material, for pleasure and without stopping much. The New Zealand researcher Paul Nation, among others, has argued that this works best when the reader already knows about 95 to 98 percent of the words on the page. In other words, a page of 300 words should contain no more than six to fifteen unknown words. At that level, the context helps the reader guess the meaning of new words, whereas a harder text turns reading into a slow puzzle.",
      "The real power of this method is repetition. A single meeting with a word is rarely enough; most learners need to see it many times, in different sentences, before it becomes theirs. Simple books for learners are written precisely so that the most frequent words keep coming back. As a result, the reader learns not only the meaning of a word but also its typical partners, such as \"make a decision\" or \"take a risk\". Moreover, reading fluently trains the brain to process English faster, which is essential in timed exams.",
      "On the other hand, extensive reading is not magic. It takes time, and its effects appear slowly, over months rather than days. Therefore, it works best together with some focused study: reviewing key words, noticing grammar that changes the meaning of a sentence, and practicing with exam questions. Despite these limits, it has one great advantage over lists: people actually enjoy it, and a habit you enjoy is a habit you keep."
    ],
    gloss: [["memorizing", "decorar, memorizar"], ["puzzle", "quebra-cabeça"]],
    check: { q: "Qual é a ideia principal do texto?", opts: ["Ler muito material fácil ajuda a fixar vocabulário, porque as palavras se repetem em contexto.", "Decorar listas de palavras é o único método que funciona para adultos.", "Para aprender inglês, é preciso ler textos difíceis com o dicionário."], a: 0 }
  },
  {
    id: "r4-why-companies-recall-products",
    level: 4,
    topic: "Economia",
    title: "Why do companies recall their own products?",
    paras: [
      "Every year, car makers, toy companies and food producers announce that some of their products must come back. This process is called a recall: the company asks customers to return an item, or to bring it in for repair, because it may be unsafe. At first sight, a recall looks like a disaster for any business. It costs a lot of money, it creates bad news, and it admits a mistake in public. Why, then, do companies do it?",
      "The first reason is the law. In many countries, government agencies can order a recall when a product puts people at risk, and companies that hide a known problem can face heavy fines. However, most recalls are actually started by the companies themselves, because the alternative is usually worse. If a dangerous product injures people, the company may face expensive court cases, and the damage to its reputation can last for years. Therefore, a quick recall is often the cheaper option in the long run.",
      "A famous example is the Samsung Galaxy Note 7. In 2016, shortly after the phone was launched, reports appeared of batteries getting too hot and catching fire. Samsung first replaced the phones, but some of the new ones had the same problem, and the company finally stopped making the model altogether. The decision cost a great deal of money. Nevertheless, the brand survived, and the phones it launched in the following years continued to sell well.",
      "Recalls also show how modern production works. Due to global supply chains, a single bad part from one supplier can end up in millions of cars from several different brands. As a result, one problem can lead to recalls across a whole industry. On the other hand, better tracking systems now allow companies to identify exactly which products are affected, whereas in the past they often had to call back everything. In other words, a recall is not only a sign of failure; it is also a sign that a company is still watching its products after they leave the factory."
    ],
    gloss: [["recall", "recall, convocação para devolução ou reparo"], ["recalls", "recalls"], ["injures", "fere, machuca"], ["supplier", "fornecedor"]],
    check: { q: "Qual é a ideia principal do texto?", opts: ["Apesar do custo, fazer recall costuma ser melhor para a empresa do que esconder um problema de segurança.", "Recalls só acontecem quando o governo obriga a empresa.", "Depois de um recall, as empresas quase sempre vão à falência."], a: 0 }
  },
  {
    id: "r4-why-everything-is-a-subscription",
    level: 4,
    topic: "Economia",
    title: "Why is everything becoming a subscription?",
    paras: [
      "Music, films, software, online storage and even food delivery: more and more things are now sold as subscriptions. Instead of paying once and owning a product, the customer pays a smaller amount every month for access to it. For companies, this model has a clear attraction. A one-time sale brings money only once, whereas a subscription brings a steady flow of income. Therefore, businesses can plan their spending, hire staff and invest with more confidence, because they can predict roughly how much money will come in next month.",
      "For customers, the advantages are also real. The price at the start is low, so people can use expensive software or huge music libraries without paying a large amount at once. Moreover, the product is often updated automatically, and the customer can usually cancel when they no longer need it. In other words, a subscription moves part of the risk from the buyer to the seller: if the service gets worse, people can simply leave.",
      "However, the model also depends on something less pleasant: human inertia. Behavioral economists have shown that people tend to stay with the default option, that is, the choice that happens automatically if they do nothing. A subscription continues by itself unless the customer takes action. As a result, many people keep paying for services they hardly use, simply because cancelling takes effort or because they forget. Free trials work in a similar way: they often ask for a credit card at the start and then begin charging when the trial ends.",
      "Despite these advantages for business, there are signs that customers are getting tired. When a family adds up all its monthly payments, the total can be surprisingly high, and many people now review their subscriptions and cut the ones they do not use. Some governments have also acted; in Germany, for instance, websites that sell subscriptions must show a clear button for cancelling them. Nevertheless, the model is unlikely to disappear. For companies, a loyal subscriber is worth much more than a single sale."
    ],
    gloss: [["subscription", "assinatura"], ["subscriptions", "assinaturas"], ["subscriber", "assinante"], ["inertia", "inércia"], ["cancelling", "cancelar"]],
    check: { q: "Qual é a ideia principal do texto?", opts: ["As assinaturas dão renda previsível às empresas e também se aproveitam da tendência das pessoas de não cancelar.", "As assinaturas são sempre mais caras do que comprar o produto de uma vez.", "Os governos proibiram as assinaturas na Europa."], a: 0 }
  },
  {
    id: "r4-why-the-sky-is-blue",
    level: 4,
    topic: "Curiosidades",
    title: "Why is the sky blue and the sunset red?",
    paras: [
      "Sunlight looks white, but it is actually a mix of all the colors of the rainbow. Each color is a light wave with a different length: red light has the longest waves, whereas blue and violet light have the shortest. You can see this mix when sunlight passes through raindrops and separates into a band of colors. The color of the sky depends on what happens to these waves on their way through the air.",
      "The air around us is made mostly of tiny particles of gas, much smaller than the waves of light. When sunlight hits them, part of it is scattered, that is, sent off in every direction. Short waves are scattered much more strongly than long ones. As a result, blue light spreads across the whole sky and reaches our eyes from every direction, while most of the red and yellow light continues in a straight line. In other words, when you look at any part of the sky away from the sun, you are seeing scattered blue light. Scientists call this effect Rayleigh scattering, after the British physicist Lord Rayleigh, who explained it in the nineteenth century.",
      "If short waves are scattered most, why is the sky not violet? There are several reasons. The sun sends out less violet light than blue light, and some violet light is absorbed high in the atmosphere. Moreover, our eyes are much more sensitive to blue than to violet. Therefore, the mix of scattered colors that reaches us looks sky blue rather than purple.",
      "The same physics explains red sunsets. When the sun is low on the horizon, its light has to travel through much more air before it reaches us. Due to this longer path, most of the blue light is scattered away before it arrives, and the light that remains is mainly orange and red. Dust and smoke in the air can make sunsets even more colorful. On the other hand, on the Moon, which has no air, the sky stays black even during the day. Despite its simple appearance, then, a blue sky is a daily lesson in physics."
    ],
    gloss: [["scattered", "espalhada, dispersa"], ["scattering", "espalhamento, dispersão"], ["violet", "violeta"], ["rainbow", "arco-íris"]],
    check: { q: "Qual é a ideia principal do texto?", opts: ["O céu é azul porque o ar espalha a luz azul muito mais do que a vermelha; no pôr do sol, a luz azul se perde no caminho.", "O céu é azul porque reflete a cor dos oceanos.", "O céu da Lua é azul durante o dia, como o da Terra."], a: 0 }
  },
);
