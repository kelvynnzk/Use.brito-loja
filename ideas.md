# Direção de Design — Use.Brito

## Três caminhos possíveis

### 1. Caderno de Estação
**Very Brief Intro:** Um editorial claro, solar e romântico, inspirado em páginas de revista de moda impressa e na leveza das coleções de resort. Privilegia respiros amplos e fotografia delicada.

**Probability:** 0.06

### 2. Ateliê de Concreto
**Very Brief Intro:** Uma loja de moda com energia urbana brasileira, construída pela tensão entre tipografia editorial, textura tátil e uma paleta de tons terrosos sofisticados. O resultado parece uma curadoria de peças, não um catálogo genérico.

**Probability:** 0.03

### 3. Noite Acetinada
**Very Brief Intro:** Uma direção escura e teatral, com fundos em grafite, luz pontual e detalhes em metal líquido para comunicar ocasiões especiais. A experiência privilegia impacto e contraste dramático.

**Probability:** 0.08

## Abordagem selecionada: Ateliê de Concreto

### Design Movement
**Editorial brutalism tropical**, reinterpretado com acabamento de boutique: composições assimétricas, linhas tipográficas firmes, blocos de cor mineral e imagens de moda com presença de campanha.

### Core Principles
1. A roupa é apresentada como objeto de desejo em uma curadoria, com muita área livre ao redor e pouca ornamentação gratuita.
2. A assimetria é funcional: a hierarquia surge de escalas, alinhamentos deslocados e cortes de imagem, sem prejudicar a leitura.
3. Elementos táteis — grão, sombras suaves, papel quente e detalhes de borda — fazem a interface parecer construída, não montada.
4. A conversão é objetiva: preço, tamanho, entrega e ações de compra permanecem sempre visíveis e inequívocos.

### Color Philosophy
O **areia mineral** cria uma base acolhedora que aproxima a experiência de um lookbook físico. O **café profundo** concentra a tipografia e dá solenidade às decisões de compra. O **Cobre de Barro** funciona como sinal de energia e deve aparecer com parcimônia em ações, etiquetas e acentos para criar reconhecimento sem competir com as peças.

### Layout Paradigm
O site se estrutura como um **editorial de páginas abertas**: a hero ocupa uma faixa integral com conteúdo ancorado lateralmente; coleções surgem em recortes verticais, blocos alternados e faixas horizontais de produto. Em telas pequenas, a narrativa vira uma sequência contínua, mantendo a ordem comercial e o foco em uma ação por vez.

### Signature Elements
1. **Etiqueta de atelier:** pequenos selos retangulares em Cobre de Barro para novidade, edição limitada e ofertas.
2. **Régua tipográfica:** linhas finas e pequenas coordenadas editoriais, como “Coleção 01 / 26”, para conduzir seções e páginas.
3. **Moldura de recorte:** imagens com uma borda deslocada sutil, lembrando provas de impressão e páginas de revista.

### Interaction Philosophy
Interações respondem como um showroom: cartões de produto elevam discretamente e revelam a ação de compra; opções de tamanho dão confirmação visual imediata; o carrinho evidencia progresso e mantém a cliente orientada. Todo feedback é claro, curto e não bloqueia a navegação.

### Animation
Entradas utilizam opacidade e deslocamento vertical leve, escalonadas em grupos de até quatro itens. Hover de imagem usa apenas transformação e brilho moderado. Botões têm transição de 160 ms, escala de 0,97 no clique e contraste de cor sem efeitos decorativos persistentes. O site respeita `prefers-reduced-motion` e remove movimentos não essenciais quando necessário.

### Typography System
**DM Serif Display** é a voz editorial dos títulos, usada em tamanhos grandes, poucas linhas e espaçamento ligeiramente justo. **Manrope** sustenta interface, preço, informações de produto e navegação com boa legibilidade. Títulos não ficam integralmente em caixa alta; rótulos, coordenadas e ações podem usar caixa alta pequena e tracking amplo.

### Brand Essence
**Use.Brito é uma curadoria de moda feminina contemporânea para quem quer vestir presença com leveza.** Personalidade: **autoral, calorosa, precisa**.

### Brand Voice
As manchetes devem ser sensoriais e curtas; CTAs são diretos, mas não genéricos; microtextos explicam o próximo passo sem ruído. Exemplos: “Texturas que ficam na memória.” e “Escolha seu tamanho, o resto a gente resolve.”

### Wordmark & Logo
O wordmark preserva **Use.Brito** em uma combinação de serif refinada e ponto gráfico marcante. A marca usa também um símbolo simples de dois arcos entrelaçados, remetendo ao gesto de vestir e ao movimento do tecido; ele aparece em favicon, marca d’água e selo de produto.

### Signature Brand Color
**Cobre de Barro — #B84C33.**

## Style Decisions

- Cada página deve apresentar ao menos um dispositivo editorial de ateliê: coordenada tipográfica, régua, bloco mineral, moldura deslocada ou o símbolo de arcos interligados.
- Imagens de coleção e produto precisam permanecer no mesmo universo: concreto, gesso, linho, tons de terra, textura têxtil e calor urbano brasileiro.
- A vitrine de produto usa ritmo de lookbook, com agrupamentos, alturas e molduras discretamente deslocadas, mantendo preço e ação de compra imediatamente legíveis.
