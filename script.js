document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // Configuração — Supabase e UTMs
    // =========================================================================
    let envUrl = 'https://gwxwxsvuuhuovmrjwold.supabase.co';
    let envKey = 'sb_publishable_Vquz6FcYtbLp7bwN8ad3uQ_AVwax1Ij';
    const WHATSAPP_NUMBER = '5521959433111';
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            envUrl = import.meta.env.VITE_SUPABASE_URL || envUrl;
            envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || envKey;
        }
    } catch (e) { console.warn("Vite env vars indisponíveis"); }

    const SUPABASE_URL = envUrl;
    const SUPABASE_KEY = envKey;

    // Capturar UTMs da URL
    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get('utm_source') || '';
    const utm_medium = urlParams.get('utm_medium') || '';
    const utm_campaign = urlParams.get('utm_campaign') || '';
    const pagina_origem = window.location.pathname;

    let isSubmitting = false;

    // =========================================================================
    // Header scroll
    // =========================================================================
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // =========================================================================
    // Rastreamento (Meta Pixel)
    // =========================================================================
    function generateEventId() {
        return 'evt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // ViewContent (Primeira interação) - Apenas 1x
    const inputsForm = document.querySelectorAll('#simulation-form input');
    const onFirstInput = () => {
        if (!sessionStorage.getItem('pixel_start')) {
            sessionStorage.setItem('pixel_start', 'true');
            if (typeof window.fbq === "function") {
                window.fbq('track', 'ViewContent', { content_name: 'Pre Analise Iniciada' });
            }
        }
        inputsForm.forEach(i => i.removeEventListener('focus', onFirstInput));
        inputsForm.forEach(i => i.removeEventListener('input', onFirstInput));
    };
    inputsForm.forEach(i => {
        i.addEventListener('focus', onFirstInput);
        i.addEventListener('input', onFirstInput);
    });

    // WhatsApp Tracking
    document.querySelectorAll('.btn-wa-contact').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof window.fbq === "function") {
                window.fbq('trackCustom', 'Contact', {}, { eventID: generateEventId() });
            }
        });
    });

    // =========================================================================
    // FAQ — Accordion
    // =========================================================================
    document.querySelectorAll('.accordion-header').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const content = btn.nextElementSibling;
            document.querySelectorAll('.accordion-item').forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                    other.querySelector('.accordion-content').style.maxHeight = null;
                }
            });
            item.classList.toggle('active');
            content.style.maxHeight = item.classList.contains('active') ? content.scrollHeight + 'px' : null;
        });
    });

    // =========================================================================
    // Formulário Multi-etapas (Apenas Memória e Frontend)
    // =========================================================================
    const form = document.getElementById('simulation-form');
    const steps = document.querySelectorAll('.form-step');
    const progress = document.getElementById('progress');
    const loadingEl = document.getElementById('loading-step');
    const successEl = document.getElementById('success-step');
    const progressSteps = document.querySelectorAll('.pstep');
    const simuladorSection = document.getElementById('pre-analise');
    const totalSteps = steps.length;
    let currentStep = 1;

    function updateForm() {
        steps.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === currentStep);
        });
        progress.style.width = `${(currentStep / totalSteps) * 100}%`;
        progressSteps.forEach(ps => {
            const target = parseInt(ps.dataset.target);
            ps.classList.remove('active', 'done');
            if (target === currentStep) ps.classList.add('active');
            else if (target < currentStep) ps.classList.add('done');
        });
        
        if (currentStep > 1 && simuladorSection) {
            simuladorSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // =========================================================================
    // Lógica de Exibição Condicional
    // =========================================================================
    function updateDynamicFields() {
        const perfis = document.getElementsByName('perfil_profissional');
        let selectedPerfil = '';
        for (const p of perfis) {
            if (p.checked) selectedPerfil = p.value;
        }

        const condClt = document.getElementById('cond_clt');
        const condAutonomo = document.getElementById('cond_autonomo');
        const condPj = document.getElementById('cond_pj');
        const condLiberal = document.getElementById('cond_liberal');

        // Oculta todos
        if(condClt) condClt.style.display = 'none';
        if(condAutonomo) condAutonomo.style.display = 'none';
        if(condPj) condPj.style.display = 'none';
        if(condLiberal) condLiberal.style.display = 'none';

        // Mostra o específico
        if (selectedPerfil === 'CLT') {
            if(condClt) condClt.style.display = 'block';
        } else if (selectedPerfil === 'Autônomo') {
            if(condAutonomo) condAutonomo.style.display = 'block';
        } else if (selectedPerfil === 'Empresário / CNPJ') {
            if(condPj) condPj.style.display = 'block';
        } else if (selectedPerfil === 'Profissional Liberal') {
            if(condLiberal) condLiberal.style.display = 'block';
        }
    }

    const perfisInputs = document.getElementsByName('perfil_profissional');
    perfisInputs.forEach(input => input.addEventListener('change', updateDynamicFields));

    // Call once to set initial state
    updateDynamicFields();


    // =========================================================================
    // Máscaras Dinâmicas e Elementos de Entrada
    // =========================================================================
    const formatCurrency = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (!value) { e.target.value = ''; return; }
        value = (parseInt(value) / 100).toFixed(2);
        value = value.replace('.', ',');
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        e.target.value = `R$ ${value}`;
    };

    const valorInput = document.getElementById('valor');
    if (valorInput) valorInput.addEventListener('input', formatCurrency);
    
    const rendaInput = document.getElementById('renda');
    if (rendaInput) rendaInput.addEventListener('input', formatCurrency);

    const movAutonomo = document.getElementById('movimentacao_autonomo');
    if (movAutonomo) movAutonomo.addEventListener('input', formatCurrency);
    
    const movLiberal = document.getElementById('movimentacao_liberal');
    if (movLiberal) movLiberal.addEventListener('input', formatCurrency);

    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
            e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + (x[3] ? '.' : '') + x[3] + (x[4] ? '/' : '') + x[4] + (x[5] ? '-' + x[5] : '');
        });
    }

    const whatsappInput = document.getElementById('whatsapp');
    const whatsappConf = document.getElementById('whatsapp-confirmation');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 11) val = val.slice(0, 11);
            if (val.length === 0) { 
                e.target.value = ''; 
                if (whatsappConf) whatsappConf.style.display = 'none';
                return; 
            }
            if (val.length <= 2) { 
                e.target.value = `(${val}`; 
                if (whatsappConf) whatsappConf.style.display = 'none';
                return; 
            }
            if (val.length <= 7) { 
                e.target.value = `(${val.slice(0, 2)}) ${val.slice(2)}`; 
                if (whatsappConf) whatsappConf.style.display = 'none';
                return; 
            }
            const formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
            e.target.value = formatted;
            
            if (val.length >= 10 && whatsappConf) {
                whatsappConf.textContent = `Entraremos em contato pelo número ${formatted}. Confira se está correto.`;
                whatsappConf.style.display = 'block';
            } else if (whatsappConf) {
                whatsappConf.style.display = 'none';
            }
        });
    }

    // =========================================================================
    // Cálculo da Simulação
    // =========================================================================
    function atualizarSimulacao() {
        if (!valorInput) return;
        const simBox = document.getElementById('simulation-box');
        if (!simBox) return; // Retorna cedo se o bloco de simulação não existir na página
        
        const valorStr = valorInput.value.replace(/\D/g, '');
        const valor = valorStr ? parseInt(valorStr) / 100 : 0;
        
        if (valor > 0) {
            const mensal = valor * 0.30;
            const quitacao = valor * 1.30;
            
            const elSolicitado = document.getElementById('sim-solicitado');
            const elMensal = document.getElementById('sim-mensal');
            const elQuitacao = document.getElementById('sim-quitacao');

            if (elSolicitado) elSolicitado.textContent = formatCurrencyValue(valor);
            if (elMensal) elMensal.textContent = formatCurrencyValue(mensal);
            if (elQuitacao) elQuitacao.textContent = formatCurrencyValue(quitacao);
            
            simBox.style.display = 'block';
        } else {
            simBox.style.display = 'none';
        }
    }
    
    function formatCurrencyValue(val) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    }

    if (valorInput) valorInput.addEventListener('input', atualizarSimulacao);

    function appendError(container, message) {
        if (!container || container.querySelector('.error-message')) return;
        const el = document.createElement('p');
        el.className = 'error-message visible';
        el.textContent = message;
        el.style.color = 'var(--danger)';
        el.style.fontSize = '0.85rem';
        el.style.marginTop = '4px';
        container.appendChild(el);
    }

    function validateStep(stepNum) {
        const step = document.querySelector(`.form-step[data-step="${stepNum}"]`);
        let isValid = true;

        console.log(`\n--- INICIANDO VALIDAÇÃO DA ETAPA ${stepNum} ---`);

        step.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        step.querySelectorAll('.chip-error').forEach(el => el.classList.remove('chip-error'));
        step.querySelectorAll('.error-message').forEach(el => el.remove());

        const radioNames = new Set();
        step.querySelectorAll('input[type="radio"]').forEach(r => {
            // Usa check robusto de visibilidade (offsetParent ou display) ao invés do atributo style
            const isHidden = r.closest('.conditional-block') && window.getComputedStyle(r.closest('.conditional-block')).display === 'none';
            if (isHidden) return;
            radioNames.add(r.name);
        });

        radioNames.forEach(name => {
            const checked = step.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                isValid = false;
                console.log(`❌ Campo obrigatório vazio (Radio): ${name}`);
                
                const chipGroup = step.querySelector(`.chip-group[data-name="${name}"]`);
                const choiceGrid = step.querySelector(`.choice-grid`);
                
                if (chipGroup) {
                    chipGroup.classList.add('chip-error');
                    appendError(chipGroup.parentElement, 'Selecione uma opção.');
                } else if (choiceGrid && name === 'perfil_profissional') {
                    choiceGrid.classList.add('chip-error'); 
                    appendError(choiceGrid.parentElement, 'Selecione uma opção.');
                }
            } else {
                console.log(`✅ Campo OK (Radio): ${name} = ${checked.value}`);
            }
        });

        step.querySelectorAll('input[type="text"], input[type="tel"], select').forEach(input => {
            const isHidden = input.closest('.conditional-block') && window.getComputedStyle(input.closest('.conditional-block')).display === 'none';
            if (isHidden) return;
            
            if (!input.value.trim()) {
                isValid = false;
                console.log(`❌ Campo obrigatório vazio (Text/Tel/Select): id=${input.id} name=${input.name}`);
                input.classList.add('input-error');
                appendError(input.closest('.input-group'), 'Este campo é obrigatório.');
            } else {
                console.log(`✅ Campo OK (Text/Tel/Select): id=${input.id} = ${input.value}`);
            }
            
            if (input.id === 'whatsapp' && input.value.trim()) {
                const num = input.value.replace(/\D/g, '');
                const isRepeated = /^(\d)\1+$/.test(num);
                const ddd = parseInt(num.substring(0, 2), 10);
                
                if (!/^\d{10,11}$/.test(num) || isRepeated || ddd < 11 || ddd > 99) {
                    isValid = false;
                    console.log(`❌ WhatsApp Inválido: ${num}`);
                    input.classList.add('input-error');
                    appendError(input.closest('.input-group'), 'Digite um número de telefone válido com DDD.');
                }
            }

            if (input.id === 'cnpj' && input.value.trim()) {
                const num = input.value.replace(/\D/g, '');
                if (num.length !== 14) {
                    isValid = false;
                    console.log(`❌ CNPJ Inválido: ${num}`);
                    input.classList.add('input-error');
                    appendError(input.closest('.input-group'), 'Digite um CNPJ válido.');
                }
            }
        });

        const consent = step.querySelector('#consentimento');
        if (consent) {
            const isHidden = consent.closest('.conditional-block') && window.getComputedStyle(consent.closest('.conditional-block')).display === 'none';
            if (!isHidden && !consent.checked) {
                isValid = false;
                console.log(`❌ Termos de consentimento não aceitos.`);
                const label = consent.closest('.checkbox-label');
                label.style.color = 'var(--danger)';
                appendError(consent.closest('.consent-box'), 'Você precisa concordar com os termos.');
            } else {
                console.log(`✅ Consentimento OK`);
            }
        }

        console.log(`--- RESULTADO DA VALIDAÇÃO ETAPA ${stepNum}: ${isValid ? 'APROVADO' : 'REPROVADO'} ---`);
        return isValid;
    }

    document.querySelectorAll('.form-step input').forEach(input => {
        const event = input.type === 'radio' || input.type === 'checkbox' ? 'change' : 'input';
        input.addEventListener(event, () => {
            input.classList.remove('input-error');
            const step = input.closest('.form-step');
            if (step) {
                step.querySelectorAll('.chip-error').forEach(el => el.classList.remove('chip-error'));
                step.querySelectorAll('.error-message').forEach(el => el.remove());
            }
            if (input.id === 'consentimento') {
                input.closest('.checkbox-label').style.color = '';
            }
        });
    });

    // =========================================================================
    // Avançar para Etapa 2 (Apenas em memória, sem enviar ao banco)
    // =========================================================================
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!validateStep(currentStep)) return;
            if (currentStep === 1) {
                atualizarSimulacao(); // Update simulation before transitioning
                currentStep++;
                updateForm();
            }
        });
    });

    // =========================================================================
    // Voltar
    // =========================================================================
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1 && !isSubmitting) {
                currentStep--;
                updateForm();
            }
        });
    });

    function getRadioValue(name) {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : '';
    }

    function toggleFormState(disabled) {
        const buttons = form.querySelectorAll('button');
        const inputs = form.querySelectorAll('input');
        buttons.forEach(b => b.disabled = disabled);
        inputs.forEach(i => i.disabled = disabled);
    }

    // =========================================================================
    // Envio Final (Single Insert)
    // =========================================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return; // Proteção extra duplo clique
        if (!validateStep(currentStep)) return;

        isSubmitting = true;
        const submitBtn = form.querySelector('.btn-submit');
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Enviar para análise';
        
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Enviando...';
        }
        toggleFormState(true);

        const valorStr = document.getElementById('valor') ? document.getElementById('valor').value.replace(/\D/g, '') : '';
        const valor = valorStr ? parseInt(valorStr) / 100 : 0;
        
        const rendaStr = document.getElementById('renda') ? document.getElementById('renda').value.replace(/\D/g, '') : '';
        const rendaExata = rendaStr ? parseInt(rendaStr) / 100 : null;

        const nome = document.getElementById('nome').value.trim();
        const telefone = document.getElementById('whatsapp').value.replace(/\D/g, '');
        const cidade = document.getElementById('cidade').value.trim();
        const bairro = document.getElementById('bairro').value.trim();
        
        const perfil_profissional = getRadioValue('perfil_profissional');
        // Mantendo compatibilidade com o banco antigo onde PJ era um "cliente" específico
        const perfil_cliente = perfil_profissional === 'Empresário / CNPJ' ? 'Empresa / CNPJ' : 'Pessoa Física';
        
        // Mocks e parses de bypass para o Supabase antigo
        let faturamentoParsed = null;
        let tempoEmpresa = null;
        let atividade = null;
        
        if (perfil_profissional === 'CLT') {
            tempoEmpresa = getRadioValue('tempo_emprego_clt');
        } else if (perfil_profissional === 'Autônomo') {
            atividade = document.getElementById('atividade_autonomo') ? document.getElementById('atividade_autonomo').value : '';
            const movStr = document.getElementById('movimentacao_autonomo') ? document.getElementById('movimentacao_autonomo').value.replace(/\D/g, '') : '';
            faturamentoParsed = movStr ? parseInt(movStr) / 100 : null;
        } else if (perfil_profissional === 'Empresário / CNPJ') {
            // No futuro, isso será salvo em uma coluna TEXT (faixa_faturamento_pj)
            // Por enquanto passamos 0 para não estourar erro de tipagem no NUMERIC do banco.
            faturamentoParsed = 0; 
            tempoEmpresa = getRadioValue('tempo_pj');
        } else if (perfil_profissional === 'Profissional Liberal') {
            atividade = document.getElementById('atividade_liberal') ? document.getElementById('atividade_liberal').value : '';
            const movStr = document.getElementById('movimentacao_liberal') ? document.getElementById('movimentacao_liberal').value.replace(/\D/g, '') : '';
            faturamentoParsed = movStr ? parseInt(movStr) / 100 : null;
        }

        const consentEl = document.getElementById('consentimento');
        const consentimentoChecked = consentEl ? consentEl.checked : false;

        const extraInfo = [
            `Perfil: ${perfil_profissional} (${perfil_cliente})`,
            `Tempo Renda/Empresa: ${getRadioValue('tempo_renda_pf') || tempoEmpresa || 'N/A'}`,
            `Atividade: ${atividade || 'N/A'}`,
            `Faturamento: ${faturamentoParsed || 'N/A'}`,
            `Comprovação: ${getRadioValue('comprova_renda_pf') || 'N/A'}`,
            `UTM Source: ${utm_source || 'N/A'}`,
            `Consentimento WhatsApp: ${consentimentoChecked ? 'Sim' : 'Não'}`
        ].join(' | ');

        const payload = {
            nome: nome.slice(0, 100),
            telefone: telefone.slice(0, 15),
            cidade: cidade.slice(0, 100),
            bairro: bairro.slice(0, 100),
            valor_solicitado: valor,
            renda_mensal: rendaExata,
            origem: pagina_origem.slice(0, 200),
            status: 'Novo',
            observacoes: extraInfo,
            utm_source: utm_source ? utm_source.slice(0, 100) : null,
            utm_medium: utm_medium ? utm_medium.slice(0, 100) : null,
            utm_campaign: utm_campaign ? utm_campaign.slice(0, 100) : null,
            tempo_renda: getRadioValue('tempo_renda_pf') || tempoEmpresa || null,
            comprovacao_renda: getRadioValue('comprova_renda_pf') || null,
            consentimento_whatsapp: consentimentoChecked,
            etapa: '2',
            data_conclusao: new Date().toISOString()
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Erro Supabase:", errorData);
                throw new Error(errorData.message || `HTTP Error: ${response.status}`);
            }

            // ================== SUCESSO ==================
            steps.forEach(step => step.style.display = 'none');
            document.querySelector('.progress-steps').style.display = 'none';
            successEl.style.display = 'block';
            progress.style.width = '100%';

            // Rastreamento Meta Pixel: O evento Lead SÓ ocorre se o insert deu 201 Created.
            if (!sessionStorage.getItem('pixel_lead_sent')) {
                const eventId = generateEventId();
                if (typeof window.fbq === "function") {
                    window.fbq('track', 'Lead', {
                        content_name: 'Pre Analise Concluida'
                    }, { eventID: eventId });
                }
                
                // Enviar para CAPI no backend
                try {
                    await fetch('/api/meta-capi', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            event_id: eventId,
                            event_source_url: window.location.href
                        })
                    });
                } catch (e) {
                    console.error('Erro ao enviar CAPI:', e);
                }

                sessionStorage.setItem('pixel_lead_sent', 'true');
            }

            // O botão de WhatsApp foi removido conforme solicitado

        } catch (err) {
            console.error('Erro ao enviar:', err);
            
            // Reverte o estado visual para permitir nova tentativa
            isSubmitting = false;
            toggleFormState(false);
            if (submitBtn) {
                submitBtn.innerHTML = originalBtnHtml;
            }
            
            const errName = err.name === 'AbortError' ? 'Timeout de conexão' : err.message;
            alert(`Ocorreu um erro ao enviar sua solicitação (${errName}). Por favor, verifique sua internet e tente novamente.`);
        }
    });
});

