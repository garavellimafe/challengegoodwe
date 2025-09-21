from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai
import json
import re

load_dotenv()

try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel(
        "gemini-1.5-flash",
        generation_config={
            "temperature": 0.7,
            "max_output_tokens": 500,
        },
    )
    print("OK ▶ Modelo da Gemini carregado com sucesso.")
except Exception as e:
    print(f"ERRO ▶ ao configurar a API da Gemini: {e}")
    model = None

app = Flask(__name__)
CORS(app)


def carregar_catalogo_html():
    try:
        base = os.path.dirname(os.path.abspath(__file__))
        caminho = os.path.join(base, 'config_itens.html')
        if not os.path.exists(caminho):
            return []
        with open(caminho, 'r', encoding='utf-8', errors='ignore') as f:
            html = f.read()
        # Coleta todos os <span> de itens
        nomes = re.findall(r"<span>([^<]+)</span>", html, flags=re.IGNORECASE)
        nomes = [n.strip() for n in nomes if n.strip()]
        # Remove rótulos/ruídos
        blacklist = {"Itens selecionados:", "Buscar item..."}
        nomes = [n for n in nomes if n not in blacklist]
        # Únicos preservando ordem
        return list(dict.fromkeys(nomes))
    except Exception:
        return []


@app.route("/api/assistente", methods=["POST"])
def assistente():
    if not model:
        return jsonify({"erro": "Modelo de IA não foi inicializado corretamente."}), 500

    try:
        dados = request.get_json() or {}
        mensagem_usuario = dados.get("mensagem")
        itens_atuais = dados.get("itens", [])
        itens_disponiveis = dados.get("itens_disponiveis", [])
        sessao_id = dados.get("sessao_id")

        if not mensagem_usuario:
            return jsonify({"erro": "Nenhuma mensagem fornecida."}), 400

        print(f"MSG ▶ {mensagem_usuario}")
        print(f"ATUAIS ▶ {itens_atuais}")

        acoes = []
        mensagem_lower = (mensagem_usuario or "").lower()

        def normalizar(txt):
            return re.sub(r"\s+", " ", (txt or "").strip().lower())

        def melhor_match_produto(mensagem, candidatos):
            msg = normalizar(mensagem)
            melhor = None
            melhor_score = 0
            for cand in (candidatos or []):
                c = normalizar(cand)
                palavras = [w for w in re.split(r"[^\w]+", c) if len(w) > 2]
                score = sum(1 for w in palavras if w and w in msg)
                if score > melhor_score:
                    melhor_score = score
                    melhor = cand
            return melhor

        # Une catálogo do HTML com lista vinda do front
        catalogo = carregar_catalogo_html()
        nomes_disponiveis = list(dict.fromkeys((itens_disponiveis or []) + catalogo))
        nomes_atuais = [it.get("nome", "") for it in (itens_atuais or []) if it.get("nome")]

        # ADICIONAR
        if any(p in mensagem_lower for p in ["adicionar", "adicione", "add", "colocar", "incluir", "quero", "preciso"]):
            print("INT ⇢ adicionar")
            alvo = melhor_match_produto(mensagem_lower, nomes_disponiveis)
            if not alvo:
                chaves = ["dns", "xs", "ms", "sdt", "lynx", "inversor", "bateria"]
                cand = [p for p in nomes_disponiveis if any(k in p.lower() for k in chaves)]
                if cand:
                    alvo = cand[0]
            if alvo:
                acoes.append({
                    "funcao": "adicionar_item",
                    "argumentos": {
                        "nome": alvo,
                        "ativo": True,
                        "prioridade": ("priorit" in mensagem_lower) or ("importante" in mensagem_lower),
                    },
                })
                print(f"ADD ▶ {alvo}")

        # REMOVER (evita confundir com "remover prioridade")
        if any(p in mensagem_lower for p in ["remover", "remova", "excluir", "deletar", "apagar", "apague", "tirar", "retirar", "delete"]):
            fala_propriedade = (
                ("priori" in mensagem_lower)
                or ("ativo" in mensagem_lower)
                or ("desativ" in mensagem_lower)
                or ("deslig" in mensagem_lower)
                or ("ativar" in mensagem_lower)
                or ("ligar" in mensagem_lower)
            )
            if not fala_propriedade:
                print("INT ⇢ remover")
                alvo = melhor_match_produto(mensagem_lower, nomes_atuais)
                if not alvo and len(nomes_atuais) == 1:
                    alvo = nomes_atuais[0]
                if alvo:
                    acoes.append({"funcao": "remover_item", "argumentos": {"nome": alvo}})
                    print(f"REM ▶ {alvo}")

        # ATUALIZAR (ativo/prioridade) com desambiguação
        desativar_padroes = [
            "desativar", "desative", "desligar", "desligue", "desativado", "desligado",
            "deixar inativo", "desabilitar", "inativar",
        ]
        ativar_padroes = [
            "ativar", "ative", "ligar", "ligue", "ativado", "deixar ativo", "habilitar",
        ]
        remove_prioridade_padroes = [
            "tirar prioridade", "sem prioridade", "normal", "prioridade baixa",
            "remover prioridade", "despriorizar", "tirar do priorit", "não priorit", "nao priorit",
        ]
        set_prioridade_padroes = [
            "prioritário", "prioritario", "prioridade alta", "dar prioridade", "marcar como priorit", "tornar priorit",
        ]

        quer_desativar = any(p in mensagem_lower for p in desativar_padroes)
        quer_ativar = any(p in mensagem_lower for p in ativar_padroes) and not quer_desativar
        tira_prioridade = any(p in mensagem_lower for p in remove_prioridade_padroes)
        seta_prioritario = any(p in mensagem_lower for p in set_prioridade_padroes) and not tira_prioridade

        if (quer_ativar or quer_desativar or seta_prioritario or tira_prioridade):
            print("INT ⇢ atualizar")
            alvo = melhor_match_produto(mensagem_lower, nomes_atuais)
            if not alvo and len(nomes_atuais) == 1:
                alvo = nomes_atuais[0]
            if alvo:
                args = {"nome_original": alvo}
                if quer_ativar:
                    args["ativo"] = True
                elif quer_desativar:
                    args["ativo"] = False
                if seta_prioritario:
                    args["prioridade"] = True
                elif tira_prioridade:
                    args["prioridade"] = False
                if len(args) > 1:
                    acoes.append({"funcao": "atualizar_item", "argumentos": args})
                    print(f"UPD ▶ {args}")

        print(f"ACOES ▶ {len(acoes)} detectadas")

        if acoes:
            resumo = []
            for ac in acoes:
                if ac["funcao"] == "adicionar_item":
                    resumo.append(f"Adicionar: {ac['argumentos']['nome']}")
                elif ac["funcao"] == "remover_item":
                    resumo.append(f"Remover: {ac['argumentos']['nome']}")
                elif ac["funcao"] == "atualizar_item":
                    det = []
                    if "ativo" in ac["argumentos"]:
                        det.append("Ativar" if ac["argumentos"]["ativo"] else "Desativar")
                    if "prioridade" in ac["argumentos"]:
                        det.append("Prioritário" if ac["argumentos"]["prioridade"] else "Normal")
                    resumo.append(f"Atualizar: {ac['argumentos']['nome_original']} ({', '.join(det)})")
            prompt = f"""
            Você é um assistente da GoodWe. Executei estas ações: {'; '.join(resumo)}.
            Responda brevemente em português confirmando as mudanças de forma amigável.
            Mensagem do usuário: "{mensagem_usuario}"
            """
        else:
            prompt = f"""
            Você é um assistente amigável da GoodWe para sistemas de energia solar.
            CONTEXTO ATUAL:
            Itens configurados: {json.dumps(itens_atuais, indent=2) if itens_atuais else "Nenhum item configurado"}
            PRODUTOS DISPONÍVEIS PARA ADICIONAR:
            {json.dumps(nomes_disponiveis, indent=2) if nomes_disponiveis else "Lista não disponível"}
            INSTRUÇÕES:
            - Responda de forma útil e amigável em português
            - Se o usuário pedir para adicionar um produto, seja específico sobre qual produto da lista disponível
            - Se não entender qual produto específico, pergunte para esclarecer
            Mensagem do usuário: "{mensagem_usuario}"
            """

        chat = model.start_chat(enable_automatic_function_calling=True)
        response = chat.send_message(prompt)
        resposta_texto = response.text

        resposta_final = {"resposta": resposta_texto, "acoes": acoes}
        if sessao_id:
            resposta_final["sessao_id"] = sessao_id

        print(f"OK ▶ Resposta com {len(acoes)} ação(ões)")
        if acoes:
            print(f"AÇÕES ▶ {[acao['funcao'] for acao in acoes]}")

        return jsonify(resposta_final)

    except Exception as e:
        print(f"ERRO ▶ no endpoint /api/assistente: {e}")
        return jsonify({"erro": f"Erro interno do servidor: {str(e)}"}), 500


@app.route("/")
def index():
    return send_from_directory(".", "config_itens.html")


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(".", filename)


if __name__ == "__main__":
    print("BOOT ▶ Iniciando servidor Flask com IA do Gemini…")
    print("URL  ▶ http://localhost:3080")
    print("CHAT ▶ POST /api/assistente")
    print("=" * 50)
    try:
        app.run(host="0.0.0.0", port=3080, debug=True)
    except Exception as e:
        print(f"ERRO ▶ ao iniciar servidor: {e}")
        print("DICA ▶ Verifique se a porta 3080 está livre.")
