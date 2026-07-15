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

    // StartPreAnalysis (Primeira interação) - Apenas 1x
    const inputsForm = document.querySelectorAll('#simulation-form input');
    const onFirstInput = () => {
        if (!sessionStorage.getItem('pixel_start')) {
            sessionStorage.setItem('pixel_start', 'true');
            if (typeof window.fbq === "function") {
                window.fbq('trackCustom', 'StartPreAnalysis', {}, { eventID: generateEventId() });
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

        step.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        step.querySelectorAll('.chip-error').forEach(el => el.classList.remove('chip-error'));
        step.querySelectorAll('.error-message').forEach(el => el.remove());

        const radioNames = new Set();
        step.querySelectorAll('input[type="radio"]').forEach(r => radioNames.add(r.name));

        radioNames.forEach(name => {
            const checked = step.querySelector(`input[name="${name}"]:checked`);
            if (!checked && step.querySelector(`input[name="${name}"][required]`)) {
                isValid = false;
                const chipGroup = step.querySelector(`.chip-group[data-name="${name}"]`);
                if (chipGroup) {
                    chipGroup.classList.add('chip-error');
                    appendError(chipGroup.parentElement, 'Selecione uma opção.');
                }
            }
        });

        step.querySelectorAll('input[type="text"], input[type="tel"]').forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                input.classList.add('input-error');
                appendError(input.closest('.input-group'), 'Este campo é obrigatório.');
            }
            
            if (input.id === 'whatsapp' && input.value.trim()) {
                const num = input.value.replace(/\D/g, '');
                const isRepeated = /^(\d)\1+$/.test(num);
                const ddd = parseInt(num.substring(0, 2), 10);
                
                // Regex rígida para celular BR
                if (!/^\d{10,11}$/.test(num) || isRepeated || ddd < 11 || ddd > 99) {
                    isValid = false;
                    input.classList.add('input-error');
                    appendError(input.closest('.input-group'), 'Digite um número de telefone válido com DDD.');
                }
            }
        });

        const consent = step.querySelector('#consentimento');
        if (consent && !consent.checked) {
            isValid = false;
            const label = consent.closest('.checkbox-label');
            label.style.color = 'var(--danger)';
            appendError(consent.closest('.consent-box'), 'Você precisa concordar com os termos.');
        }

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

        const valorStr = document.getElementById('valor').value.replace(/\D/g, '');
        const valor = valorStr ? parseInt(valorStr) / 100 : 0;
        const finalidade = document.getElementById('finalidade').value.trim();
        const nome = document.getElementById('nome').value.trim();
        const telefone = document.getElementById('whatsapp').value.replace(/\D/g, '');
        const cidade = document.getElementById('cidade').value.trim();
        const bairro = document.getElementById('bairro').value.trim();
        
        const faixa_renda = getRadioValue('renda_media');
        const comprovacao_renda = getRadioValue('comprovante');
        const tempo_renda = getRadioValue('tempo_renda');
        const melhor_periodo_contato = getRadioValue('melhor_horario');
        const consent = document.getElementById('consentimento').checked;

        const payload = {
            nome: nome.slice(0, 100),
            telefone: telefone.slice(0, 15),
            cidade: cidade.slice(0, 100),
            bairro: bairro.slice(0, 100),
            valor_solicitado: valor,
            observacoes: `Finalidade: ${finalidade.slice(0, 200)}`,
            origem: pagina_origem.slice(0, 200),
            utm_source: utm_source ? utm_source.slice(0, 100) : null,
            utm_medium: utm_medium ? utm_medium.slice(0, 100) : null,
            utm_campaign: utm_campaign ? utm_campaign.slice(0, 100) : null,
            faixa_renda: faixa_renda,
            comprovacao_renda: comprovacao_renda,
            tempo_renda: tempo_renda,
            melhor_periodo_contato: melhor_periodo_contato,
            consentimento_whatsapp: consent,
            status: 'Novo', // Cadastro finalizado
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
                    'Content-Type': 'application/json'
                    // IMPORTANT: We do NOT use 'Prefer: return=representation' here.
                    // This allows anon to INSERT without needing SELECT permissions.
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            // ================== SUCESSO ==================
            steps.forEach(step => step.style.display = 'none');
            document.querySelector('.progress-steps').style.display = 'none';
            successEl.style.display = 'block';
            progress.style.width = '100%';

            // Rastreamento Meta Pixel: O evento Lead SÓ ocorre se o insert deu 201 Created.
            if (typeof window.fbq === "function" && !sessionStorage.getItem('pixel_lead_sent')) {
                window.fbq('track', 'Lead', {
                    content_name: 'Pre Analise Concluida',
                    currency: 'BRL',
                    value: valor > 0 ? valor : 0.00
                }, { eventID: generateEventId() });
                sessionStorage.setItem('pixel_lead_sent', 'true');
            }

            // Botão WhatsApp de Sucesso
            const msg = encodeURIComponent(`Olá, finalizei minha pré-análise no site e gostaria de falar com um especialista.`);
            document.getElementById('btn-whatsapp-final').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;

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

    // =========================================================================
    // Máscaras Dinâmicas
    // =========================================================================
    const valorInput = document.getElementById('valor');
    if (valorInput) {
        valorInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (!value) { e.target.value = ''; return; }
            value = (parseInt(value) / 100).toFixed(2);
            value = value.replace('.', ',');
            value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            e.target.value = `R$ ${value}`;
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
});
