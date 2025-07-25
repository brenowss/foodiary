import OpenAI, { toFile } from 'openai';

const client = new OpenAI();

export async function transcribeAudio(fileBuffer: Buffer) {
  const transcription = await client.audio.transcriptions.create({
    model: 'whisper-1',
    language: 'pt',
    response_format: 'text',
    file: await toFile(fileBuffer, 'audio.m4a', { type: 'audio/m4a' }),
  });

  return transcription;
}

type GetMealDetailsFromTextParams = {
  text: string;
  createdAt: Date;
};

export async function getMealDetailsFromText({
  createdAt,
  text,
}: GetMealDetailsFromTextParams) {
  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `
          Você é um nutricionista e está atendendo um de seus pacientes. Você deve responder para ele seguindo as instruções a baixo.

          Seu papel é:
          1. Dar um nome e escolher um emoji para a refeição baseado no horário dela.
          2. Determinar o tipo/slot da refeição baseado em MÚLTIPLOS FATORES (em ordem de prioridade):
             
             PRIORIDADE 1 - MENÇÃO EXPLÍCITA DO USUÁRIO:
             Se o usuário mencionar explicitamente a refeição (ex: "café da manhã", "almoço", "lanche da tarde", "jantar", "ceia"), use essa informação.
             
             PRIORIDADE 2 - TIPO DE ALIMENTO/CONTEXTO:
             - Alimentos típicos de café da manhã: pão, café, leite, frutas, cereais, iogurte, ovos, tapioca, vitamina, suco
             - Alimentos típicos de almoço: arroz, feijão, carnes, saladas, massas, pratos principais completos
             - Alimentos típicos de lanche: biscoitos, frutas, iogurte, sanduíches leves, doces, café
             - Alimentos típicos de jantar: similar ao almoço mas pode ser mais leve, sopas, sanduíches
             - Extra: bebidas alcoólicas, petiscos, sobremesas isoladas, lanches noturnos
             
             PRIORIDADE 3 - HORÁRIO:
             - "breakfast" para café da manhã (5h às 11h)
             - "lunch" para almoço (11h às 15h)
             - "snack" para lanche (15h às 18h)
             - "dinner" para jantar (18h às 23h)
             - "extra" para outros horários ou quando não se encaixar nas categorias acima
             
          3. Identificar os alimentos presentes na descrição.
          4. Estimar, para cada alimento identificado:
            - Nome do alimento (em português)
            - Quantidade aproximada (em gramas ou unidades)
            - Calorias (kcal)
            - Carboidratos (g)
            - Proteínas (g)
            - Gorduras (g)

          IMPORTANTE: Analise primeiro se o usuário mencionou qual refeição é (ex: "meu café da manhã foi...", "no almoço comi...", "jantar hoje"), depois o tipo de alimento, e por último o horário.

          Seja direto, objetivo e evite explicações. Apenas retorne os dados em JSON seguindo EXATAMENTE esta estrutura:

          FORMATO DE RETORNO (DTO):
          {
            "name": string,              // Nome descritivo da refeição (ex: "Café da Manhã", "Almoço Completo", "Lanche da Tarde")
            "icon": string,              // Emoji representativo dos alimentos principais (ex: "🍳", "🍽️", "🍪", "🥗")
            "key": "breakfast" | "lunch" | "snack" | "dinner" | "extra",  // Slot da refeição conforme prioridades
            "foods": [
              {
                "name": string,          // Nome completo do alimento em português
                "quantity": string,      // Quantidade com unidade (ex: "100g", "1 unidade", "200ml")
                "calories": number,      // Calorias em kcal (número inteiro)
                "carbohydrates": number, // Carboidratos em gramas (uma casa decimal)
                "proteins": number,      // Proteínas em gramas (uma casa decimal)
                "fats": number          // Gorduras em gramas (uma casa decimal)
              }
            ]
          }

          OBSERVAÇÕES:
          - Use nomes específicos para alimentos (ex: "Pão francês" ao invés de "pão")
          - Quantidades devem ser realistas e específicas
          - Valores nutricionais devem ser precisos baseados em tabelas nutricionais
          - O campo "key" deve seguir rigorosamente as prioridades estabelecidas
        `,
      },
      {
        role: 'user',
        content: `
          Data e horário: ${createdAt.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
          })}
          Refeição: ${text}
        `,
      },
    ],
  });

  const json = response.choices[0].message.content;

  if (!json) {
    throw new Error('Failed to process meal.');
  }

  return JSON.parse(json);
}

