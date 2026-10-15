// Node 22+: testes de contrato isolados, sem precisar iniciar o Expo ou o Laravel.
// npm test usa --experimental-strip-types para executar schemas.ts diretamente.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseStatus, parseSensorList, parseSingleStatus, validateUpdateResponse } from '../src/api/schemas.ts';

test('interpreta todos os formatos de status aceitos', () => {
  for (const value of [1, '1', true]) assert.equal(parseStatus(value), 1);
  for (const value of [0, '0', false]) assert.equal(parseStatus(value), 0);
  assert.throws(() => parseStatus('online'), /status inválido/);
});

test('lê a resposta Swagger da listagem sem registros artificiais', () => {
  assert.deepEqual(parseSensorList({ success: 'Registros encontrados com sucesso', data: [
    { codigo: 'S2', tipo: 'umidade', status: 0 },
    { codigo: 'S1', tipo: 'luminosidade', status: 1 },
  ] }), [
    { codigo: 'S1', tipo: 'luminosidade', status: 1 },
    { codigo: 'S2', tipo: 'umidade', status: 0 },
  ]);
  assert.deepEqual(parseSensorList({ data: [] }), []);
});

test('falha em resposta incompleta ou com status inesperado', () => {
  assert.throws(() => parseSensorList({ success: 'ok' }), /array/);
  assert.throws(() => parseSensorList({ data: [{ codigo: 'S1', tipo: 'umidade', status: 9 }] }), /status inválido/);
});

test('consulta individual interpreta 404 e status', () => {
  assert.equal(parseSingleStatus({ success: 'Registro encontrado', status: 1 }), 1);
  assert.throws(() => parseSingleStatus({ error: 'sensor não encontrado' }), /sensor não encontrado/);
});

test('200 da atualização só é sucesso quando o conteúdo confirma', () => {
  assert.doesNotThrow(() => validateUpdateResponse({ status: 1, message: 'Atualizado' }, 1));
  assert.doesNotThrow(() => validateUpdateResponse({ message: 'Atualizado' }, 0));
  assert.throws(() => validateUpdateResponse({ message: 'sensor não existe' }, 1), /sensor não existe/);
  assert.throws(() => validateUpdateResponse({ status: 0, message: 'Atualizado' }, 1), /não confirmou/);
  assert.throws(() => validateUpdateResponse({ somethingElse: true }, 1), /não confirmou/);
});
