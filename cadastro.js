const form = document.getElementById("formCadastro");
const inputs = form.querySelectorAll("input[required]");
const btnCadastrar = document.getElementById("btnCadastrar");

function verificarCampos() {
    let todosPreenchidos = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            todosPreenchidos = false;
        }
    });
    btnCadastrar.disabled = !todosPreenchidos;
}

inputs.forEach(input => {
    input.addEventListener("input", verificarCampos);
});

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
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

function validarCEP(cep) {
    const regex = /^[0-9]{5}-[0-9]{3}$/;
    return regex.test(cep);
}

const estadosBR = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const cidadesBR = [
    "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza",
    "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"
];

function validarEstado(estado) {
    return estadosBR.includes(estado.toUpperCase());
}

function validarCidade(cidade) {
    return cidadesBR.some(c => c.toLowerCase() === cidade.toLowerCase());
}

function validarSenha(senha) {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
}

// Validação visual dos requisitos da senha
const senhaInput = document.querySelector("input[placeholder='Digite sua senha']");
const reqMin = document.getElementById("req-min");
const reqLetra = document.getElementById("req-letra");
const reqNum = document.getElementById("req-num");
const reqEspecial = document.getElementById("req-especial");

senhaInput.addEventListener("input", () => {
    const senha = senhaInput.value;

    reqMin.classList.toggle("cumprido", senha.length >= 8);
    reqLetra.classList.toggle("cumprido", /[a-zA-Z]/.test(senha));
    reqNum.classList.toggle("cumprido", /\d/.test(senha));
    reqEspecial.classList.toggle("cumprido", /[\W_]/.test(senha));
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const idade = parseInt(form.querySelector("input[placeholder='Digite sua idade']").value);
    if (idade < 18) {
        alert("Cadastro inválido: você precisa ter 18 anos ou mais.");
        return;
    }

    const email = form.querySelector("input[type='email']").value.trim();
    if (!validarEmail(email)) {
        alert("Cadastro inválido: insira um e-mail válido.");
        return;
    }

    const cpf = form.querySelector("input[placeholder='CPF']").value.trim();
    if (!validarCPF(cpf)) {
        alert("Cadastro inválido: insira um CPF válido.");
        return;
    }

    const cep = form.querySelector("input[placeholder='CEP']").value.trim();
    if (!validarCEP(cep)) {
        alert("Cadastro inválido: insira um CEP válido (ex: 12345-678).");
        return;
    }

    const estado = form.querySelector("input[placeholder='Digite seu estado']").value.trim();
    if (!validarEstado(estado)) {
        alert("Cadastro inválido: insira um estado brasileiro válido (ex: SP, RJ, MG).");
        return;
    }

    const cidade = form.querySelector("input[placeholder='Digite sua cidade']").value.trim();
    if (!validarCidade(cidade)) {
        alert("Cadastro inválido: insira uma cidade brasileira válida.");
        return;
    }

    const senha = senhaInput.value.trim();
    const confirmarSenha = form.querySelector("input[placeholder='Confirme sua senha']").value.trim();

    if (!validarSenha(senha)) {
        alert("Cadastro inválido: a senha deve ter no mínimo 8 caracteres, incluindo letras, números e caracteres especiais.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("Cadastro inválido: as senhas não coincidem.");
        return;
    }

    window.location.href = "config_itens.html";
});