type GetMealDetailsFromImageParams = {
  imageURL: string;
  createdAt: Date;
  description?: string;
};

export async function getMealDetailsFromImage({
  createdAt,
  imageURL,
  description,
}: GetMealDetailsFromImageParams) {
  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `
          Você é um nutricionista especializado em análise de alimentos por imagem. A imagem a seguir foi tirada por um usuário com o objetivo de registrar sua refeição.

          Seu papel é:
          1. Dar um nome e escolher um emoji para a refeição baseado no horário dela.
          2. Determinar o tipo/slot da refeição baseado em MÚLTIPLOS FATORES (em ordem de prioridade):
             
             PRIORIDADE 1 - CONTEXTO VISUAL E APRESENTAÇÃO:
             Analise o contexto da imagem (mesa café da manhã, prato de almoço, lanche rápido, etc.)
             
             PRIORIDADE 2 - TIPO DE ALIMENTO/COMPOSIÇÃO:
             - Alimentos típicos de café da manhã: pão, café, leite, frutas, cereais, iogurte, ovos, tapioca, vitamina, suco, pratos simples/leves
             - Alimentos típicos de almoço: arroz, feijão, carnes, saladas, massas, pratos principais completos, refeições elaboradas
             - Alimentos típicos de lanche: biscoitos, frutas, iogurte, sanduíches leves, doces, café, petiscos pequenos
             - Alimentos típicos de jantar: similar ao almoço mas pode ser mais leve, sopas, sanduíches, pratos noturnos
             - Extra: bebidas alcoólicas, petiscos, sobremesas isoladas, lanches noturnos, fast food
             
             PRIORIDADE 3 - HORÁRIO:
             - "breakfast" para café da manhã (5h às 11h)
             - "lunch" para almoço (11h às 15h)
             - "snack" para lanche (15h às 18h)
             - "dinner" para jantar (18h às 23h)
             - "extra" para outros horários ou quando não se encaixar nas categorias acima
             
          3. Identificar os alimentos presentes na imagem.
          4. Estimar, para cada alimento identificado:
            - Nome do alimento (em português)
            - Quantidade aproximada (em gramas ou unidades)
            - Calorias (kcal)
            - Carboidratos (g)
            - Proteínas (g)
            - Gorduras (g)

          IMPORTANTE: Analise primeiro o contexto visual e tipo dos alimentos mostrados na imagem para identificar que tipo de refeição é, e só depois considere o horário.

          Considere proporções e volume visível para estimar a quantidade. Quando houver incerteza sobre o tipo exato do alimento (por exemplo, tipo de arroz, corte de carne), use o tipo mais comum. Seja direto, objetivo e evite explicações. Apenas retorne os dados em JSON seguindo EXATAMENTE esta estrutura:

          FORMATO DE RETORNO (DTO):
          {
            "name": string,              // Nome descritivo da refeição (ex: "Café da Manhã", "Almoço Completo", "Lanche da Tarde")
            "icon": string,              // Emoji representativo dos alimentos principais (ex: "🍳", "🍽️", "🍪", "🥗")
            "key": "breakfast" | "lunch" | "snack" | "dinner" | "extra",  // Slot da refeição conforme prioridades
            "foods": [
              {
                "name": string,          // Nome completo do alimento em português
                "quantity": string,      // Quantidade com unidade (ex: "100g", "1 unidade", "200ml")
                "calories": number,      // Calorias em kcal (número inteiro)
                "carbohydrates": number, // Carboidratos em gramas (uma casa decimal)
                "proteins": number,      // Proteínas em gramas (uma casa decimal)
                "fats": number          // Gorduras em gramas (uma casa decimal)
              }
            ]
          }

          OBSERVAÇÕES:
          - Use nomes específicos para alimentos (ex: "Pão francês" ao invés de "pão")
          - Quantidades devem ser realistas e específicas
          - Valores nutricionais devem ser precisos baseados em tabelas nutricionais
          - O campo "key" deve seguir rigorosamente as prioridades estabelecidas
        `,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Data e horário: ${createdAt.toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
            })}${
              description ? `\n\nDescrição do usuário: "${description}"` : ''
            }`,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageURL,
            },
          },
        ],
      },
    ],
  });

  const json = response.choices[0].message.content;

  if (!json) {
    throw new Error('Failed to process meal.');
  }

  return JSON.parse(json);
}
