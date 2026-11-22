// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes da batalha (B2 a B4). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, casa, casasNoEstado, FROTA_PADRAO, TIROS_AGUA, TODAS_AS_CASAS } from "../helpers.js";
import { conferir } from "../support/verificacoes.js";
export const CENARIO = {
  jogador: FROTA_PADRAO,
  inimigo: FROTA_PADRAO,
  tiroscpu: TIROS_AGUA
};
