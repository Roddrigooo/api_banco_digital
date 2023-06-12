const bancoDigital = require('../bancodedados');
let proximoNumero = 1;

function listarContasBancarias(req, res) {
    return res.json(bancoDigital.contas)
}

function criarContaBancaria(req, res) {
    let { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ MENSAGEM: 'INFORMAR NOME' })
    }

    if (!cpf) {
        return res.status(400).json({ MENSAGEM: 'INFORMAR CPF' })
    }

    if (!data_nascimento) {
        return res.status(400).json({ MENSAGEM: 'INFORMAR DATA DE NASCIMENTO' })
    }

    if (!telefone) {
        return res.status(400).json({ MENSAGEM: 'INFORMAR TELEFONE' })
    }

    if (!email) {
        return res.status(400).json({ MENSAGEM: 'INFORMAR E-MAIL' })
    }

    if (!senha) {
        return res.status(400).json({ MENSAGEM: 'INFORMAR SENHA' })
    }

    const vericarEmailEcpf = bancoDigital.contas.find((conta) => {
        return conta.usuario.cpf === cpf || conta.usuario.email === email;
    });

    if (vericarEmailEcpf) {
        return res.status(400).json({ mensagem: 'JA EXISTE USUARIO CADASTRADO COM E-MAIL OU CPF' })
    }

    const novaConta = {
        numero: proximoNumero,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    bancoDigital.contas.push(novaConta);
    proximoNumero++

    return res.status(201).json(novaConta);
}

function atualizarUsuarioContaBancaria(req, res) {
    let { numeroConta } = req.params;
    let { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!Number(numeroConta)) {
        return res.status(400).json({ mensagem: 'O NUMERO DA CONTA INFORMADO NÃO E VALIDO' });
    };

    const conta = bancoDigital.contas.find((elemento) => {
        return elemento.numero === Number(numeroConta);
    });

    if (!conta) {
        return res.status(400).json({ mensagem: 'NÃO EXISTE A CONTA INFORMADA' });
    };

    if (nome) {
        conta.usuario.nome = nome;
    };

    if (cpf) {
        const vericarCpf = bancoDigital.contas.find((conta) => {
            return conta.usuario.cpf === cpf && conta.numero !== Number(numeroConta);
        });

        if (vericarCpf) {
            return res.status(400).json({ mensagem: 'JA EXISTE USUARIO CADASTRADO COM O CPF' })
        };

        conta.usuario.cpf = cpf;
    };

    if (data_nascimento) {
        conta.usuario.data_nascimento = data_nascimento;
    };

    if (telefone) {
        conta.usuario.telefone = telefone;
    };

    if (email) {
        const vericarEmail = bancoDigital.contas.find((conta) => {
            return conta.usuario.email === email && conta.numero !== Number(numeroConta);
        });

        if (vericarEmail) {
            return res.status(400).json({ mensagem: 'JA EXISTE USUARIO CADASTRADO COM O E-MAIL' })
        };
        conta.usuario.email = email;
    };

    if (senha) {
        conta.usuario.senha = senha;
    };

    return res.status(200).json({ mensagem: 'CONTA ALTERADA' })
}

function excluirContaBancaria(req, res) {
    const { numeroConta } = req.params;

    if (!Number(numeroConta)) {
        return res.status(400).json({ mensagem: 'O NUMERO DA CONTA INFORMADO NÃO E VALIDO' });
    };

    const conta = bancoDigital.contas.find((elemento) => {
        return elemento.numero === Number(numeroConta);
    });

    if (!conta) {
        return res.status(404).json({ mensagem: 'CONTA NÃO ENCONTRADA' })
    };

    if (conta.saldo !== 0) {
        return res.status(400).json({ mensagem: 'PERMITIDO DELETAR CONTA APENAS ZERADA' })
    };

    bancoDigital.contas = bancoDigital.contas.filter((elemento) => {
        return elemento.numero !== Number(numeroConta);
    });

    return res.status(200).json({ mensagem: 'CONTA DELETADA' });
}

function depositar(req, res) {
    let { numero, valorDepositado } = req.body;

    if (!numero && !valorDepositado) {
        return res.status(400).json({ mensagem: ' OBRIGATORIO INFORMAR A CONTA E O VALOR ' })
    };

    if (valorDepositado <= 0) {
        return res.status(400).json({ mensagem: 'PERMITIDO DEPOSITOS MAIORES QUE ZERO' })
    };

    const conta = bancoDigital.contas.find((elemento) => {
        return elemento.numero === Number(numero);
    });

    if (!conta) {
        return res.status(400).json({ mensagem: 'NÃO EXISTE A CONTA INFORMADA' });
    };

    conta.saldo += valorDepositado;

    const registroDeposito = {
        data: new Date(),
        numero_conta: numero,
        valor: valorDepositado
    }

    bancoDigital.depositos.push(registroDeposito);

    return res.status(200).json({ mensagem: 'Depósito realizado com sucesso!' });
}

