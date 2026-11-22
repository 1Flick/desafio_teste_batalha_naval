// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes do computador caçando depois de um acerto (G6).
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, casa, FROTA_PADRAO, TIROS_AGUA, TODAS_AS_CASAS, LETRAS } from "../helpers.js";
import { conferir } from "../support/verificacoes.js";
export const CENARIO = {
  jogador: FROTA_PADRAO,
  inimigo: FROTA_PADRAO
};
export const AGUA = TIROS_AGUA.split(','); // casas sem navio no inimigo: o jogador nunca acerta
export const ATINGIDA = ['erro', 'acerto', 'afundado'];
export const atingidas = () => new Set(TODAS_AS_CASAS.filter(c => ATINGIDA.includes(casa('jogador', c).getAttribute('data-estado'))));

/** O jogador atira em `alvo`; devolve a casa nova que o computador atingiu em seguida. */
export async function rodada(user, alvo) {
  const antes = atingidas();
  await user.click(casa('inimigo', alvo));
  const novas = [...atingidas()].filter(c => !antes.has(c));
  conferir.quantidade(novas, 1);
  return novas[0];
}

/** Casas em cima, embaixo, à esquerda e à direita (dentro do tabuleiro). */
export function vizinhas(coord) {
  const col = LETRAS.indexOf(coord[0]),
    lin = Number(coord.slice(1));
  return [[col - 1, lin], [col + 1, lin], [col, lin - 1], [col, lin + 1]].filter(([c, l]) => c >= 0 && c < 10 && l >= 1 && l <= 10).map(([c, l]) => `${LETRAS[c]}${l}`);
}
