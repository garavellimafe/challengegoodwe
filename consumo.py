from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import datetime
import math
import requests

app = Flask(__name__)
CORS(app)

# Dados dos dispositivos GoodWe com especificações técnicas detalhadas
DISPOSITIVOS_GOODWE = {
    # Inversores Residenciais
    'DNS-G3': {
        'nome': 'DNS-G3',
        'categoria': 'residencial',
        'potencia_nominal': 3000,  # W
        'potencia_maxima': 3300,   # W
        'eficiencia': 97.6,        # %
        'tensao_entrada': '150-1000V',
        'corrente_maxima': 16,     # A
        'imagem': 'DNS-G3.png',
        'fator_consumo': 0.8       # Fator de consumo típico
    },
    'DNS-G4': {
        'nome': 'DNS-G4',
        'categoria': 'residencial',
        'potencia_nominal': 4000,
        'potencia_maxima': 4400,
        'eficiencia': 97.8,
        'tensao_entrada': '150-1000V',
        'corrente_maxima': 16,
        'imagem': 'DNS-G4.png',
        'fator_consumo': 0.8
    },
    'MS-G3': {
        'nome': 'MS-G3',
        'categoria': 'residencial',
        'potencia_nominal': 3000,
        'potencia_maxima': 3300,
        'eficiencia': 97.5,
        'tensao_entrada': '150-1000V',
        'corrente_maxima': 16,
        'imagem': 'MS-G3.png',
        'fator_consumo': 0.85
    },
    'MS-G4': {
        'nome': 'MS-G4',
        'categoria': 'residencial',
        'potencia_nominal': 4000,
        'potencia_maxima': 4400,
        'eficiencia': 97.7,
        'tensao_entrada': '150-1000V',
        'corrente_maxima': 16,
        'imagem': 'MS-G4.png',
        'fator_consumo': 0.85
    },
    'XS-G3': {
        'nome': 'XS-G3',
        'categoria': 'residencial',
        'potencia_nominal': 3000,
        'potencia_maxima': 3300,
        'eficiencia': 97.4,
        'tensao_entrada': '150-1000V',
        'corrente_maxima': 16,
        'imagem': 'XS-G3.png',
        'fator_consumo': 0.75
    },
    
    # Inversores Comerciais
    'ET50': {
        'nome': 'ET50',
        'categoria': 'comercial',
        'potencia_nominal': 50000,
        'potencia_maxima': 55000,
        'eficiencia': 98.2,
        'tensao_entrada': '200-1000V',
        'corrente_maxima': 12.5,
        'imagem': 'ET50.png',
        'fator_consumo': 0.9
    },
    'ET1230': {
        'nome': 'ET1230',
        'categoria': 'comercial',
        'potencia_nominal': 1230000,
        'potencia_maxima': 1353000,
        'eficiencia': 98.7,
        'tensao_entrada': '200-1000V',
        'corrente_maxima': 12.5,
        'imagem': 'ET1230.png',
        'fator_consumo': 0.95
    },
    'HT': {
        'nome': 'HT Series',
        'categoria': 'comercial',
        'potencia_nominal': 100000,
        'potencia_maxima': 110000,
        'eficiencia': 98.5,
        'tensao_entrada': '200-1000V',
        'corrente_maxima': 12.5,
        'imagem': 'HT.png',
        'fator_consumo': 0.92
    },
    'MT': {
        'nome': 'MT Series',
        'categoria': 'comercial',
        'potencia_nominal': 75000,
        'potencia_maxima': 82500,
        'eficiencia': 98.3,
        'tensao_entrada': '200-1000V',
        'corrente_maxima': 12.5,
        'imagem': 'MT.png',
        'fator_consumo': 0.88
    },
    'UT': {
        'nome': 'UT Series',
        'categoria': 'comercial',
        'potencia_nominal': 125000,
        'potencia_maxima': 137500,
        'eficiencia': 98.6,
        'tensao_entrada': '200-1000V',
        'corrente_maxima': 12.5,
        'imagem': 'UT.png',
        'fator_consumo': 0.93
    },
    
    # Baterias e Armazenamento
    'ESG2': {
        'nome': 'ESG2',
        'categoria': 'bateria',
        'potencia_nominal': 5000,
        'potencia_maxima': 5500,
        'eficiencia': 95.0,
        'capacidade_bateria': 5120,  # Wh
        'ciclos_vida': 6000,
        'imagem': 'ESG2.png',
        'fator_consumo': 0.7
    },
    'SBP': {
        'nome': 'SBP Series',
        'categoria': 'bateria',
        'potencia_nominal': 3300,
        'potencia_maxima': 3630,
        'eficiencia': 94.5,
        'capacidade_bateria': 3276,
        'ciclos_vida': 5000,
        'imagem': 'SBPG2.png',
        'fator_consumo': 0.65
    },
    'LynxHome': {
        'nome': 'Lynx Home U',
        'categoria': 'bateria',
        'potencia_nominal': 5000,
        'potencia_maxima': 5500,
        'eficiencia': 95.5,
        'capacidade_bateria': 5120,
        'ciclos_vida': 6500,
        'imagem': 'LynxhomeU.png',
        'fator_consumo': 0.72
    },
    
    # Sistemas de Monitoramento
    'SEMS': {
        'nome': 'SEMS Portal',
        'categoria': 'monitoramento',
        'potencia_nominal': 50,
        'potencia_maxima': 55,
        'eficiencia': 90.0,
        'conectividade': 'WiFi/Ethernet',
        'protocolos': 'Modbus, RS485',
        'imagem': 'sems.png',
        'fator_consumo': 1.0  # Sempre ligado
    },
    'WiFi Kit': {
        'nome': 'WiFi Kit',
        'categoria': 'monitoramento',
        'potencia_nominal': 5,
        'potencia_maxima': 6,
        'eficiencia': 85.0,
        'conectividade': 'WiFi',
        'protocolos': 'TCP/IP',
        'imagem': 'wiikit.png',
        'fator_consumo': 1.0
    },
    'EzLogger': {
        'nome': 'EzLogger',
        'categoria': 'monitoramento',
        'potencia_nominal': 10,
        'potencia_maxima': 12,
        'eficiencia': 88.0,
        'conectividade': '4G/WiFi',
        'protocolos': 'Modbus, TCP/IP',
        'imagem': 'ezlogger.png',
        'fator_consumo': 1.0
    },
    
    # Carregadores Veiculares
    'EzLink': {
        'nome': 'EzLink EV Charger',
        'categoria': 'veicular',
        'potencia_nominal': 7000,
        'potencia_maxima': 7700,
        'eficiencia': 94.0,
        'tipo_conector': 'Type 2',
        'protecao': 'IP54',
        'imagem': 'Ezlink.png',
        'fator_consumo': 0.6  # Uso intermitente
    },
    'HCA7': {
        'nome': 'HCA7',
        'categoria': 'veicular',
        'potencia_nominal': 7000,
        'potencia_maxima': 7700,
        'eficiencia': 93.5,
        'tipo_conector': 'Type 2',
        'protecao': 'IP54',
        'imagem': 'HCA7.png',
        'fator_consumo': 0.6
    },
    'HCA11': {
        'nome': 'HCA11',
        'categoria': 'veicular',
        'potencia_nominal': 11000,
        'potencia_maxima': 12100,
        'eficiencia': 94.5,
        'tipo_conector': 'Type 2',
        'protecao': 'IP54',
        'imagem': 'HCA11.png',
        'fator_consumo': 0.65
    },
    
    # Baterias Específicas
    'BT': {
        'nome': 'BT Battery',
        'categoria': 'bateria',
        'potencia_nominal': 2560,
        'potencia_maxima': 2816,
        'eficiencia': 94.0,
        'capacidade_bateria': 2560,
        'ciclos_vida': 5000,
        'imagem': 'BT.png',
        'fator_consumo': 0.6
    },
    'BTC': {
        'nome': 'BTC Battery',
        'categoria': 'bateria',
        'potencia_nominal': 5120,
        'potencia_maxima': 5632,
        'eficiencia': 94.5,
        'capacidade_bateria': 5120,
        'ciclos_vida': 5500,
        'imagem': 'BTC.png',
        'fator_consumo': 0.65
    },
    
    # Sistema Especial
    'Polaris': {
        'nome': 'Polaris',
        'categoria': 'comercial',
        'potencia_nominal': 15000,
        'potencia_maxima': 16500,
        'eficiencia': 98.0,
        'tensao_entrada': '200-1000V',
        'corrente_maxima': 12.5,
        'imagem': 'polaris.png',
        'fator_consumo': 0.85
    }
}