function sacar(req, res) {
    let { numero, valorSacado, senha } = req.body;

    if (!Number(numero) || !Number(valorSacado) || !senha) {
        return res.status(400).json({ mensagem: 'INFORMAR NUMERO DA CONTA, VALOR DE SAQUE E SENHA' });
    };

    const conta = bancoDigital.contas.find((elemento) => {
        return elemento.numero === Number(numero);
    });

    if (!conta) {
        return res.status(400).json({ mensagem: 'NÃO EXISTE A CONTA INFORMADA' });
    };

    if (conta.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'SENHA INVALIDA' })
    };

    if (conta.saldo < valorSacado) {
        return res.status(400).json({ mensagem: 'SALDO INSUFICIENTE' })
    };

    conta.saldo -= valorSacado;

    const registroSaque = {
        data: new Date(),
        numero_conta: numero,
        valor: valorSacado
    }

    bancoDigital.saques.push(registroSaque);

    return res.status(200).json({ mensagem: 'Depósito realizado com sucesso!' });
}

function transferir(req, res) {
    let { numero_conta_origem, numero_conta_destino, senha, valor } = req.body;

    if (!Number(numero_conta_origem) || !Number(numero_conta_destino) || !senha || !valor) {
        return res.status(400).json({ mensagem: 'INFORMA CONTA DE ORIGEM, CONTA DE DESTINO, SENHA E VALOR' })
    };

    const contaOrigem = bancoDigital.contas.find((elemento) => {
        return elemento.numero === Number(numero_conta_origem);
    })

    if (!contaOrigem) {
        return res.status(400).json({ mensagem: 'NÃO EXISTE A CONTA DE ORIGEM INFORMADA' });
    };

    const contaDestino = bancoDigital.contas.find((elemento) => {
        return elemento.numero === Number(numero_conta_destino);
    });

    if (!contaDestino) {
        return res.status(400).json({ mensagem: 'NÃO EXISTE A CONTA DE DESTINO INFORMADA' });
    };

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'SENHA INVALIDA' });
    };

    if (contaOrigem.saldo < valor) {
        return res.status(400).json({ mensagem: 'SALDO INSUFICIENTE' });
    };

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    const registroTranferencia = {
        data: new Date(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }

    bancoDigital.transferencias.push(registroTranferencia);

    return res.status(200).json({ mensagem: 'TRANFERENCIA REALIZADA COM SUCESSO' })
}

function saldo(req, res) {
    let { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ MENSAGEM: 'INFORMAR NUMERO DA CONTA E SENHA' });
    };

    const conta = bancoDigital.contas.find((elemento) => {
        return elemento.numero === Number(numero_conta);
    });

    if (!conta) {
        return res.status(400).json({ mensagem: 'A CONTA NÃO EXISTE' })
    };

    if (conta.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'SENHA INVALIDA' })
    };

    return res.status(200).json({ saldo: conta.saldo });
}

function extrato(req, res) {
    let { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ MENSAGEM: 'INFORMAR NUMERO DA CONTA E SENHA' });
    };

    const conta = bancoDigital.contas.find((elemento) => {
        return elemento.numero === Number(numero_conta);
    });

    if (!conta) {
        return res.status(400).json({ mensagem: 'A CONTA NÃO EXISTE' })
    };

    if (conta.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'SENHA INVALIDA' })
    };

    const extrato = {
        depositos: [],
        saques: [],
        transferenciasEnviadas: [],
        transferenciasRecebidas: []
    }

    bancoDigital.depositos.map((deposito) => {
        if (deposito.numero_conta === conta.numero) {
            extrato.depositos.push(deposito)
        };
    })

    bancoDigital.saques.map((saque) => {
        if (saque.numero_conta === conta.numero) {
            extrato.saques.push(saque)
        };
    })

    bancoDigital.transferencias.map((transferencia) => {
        if (transferencia.numero_conta_origem === conta.numero) {
            extrato.transferenciasEnviadas.push(transferencia)
        };
        if (transferencia.numero_conta_destino === conta.numero) {
            extrato.transferenciasRecebidas.push(transferencia)
        }
    })

    return res.status(200).json({ extrato });
}

module.exports = {
    listarContasBancarias,
    criarContaBancaria,
    atualizarUsuarioContaBancaria,
    excluirContaBancaria,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}