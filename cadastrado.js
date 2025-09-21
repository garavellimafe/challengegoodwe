document.addEventListener("DOMContentLoaded", () => {
    const btnEntrar = document.getElementById("btnEntrar");

    btnEntrar.addEventListener("click", () => {
        const emailCpf = document.getElementById("emailCpf").value.trim();
        const senha = document.getElementById("senha").value.trim();

        if (emailCpf === "" || senha === "") {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        // Validação de email
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCpf);

        // Validação de CPF
        const cpfLimpo = emailCpf.replace(/[^\d]/g, "");
        const cpfValido = validarCPF(cpfLimpo);

        if (!emailValido && !cpfValido) {
            alert("Insira um email ou CPF válido.");
            return;
        }

        // Validação de senha
        const senhaValida = validarSenha(senha);
        if (!senhaValida) {
            alert("Senha incorreta.");
            return;
        }

        // Redireciona se tudo estiver ok
        window.location.href = "config_itens.html";
    });

    // Função para validar CPF
    function validarCPF(cpf) {
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
        let soma = 0, resto;

        for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf[9])) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;

        return resto === parseInt(cpf[10]);
    }

    // Função para validar senha
    function validarSenha(senha) {
        const temMinimo = senha.length >= 8;
        const temLetra = /[a-zA-Z]/.test(senha);
        const temNumero = /\d/.test(senha);
        const temEspecial = /[\W_]/.test(senha);

        return temMinimo && temLetra && temNumero && temEspecial;
    }
});