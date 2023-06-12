function validarSenha(req, res, next) {
    const { senha } = req.query;

    if (!senha) {
        return res.status(400).json({ mensagem: "SENHA NÃO INFORMADA" });
    }

    if (senha !== 'Cubos123Bank') {
        return res.status(404).json({ mensagem: "SENHA INCORRETA" });
    }

    next();
}

module.exports = {
    validarSenha
}