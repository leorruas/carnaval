import requests
from bs4 import BeautifulSoup
import json
import time
import urllib.parse

from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://portalbelohorizonte.com.br/carnaval/2026/programacao/bloco-de-rua"
OUTPUT_FILE = "src/data/blocos_scraped.json"

def get_coordinates(address, neighborhood=""):
    """
    Busca coordenadas usando a API Nominatim (OpenStreetMap).
    Adiciona 'Belo Horizonte' para garantir precisão.
    """
    try:
        query = f"{address}, {neighborhood}, Belo Horizonte, MG, Brazil"
        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json"
        headers = {'User-Agent': 'CarnavalBH2026Scraper/1.0'}
        
        response = requests.get(url, headers=headers)
        data = response.json()
        
        if data and len(data) > 0:
            return float(data[0]['lat']), float(data[0]['lon'])
        
        # Tentativa secundária: apenas bairro e cidade se falhar
        if neighborhood:
            query = f"{neighborhood}, Belo Horizonte, MG, Brazil"
            url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json"
            response = requests.get(url, headers=headers)
            data = response.json()
            if data and len(data) > 0:
                return float(data[0]['lat']), float(data[0]['lon'])

        return -19.9167, -43.9345 # Default BH Centro
        
    except Exception as e:
        print(f"Erro ao geocodificar {address}: {e}")
        return -19.9167, -43.9345

def scrape_page(page_num):
    print(f"Scraping page {page_num}...")
    url = f"{BASE_URL}?page={page_num}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        blocks = []
        # O elemento .favorito-icon contem todos os dados estruturados
        icons = soup.find_all('div', class_='favorito-icon')
        
        for icon in icons:
            try:
                name = icon.get('data-titulo', 'Sem Nome')
                date_text = icon.get('data-data', '') # 31/01/2026
                time_text = icon.get('data-hora', '00:00')
                block_id = icon.get('data-id', str(int(time.time()*1000)))
                full_address = icon.get('data-local', 'A definir') # Endereço, Bairro
                
                # Converter data
                date_formatted = ""
                if date_text:
                    try:
                        parts = date_text.split('/')
                        if len(parts) == 3:
                            date_formatted = f"{parts[2]}-{parts[1]}-{parts[0]}"
                    except:
                        date_formatted = date_text

                # Tentar separar bairro do endereço
                address = full_address
                neighborhood = ""
                if "," in full_address:
                    parts = full_address.rsplit(',', 1)
                    if len(parts) > 1:
                        neighborhood = parts[1].strip()
                        # Se o bairro for muito curto ou parecer numero, ignorar separação
                        if len(neighborhood) < 2 or neighborhood.isdigit():
                            neighborhood = ""
                        else:
                            address = parts[0].strip()

                blocks.append({
                    "id": block_id,
                    "nome": name,
                    "data": date_formatted,
                    "horario": time_text,
                    "endereco": address,
                    "bairro": neighborhood,
                    "observacoes": "Carnaval 2026",
                    "latitude": 0,
                    "longitude": 0
                })
            except Exception as e:
                print(f"Erro ao processar bloco: {e}")
                continue
                
        return blocks
    except Exception as e:
        print(f"Erro ao carregar pagina {page_num}: {e}")
        return []

def main():
    all_blocks = []
    
    # O user disse que tem até a pagina 40 mais ou menos
    # Vamos fazer um loop seguro ou até não encontrar mais blocos
    for i in range(0, 42): 
        page_blocks = scrape_page(i)
        if not page_blocks:
            print("Nenhum bloco encontrado ou fim das páginas.")
            break
        all_blocks.extend(page_blocks)
        time.sleep(1) # Respeitar o servidor

    print(f"Total de blocos encontrados: {len(all_blocks)}")
    print("Iniciando geocodificação (isso pode demorar)...")

    # Geocodificação em paralelo para ser mais rápido
    # ATENÇÃO: Nominatim tem limite de rate limit (1 req/sec). 
    # Vou fazer sequencial com sleep para não ser banido, ou usar pool pequeno com delay.
    
    for i, block in enumerate(all_blocks):
        if block['endereco'] != "A definir":
            print(f"[{i+1}/{len(all_blocks)}] Geocodificando: {block['nome']}...")
            lat, lon = get_coordinates(block['endereco'], block['bairro'])
            block['latitude'] = lat
            block['longitude'] = lon
            time.sleep(1.1) # Respeitar rate limit do Nominatim (importante!)
        else:
             block['latitude'] = -19.9167
             block['longitude'] = -43.9345

    # Salvar JSON final
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_blocks, f, ensure_ascii=False, indent=2)

    print(f"Concluído! Dados salvos em {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
