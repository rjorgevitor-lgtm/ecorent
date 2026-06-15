export const processCommand = (transcript) => {
  const text = transcript.toLowerCase().trim();
  
  const commands = [
    {
      pattern: /navegar para home|ir para home|página inicial|ir para o início/i,
      action: 'NAVIGATE',
      params: { path: '/' },
      feedback: 'Com certeza! Levando você de volta para a página inicial.'
    },
    {
      pattern: /ir para meu perfil|abrir perfil|meu perfil/i,
      action: 'NAVIGATE',
      params: { path: '/profile' },
      feedback: 'Perfeito! Vamos dar uma olhada no seu perfil.'
    },
    {
      pattern: /explorar itens|buscar itens|ir para explorar/i,
      action: 'NAVIGATE',
      params: { path: '/browse' },
      feedback: 'Ótima escolha! Vamos explorar os itens maravilhosos que temos disponíveis.'
    },
    {
      pattern: /buscar (.*)/i,
      action: 'SEARCH',
      params: (match) => ({ query: match[1] }),
      feedback: (match) => `Claro! Buscando por ${match[1]} com todo carinho para você.`
    },
    {
      pattern: /ler página|ler conteúdo/i,
      action: 'READ_PAGE',
      params: {},
      feedback: 'Lendo a página para você agora mesmo.'
    },
    {
      pattern: /ler descrição/i,
      action: 'READ_DESCRIPTION',
      params: {},
      feedback: 'Claro, aqui está a descrição detalhada do item.'
    },
    {
      pattern: /ler preço/i,
      action: 'READ_PRICE',
      params: {},
      feedback: 'O valor deste item é:'
    },
    {
      pattern: /próximo item/i,
      action: 'NEXT_ITEM',
      params: {},
      feedback: 'Passando para o próximo item da nossa lista.'
    },
    {
      pattern: /item anterior/i,
      action: 'PREV_ITEM',
      params: {},
      feedback: 'Voltando um pouquinho para o item anterior.'
    },
    {
      pattern: /parar leitura|silêncio|parar de falar|obrigada gaia|obrigado gaia/i,
      action: 'STOP_READING',
      params: {},
      feedback: 'Tudo bem, ficarei em silêncio por enquanto. É só me chamar se precisar de mais alguma coisa!'
    }
  ];

  for (const cmd of commands) {
    const match = text.match(cmd.pattern);
    if (match) {
      return {
        type: cmd.action,
        params: typeof cmd.params === 'function' ? cmd.params(match) : cmd.params,
        feedback: typeof cmd.feedback === 'function' ? cmd.feedback(match) : cmd.feedback,
        originalText: text
      };
    }
  }

  return { 
    type: 'UNKNOWN', 
    originalText: text,
    feedback: 'Me desculpe, coração, não consegui entender direitinho. Você poderia repetir para mim, por favor?'
  };
};