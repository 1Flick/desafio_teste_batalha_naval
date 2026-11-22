// Testes dos tabuleiros e do posicionamento da frota (G2 a G5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, within, casa, casasDe, casasNoEstado, LETRAS, FROTA_PADRAO, CASAS_FROTA_PADRAO, TODAS_AS_CASAS } from './helpers.js';

/** Escolhe o navio na lista e clica na casa inicial do tabuleiro do jogador. */
import { posicionar, AGUA_FROTA_PADRAO } from "./cenarios/posicionamento.js";
import { conferir } from "./support/verificacoes.js";
describe("Batalha naval \u2014 posicionamento", () => {
  test('TC-BN-01 dois tabuleiros 10 × 10 com rótulos A–J e 1–10', async () => {
    await abrirJogo();
    for (const lado of ['jogador', 'inimigo']) {
      conferir.quantidade(casasDe(lado), 100);
      const tabuleiro = within(screen.getByTestId(`tabuleiro-${lado}`));
      for (const rotulo of [...LETRAS, ...Array.from({
        length: 10
      }, (_, i) => String(i + 1))]) {
        conferir.visivel(tabuleiro.getAllByText(rotulo, {
          exact: true
        })[0]);
      }
    }
  });
  test('TC-BN-02 lista da frota com os tamanhos e Iniciar desabilitado', async () => {
    await abrirJogo();
    const tamanhos = {
      P: '5',
      E: '4',
      S: '3',
      D: '2'
    };
    for (const [navio, tamanho] of Object.entries(tamanhos)) {
      conferir.visivel(screen.getByTestId(`navio-${navio}`));
      conferir.texto(screen.getByTestId(`navio-${navio}`), new RegExp(`\\b${tamanho}\\b`)); // "2", não "12"
    }
    conferir.desabilitado(screen.getByTestId('btn-iniciar'));
  });
  test('TC-BN-09 navios do inimigo ficam escondidos', async () => {
    const user = await abrirJogo({
      inimigo: FROTA_PADRAO
    }); // há navios em A1–E1, A3–D3, A5–C5, A7–B7
    await user.click(screen.getByTestId('btn-aleatorio'));
    await user.click(screen.getByTestId('btn-iniciar'));
    conferir.texto(screen.getByTestId('vez'), 'Jogador');
    for (const c of CASAS_FROTA_PADRAO) conferir.atributo(casa('inimigo', c), 'data-estado', 'desconhecido');
    conferir.quantidade(casasNoEstado('inimigo', 'desconhecido'), 100);
    await user.click(casa('inimigo', 'A1'));
    conferir.atributo(casa('inimigo', 'A1'), 'data-estado', 'acerto'); // o navio estava lá, escondido
  });
  test('TC-BN-03 porta-aviões na horizontal ocupa A1 a E1', async () => {
    const user = await abrirJogo();
    await posicionar(user, 'P', 'A1');
    for (const c of ['A1', 'B1', 'C1', 'D1', 'E1']) conferir.atributo(casa('jogador', c), 'data-estado', 'navio');
    conferir.atributo(casa('jogador', 'F1'), 'data-estado', 'agua');
    expect(screen.queryByTestId('navio-P')).toBeNull(); // saiu da lista
  });
  test('TC-BN-04 girar para vertical: encouraçado em J1 ocupa J1 a J4', async () => {
    const user = await abrirJogo();
    conferir.texto(screen.getByTestId('orientacao'), 'Horizontal');
    await user.click(screen.getByTestId('navio-E'));
    await user.click(screen.getByTestId('btn-girar'));
    conferir.texto(screen.getByTestId('orientacao'), 'Vertical');
    await user.click(casa('jogador', 'J1'));
    for (const c of ['J1', 'J2', 'J3', 'J4']) conferir.atributo(casa('jogador', c), 'data-estado', 'navio');
    conferir.atributo(casa('jogador', 'J5'), 'data-estado', 'agua');
  });
  test('TC-BN-07 Iniciar só habilita com os 4 navios', async () => {
    const user = await abrirJogo();
    await posicionar(user, 'P', 'A1');
    await posicionar(user, 'E', 'A3');
    await posicionar(user, 'S', 'A5');
    conferir.quantidade(casasNoEstado('jogador', 'navio'), 12);
    conferir.desabilitado(screen.getByTestId('btn-iniciar'));
    await posicionar(user, 'D', 'A7');
    conferir.quantidade(casasNoEstado('jogador', 'navio'), 14);
    conferir.habilitado(screen.getByTestId('btn-iniciar'));
  });
  test('TC-BN-20 navio vertical que sairia por baixo é recusado', async () => {
    const user = await abrirJogo();
    await user.click(screen.getByTestId('navio-E'));
    await user.click(screen.getByTestId('btn-girar')); // vertical
    await user.click(casa('jogador', 'A8')); // A8–A11: não existe linha 11
    conferir.quantidade(casasNoEstado('jogador', 'agua'), 100);
    conferir.texto(screen.getByTestId('mensagem'), /inválida/i);
    conferir.presente(screen.getByTestId('navio-E'));
  });
  test('TC-BN-20 navio vertical encostado na borda de baixo é aceito', async () => {
    const user = await abrirJogo();
    await user.click(screen.getByTestId('navio-E'));
    await user.click(screen.getByTestId('btn-girar')); // vertical
    await user.click(casa('jogador', 'A7')); // A7–A10: cabe exatamente
    for (const c of ['A7', 'A8', 'A9', 'A10']) conferir.atributo(casa('jogador', c), 'data-estado', 'navio');
    expect(screen.queryByTestId('navio-E')).toBeNull();
  });
  test('TC-BN-05 navio que sairia do tabuleiro é recusado', async () => {
    const user = await abrirJogo();
    await posicionar(user, 'P', 'H1'); // horizontal: precisaria de H1 até L1
    conferir.quantidade(casasNoEstado('jogador', 'agua'), 100);
    conferir.texto(screen.getByTestId('mensagem'), /inválida/i);
    conferir.presente(screen.getByTestId('navio-P'));
  });
  test('TC-BN-06 navio sobreposto é recusado', async () => {
    const user = await abrirJogo();
    await posicionar(user, 'P', 'A1'); // A1–E1
    await user.click(screen.getByTestId('navio-E'));
    await user.click(screen.getByTestId('btn-girar')); // vertical
    await user.click(casa('jogador', 'C1')); // C1–C4 cruzaria o porta-aviões em C1
    conferir.quantidade(casasNoEstado('jogador', 'navio'), 5);
    for (const c of ['C2', 'C3', 'C4']) conferir.atributo(casa('jogador', c), 'data-estado', 'agua');
    conferir.texto(screen.getByTestId('mensagem'), /inválida/i);
    conferir.presente(screen.getByTestId('navio-E'));
  });
  test('TC-BN-08 posicionamento aleatório válido (10 vezes)', async () => {
    const user = await abrirJogo();
    for (let i = 0; i < 10; i++) {
      await user.click(screen.getByTestId('btn-aleatorio')); // cada clique refaz a frota inteira (não soma outra)
      conferir.quantidade(casasNoEstado('jogador', 'navio'), 14); // 5 + 4 + 3 + 2, sem sobreposição
      for (const navio of ['P', 'E', 'S', 'D']) expect(screen.queryByTestId(`navio-${navio}`)).toBeNull();
      conferir.habilitado(screen.getByTestId('btn-iniciar'));
    }
  });
  test('TC-BN-19 parâmetro jogador posiciona a frota e começa a batalha', async () => {
    await abrirJogo({
      jogador: FROTA_PADRAO
    });
    for (const c of CASAS_FROTA_PADRAO) conferir.atributo(casa('jogador', c), 'data-estado', 'navio');
    conferir.quantidade(casasNoEstado('jogador', 'navio'), 14); // e só elas
    for (const navio of ['P', 'E', 'S', 'D']) expect(screen.queryByTestId(`navio-${navio}`)).toBeNull();
    conferir.texto(screen.getByTestId('vez'), 'Jogador');
  });

  // As 86 casas de água da FROTA_PADRAO: o computador só atira nelas e nunca acerta o jogador.

  test('TC-BN-21 a frota do computador tem 14 casas', async () => {
    const user = await abrirJogo({
      jogador: FROTA_PADRAO,
      tiroscpu: AGUA_FROTA_PADRAO
    });
    for (const c of TODAS_AS_CASAS) {
      if (/Você venceu/.test(screen.getByTestId('mensagem').textContent)) break;
      await user.click(casa('inimigo', c));
    }
    conferir.texto(screen.getByTestId('mensagem'), 'Você venceu!');
    conferir.quantidade(casasNoEstado('inimigo', 'afundado'), 14);
    conferir.texto(screen.getByTestId('restantes-inimigo'), /^0$/);
  });
});
