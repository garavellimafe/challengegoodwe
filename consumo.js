// Estado global da aplicação
let dispositivosSelecionados = [];
let chartConsumo = null;
let configuracoes = {
    eficienciaGeral: 95,
    fatorPotencia: 0.95,
    perdaTransmissao: 5
};

// Dados dos dispositivos GoodWe com potências estimadas
const dispositivosGoodWe = {
    // Inversores Residenciais
    'DNS-G3': { nome: 'DNS-G3', categoria: 'residencial', potencia: 3000, imagem: 'DNS-G3.png' },
    'DNS-G4': { nome: 'DNS-G4', categoria: 'residencial', potencia: 4000, imagem: 'DNS-G4.png' },
    'MS-G3': { nome: 'MS-G3', categoria: 'residencial', potencia: 3000, imagem: 'MS-G3.png' },
    'MS-G4': { nome: 'MS-G4', categoria: 'residencial', potencia: 4000, imagem: 'MS-G4.png' },
    'XS-G3': { nome: 'XS-G3', categoria: 'residencial', potencia: 3000, imagem: 'XS-G3.png' },
    
    // Inversores Comerciais
    'ET50': { nome: 'ET50', categoria: 'comercial', potencia: 50000, imagem: 'ET50.png' },
    'ET1230': { nome: 'ET1230', categoria: 'comercial', potencia: 1230000, imagem: 'ET1230.png' },
    'HT': { nome: 'HT Series', categoria: 'comercial', potencia: 100000, imagem: 'HT.png' },
    'MT': { nome: 'MT Series', categoria: 'comercial', potencia: 75000, imagem: 'MT.png' },
    'UT': { nome: 'UT Series', categoria: 'comercial', potencia: 125000, imagem: 'UT.png' },
    
    // Baterias e Armazenamento
    'ESG2': { nome: 'ESG2', categoria: 'bateria', potencia: 5000, imagem: 'ESG2.png' },
    'SBP': { nome: 'SBP Series', categoria: 'bateria', potencia: 3300, imagem: 'SBPG2.png' },
    'LynxHome': { nome: 'Lynx Home U', categoria: 'bateria', potencia: 5000, imagem: 'LynxhomeU.png' },
    
    // Monitoramento
    'SEMS': { nome: 'SEMS Portal', categoria: 'monitoramento', potencia: 50, imagem: 'sems.png' },
    'WiFi Kit': { nome: 'WiFi Kit', categoria: 'monitoramento', potencia: 5, imagem: 'wiikit.png' },
    'EzLogger': { nome: 'EzLogger', categoria: 'monitoramento', potencia: 10, imagem: 'ezlogger.png' },
    
    // Carregadores Veiculares
    'EzLink': { nome: 'EzLink EV Charger', categoria: 'veicular', potencia: 7000, imagem: 'Ezlink.png' },
    'HCA7': { nome: 'HCA7', categoria: 'veicular', potencia: 7000, imagem: 'HCA7.png' },
    'HCA11': { nome: 'HCA11', categoria: 'veicular', potencia: 11000, imagem: 'HCA11.png' },
    
    // Sistemas Especiais
    'BT': { nome: 'BT Battery', categoria: 'bateria', potencia: 2560, imagem: 'BT.png' },
    'BTC': { nome: 'BTC Battery', categoria: 'bateria', potencia: 5120, imagem: 'BTC.png' },
    'Polaris': { nome: 'Polaris', categoria: 'comercial', potencia: 15000, imagem: 'polaris.png' }
};

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventListeners();
    carregarDispositivos();
    verificarServidorPython();
    inicializarSliders();
});

// Event Listeners
function inicializarEventListeners() {
    // Botões do cabeçalho
    document.getElementById('btnVoltar')?.addEventListener('click', () => {
        window.location.href = 'config_itens.html';
    });
    
    document.getElementById('btnConfiguracao')?.addEventListener('click', abrirModalConfiguracao);
    document.getElementById('btnExportarRelatorio')?.addEventListener('click', exportarRelatorio);
    
    // Controles de filtros e busca
    document.getElementById('campoBusca')?.addEventListener('input', filtrarDispositivos);
    document.getElementById('filtroCategoria')?.addEventListener('change', filtrarDispositivos);
    document.getElementById('btnSelecionarTodos')?.addEventListener('click', selecionarTodosDispositivos);
    
    // Controles de simulação
    document.getElementById('btnCalcular')?.addEventListener('click', calcularConsumo);
    
    // Toggle de visualização
    document.querySelectorAll('.btn_toggle').forEach(btn => {
        btn.addEventListener('click', alternarVisualizacao);
    });
    
    // Modal de configuração
    document.getElementById('btnFecharConfig')?.addEventListener('click', fecharModalConfiguracao);
    document.getElementById('btnAplicarConfig')?.addEventListener('click', aplicarConfiguracoes);
    
    // Fechar modal clicando fora
    document.getElementById('modalConfiguracao')?.addEventListener('click', (e) => {
        if (e.target.id === 'modalConfiguracao') {
            fecharModalConfiguracao();
        }
    });
}

