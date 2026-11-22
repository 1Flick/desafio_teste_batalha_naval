// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes dos tabuleiros e do posicionamento da frota (G2 a G5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, within, casa, casasDe, casasNoEstado, LETRAS, FROTA_PADRAO, CASAS_FROTA_PADRAO, TODAS_AS_CASAS } from "../helpers.js";

/** Escolhe o navio na lista e clica na casa inicial do tabuleiro do jogador. */
import { conferir } from "../support/verificacoes.js";
/** Escolhe o navio na lista e clica na casa inicial do tabuleiro do jogador. */
export async function posicionar(user, navio, coord) {
  await user.click(screen.getByTestId(`navio-${navio}`));
  await user.click(casa('jogador', coord));
}
// As 86 casas de água da FROTA_PADRAO: o computador só atira nelas e nunca acerta o jogador.
export const AGUA_FROTA_PADRAO = TODAS_AS_CASAS.filter(c => !CASAS_FROTA_PADRAO.includes(c)).join(',');
