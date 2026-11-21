/**
 * ESPECIFICAÇÃO EXECUTÁVEL — BATALHA NAVAL
 * Origem: github.com/JoaoChoma/teste_software_2026/blob/main/desafios.md
 * Exigido: JavaScript; tabuleiro 10x10; porta-aviões 5, encouraçado 4,
 * submarino 3 e destroier OU hidroavião 2. Esta variante escolhe DESTROIER.
 * Colaboradores: Pedro Lucas Gomes Braido (24190443-2);
 * Leonardo Fratoni Borges da Silva (24047610-2).
 *
 * Node.js >= 24. Implemente batalha_naval.js ao lado deste teste, ESM.
 * node --test batalha_naval.test.js
 * Opcional: MODULO_BATALHA_NAVAL = caminho de outra implementação.
 *
 * EXPORTAÇÕES/ESTADO:
 * FROTA={portaAvioes:5,encouracado:4,submarino:3,destroier:2}.
 * new Tabuleiro(): navios Map<tipo,{casas:Set<'x,y'>,acertos:Set<'x,y'>}>,
 * tiros Set<'x,y'>; getters pronto:boolean, derrotado:boolean.
 * posicionar(tipo,x,y,direcao='H'); atirar(x,y):{resultado,tipo?}.
 * new BatalhaNaval(): tabuleiros=[Tabuleiro,Tabuleiro],turno=0,vencedor=null.
 * atacar(jogador,x,y) usa o tabuleiro ADVERSÁRIO e retorna o resultado do tiro.
 *
 * VARIANTE DEFINIDA AQUI, PARA NÃO DEIXAR DECISÕES À OUTRA IMPLEMENTAÇÃO:
 * - Dois jogadores 0/1; x e y inteiros de 0 a 9. H avança x; V avança y.
 * - Um navio de cada tipo; não pode girar diagonal, sobrepor, sair do tabuleiro
 *   nem mover navio já colocado. Navios PODEM tocar lado a lado/diagonalmente.
 * - Colocação inválida é atômica: não deixa metade de navio no tabuleiro.
 * - pronto exige os quatro tipos (14 casas). Só se atira contra frota pronta.
 * - água: {resultado:'agua'}; acerto parcial: {resultado:'acertou',tipo};
 *   último segmento de navio: {resultado:'afundou',tipo}; último segmento da
 *   frota inteira: {resultado:'venceu',tipo} (venceu prevalece sobre afundou).
 * - Tiro repetido/fora da grade lança Error sem consumir turno nem alterar sets.
 * - Em partida, ambas as frotas devem estar prontas. Todo tiro válido, inclusive
 *   acerto e afundamento, alterna turno; o tiro vencedor apenas define vencedor.
 * - Após vitória não se atira mais; tabuleiro derrotado também rejeita tiros.
 * - Não há sorteio obrigatório, movimentação de navios, sonar ou adversário IA.
 * - Mensagens de erro e UI são livres. Testes não exigem CSS ou um framework.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { FROTA, Tabuleiro, BatalhaNaval } = await import(process.env.MODULO_BATALHA_NAVAL
  ? pathToFileURL(resolve(process.env.MODULO_BATALHA_NAVAL)).href
  : new URL('./batalha_naval.js',import.meta.url).href);
const TIPOS={portaAvioes:5,encouracado:4,submarino:3,destroier:2};
function preparar(t=new Tabuleiro()) {Object.keys(TIPOS).forEach((tipo,y)=>t.posicionar(tipo,0,y));return t;}
function fotografia(t) {return {tiros:[...t.tiros].sort(),navios:[...t.navios].map(([tipo,n])=>[tipo,{casas:[...n.casas].sort(),acertos:[...n.acertos].sort()}]),pronto:t.pronto,derrotado:t.derrotado};}
function rejeita(t,acao) {const antes=fotografia(t);assert.throws(acao,Error);assert.deepEqual(fotografia(t),antes);}
const casasFrota=()=>Object.values(TIPOS).flatMap((n,y)=>Array.from({length:n},(_,x)=>[x,y]));

test('exporta as classes e a composição exata da frota',()=>{assert.equal(typeof Tabuleiro,'function');assert.equal(typeof BatalhaNaval,'function');assert.deepEqual(FROTA,TIPOS);});
test('tabuleiro inicial não está pronto nem derrotado e não possui tiros',()=>{const t=new Tabuleiro();assert.equal(t.pronto,false);assert.equal(t.derrotado,false);assert.equal(t.navios.size,0);assert.equal(t.tiros.size,0);});
for(const [tipo,n] of Object.entries(TIPOS)) for(const direcao of ['H','V']) test(`${tipo}, ${direcao}: exatamente ${n} casas consecutivas, incluindo borda máxima`,()=>{
  const t=new Tabuleiro(),x=direcao==='H'?10-n:9,y=direcao==='V'?10-n:9;t.posicionar(tipo,x,y,direcao);
  const esperado=Array.from({length:n},(_,i)=>`${x+(direcao==='H'?i:0)},${y+(direcao==='V'?i:0)}`);
  assert.deepEqual([...t.navios.get(tipo).casas],esperado);assert.equal(t.navios.get(tipo).acertos.size,0);
});
test('direção omitida equivale a horizontal',()=>{const t=new Tabuleiro();t.posicionar('submarino',2,2);assert.deepEqual([...t.navios.get('submarino').casas],['2,2','3,2','4,2']);});
for(const [tipo,n] of Object.entries(TIPOS)) test(`${tipo}: um segmento além da borda é rejeitado atomicamente`,()=>{
  const t=new Tabuleiro();rejeita(t,()=>t.posicionar(tipo,11-n,0,'H'));rejeita(t,()=>t.posicionar(tipo,0,11-n,'V'));
});
for(const tipo of ['hidroaviao','desconhecido','',null,undefined]) test(`tipo não adotado/ inválido ${String(tipo)} é rejeitado`,()=>{const t=new Tabuleiro();rejeita(t,()=>t.posicionar(tipo,0,0));});
for(const d of ['D','h','v','',null,1]) test(`direção ${String(d)} é rejeitada sem alterar a frota`,()=>{const t=new Tabuleiro();rejeita(t,()=>t.posicionar('destroier',0,0,d));});
test('sobreposição horizontal/vertical e duplicação de tipo são rejeitadas',()=>{
  const t=new Tabuleiro();t.posicionar('portaAvioes',0,0);rejeita(t,()=>t.posicionar('submarino',2,0,'V'));rejeita(t,()=>t.posicionar('encouracado',1,0,'H'));rejeita(t,()=>t.posicionar('portaAvioes',0,2));
});