# Configurações padrão
CONFIGURACOES_PADRAO = {
    'eficiencia_geral': 95.0,
    'fator_potencia': 0.95,
    'perdas_transmissao': 5.0,
    'tarifa_energia': 0.75,  # R$/kWh
    'fator_co2': 0.0817      # kg CO2/kWh (média Brasil)
}

def obter_dispositivos_selecionados():
    """
    Busca os dispositivos selecionados da API do config_itens
    Retorna os dispositivos no formato esperado pelo sistema de consumo
    """
    try:
        response = requests.get('http://localhost:3080/api/itens-selecionados', timeout=5)
        if response.status_code == 200:
            data = response.json()
            itens_selecionados = data.get('itens', [])
            
            # Converte os itens para o formato do DISPOSITIVOS_GOODWE
            dispositivos_formatados = {}
            for item in itens_selecionados:
                # Usa o nome como chave, similar ao DISPOSITIVOS_GOODWE
                dispositivo_id = item['nome']
                dispositivos_formatados[dispositivo_id] = {
                    'nome': item['nome'],
                    'categoria': item.get('categoria', 'residencial'),
                    'potencia_nominal': int(float(item.get('potencia', 3000))),  # Converte para W
                    'potencia_maxima': int(float(item.get('potencia', 3000)) * 1.1),  # 10% acima do nominal
                    'eficiencia': float(item.get('eficiencia', 97.0)),
                    'tensao_entrada': '150-1000V',  # Valor padrão
                    'corrente_maxima': 16,  # Valor padrão
                    'imagem': item.get('imagem', 'default.png'),
                    'fator_consumo': 0.8  # Fator padrão
                }
            
            return dispositivos_formatados
        else:
            print(f"Erro ao buscar dispositivos do config_itens: {response.status_code}")
            return DISPOSITIVOS_GOODWE  # Fallback para dados estáticos
    except requests.exceptions.RequestException as e:
        print(f"Erro de conexão com config_itens: {e}")
        return DISPOSITIVOS_GOODWE  # Fallback para dados estáticos
    except Exception as e:
        print(f"Erro inesperado ao buscar dispositivos: {e}")
        return DISPOSITIVOS_GOODWE  # Fallback para dados estáticos

