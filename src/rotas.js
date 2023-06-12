const express = require('express');
const controladores = require('./controlador/bancoDigital');
const { validarSenha } = require('./intermediarios');

const rotas = express();
//rotas.use(validarSenha);

rotas.get('/contas', validarSenha, controladores.listarContasBancarias);
rotas.post('/contas', controladores.criarContaBancaria);
rotas.put('/contas/:numeroConta/usuario', controladores.atualizarUsuarioContaBancaria);
rotas.delete('/contas/:numeroConta', controladores.excluirContaBancaria);
rotas.post('/transacao/depositar', controladores.depositar);
rotas.post('/transacao/sacar', controladores.sacar);
rotas.post('/transacao/transferir', controladores.transferir);
rotas.get('/contas/saldo', controladores.saldo);
rotas.get('/contas/extrato', controladores.extrato);

module.exports = rotas