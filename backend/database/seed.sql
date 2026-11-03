-- ====================================================================
-- EQUALIS - DADOS DE CATÁLOGO INICIAL (BETA REAL)
-- Contém apenas o catálogo oficial de deficiências e contas base de
-- referência, sem poluir o feed, vagas ou mensagens com dados fictícios.
-- ====================================================================

USE equalis_db;

-- 1. Catálogo Oficial de Deficiências (Lei Brasileira de Inclusão / Lei nº 8.213/91)
INSERT INTO Deficiencia (id, categoria, descricao) VALUES
(1, 'Deficiência Física', 'Alteração completa ou parcial de um ou mais segmentos do corpo humano, com suporte de mobilidade e ergonomia.'),
(2, 'Deficiência Visual', 'Cegueira, baixa visão ou visão monocular, com suporte de leitores de tela, braille e alto contraste.'),
(3, 'Deficiência Auditiva', 'Perda bilateral, parcial ou total da audição, com suporte em Libras e comunicação visual.'),
(4, 'Deficiência Intelectual', 'Limitações adaptativas com suporte de comunicação simples, rotinas estruturadas e mentoria inclusiva.'),
(5, 'Deficiência Psicossocial / Mental', 'Condições neurodivergentes ou psicossociais (TEA, TDAH, etc.) com ambiente sensorialmente adaptado e horário flexível.')
ON DUPLICATE KEY UPDATE categoria=VALUES(categoria), descricao=VALUES(descricao);

-- 2. Empresas Parceiras Base (para login institucional e testes)
INSERT INTO Empresa (id, nome_fantasia, cnpj, email, senha, descricao) VALUES
(1, 'Centro Universitário UNICEPLAC', '00394460005887', 'rh@uniceplac.edu.br', '$2b$10$equalishashedpassword1234567890', 'Centro Universitário do Planalto Central Apparecido dos Santos (Gama - DF). Instituição comprometida com a acessibilidade universal e inclusão PcD.'),
(2, 'Inclusiva Tech Brasil', '11222333000181', 'talentos@inclusivatech.com.br', '$2b$10$equalishashedpassword1234567890', 'Consultoria e desenvolvimento de software acessível com vagas adaptadas para trabalho remoto e híbrido.')
ON DUPLICATE KEY UPDATE nome_fantasia=VALUES(nome_fantasia);

-- 3. Candidata Base de Referência
INSERT INTO Candidato (id, nome, email, senha, cpf, resumo_profissional, url_curriculo, cidade, estado, area_atuacao, usa_tela_acessivel) VALUES
(1, 'Maria Ledentsova', 'maria@equalis.com.br', '$2b$10$equalishashedpassword1234567890', '52998224725', 'Especialista em Marketing Digital, Comunicação Inclusiva e Atendimento ao Público.', 'https://equalis.app/curriculos/maria-ledentsova.pdf', 'Guarulhos', 'SP', 'Marketing', 0)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 4. Vínculo Candidato_Deficiencia da Conta Base
INSERT INTO Candidato_Deficiencia (id, candidato_id, deficiencia_id, url_laudo_medico) VALUES
(1, 1, 1, 'https://equalis.app/laudos/laudo-cid-maria.pdf')
ON DUPLICATE KEY UPDATE url_laudo_medico=VALUES(url_laudo_medico);

-- 5. Sugestões de Contatos na Rede (Todos como SUGERIDO, nenhum pré-conectado)
INSERT INTO Conexao (id, candidato_id, nome_contato, cargo_contato, conexoes_em_comum, total_conexoes, status) VALUES
(1, 1, 'Charles Oliveira', 'Gerente de Projetos com foco em diversidade e crescimento em equipe', 0, 312, 'SUGERIDO'),
(2, 1, 'Helena Costa', 'Tech Recruiter Especialista em Inclusão PcD na Inclusiva Tech', 0, 418, 'SUGERIDO'),
(3, 1, 'Rafael Mendes', 'Desenvolvedor Mobile & Especialista em Acessibilidade WCAG', 0, 204, 'SUGERIDO')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 6. Formação Acadêmica Oficial da Candidata de Referência
INSERT INTO Formacao_Academica (id, candidato_id, instituicao, diploma, area_estudo, mes_inicio, ano_inicio, mes_termino, ano_termino, atividades_grupos, descricao, competencias) VALUES
(1, 1, 'Centro Universitário UNICEPLAC', 'Graduação / Tecnólogo', 'Marketing e Mídias Digitais', 'Fevereiro', '2024', 'Dezembro', '2026', 'Núcleo de Acessibilidade e Inclusão (NICE)', 'Projetos práticos voltados à comunicação inclusiva e redução de barreiras.', 'Marketing Digital, Acessibilidade')
ON DUPLICATE KEY UPDATE instituicao=VALUES(instituicao);

-- 7. Experiência Profissional Oficial da Candidata de Referência
INSERT INTO Experiencia_Profissional (id, candidato_id, cargo, organizacao, tipo_emprego, localidade, tipo_localidade, mes_inicio, ano_inicio, descricao, competencias) VALUES
(1, 1, 'Assistente de Marketing e Relacionamento', 'Agência Conecta Inclusão', 'Meio período', 'São Paulo, Guarulhos, Brasil', 'Híbrido', 'Março', '2024', 'Criação de campanhas digitais acessíveis, descrição de imagens para leitores de tela e suporte ao cliente.', 'Atendimento ao Cliente, Marketing')
ON DUPLICATE KEY UPDATE cargo=VALUES(cargo);

