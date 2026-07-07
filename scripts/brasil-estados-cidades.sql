-- ============================================================
-- TABELA DE ESTADOS E CIDADES DO BRASIL
-- ADA ABACUS 2026 — Referência geográfica nacional
-- ============================================================

-- Criar tabela de estados
CREATE TABLE IF NOT EXISTS brasil_estados (
  id        SERIAL PRIMARY KEY,
  sigla     VARCHAR(2)  NOT NULL UNIQUE,
  nome      VARCHAR(100) NOT NULL,
  regiao    VARCHAR(20)  NOT NULL
);

-- Criar tabela de cidades
CREATE TABLE IF NOT EXISTS brasil_cidades (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  estado_id  INTEGER NOT NULL REFERENCES brasil_estados(id) ON DELETE CASCADE,
  capital    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cidades_estado ON brasil_cidades(estado_id);
CREATE INDEX IF NOT EXISTS idx_cidades_capital ON brasil_cidades(capital);
CREATE INDEX IF NOT EXISTS idx_estados_sigla ON brasil_estados(sigla);

-- ============================================================
-- ESTADOS
-- ============================================================
INSERT INTO brasil_estados (sigla, nome, regiao) VALUES
  ('AC', 'Acre',                'Norte'),
  ('AL', 'Alagoas',             'Nordeste'),
  ('AM', 'Amazonas',            'Norte'),
  ('AP', 'Amapá',               'Norte'),
  ('BA', 'Bahia',               'Nordeste'),
  ('CE', 'Ceará',               'Nordeste'),
  ('DF', 'Distrito Federal',    'Centro-Oeste'),
  ('ES', 'Espírito Santo',      'Sudeste'),
  ('GO', 'Goiás',               'Centro-Oeste'),
  ('MA', 'Maranhão',            'Nordeste'),
  ('MG', 'Minas Gerais',        'Sudeste'),
  ('MS', 'Mato Grosso do Sul',  'Centro-Oeste'),
  ('MT', 'Mato Grosso',         'Centro-Oeste'),
  ('PA', 'Pará',                'Norte'),
  ('PB', 'Paraíba',             'Nordeste'),
  ('PE', 'Pernambuco',          'Nordeste'),
  ('PI', 'Piauí',               'Nordeste'),
  ('PR', 'Paraná',              'Sul'),
  ('RJ', 'Rio de Janeiro',      'Sudeste'),
  ('RN', 'Rio Grande do Norte', 'Nordeste'),
  ('RO', 'Rondônia',            'Norte'),
  ('RR', 'Roraima',             'Norte'),
  ('RS', 'Rio Grande do Sul',   'Sul'),
  ('SC', 'Santa Catarina',      'Sul'),
  ('SE', 'Sergipe',             'Nordeste'),
  ('SP', 'São Paulo',           'Sudeste'),
  ('TO', 'Tocantins',           'Norte')
ON CONFLICT (sigla) DO NOTHING;

-- ============================================================
-- CIDADES — CAPITAIS E PRINCIPAIS CIDADES
-- ============================================================

-- ACRE (AC)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Rio Branco',    (SELECT id FROM brasil_estados WHERE sigla='AC'), TRUE),
  ('Cruzeiro do Sul',(SELECT id FROM brasil_estados WHERE sigla='AC'), FALSE),
  ('Sena Madureira',(SELECT id FROM brasil_estados WHERE sigla='AC'), FALSE);

-- ALAGOAS (AL)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Maceió',        (SELECT id FROM brasil_estados WHERE sigla='AL'), TRUE),
  ('Arapiraca',     (SELECT id FROM brasil_estados WHERE sigla='AL'), FALSE),
  ('Palmeira dos Índios',(SELECT id FROM brasil_estados WHERE sigla='AL'), FALSE);

-- AMAZONAS (AM)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Manaus',        (SELECT id FROM brasil_estados WHERE sigla='AM'), TRUE),
  ('Parintins',     (SELECT id FROM brasil_estados WHERE sigla='AM'), FALSE),
  ('Itacoatiara',   (SELECT id FROM brasil_estados WHERE sigla='AM'), FALSE),
  ('Tefé',          (SELECT id FROM brasil_estados WHERE sigla='AM'), FALSE);

-- AMAPÁ (AP)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Macapá',        (SELECT id FROM brasil_estados WHERE sigla='AP'), TRUE),
  ('Santana',       (SELECT id FROM brasil_estados WHERE sigla='AP'), FALSE),
  ('Laranjal do Jari',(SELECT id FROM brasil_estados WHERE sigla='AP'), FALSE);

-- BAHIA (BA)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Salvador',      (SELECT id FROM brasil_estados WHERE sigla='BA'), TRUE),
  ('Feira de Santana',(SELECT id FROM brasil_estados WHERE sigla='BA'), FALSE),
  ('Vitória da Conquista',(SELECT id FROM brasil_estados WHERE sigla='BA'), FALSE),
  ('Camaçari',      (SELECT id FROM brasil_estados WHERE sigla='BA'), FALSE),
  ('Itabuna',       (SELECT id FROM brasil_estados WHERE sigla='BA'), FALSE),
  ('Ilhéus',        (SELECT id FROM brasil_estados WHERE sigla='BA'), FALSE),
  ('Juazeiro',      (SELECT id FROM brasil_estados WHERE sigla='BA'), FALSE),
  ('Porto Seguro',  (SELECT id FROM brasil_estados WHERE sigla='BA'), FALSE);

-- CEARÁ (CE)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Fortaleza',     (SELECT id FROM brasil_estados WHERE sigla='CE'), TRUE),
  ('Caucaia',       (SELECT id FROM brasil_estados WHERE sigla='CE'), FALSE),
  ('Juazeiro do Norte',(SELECT id FROM brasil_estados WHERE sigla='CE'), FALSE),
  ('Maracanaú',     (SELECT id FROM brasil_estados WHERE sigla='CE'), FALSE),
  ('Sobral',        (SELECT id FROM brasil_estados WHERE sigla='CE'), FALSE);

-- DISTRITO FEDERAL (DF)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Brasília',      (SELECT id FROM brasil_estados WHERE sigla='DF'), TRUE),
  ('Ceilândia',     (SELECT id FROM brasil_estados WHERE sigla='DF'), FALSE),
  ('Taguatinga',    (SELECT id FROM brasil_estados WHERE sigla='DF'), FALSE),
  ('Planaltina',    (SELECT id FROM brasil_estados WHERE sigla='DF'), FALSE);

-- ESPÍRITO SANTO (ES)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Vitória',       (SELECT id FROM brasil_estados WHERE sigla='ES'), TRUE),
  ('Serra',         (SELECT id FROM brasil_estados WHERE sigla='ES'), FALSE),
  ('Vila Velha',    (SELECT id FROM brasil_estados WHERE sigla='ES'), FALSE),
  ('Cariacica',     (SELECT id FROM brasil_estados WHERE sigla='ES'), FALSE),
  ('Cachoeiro de Itapemirim',(SELECT id FROM brasil_estados WHERE sigla='ES'), FALSE);

-- GOIÁS (GO)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Goiânia',       (SELECT id FROM brasil_estados WHERE sigla='GO'), TRUE),
  ('Aparecida de Goiânia',(SELECT id FROM brasil_estados WHERE sigla='GO'), FALSE),
  ('Anápolis',      (SELECT id FROM brasil_estados WHERE sigla='GO'), FALSE),
  ('Rio Verde',     (SELECT id FROM brasil_estados WHERE sigla='GO'), FALSE),
  ('Luziânia',      (SELECT id FROM brasil_estados WHERE sigla='GO'), FALSE);

-- MARANHÃO (MA)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('São Luís',      (SELECT id FROM brasil_estados WHERE sigla='MA'), TRUE),
  ('Imperatriz',    (SELECT id FROM brasil_estados WHERE sigla='MA'), FALSE),
  ('Caxias',        (SELECT id FROM brasil_estados WHERE sigla='MA'), FALSE),
  ('Timon',         (SELECT id FROM brasil_estados WHERE sigla='MA'), FALSE);

-- MINAS GERAIS (MG)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Belo Horizonte',(SELECT id FROM brasil_estados WHERE sigla='MG'), TRUE),
  ('Uberlândia',    (SELECT id FROM brasil_estados WHERE sigla='MG'), FALSE),
  ('Contagem',      (SELECT id FROM brasil_estados WHERE sigla='MG'), FALSE),
  ('Juiz de Fora',  (SELECT id FROM brasil_estados WHERE sigla='MG'), FALSE),
  ('Betim',         (SELECT id FROM brasil_estados WHERE sigla='MG'), FALSE),
  ('Montes Claros', (SELECT id FROM brasil_estados WHERE sigla='MG'), FALSE),
  ('Ribeirão das Neves',(SELECT id FROM brasil_estados WHERE sigla='MG'), FALSE),
  ('Uberaba',       (SELECT id FROM brasil_estados WHERE sigla='MG'), FALSE),
  ('Poços de Caldas',(SELECT id FROM brasil_estados WHERE sigla='MG'), FALSE);

-- MATO GROSSO DO SUL (MS)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Campo Grande',  (SELECT id FROM brasil_estados WHERE sigla='MS'), TRUE),
  ('Dourados',      (SELECT id FROM brasil_estados WHERE sigla='MS'), FALSE),
  ('Três Lagoas',   (SELECT id FROM brasil_estados WHERE sigla='MS'), FALSE),
  ('Corumbá',       (SELECT id FROM brasil_estados WHERE sigla='MS'), FALSE);

-- MATO GROSSO (MT)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Cuiabá',        (SELECT id FROM brasil_estados WHERE sigla='MT'), TRUE),
  ('Várzea Grande', (SELECT id FROM brasil_estados WHERE sigla='MT'), FALSE),
  ('Rondonópolis',  (SELECT id FROM brasil_estados WHERE sigla='MT'), FALSE),
  ('Sinop',         (SELECT id FROM brasil_estados WHERE sigla='MT'), FALSE),
  ('Tangará da Serra',(SELECT id FROM brasil_estados WHERE sigla='MT'), FALSE);

-- PARÁ (PA)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Belém',         (SELECT id FROM brasil_estados WHERE sigla='PA'), TRUE),
  ('Ananindeua',    (SELECT id FROM brasil_estados WHERE sigla='PA'), FALSE),
  ('Santarém',      (SELECT id FROM brasil_estados WHERE sigla='PA'), FALSE),
  ('Marabá',        (SELECT id FROM brasil_estados WHERE sigla='PA'), FALSE),
  ('Castanhal',     (SELECT id FROM brasil_estados WHERE sigla='PA'), FALSE);

-- PARAÍBA (PB)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('João Pessoa',   (SELECT id FROM brasil_estados WHERE sigla='PB'), TRUE),
  ('Campina Grande',(SELECT id FROM brasil_estados WHERE sigla='PB'), FALSE),
  ('Santa Rita',    (SELECT id FROM brasil_estados WHERE sigla='PB'), FALSE),
  ('Patos',         (SELECT id FROM brasil_estados WHERE sigla='PB'), FALSE);

-- PERNAMBUCO (PE)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Recife',        (SELECT id FROM brasil_estados WHERE sigla='PE'), TRUE),
  ('Caruaru',       (SELECT id FROM brasil_estados WHERE sigla='PE'), FALSE),
  ('Olinda',        (SELECT id FROM brasil_estados WHERE sigla='PE'), FALSE),
  ('Petrolina',     (SELECT id FROM brasil_estados WHERE sigla='PE'), FALSE),
  ('Paulista',      (SELECT id FROM brasil_estados WHERE sigla='PE'), FALSE),
  ('Jaboatão dos Guararapes',(SELECT id FROM brasil_estados WHERE sigla='PE'), FALSE);

-- PIAUÍ (PI)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Teresina',      (SELECT id FROM brasil_estados WHERE sigla='PI'), TRUE),
  ('Parnaíba',      (SELECT id FROM brasil_estados WHERE sigla='PI'), FALSE),
  ('Picos',         (SELECT id FROM brasil_estados WHERE sigla='PI'), FALSE);

-- PARANÁ (PR)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Curitiba',      (SELECT id FROM brasil_estados WHERE sigla='PR'), TRUE),
  ('Londrina',      (SELECT id FROM brasil_estados WHERE sigla='PR'), FALSE),
  ('Maringá',       (SELECT id FROM brasil_estados WHERE sigla='PR'), FALSE),
  ('Ponta Grossa',  (SELECT id FROM brasil_estados WHERE sigla='PR'), FALSE),
  ('Cascavel',      (SELECT id FROM brasil_estados WHERE sigla='PR'), FALSE),
  ('São José dos Pinhais',(SELECT id FROM brasil_estados WHERE sigla='PR'), FALSE),
  ('Foz do Iguaçu', (SELECT id FROM brasil_estados WHERE sigla='PR'), FALSE),
  ('Colombo',       (SELECT id FROM brasil_estados WHERE sigla='PR'), FALSE);

-- RIO DE JANEIRO (RJ)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Rio de Janeiro',(SELECT id FROM brasil_estados WHERE sigla='RJ'), TRUE),
  ('São Gonçalo',   (SELECT id FROM brasil_estados WHERE sigla='RJ'), FALSE),
  ('Duque de Caxias',(SELECT id FROM brasil_estados WHERE sigla='RJ'), FALSE),
  ('Nova Iguaçu',   (SELECT id FROM brasil_estados WHERE sigla='RJ'), FALSE),
  ('Niterói',       (SELECT id FROM brasil_estados WHERE sigla='RJ'), FALSE),
  ('Belford Roxo',  (SELECT id FROM brasil_estados WHERE sigla='RJ'), FALSE),
  ('Campos dos Goytacazes',(SELECT id FROM brasil_estados WHERE sigla='RJ'), FALSE),
  ('Petrópolis',    (SELECT id FROM brasil_estados WHERE sigla='RJ'), FALSE),
  ('Volta Redonda', (SELECT id FROM brasil_estados WHERE sigla='RJ'), FALSE);

-- RIO GRANDE DO NORTE (RN)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Natal',         (SELECT id FROM brasil_estados WHERE sigla='RN'), TRUE),
  ('Mossoró',       (SELECT id FROM brasil_estados WHERE sigla='RN'), FALSE),
  ('Parnamirim',    (SELECT id FROM brasil_estados WHERE sigla='RN'), FALSE),
  ('Caicó',         (SELECT id FROM brasil_estados WHERE sigla='RN'), FALSE);

-- RONDÔNIA (RO)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Porto Velho',   (SELECT id FROM brasil_estados WHERE sigla='RO'), TRUE),
  ('Ji-Paraná',     (SELECT id FROM brasil_estados WHERE sigla='RO'), FALSE),
  ('Ariquemes',     (SELECT id FROM brasil_estados WHERE sigla='RO'), FALSE);

-- RORAIMA (RR)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Boa Vista',     (SELECT id FROM brasil_estados WHERE sigla='RR'), TRUE),
  ('Rorainópolis',  (SELECT id FROM brasil_estados WHERE sigla='RR'), FALSE),
  ('Caracaraí',     (SELECT id FROM brasil_estados WHERE sigla='RR'), FALSE);

-- RIO GRANDE DO SUL (RS)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Porto Alegre',  (SELECT id FROM brasil_estados WHERE sigla='RS'), TRUE),
  ('Caxias do Sul', (SELECT id FROM brasil_estados WHERE sigla='RS'), FALSE),
  ('Pelotas',       (SELECT id FROM brasil_estados WHERE sigla='RS'), FALSE),
  ('Canoas',        (SELECT id FROM brasil_estados WHERE sigla='RS'), FALSE),
  ('Santa Maria',   (SELECT id FROM brasil_estados WHERE sigla='RS'), FALSE),
  ('Gravataí',      (SELECT id FROM brasil_estados WHERE sigla='RS'), FALSE),
  ('Viamão',        (SELECT id FROM brasil_estados WHERE sigla='RS'), FALSE),
  ('Novo Hamburgo', (SELECT id FROM brasil_estados WHERE sigla='RS'), FALSE),
  ('São Leopoldo',  (SELECT id FROM brasil_estados WHERE sigla='RS'), FALSE);

-- SANTA CATARINA (SC)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Florianópolis', (SELECT id FROM brasil_estados WHERE sigla='SC'), TRUE),
  ('Joinville',     (SELECT id FROM brasil_estados WHERE sigla='SC'), FALSE),
  ('Blumenau',      (SELECT id FROM brasil_estados WHERE sigla='SC'), FALSE),
  ('São José',      (SELECT id FROM brasil_estados WHERE sigla='SC'), FALSE),
  ('Chapecó',       (SELECT id FROM brasil_estados WHERE sigla='SC'), FALSE),
  ('Itajaí',        (SELECT id FROM brasil_estados WHERE sigla='SC'), FALSE),
  ('Criciúma',      (SELECT id FROM brasil_estados WHERE sigla='SC'), FALSE);

-- SERGIPE (SE)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Aracaju',       (SELECT id FROM brasil_estados WHERE sigla='SE'), TRUE),
  ('Nossa Senhora do Socorro',(SELECT id FROM brasil_estados WHERE sigla='SE'), FALSE),
  ('Lagarto',       (SELECT id FROM brasil_estados WHERE sigla='SE'), FALSE),
  ('Itabaiana',     (SELECT id FROM brasil_estados WHERE sigla='SE'), FALSE);

-- SÃO PAULO (SP)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('São Paulo',     (SELECT id FROM brasil_estados WHERE sigla='SP'), TRUE),
  ('Guarulhos',     (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Campinas',      (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('São Bernardo do Campo',(SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Santo André',   (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Osasco',        (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Ribeirão Preto',(SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('São José dos Campos',(SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Sorocaba',      (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Mogi das Cruzes',(SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Santos',        (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Diadema',       (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Jundiaí',       (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Piracicaba',    (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Bauru',         (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('São Vicente',   (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Carapicuíba',   (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Franca',        (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE),
  ('Marília',       (SELECT id FROM brasil_estados WHERE sigla='SP'), FALSE);

-- TOCANTINS (TO)
INSERT INTO brasil_cidades (nome, estado_id, capital) VALUES
  ('Palmas',        (SELECT id FROM brasil_estados WHERE sigla='TO'), TRUE),
  ('Araguaína',     (SELECT id FROM brasil_estados WHERE sigla='TO'), FALSE),
  ('Gurupi',        (SELECT id FROM brasil_estados WHERE sigla='TO'), FALSE),
  ('Porto Nacional',(SELECT id FROM brasil_estados WHERE sigla='TO'), FALSE);

-- ============================================================
-- VIEW ÚTIL: cidades com nome do estado e sigla
-- ============================================================
CREATE OR REPLACE VIEW v_cidades_brasil AS
SELECT
  c.id,
  c.nome AS cidade,
  e.sigla,
  e.nome AS estado,
  e.regiao,
  c.capital
FROM brasil_cidades c
JOIN brasil_estados e ON e.id = c.estado_id
ORDER BY e.nome, c.capital DESC, c.nome;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- SELECT * FROM v_cidades_brasil WHERE capital = TRUE ORDER BY regiao, estado;
-- SELECT COUNT(*) FROM brasil_cidades;   -- total de cidades
-- SELECT COUNT(*) FROM brasil_estados;   -- deve ser 27
