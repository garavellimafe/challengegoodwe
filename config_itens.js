document.addEventListener("DOMContentLoaded", function () {
    // ELEMENTOS PRINCIPAIS
    const modal = document.getElementById("interfaceModal");
    const botaoAdicionar = document.getElementById("botaoAdicionar");
    const fecharModal = document.getElementById("fecharModal");
    const gridSelecionados = document.getElementById("gridSelecionados");
    
    // FUNÇÃO PARA SINCRONIZAR ITENS COM O BACKEND
    async function syncItensComBackend() {
        try {
            const itens = Array.from(gridSelecionados.querySelectorAll(".item_selecionado")).map(item => {
                const nome = item.querySelector("span")?.textContent || "";
                const img = item.querySelector("img")?.getAttribute("src") || null;
                const ativo = item.getAttribute("data-ativo") === "true";
                const prioridade = item.getAttribute("data-prioridade") === "true";
                return { nome, img, ativo, prioridade };
            });
            
            const response = await fetch('/api/itens-selecionados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itens })
            });
            
            if (response.ok) {
                console.log(`✅ ${itens.length} itens sincronizados com o backend`);
            } else {
                console.error('❌ Erro ao sincronizar itens:', await response.text());
            }
        } catch (error) {
            console.error('❌ Erro de conexão ao sincronizar itens:', error);
        }
    }
    
     // FUNÇÃO PARA EXTRAIR ITENS DISPONÍVEIS DO MODAL
    function getItensDisponiveis() {
        const itens = [];
        document.querySelectorAll(".item_adicionavel1").forEach(item => {
            const span = item.querySelector("span");
            if (span) {
                const nome = span.textContent.trim();
                if (nome) { // Só adiciona se tiver nome
                    itens.push(nome);
                }
            }
        });
        console.log(`📦 Itens disponíveis encontrados: ${itens.length}`, itens);
        return itens;
    }nLimpar = document.getElementById("btnLimpar");
    const campoPesquisa = document.getElementById("campoPesquisa");
    const btnExportar = document.getElementById("btnExportar");
    const btnImportar = document.getElementById("btnImportar");
    const inputImportar = document.getElementById("inputImportar");

    // MODAL DE NOMEAÇÃO
    const modalNomeacao = document.getElementById("modalNomeacao");
    const imagemPreview = document.getElementById("imagemPreview");
    const inputNomePersonalizado = document.getElementById("inputNomePersonalizado");
    const confirmarNomeacao = document.getElementById("confirmarNomeacao");
    const removerItemSelecionado = document.getElementById("removerItemSelecionado");
    const sliderAtivo = document.getElementById("sliderAtivo");
    const statusTexto = document.getElementById("statusTexto");
    const sliderPrioridade = document.getElementById("sliderPrioridade");
    const prioridadeTexto = document.getElementById("prioridadeTexto");
    const btnAssistenteNomeacao = document.getElementById("btnAssistenteNomeacao");
    const chatModal = document.getElementById("chatModal");
    const chatBody = document.getElementById("chatBody");

    let itemSelecionadoParaEdicao = null;
    let imagemSelecionadaTemp = null;
    let nomeOriginalTemp = "";

    // CATEGORIAS
    const categorias = {
        btnResidenciais: "listaResidenciais",
        btnCI: "listaCI",
        btnBaterias: "listaBaterias",
        btnMonitoramento: "listaMonitoramento",
        btnVeicular: "listaVeicular",
        btnBIPV: "listaBIPV",
        btnSolo: "listaSolo",
        btnArmazenamento: "listaArmazenamento"
    };

    // ABRIR MODAL PRINCIPAL
    botaoAdicionar?.addEventListener("click", () => {
        modal.style.display = "flex";
        mostrarLista("listaResidenciais");
    });

    // FECHAR MODAL PRINCIPAL
    fecharModal?.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // MOSTRAR LISTA DE CATEGORIA
    Object.keys(categorias).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener("click", () => {
                mostrarLista(categorias[btnId]);
            });
        }
    });

    function mostrarLista(id) {
        esconderTodasAsListas();
        const lista = document.getElementById(id);
        if (lista) lista.style.display = "grid";
    }

    function esconderTodasAsListas() {
        Object.values(categorias).forEach(id => {
            const lista = document.getElementById(id);
            if (lista) lista.style.display = "none";
        });
    }

    // ADICIONAR ITEM SELECIONADO
    function adicionarItemSelecionado(nomeItem, imagemSrc, ativo, prioridade = false) {
        const novoItem = document.createElement("div");
        novoItem.classList.add("item_selecionado");
        novoItem.setAttribute("data-ativo", String(ativo)); // Garante que seja string
        novoItem.setAttribute("data-prioridade", String(prioridade)); // Garante que seja string
        novoItem.title = "Clique para editar";

        if (imagemSrc) {
            const img = document.createElement("img");
            img.src = imagemSrc;
            img.alt = nomeItem;
            // Adiciona um listener de erro para não adicionar imagens quebradas
            img.onerror = function() {
                this.remove(); // Remove o elemento img se a imagem não carregar
            };
            novoItem.appendChild(img);
        }

        const contentDiv = document.createElement("div");
        contentDiv.className = "item_content";
        
        const texto = document.createElement("span");
        texto.textContent = nomeItem;
        contentDiv.appendChild(texto);
        novoItem.appendChild(contentDiv);

        const switchContainer = document.createElement("div");
        switchContainer.className = "switch_container";

        // Adiciona o slider de ativo em uma row
        const switchRowAtivo = document.createElement("div");
        switchRowAtivo.className = "switch_row";
        
        const labelSwitchAtivo = document.createElement("label");
        labelSwitchAtivo.className = "switch switch-inline";
        const inputSwitchAtivo = document.createElement("input");
        inputSwitchAtivo.type = "checkbox";
        inputSwitchAtivo.className = "switchAtivoGrid";
        inputSwitchAtivo.checked = ativo;
        inputSwitchAtivo.addEventListener("change", function(e) {
            novoItem.setAttribute("data-ativo", e.target.checked);
        });
        const spanSliderAtivo = document.createElement("span");
        spanSliderAtivo.className = "slider";
        labelSwitchAtivo.appendChild(inputSwitchAtivo);
        labelSwitchAtivo.appendChild(spanSliderAtivo);
        switchRowAtivo.appendChild(labelSwitchAtivo);

        const statusTexto = document.createElement("span");
        statusTexto.className = "statusTextoGrid";
        statusTexto.textContent = inputSwitchAtivo.checked ? "Ativado" : "Desativado";
        inputSwitchAtivo.addEventListener("change", function(e) {
            statusTexto.textContent = e.target.checked ? "Ativado" : "Desativado";
        });
        switchRowAtivo.appendChild(statusTexto);
        switchContainer.appendChild(switchRowAtivo);

        // Adiciona o slider de prioritário em uma nova row
        const switchRowPrioridade = document.createElement("div");
        switchRowPrioridade.className = "switch_row";
        
        const labelSwitchPrioridade = document.createElement("label");
        labelSwitchPrioridade.className = "switch switch-inline";
        const inputSwitchPrioridade = document.createElement("input");
        inputSwitchPrioridade.type = "checkbox";
        inputSwitchPrioridade.className = "switchPrioridadeGrid";
        inputSwitchPrioridade.checked = prioridade; // Usa o valor passado
        inputSwitchPrioridade.addEventListener("change", function(e) {
            novoItem.setAttribute("data-prioridade", e.target.checked);
        });
        const spanSliderPrioridade = document.createElement("span");
        spanSliderPrioridade.className = "slider";
        labelSwitchPrioridade.appendChild(inputSwitchPrioridade);
        labelSwitchPrioridade.appendChild(spanSliderPrioridade);
        switchRowPrioridade.appendChild(labelSwitchPrioridade);

        const prioridadeTexto = document.createElement("span");
        prioridadeTexto.className = "prioridadeTextoGrid";
        prioridadeTexto.textContent = inputSwitchPrioridade.checked ? "Prioritário" : "Normal";
        inputSwitchPrioridade.addEventListener("change", function(e) {
            prioridadeTexto.textContent = e.target.checked ? "Prioritário" : "Normal";
        });
        switchRowPrioridade.appendChild(prioridadeTexto);
        switchContainer.appendChild(switchRowPrioridade);

        novoItem.appendChild(switchContainer);
        gridSelecionados.appendChild(novoItem);
        
        // Sincroniza com o backend após adicionar item
        syncItensComBackend();
    }

    // CLIQUE EM ITEM ADICIONÁVEL
    document.querySelectorAll(".lista_adicionavel").forEach(lista => {
        lista.addEventListener("click", (e) => {
            const item = e.target.closest(".item_adicionavel1");
            if (!item) return;

            const span = item.querySelector("span");
            nomeOriginalTemp = span ? span.textContent.trim() : item.textContent.trim();

            const imgTag = item.querySelector("img");
            imagemSelecionadaTemp = imgTag ? imgTag.getAttribute("src") : null;

            sliderAtivo.checked = false;
            sliderPrioridade.checked = false;

            imagemPreview.src = imagemSelecionadaTemp || "";
            inputNomePersonalizado.value = nomeOriginalTemp;
            itemSelecionadoParaEdicao = null;

            modal.style.display = "none";
            modalNomeacao.style.display = "flex";
        });
    });

    // CLIQUE EM ITEM SELECIONADO
    gridSelecionados?.addEventListener("click", (e) => {
        const item = e.target.closest(".item_selecionado");
        if (!item) return;

        const span = item.querySelector("span");
        nomeOriginalTemp = span ? span.textContent.trim() : item.textContent.trim();

        const imgTag = item.querySelector("img");
        imagemSelecionadaTemp = imgTag ? imgTag.getAttribute("src") : null;

        const ativo = item.getAttribute("data-ativo") === "true";
        sliderAtivo.checked = ativo;

        const prioridade = item.getAttribute("data-prioridade") === "true";
        sliderPrioridade.checked = prioridade;

        imagemPreview.src = imagemSelecionadaTemp || "";
        inputNomePersonalizado.value = nomeOriginalTemp;
        itemSelecionadoParaEdicao = item;

        modalNomeacao.style.display = "flex";
    });

    // CONFIRMAR NOMEAÇÃO
    confirmarNomeacao?.addEventListener("click", () => {
        const nomeFinal = inputNomePersonalizado.value.trim();
        const ativo = sliderAtivo.checked;
        const prioridade = sliderPrioridade.checked;
        if (!nomeFinal) return;

        if (itemSelecionadoParaEdicao) {
            const span = itemSelecionadoParaEdicao.querySelector("span");
            if (span) span.textContent = nomeFinal;

            itemSelecionadoParaEdicao.setAttribute("data-ativo", ativo);
            itemSelecionadoParaEdicao.setAttribute("data-prioridade", prioridade);

            // Atualiza os sliders existentes ou adiciona novos
            let switchAtivo = itemSelecionadoParaEdicao.querySelector(".switchAtivoGrid");
            let statusTexto = itemSelecionadoParaEdicao.querySelector(".statusTextoGrid");
            let switchPrioridade = itemSelecionadoParaEdicao.querySelector(".switchPrioridadeGrid");
            let prioridadeTexto = itemSelecionadoParaEdicao.querySelector(".prioridadeTextoGrid");

            if (!switchAtivo) {
                // Adiciona o slider de ativo se não existir
                const labelSwitchAtivo = document.createElement("label");
                labelSwitchAtivo.className = "switch switch-inline";
                const inputSwitchAtivo = document.createElement("input");
                inputSwitchAtivo.type = "checkbox";
                inputSwitchAtivo.className = "switchAtivoGrid";
                inputSwitchAtivo.checked = ativo;
                const spanSliderAtivo = document.createElement("span");
                spanSliderAtivo.className = "slider";
                labelSwitchAtivo.appendChild(inputSwitchAtivo);
                labelSwitchAtivo.appendChild(spanSliderAtivo);
                itemSelecionadoParaEdicao.appendChild(labelSwitchAtivo);

                statusTexto = document.createElement("span");
                statusTexto.className = "statusTextoGrid";
                itemSelecionadoParaEdicao.appendChild(statusTexto);
            } else {
                switchAtivo.checked = ativo;
            }

            if (!switchPrioridade) {
                // Adiciona o slider de prioridade se não existir
                const labelSwitchPrioridade = document.createElement("label");
                labelSwitchPrioridade.className = "switch switch-inline";
                const inputSwitchPrioridade = document.createElement("input");
                inputSwitchPrioridade.type = "checkbox";
                inputSwitchPrioridade.className = "switchPrioridadeGrid";
                inputSwitchPrioridade.checked = prioridade;
                const spanSliderPrioridade = document.createElement("span");
                spanSliderPrioridade.className = "slider";
                labelSwitchPrioridade.appendChild(inputSwitchPrioridade);
                labelSwitchPrioridade.appendChild(spanSliderPrioridade);
                itemSelecionadoParaEdicao.appendChild(labelSwitchPrioridade);

                prioridadeTexto = document.createElement("span");
                prioridadeTexto.className = "prioridadeTextoGrid";
                itemSelecionadoParaEdicao.appendChild(prioridadeTexto);
            } else {
                switchPrioridade.checked = prioridade;
            }

            // Atualiza os textos
            statusTexto.textContent = ativo ? "Ativado" : "Desativado";
            prioridadeTexto.textContent = prioridade ? "Prioritário" : "Normal";

            itemSelecionadoParaEdicao = null;
        } else {
            adicionarItemSelecionado(nomeFinal, imagemSelecionadaTemp, ativo, prioridade);
        }
        modalNomeacao.style.display = "none";
    });

    // REMOVER ITEM
    removerItemSelecionado?.addEventListener("click", () => {
        if (itemSelecionadoParaEdicao) {
            itemSelecionadoParaEdicao.remove();
            itemSelecionadoParaEdicao = null;
            // Sincroniza com o backend após remover item
            syncItensComBackend();
        }
        modalNomeacao.style.display = "none";
    });

    // LIMPAR TODOS
    btnLimpar?.addEventListener("click", () => {
        gridSelecionados.innerHTML = "";
        campoPesquisa.value = "";
        // Sincroniza com o backend após limpar todos
        syncItensComBackend();
    });

    // BUSCA
    campoPesquisa?.addEventListener("input", () => {
        const termo = campoPesquisa.value.toLowerCase();
        const itens = gridSelecionados.querySelectorAll(".item_selecionado");
        itens.forEach(item => {
            const texto = item.textContent.toLowerCase();
            item.style.display = texto.includes(termo) ? "" : "none";
        });
    });

    // EXPORTAR ITENS SELECIONADOS EM JSON
    btnExportar?.addEventListener("click", () => {
        const itens = Array.from(gridSelecionados.querySelectorAll(".item_selecionado")).map(item => {
            const nome = item.querySelector("span")?.textContent || "";
            const img = item.querySelector("img")?.getAttribute("src") || null;
            const ativo = item.getAttribute("data-ativo") === "true";
            const prioridade = item.getAttribute("data-prioridade") === "true";
            return { nome, img, ativo, prioridade };
        });
        const blob = new Blob([JSON.stringify(itens, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "itens_selecionados.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // IMPORTAR ITENS SELECIONADOS DE JSON
    btnImportar?.addEventListener("click", () => {
        inputImportar.click();
    });

    inputImportar?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const itens = JSON.parse(evt.target.result);
                gridSelecionados.innerHTML = "";
                itens.forEach(item => {
                    // CORREÇÃO: Usa a função completa para adicionar item
                    adicionarItemSelecionado(
                        item.nome || "Sem nome", 
                        item.img || null, 
                        item.ativo || false, 
                        item.prioridade || false
                    );
                });
                console.log(`${itens.length} itens importados com sucesso.`);
            } catch (err) {
                alert("Arquivo JSON inválido ou formato incompatível.");
                console.error("Erro ao importar:", err);
            }
        };
        reader.readAsText(file);
        inputImportar.value = "";
    });

    // FUNÇÃO PARA EXTRAIR ITENS DISPONÍVEIS DO MODAL
    function getItensDisponiveis() {
        const itens = [];
        document.querySelectorAll(".item_adicionavel1").forEach(item => {
            const span = item.querySelector("span");
            if (span && span.textContent.trim()) {
                itens.push(span.textContent.trim());
            }
        });
        return itens;
    }

    // FUNÇÕES DE MANIPULAÇÃO DE ITENS PARA IA
    function getItensAtuais() {
        const itens = Array.from(gridSelecionados.querySelectorAll(".item_selecionado")).map(item => {
            const span = item.querySelector("span");
            const itemData = {
                nome: span?.textContent || "",
                ativo: item.getAttribute("data-ativo") === "true",
                prioridade: item.getAttribute("data-prioridade") === "true",
            };
            return itemData;
        });
        console.log(`📋 Itens atuais encontrados: ${itens.length}`, itens);
        return itens;
    }

    function removerItemPeloNome(nome) {
        const itemParaRemover = Array.from(gridSelecionados.querySelectorAll(".item_selecionado")).find(item => {
            const span = item.querySelector("span");
            return span && span.textContent.trim().toLowerCase() === nome.toLowerCase();
        });
        if (itemParaRemover) {
            itemParaRemover.remove();
            console.log(`Item "${nome}" removido.`);
            // Sincroniza com o backend após remover item
            syncItensComBackend();
            return true;
        } else {
            console.log(`Item "${nome}" não encontrado para remoção.`);
            return false;
        }
    }

    function atualizarItemPeloNome(nomeOriginal, novoNome, ativo, prioridade) {
        const itemParaAtualizar = Array.from(gridSelecionados.querySelectorAll(".item_selecionado")).find(item => {
            const span = item.querySelector("span");
            return span && span.textContent.trim().toLowerCase() === nomeOriginal.toLowerCase();
        });

        if (itemParaAtualizar) {
            if (novoNome && novoNome !== nomeOriginal) {
                const span = itemParaAtualizar.querySelector("span");
                if (span) span.textContent = novoNome;
            }
            if (ativo !== undefined) {
                itemParaAtualizar.setAttribute("data-ativo", ativo);
                const switchAtivo = itemParaAtualizar.querySelector(".switchAtivoGrid");
                const statusTexto = itemParaAtualizar.querySelector(".statusTextoGrid");
                if (switchAtivo) switchAtivo.checked = ativo;
                if (statusTexto) statusTexto.textContent = ativo ? "Ativado" : "Desativado";
            }
            if (prioridade !== undefined) {
                itemParaAtualizar.setAttribute("data-prioridade", prioridade);
                const switchPrioridade = itemParaAtualizar.querySelector(".switchPrioridadeGrid");
                const prioridadeTexto = itemParaAtualizar.querySelector(".prioridadeTextoGrid");
                if (switchPrioridade) switchPrioridade.checked = prioridade;
                if (prioridadeTexto) prioridadeTexto.textContent = prioridade ? "Prioritário" : "Normal";
            }
            console.log(`✅ Item "${nomeOriginal}" atualizado.`);
            return true;
        } else {
            console.log(`❌ Item "${nomeOriginal}" não encontrado para atualização.`);
            return false;
        }
    }

    function executarAcao(acao) {
        const { funcao, argumentos } = acao;
        console.log("🎯 Executando ação:", funcao, argumentos);

        switch (funcao) {
            case "adicionar_item":
                // CORREÇÃO: Validação de argumentos
                if (!argumentos || !argumentos.nome) {
                    console.warn("❌ Nome do item não fornecido para adicionar");
                    return false;
                }
                
                console.log(`➕ Tentando adicionar: ${argumentos.nome}`);
                
                // Tenta encontrar a imagem correspondente na lista de itens disponíveis
                const itemOriginal = Array.from(document.querySelectorAll(".item_adicionavel1")).find(item => {
                    const span = item.querySelector("span");
                    if (span) {
                        const nomeItem = span.textContent.trim();
                        console.log(`🔍 Comparando: "${argumentos.nome}" com "${nomeItem}"`);
                        return nomeItem.toLowerCase() === argumentos.nome.toLowerCase();
                    }
                    return false;
                });
                
                const imagemSrc = itemOriginal ? itemOriginal.querySelector("img")?.src : null;
                console.log(`🖼️ Imagem encontrada: ${imagemSrc ? 'Sim' : 'Não'}`);

                adicionarItemSelecionado(argumentos.nome, imagemSrc, argumentos.ativo || false, argumentos.prioridade || false);
                console.log(`✅ Item "${argumentos.nome}" adicionado com sucesso`);
                return true;
                
            case "remover_item":
                if (!argumentos || !argumentos.nome) {
                    console.warn("❌ Nome do item não fornecido para remover");
                    return false;
                }
                console.log(`🗑️ Tentando remover: ${argumentos.nome}`);
                const removido = removerItemPeloNome(argumentos.nome);
                console.log(`${removido ? '✅' : '❌'} Remoção do item "${argumentos.nome}": ${removido ? 'sucesso' : 'falhou'}`);
                return removido;
                
            case "atualizar_item":
                if (!argumentos || !argumentos.nome_original) {
                    console.warn("❌ Nome original do item não fornecido para atualizar");
                    return false;
                }
                console.log(`🔧 Tentando atualizar: ${argumentos.nome_original}`);
                const atualizado = atualizarItemPeloNome(argumentos.nome_original, argumentos.novo_nome, argumentos.ativo, argumentos.prioridade);
                console.log(`${atualizado ? '✅' : '❌'} Atualização do item "${argumentos.nome_original}": ${atualizado ? 'sucesso' : 'falhou'}`);
                return atualizado;
                
            default:
                console.warn(`❌ Função desconhecida: ${funcao}`);
                return false;
        }
    }

    // CHAT
    const chatClose = document.getElementById("chatClose");
    const chatInput = document.getElementById("chatInput");
    const chatSend = document.getElementById("chatSend");
    
    // SISTEMA DE SESSÃO PARA MEMÓRIA DA IA
    let sessaoAtual = null;
    
    // Gera ou recupera ID de sessão único
    function obterSessaoId() {
        if (!sessaoAtual) {
            // Tenta recuperar sessão existente do localStorage
            sessaoAtual = localStorage.getItem('goodwe_chat_session');
            if (!sessaoAtual) {
                // Gera nova sessão
                sessaoAtual = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('goodwe_chat_session', sessaoAtual);
                console.log('🆕 Nova sessão criada:', sessaoAtual);
            } else {
                console.log('🔄 Sessão recuperada:', sessaoAtual);
            }
        }
        return sessaoAtual;
    }
    
    // Função para limpar sessão (pode ser chamada para "esquecer" a conversa)
    function limparSessao() {
        localStorage.removeItem('goodwe_chat_session');
        sessaoAtual = null;
        chatBody.innerHTML = "";
        console.log('🧹 Sessão limpa');
    }

    document.querySelectorAll(".cabecalho_item").forEach(item => {
        if (item.textContent.trim().toLowerCase() === "assistente virtual") {
            item.addEventListener("click", () => {
                chatModal.style.display = "flex";
                if (chatBody.innerHTML.trim() === "") {
                    chatBody.innerHTML = '<div class="msg-ia">Olá! Sou seu assistente virtual. Como posso ajudar?</div>';
                }
            });
        }
    });

    btnAssistenteNomeacao?.addEventListener("click", () => {
        chatModal.style.display = "flex";
        if (chatBody.innerHTML.trim() === "") {
            chatBody.innerHTML = '<div class="msg-ia">Olá! Sou seu assistente virtual. Como posso ajudar?</div>';
        }
    });

    chatClose?.addEventListener("click", () => {
        chatModal.style.display = "none";
    });
    
    // Botão para limpar memória da IA
    const btnLimparMemoria = document.getElementById("btnLimparMemoria");
    btnLimparMemoria?.addEventListener("click", () => {
        if (confirm("Deseja realmente limpar a memória da conversa? A IA esquecerá tudo que foi dito anteriormente.")) {
            limparSessao();
            chatBody.innerHTML = `<div class="msg-ia">Memória limpa! Olá novamente, como posso ajudar?</div>`;
        }
    });

    function enviarMensagem() {
        const msg = chatInput.value.trim();
        if (!msg) return;

        chatBody.innerHTML += `<div class="msg-usuario">${msg}</div>`;
        chatInput.value = "";
        chatBody.scrollTop = chatBody.scrollHeight;

        const loadingId = "loading-" + Date.now();
        chatBody.innerHTML += `<div class="msg-ia" id="${loadingId}">Digitando...</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;

        // Coleta os itens atuais e disponíveis para enviar como contexto para a IA
        const itensAtuais = getItensAtuais();
        const itensDisponiveis = getItensDisponiveis();
        
        console.log("📤 Enviando para IA:", {
            mensagem: msg,
            itens_atuais: itensAtuais.length,
            itens_disponiveis: itensDisponiveis.length,
            sessao_id: obterSessaoId()
        });

        // Timeout para a API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

        fetch("http://localhost:3080/api/assistente", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                mensagem: msg, 
                itens: itensAtuais,
                itens_disponiveis: itensDisponiveis,
                sessao_id: obterSessaoId()  // Inclui ID da sessão
            }),
            signal: controller.signal
        })
        .then(async (r) => {
            if (!r.ok) {
                const err = await r.json();
                throw new Error(err.erro || "Erro na comunicação com a API.");
            }
            return r.json();
        })
        .then((data) => {
            clearTimeout(timeoutId); // Limpa o timeout se a requisição foi bem-sucedida
            const loadingDiv = document.getElementById(loadingId);
            
            // Atualiza sessão se recebida do servidor
            if (data.sessao_id) {
                sessaoAtual = data.sessao_id;
                localStorage.setItem('goodwe_chat_session', sessaoAtual);
            }
            
            // Exibe a resposta da IA
            if (data.resposta) {
                loadingDiv.innerHTML = data.resposta;
            } else {
                loadingDiv.remove();
            }

            // EXECUTA AS AÇÕES RETORNADAS PELA IA (CORREÇÃO PRINCIPAL)
            if (data.acoes && Array.isArray(data.acoes)) {
                let acoesExecutadas = 0;
                let mensagensAcao = [];
                
                data.acoes.forEach(acao => {
                    try {
                        const sucesso = executarAcao(acao);
                        if (sucesso) {
                            acoesExecutadas++;
                            // Gera mensagem de confirmação específica
                            switch(acao.funcao) {
                                case "adicionar_item":
                                    mensagensAcao.push(`➕ Adicionado: ${acao.argumentos.nome}`);
                                    break;
                                case "remover_item":
                                    mensagensAcao.push(`🗑️ Removido: ${acao.argumentos.nome}`);
                                    break;
                                case "atualizar_item":
                                    let detalhes = [];
                                    if (acao.argumentos.ativo !== undefined) detalhes.push(acao.argumentos.ativo ? "Ativado" : "Desativado");
                                    if (acao.argumentos.prioridade !== undefined) detalhes.push(acao.argumentos.prioridade ? "Prioritário" : "Normal");
                                    mensagensAcao.push(`🔧 Atualizado: ${acao.argumentos.nome_original} (${detalhes.join(", ")})`);
                                    break;
                            }
                        }
                    } catch (error) {
                        console.error("Erro ao executar ação:", error);
                        chatBody.innerHTML += `<div class="msg-ia" style="color: red;">❌ Erro ao executar ação: ${error.message}</div>`;
                    }
                });
                
                if (acoesExecutadas > 0) {
                    chatBody.innerHTML += `<div class="msg-ia" style="color: green; font-size: 0.9em; margin-top: 10px;">${mensagensAcao.join('<br>')}</div>`;
                }
            }

            chatBody.scrollTop = chatBody.scrollHeight;
        })
        .catch((err) => {
            clearTimeout(timeoutId);
            const loadingDiv = document.getElementById(loadingId);
            if (loadingDiv) {
                let mensagemErro = "Erro na comunicação com a IA.";
                
                if (err.name === 'AbortError') {
                    mensagemErro = "Tempo limite excedido. Tente novamente.";
                } else if (err.message.includes("Failed to fetch")) {
                    mensagemErro = "Servidor não está rodando. Execute: python config_itens.py";
                } else if (err.message) {
                    mensagemErro = err.message;
                }
                
                loadingDiv.innerHTML = `Erro: ${mensagemErro}`;
                loadingDiv.style.color = "red";
            }
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    chatSend?.addEventListener("click", enviarMensagem);
    chatInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") enviarMensagem();
    });
});