@app.route('/api/test', methods=['GET'])
def test_api():
    """Endpoint para testar se a API está funcionando"""
    return jsonify({
        'status': 'ok',
        'message': 'API de Consumo GoodWe funcionando',
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/dispositivos', methods=['GET'])
def listar_dispositivos():
    """Retorna lista de dispositivos selecionados no config_itens ou todos os disponíveis"""
    categoria = request.args.get('categoria', None)
    
    # Primeiro tenta buscar dispositivos selecionados do config_itens
    dispositivos = obter_dispositivos_selecionados()
    
    if categoria:
        dispositivos = {k: v for k, v in dispositivos.items() 
                      if v['categoria'] == categoria}
    
    return jsonify({
        'dispositivos': dispositivos,
        'total': len(dispositivos),
        'source': 'config_itens' if dispositivos != DISPOSITIVOS_GOODWE else 'static'
    })

@app.route('/api/dispositivo/<dispositivo_id>', methods=['GET'])
def obter_dispositivo(dispositivo_id):
    """Retorna informações detalhadas de um dispositivo específico"""
    # Busca primeiro nos dispositivos selecionados
    dispositivos = obter_dispositivos_selecionados()
    
    if dispositivo_id not in dispositivos:
        return jsonify({'erro': 'Dispositivo não encontrado'}), 404
    
    return jsonify(dispositivos[dispositivo_id])

@app.route('/api/calcular-consumo', methods=['POST'])
def calcular_consumo():
    """Calcula o consumo de energia para dispositivos selecionados"""
    try:
        dados = request.json
        
        # Validar dados de entrada
        required_fields = ['dispositivos', 'horas_uso', 'dias_mes', 'tarifa_energia']
        for field in required_fields:
            if field not in dados:
                return jsonify({'erro': f'Campo obrigatório: {field}'}), 400
        
        dispositivos_ids = dados['dispositivos']
        horas_uso = float(dados['horas_uso'])
        dias_mes = int(dados['dias_mes'])
        tarifa_energia = float(dados['tarifa_energia'])
        periodo = dados.get('periodo', 'mensal')
        
        # Configurações (usar padrões se não fornecidas)
        config = dados.get('configuracoes', CONFIGURACOES_PADRAO)
        eficiencia_geral = config.get('eficiencia_geral', 95.0) / 100
        perdas_transmissao = config.get('perdas_transmissao', 5.0) / 100
        fator_potencia = config.get('fator_potencia', 0.95)
        
        # Busca dispositivos selecionados
        dispositivos_disponiveis = obter_dispositivos_selecionados()
        
        resultados = []
        consumo_total = 0
        custo_total = 0
        
        for dispositivo_id in dispositivos_ids:
            if dispositivo_id not in dispositivos_disponiveis:
                continue
                
            dispositivo = dispositivos_disponiveis[dispositivo_id]
            
            # Calcular potência real considerando eficiência e perdas
            potencia_nominal = dispositivo['potencia_nominal']  # W
            eficiencia_dispositivo = dispositivo.get('eficiencia', 95.0) / 100
            fator_consumo = dispositivo.get('fator_consumo', 0.8)
            
            # Potência efetiva em kW
            potencia_efetiva = (potencia_nominal * eficiencia_dispositivo * 
                              eficiencia_geral * (1 - perdas_transmissao) * 
                              fator_potencia * fator_consumo) / 1000
            
            # Cálculos de consumo
            consumo_diario = potencia_efetiva * horas_uso  # kWh/dia
            consumo_mensal = consumo_diario * dias_mes     # kWh/mês
            custo_mensal = consumo_mensal * tarifa_energia # R$/mês
            
            # Calcular para o período solicitado
            multiplicador_periodo = {
                'diario': 1,
                'semanal': 7,
                'mensal': dias_mes,
                'anual': dias_mes * 12
            }.get(periodo, dias_mes)
            
            consumo_periodo = consumo_diario * multiplicador_periodo
            custo_periodo = consumo_periodo * tarifa_energia
            
            resultado_dispositivo = {
                'dispositivo_id': dispositivo_id,
                'nome': dispositivo['nome'],
                'categoria': dispositivo['categoria'],
                'potencia_nominal': potencia_nominal,
                'potencia_efetiva': round(potencia_efetiva * 1000, 2),  # W
                'horas_uso': horas_uso,
                'fator_consumo': fator_consumo,
                'consumo_diario': round(consumo_diario, 3),
                'consumo_mensal': round(consumo_mensal, 2),
                'consumo_periodo': round(consumo_periodo, 2),
                'custo_mensal': round(custo_mensal, 2),
                'custo_periodo': round(custo_periodo, 2),
                'eficiencia_total': round(eficiencia_dispositivo * eficiencia_geral * (1 - perdas_transmissao) * 100, 1)
            }
            
            resultados.append(resultado_dispositivo)
            consumo_total += consumo_periodo
            custo_total += custo_periodo
        
        # Calcular emissões de CO2
        fator_co2 = CONFIGURACOES_PADRAO['fator_co2']
        co2_equivalente = consumo_total * fator_co2
        
        # Encontrar maior e menor consumidor
        if resultados:
            maior_consumidor = max(resultados, key=lambda x: x['consumo_periodo'])
            menor_consumidor = min(resultados, key=lambda x: x['consumo_periodo'])
        else:
            maior_consumidor = menor_consumidor = None
        
        # Calcular economia potencial (simulação de otimização)
        economia_potencial = custo_total * 0.15  # 15% de economia potencial
        
        resposta = {
            'periodo': periodo,
            'parametros': {
                'horas_uso': horas_uso,
                'dias_mes': dias_mes,
                'tarifa_energia': tarifa_energia,
                'dispositivos_analisados': len(dispositivos_ids)
            },
            'configuracoes_aplicadas': {
                'eficiencia_geral': eficiencia_geral * 100,
                'perdas_transmissao': perdas_transmissao * 100,
                'fator_potencia': fator_potencia
            },
            'resultados_dispositivos': resultados,
            'resumo': {
                'consumo_total_kwh': round(consumo_total, 2),
                'custo_total_reais': round(custo_total, 2),
                'co2_equivalente_kg': round(co2_equivalente, 2),
                'maior_consumidor': maior_consumidor['nome'] if maior_consumidor else None,
                'menor_consumidor': menor_consumidor['nome'] if menor_consumidor else None,
                'economia_potencial_reais': round(economia_potencial, 2),
                'custo_medio_kwh': round(custo_total / consumo_total, 3) if consumo_total > 0 else 0
            },
            'timestamp': datetime.datetime.now().isoformat()
        }
        
        return jsonify(resposta)
        
    except Exception as e:
        return jsonify({'erro': f'Erro no cálculo: {str(e)}'}), 500

@app.route('/api/analise-eficiencia', methods=['POST'])
def analise_eficiencia():
    """Analisa a eficiência energética dos dispositivos selecionados"""
    try:
        dados = request.json
        dispositivos_ids = dados.get('dispositivos', [])
        
        if not dispositivos_ids:
            return jsonify({'erro': 'Nenhum dispositivo fornecido'}), 400
        
        # Busca dispositivos selecionados
        dispositivos_disponiveis = obter_dispositivos_selecionados()
        
        analises = []
        
        for dispositivo_id in dispositivos_ids:
            if dispositivo_id not in dispositivos_disponiveis:
                continue
                
            dispositivo = dispositivos_disponiveis[dispositivo_id]
            
            # Classificação de eficiência
            eficiencia = dispositivo.get('eficiencia', 90.0)
            if eficiencia >= 98.0:
                classificacao = 'Excelente'
                cor = '#27ae60'
            elif eficiencia >= 96.0:
                classificacao = 'Muito Boa'
                cor = '#2ecc71'
            elif eficiencia >= 94.0:
                classificacao = 'Boa'
                cor = '#f39c12'
            elif eficiencia >= 90.0:
                classificacao = 'Regular'
                cor = '#e67e22'
            else:
                classificacao = 'Baixa'
                cor = '#e74c3c'
            
            # Recomendações
            recomendacoes = []
            if eficiencia < 95.0:
                recomendacoes.append('Considere upgrade para modelo mais eficiente')
            if dispositivo['categoria'] == 'bateria' and dispositivo.get('ciclos_vida', 0) < 5000:
                recomendacoes.append('Bateria com vida útil limitada')
            if dispositivo.get('fator_consumo', 1.0) < 0.7:
                recomendacoes.append('Otimize padrões de uso para melhor eficiência')
                
            analise = {
                'dispositivo_id': dispositivo_id,
                'nome': dispositivo['nome'],
                'eficiencia': eficiencia,
                'classificacao': classificacao,
                'cor_classificacao': cor,
                'recomendacoes': recomendacoes,
                'pontuacao': min(100, eficiencia + 2)  # Pontuação de 0-100
            }
            
            analises.append(analise)
        
        # Calcular média geral
        eficiencia_media = sum(a['eficiencia'] for a in analises) / len(analises) if analises else 0
        pontuacao_media = sum(a['pontuacao'] for a in analises) / len(analises) if analises else 0
        
        return jsonify({
            'analises_dispositivos': analises,
            'resumo_geral': {
                'eficiencia_media': round(eficiencia_media, 1),
                'pontuacao_media': round(pontuacao_media, 1),
                'total_dispositivos': len(analises),
                'dispositivos_eficientes': len([a for a in analises if a['eficiencia'] >= 96.0])
            },
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'erro': f'Erro na análise: {str(e)}'}), 500

@app.route('/api/configuracoes', methods=['GET', 'POST'])
def gerenciar_configuracoes():
    """Gerencia configurações do sistema"""
    if request.method == 'GET':
        return jsonify(CONFIGURACOES_PADRAO)
    
    elif request.method == 'POST':
        try:
            novas_config = request.json
            
            # Validar valores
            if 'eficiencia_geral' in novas_config:
                if not 70 <= novas_config['eficiencia_geral'] <= 100:
                    return jsonify({'erro': 'Eficiência geral deve estar entre 70% e 100%'}), 400
            
            if 'fator_potencia' in novas_config:
                if not 0.7 <= novas_config['fator_potencia'] <= 1.0:
                    return jsonify({'erro': 'Fator de potência deve estar entre 0.7 e 1.0'}), 400
            
            if 'perdas_transmissao' in novas_config:
                if not 0 <= novas_config['perdas_transmissao'] <= 15:
                    return jsonify({'erro': 'Perdas de transmissão devem estar entre 0% e 15%'}), 400
            
            # Atualizar configurações
            CONFIGURACOES_PADRAO.update(novas_config)
            
            return jsonify({
                'message': 'Configurações atualizadas com sucesso',
                'configuracoes': CONFIGURACOES_PADRAO
            })
            
        except Exception as e:
            return jsonify({'erro': f'Erro ao atualizar configurações: {str(e)}'}), 500

@app.route('/api/exportar-relatorio', methods=['POST'])
def exportar_relatorio():
    """Gera relatório detalhado em JSON"""
    try:
        dados = request.json
        
        # Busca dispositivos atuais (selecionados ou padrão)
        dispositivos_atuais = obter_dispositivos_selecionados()
        
        # Incluir timestamp e metadados
        relatorio = {
            'metadata': {
                'versao_api': '1.0',
                'timestamp_geracao': datetime.datetime.now().isoformat(),
                'total_dispositivos_disponiveis': len(dispositivos_atuais)
            },
            'dados_solicitacao': dados,
            'configuracoes_sistema': CONFIGURACOES_PADRAO,
            'dispositivos_analisados': {
                k: v for k, v in dispositivos_atuais.items() 
                if k in dados.get('dispositivos', [])
            }
        }
        
        return jsonify(relatorio)
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao gerar relatório: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Iniciando API de Consumo GoodWe...")
    print("📡 Servidor rodando em: http://127.0.0.1:5000")
    print("📋 Endpoints disponíveis:")
    print("   GET  /api/test")
    print("   GET  /api/dispositivos")
    print("   GET  /api/dispositivo/<id>")
    print("   POST /api/calcular-consumo")
    print("   POST /api/analise-eficiencia")
    print("   GET/POST /api/configuracoes")
    print("   POST /api/exportar-relatorio")
    print("⚡ Dispositivos estáticos disponíveis: ", len(DISPOSITIVOS_GOODWE))
    print("🔗 Integração com config_itens em: http://localhost:3080/api/itens-selecionados")
    
    app.run(debug=True, host='127.0.0.1', port=5000)