// Verificar se o servidor Python está rodando
function verificarServidorPython() {
    fetch('http://127.0.0.1:5000/api/test')
        .then(response => {
            if (!response.ok) {
                throw new Error('Servidor não encontrado');
            }
            return response.json();
        })
        .catch(error => {
            console.warn('Servidor Python não encontrado, usando dados locais:', error);
            // Continua funcionando com dados locais
        });
}

// Carregar dispositivos na interface
function carregarDispositivos() {
    const grid = document.getElementById('gridDispositivos');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    Object.keys(dispositivosGoodWe).forEach(key => {
        const dispositivo = dispositivosGoodWe[key];
        const card = criarCardDispositivo(key, dispositivo);
        grid.appendChild(card);
    });
}

// Criar card de dispositivo
function criarCardDispositivo(id, dispositivo) {
    const card = document.createElement('div');
    card.className = 'dispositivo_card';
    card.dataset.id = id;
    card.dataset.categoria = dispositivo.categoria;
    
    card.innerHTML = `
        <img src="imagens/${dispositivo.imagem}" alt="${dispositivo.nome}" class="dispositivo_imagem" 
             onerror="this.style.display='none'">
        <div class="dispositivo_nome">${dispositivo.nome}</div>
        <div class="dispositivo_potencia">${formatarPotencia(dispositivo.potencia)}</div>
    `;
    
    card.addEventListener('click', () => toggleSelecaoDispositivo(id, dispositivo, card));
    
    return card;
}

// Toggle seleção de dispositivo
function toggleSelecaoDispositivo(id, dispositivo, card) {
    const index = dispositivosSelecionados.findIndex(d => d.id === id);
    
    if (index > -1) {
        // Remove seleção
        dispositivosSelecionados.splice(index, 1);
        card.classList.remove('selecionado');
    } else {
        // Adiciona seleção
        dispositivosSelecionados.push({
            id: id,
            ...dispositivo
        });
        card.classList.add('selecionado');
    }
    
    atualizarListaSelecionados();
}

// Atualizar lista de dispositivos selecionados
function atualizarListaSelecionados() {
    const lista = document.getElementById('listaSelecionados');
    const contador = document.getElementById('contadorSelecionados');
    
    if (!lista || !contador) return;
    
    contador.textContent = `${dispositivosSelecionados.length} dispositivo${dispositivosSelecionados.length !== 1 ? 's' : ''}`;
    
    if (dispositivosSelecionados.length === 0) {
        lista.innerHTML = '<p class="mensagem_vazia">Nenhum dispositivo selecionado</p>';
        return;
    }
    
    lista.innerHTML = dispositivosSelecionados.map(dispositivo => `
        <div class="item_selecionado">
            <span>${dispositivo.nome}</span>
            <span class="remover_item" onclick="removerDispositivo('${dispositivo.id}')">&times;</span>
        </div>
    `).join('');
}

// Remover dispositivo específico
function removerDispositivo(id) {
    const index = dispositivosSelecionados.findIndex(d => d.id === id);
    if (index > -1) {
        dispositivosSelecionados.splice(index, 1);
        
        // Remove seleção visual
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) card.classList.remove('selecionado');
        
        atualizarListaSelecionados();
    }
}

// Selecionar todos os dispositivos visíveis
function selecionarTodosDispositivos() {
    const cardsVisiveis = document.querySelectorAll('.dispositivo_card:not([style*="display: none"])');
    
    cardsVisiveis.forEach(card => {
        const id = card.dataset.id;
        if (!dispositivosSelecionados.find(d => d.id === id)) {
            const dispositivo = dispositivosGoodWe[id];
            if (dispositivo) {
                dispositivosSelecionados.push({
                    id: id,
                    ...dispositivo
                });
                card.classList.add('selecionado');
            }
        }
    });
    
    atualizarListaSelecionados();
}

