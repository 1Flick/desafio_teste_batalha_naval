// Testes do computador caçando depois de um acerto (G6).
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, casa, FROTA_PADRAO, TIROS_AGUA, TODAS_AS_CASAS, LETRAS } from './helpers.js';
import { CENARIO, AGUA, ATINGIDA, atingidas, rodada, vizinhas } from "./cenarios/cpu-caca.js";
import { conferir } from "./support/verificacoes.js";
describe("Batalha naval \u2014 cpu-caca", () => {
  test('TC-BN-25 depois de acertar, o computador atira numa casa vizinha', async () => {
    const user = await abrirJogo({
      ...CENARIO,
      tiroscpu: 'C1'
    });
    expect(await rodada(user, AGUA[0])).toBe('C1');
    conferir.atributo(casa('jogador', 'C1'), 'data-estado', 'acerto');
    expect(['B1', 'D1', 'C2']).toContain(await rodada(user, AGUA[1]));
  });
  test('TC-BN-26 o computador segue caçando até afundar o navio', async () => {
    const user = await abrirJogo({
      ...CENARIO,
      tiroscpu: 'C1'
    });
    await rodada(user, AGUA[0]); // C1
    const PORTA_AVIOES = ['A1', 'B1', 'C1', 'D1', 'E1'];
    let tiros = 0;
    while (casa('jogador', 'C1').getAttribute('data-estado') !== 'afundado') {
      const acertos = PORTA_AVIOES.filter(c => casa('jogador', c).getAttribute('data-estado') === 'acerto');
      const permitidas = new Set(acertos.flatMap(vizinhas));
      const tiro = await rodada(user, AGUA[1 + tiros]);
      expect(permitidas.has(tiro)).toBe(true);
      tiros++;
      expect(tiros).toBeLessThanOrEqual(12);
    }
    for (const c of PORTA_AVIOES) conferir.atributo(casa('jogador', c), 'data-estado', 'afundado');
  });
  test('TC-BN-27 acerto na borda: o tiro seguinte fica dentro do tabuleiro', async () => {
    const user = await abrirJogo({
      ...CENARIO,
      tiroscpu: 'A7'
    });
    expect(await rodada(user, AGUA[0])).toBe('A7');
    expect(['A6', 'A8', 'B7']).toContain(await rodada(user, AGUA[1]));
  });
});
