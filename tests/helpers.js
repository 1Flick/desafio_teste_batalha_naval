// API dos cenários; ciclo de abertura compartilhado em support/interface.js.
import { criarAbertura, screen, within } from './support/interface.js';
export { cliqueDireito, screen, within } from './support/interface.js';

export const abrirJogo = criarAbertura(() => import('../js/main.js'));


export const LETRAS = 'ABCDEFGHIJ'.split('');
export const TODAS_AS_CASAS = LETRAS.flatMap((letra) => Array.from({ length: 10 }, (_, i) => `${letra}${i + 1}`));

/**
 * FROTA_PADRAO: P em A1–E1, E em A3–D3, S em A5–C5, D em A7–B7 (todos horizontais).
 * Formato `Letra:Casa:Orientação`.
 */
export const FROTA_PADRAO = 'P:A1:H,E:A3:H,S:A5:H,D:A7:H';
export const CASAS_FROTA_PADRAO = ['A1', 'B1', 'C1', 'D1', 'E1', 'A3', 'B3', 'C3', 'D3', 'A5', 'B5', 'C5', 'A7', 'B7'];
// TIROS_AGUA: as 30 casas das linhas 8–10 (sem navio na FROTA_PADRAO), para o computador sempre errar.
export const TIROS_AGUA = [8, 9, 10].flatMap((n) => LETRAS.map((letra) => `${letra}${n}`)).join(',');

export const casa = (lado, coord) => screen.getByTestId(`${lado}-${coord}`);
export const casasDe = (lado) => screen.getAllByTestId(new RegExp(`^${lado}-[A-J](10|[1-9])$`));
export const casasNoEstado = (lado, estado) => casasDe(lado).filter((c) => c.getAttribute('data-estado') === estado);