// Filtrar dispositivos
function filtrarDispositivos() {
    const busca = document.getElementById('campoBusca').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;
    
    document.querySelectorAll('.dispositivo_card').forEach(card => {
        const nome = card.querySelector('.dispositivo_nome').textContent.toLowerCase();
        const cardCategoria = card.dataset.categoria;
        
        const matchBusca = nome.includes(busca);
        const matchCategoria = !categoria || cardCategoria === categoria;
        
        if (matchBusca && matchCategoria) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Inicializar sliders
function inicializarSliders() {
    const sliders = [
        { id: 'horasUso', valorId: 'valorHoras', sufixo: 'h' },
        { id: 'diasMes', valorId: 'valorDias', sufixo: ' dias' },
        { id: 'eficienciaGeral', valorId: 'valorEficiencia', sufixo: '%' },
        { id: 'perdaTransmissao', valorId: 'valorPerdas', sufixo: '%' }
    ];
    
    sliders.forEach(slider => {
        const elemento = document.getElementById(slider.id);
        const valorElemento = document.getElementById(slider.valorId);
        
        if (elemento && valorElemento) {
            elemento.addEventListener('input', () => {
                valorElemento.textContent = elemento.value + slider.sufixo;
            });
        }
    });
}

// Calcular consumo de energia
function calcularConsumo() {
    if (dispositivosSelecionados.length === 0) {
        alert('Selecione pelo menos um dispositivo para calcular o consumo.');
        return;
    }
    
    const horasUso = parseFloat(document.getElementById('horasUso').value);
    const diasMes = parseFloat(document.getElementById('diasMes').value);
    const tarifaEnergia = parseFloat(document.getElementById('tarifaEnergia').value);
    const periodo = document.getElementById('periodoAnalise').value;
    
    const resultados = dispositivosSelecionados.map(dispositivo => {
        const potenciaKw = dispositivo.potencia / 1000; // Converter para kW
        const eficiencia = configuracoes.eficienciaGeral / 100;
        const perdas = configuracoes.perdaTransmissao / 100;
        
        // Aplicar eficiência e perdas
        const potenciaReal = potenciaKw * eficiencia * (1 - perdas);
        
        const consumoDiario = potenciaReal * horasUso;
        const consumoMensal = consumoDiario * diasMes;
        const custoMensal = consumoMensal * tarifaEnergia;
        
        let consumoPeriodo, custoPeriodo;
        
        switch (periodo) {
            case 'diario':
                consumoPeriodo = consumoDiario;
                custoPeriodo = consumoDiario * tarifaEnergia;
                break;
            case 'semanal':
                consumoPeriodo = consumoDiario * 7;
                custoPeriodo = consumoDiario * 7 * tarifaEnergia;
                break;
            case 'anual':
                consumoPeriodo = consumoMensal * 12;
                custoPeriodo = custoMensal * 12;
                break;
            default: // mensal
                consumoPeriodo = consumoMensal;
                custoPeriodo = custoMensal;
        }
        
        return {
            dispositivo: dispositivo.nome,
            potencia: dispositivo.potencia,
            horasUso,
            consumoDiario: consumoDiario.toFixed(2),
            consumoMensal: consumoMensal.toFixed(2),
            custoMensal: custoMensal.toFixed(2),
            consumoPeriodo: consumoPeriodo.toFixed(2),
            custoPeriodo: custoPeriodo.toFixed(2)
        };
    });
    
    atualizarResultados(resultados, periodo);
}

// Atualizar resultados na interface
function atualizarResultados(resultados, periodo) {
    const consumoTotal = resultados.reduce((sum, r) => sum + parseFloat(r.consumoPeriodo), 0);
    const custoTotal = resultados.reduce((sum, r) => sum + parseFloat(r.custoPeriodo), 0);
    const co2Equivalente = consumoTotal * 0.0817; // kg CO2 por kWh (média Brasil)
    
    // Atualizar cards de resumo
    document.getElementById('consumoTotal').textContent = `${consumoTotal.toFixed(2)} kWh`;
    document.getElementById('custoTotal').textContent = `R$ ${custoTotal.toFixed(2)}`;
    document.getElementById('co2Equivalente').textContent = `${co2Equivalente.toFixed(2)} kg`;
    
    // Encontrar maior consumidor
    const maiorConsumidor = resultados.reduce((max, r) => 
        parseFloat(r.consumoPeriodo) > parseFloat(max.consumoPeriodo) ? r : max
    );
    document.getElementById('maiorConsumidor').textContent = maiorConsumidor.dispositivo;
    
    // Atualizar gráfico
    atualizarGrafico(resultados, periodo);
    
    // Atualizar tabela
    atualizarTabela(resultados);
}

// Atualizar gráfico
function atualizarGrafico(resultados, periodo) {
    const ctx = document.getElementById('chartConsumo');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (chartConsumo) {
        chartConsumo.destroy();
    }
    
    const labels = resultados.map(r => r.dispositivo);
    const dados = resultados.map(r => parseFloat(r.consumoPeriodo));
    const cores = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#fa709a', '#fee140', '#a8edea', '#fed6e3'
    ];
    
    chartConsumo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: cores,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const valor = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const porcentagem = ((valor / total) * 100).toFixed(1);
                            return `${label}: ${valor} kWh (${porcentagem}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Atualizar tabela
function atualizarTabela(resultados) {
    const tbody = document.getElementById('corpoTabela');
    if (!tbody) return;
    
    tbody.innerHTML = resultados.map(r => `
        <tr>
            <td>${r.dispositivo}</td>
            <td>${r.potencia}W</td>
            <td>${r.horasUso}h</td>
            <td>${r.consumoDiario} kWh</td>
            <td>${r.consumoMensal} kWh</td>
            <td>R$ ${r.custoMensal}</td>
        </tr>
    `).join('');
}

// Alternar visualização
function alternarVisualizacao(e) {
    const view = e.target.dataset.view;
    
    // Atualizar botões
    document.querySelectorAll('.btn_toggle').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Mostrar/esconder visualizações
    const grafico = document.getElementById('visualizacaoGrafico');
    const tabela = document.getElementById('visualizacaoTabela');
    
    if (view === 'grafico') {
        grafico.style.display = 'block';
        tabela.style.display = 'none';
    } else {
        grafico.style.display = 'none';
        tabela.style.display = 'block';
    }
}

// Modal de configuração
function abrirModalConfiguracao() {
    document.getElementById('modalConfiguracao').style.display = 'block';
    
    // Carregar valores atuais
    document.getElementById('eficienciaGeral').value = configuracoes.eficienciaGeral;
    document.getElementById('fatorPotencia').value = configuracoes.fatorPotencia;
    document.getElementById('perdaTransmissao').value = configuracoes.perdaTransmissao;
    
    // Atualizar displays
    document.getElementById('valorEficiencia').textContent = configuracoes.eficienciaGeral + '%';
    document.getElementById('valorPerdas').textContent = configuracoes.perdaTransmissao + '%';
}

function fecharModalConfiguracao() {
    document.getElementById('modalConfiguracao').style.display = 'none';
}

function aplicarConfiguracoes() {
    configuracoes.eficienciaGeral = parseInt(document.getElementById('eficienciaGeral').value);
    configuracoes.fatorPotencia = parseFloat(document.getElementById('fatorPotencia').value);
    configuracoes.perdaTransmissao = parseInt(document.getElementById('perdaTransmissao').value);
    
    fecharModalConfiguracao();
    
    // Recalcular se há dispositivos selecionados
    if (dispositivosSelecionados.length > 0) {
        calcularConsumo();
    }
}

// Exportar relatório
function exportarRelatorio() {
    if (dispositivosSelecionados.length === 0) {
        alert('Calcule o consumo primeiro para gerar um relatório.');
        return;
    }
    
    const horasUso = document.getElementById('horasUso').value;
    const diasMes = document.getElementById('diasMes').value;
    const tarifaEnergia = document.getElementById('tarifaEnergia').value;
    const periodo = document.getElementById('periodoAnalise').value;
    
    const consumoTotal = document.getElementById('consumoTotal').textContent;
    const custoTotal = document.getElementById('custoTotal').textContent;
    const co2Equivalente = document.getElementById('co2Equivalente').textContent;
    
    const relatorio = {
        timestamp: new Date().toLocaleString('pt-BR'),
        parametros: {
            horasUso,
            diasMes,
            tarifaEnergia,
            periodo
        },
        configuracoes,
        dispositivos: dispositivosSelecionados,
        resultados: {
            consumoTotal,
            custoTotal,
            co2Equivalente
        }
    };
    
    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_consumo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Funções utilitárias
function formatarPotencia(potencia) {
    if (potencia >= 1000000) {
        return (potencia / 1000000).toFixed(1) + ' MW';
    } else if (potencia >= 1000) {
        return (potencia / 1000).toFixed(1) + ' kW';
    } else {
        return potencia + ' W';
    }
}