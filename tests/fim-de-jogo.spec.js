// Testes de fim de jogo (B5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, casa, casasNoEstado, FROTA_PADRAO, CASAS_FROTA_PADRAO, TIROS_AGUA } from './helpers.js';
import { CENARIO } from "./cenarios/fim-de-jogo.js";
import { conferir } from "./support/verificacoes.js";
describe("Batalha naval \u2014 fim-de-jogo", () => {
  test('TC-BN-16 vitória encerra a partida', async () => {
    const user = await abrirJogo(CENARIO);
    for (const coord of CASAS_FROTA_PADRAO) await user.click(casa('inimigo', coord));
    conferir.texto(screen.getByTestId('mensagem'), /^Você venceu!$/);
    conferir.texto(screen.getByTestId('restantes-inimigo'), /^0$/);
    const atingidasNoJogador = () => ['acerto', 'erro', 'afundado'].reduce((n, estado) => n + casasNoEstado('jogador', estado).length, 0);
    const tirosDoComputador = atingidasNoJogador();
    const antes = casa('inimigo', 'J10').getAttribute('data-estado');
    await user.click(casa('inimigo', 'J10'));
    conferir.atributo(casa('inimigo', 'J10'), 'data-estado', antes);
    expect(atingidasNoJogador()).toBe(tirosDoComputador); // o computador também não joga mais
    conferir.texto(screen.getByTestId('mensagem'), /^Você venceu!$/);
  });
  test('TC-BN-17 derrota revela a frota inimiga', async () => {
    const user = await abrirJogo({
      jogador: FROTA_PADRAO,
      inimigo: FROTA_PADRAO,
      tiroscpu: CASAS_FROTA_PADRAO.join(',')
    });
    for (const coord of TIROS_AGUA.split(',').slice(0, 14)) await user.click(casa('inimigo', coord));
    conferir.texto(screen.getByTestId('mensagem'), /^Você perdeu!$/);
    conferir.texto(screen.getByTestId('restantes-jogador'), /^0$/);
    conferir.quantidade(casasNoEstado('inimigo', 'navio'), 14);
  });
  test('TC-BN-18 reiniciar volta ao posicionamento', async () => {
    const user = await abrirJogo(CENARIO);
    for (const coord of CASAS_FROTA_PADRAO) await user.click(casa('inimigo', coord));
    for (const navio of ['P', 'E', 'S', 'D']) expect(screen.queryByTestId(`navio-${navio}`)).toBeNull(); // frota já posicionada
    await user.click(screen.getByTestId('btn-reiniciar'));
    for (const navio of ['P', 'E', 'S', 'D']) {
      conferir.visivel(screen.getByTestId(`navio-${navio}`));
    }
    conferir.quantidade(casasNoEstado('jogador', 'agua'), 100);
    conferir.quantidade(casasNoEstado('inimigo', 'desconhecido'), 100);
    conferir.desabilitado(screen.getByTestId('btn-iniciar'));
  });
});
