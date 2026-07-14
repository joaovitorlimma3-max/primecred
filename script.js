document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // Configuração — Supabase e WhatsApp
    // =========================================================================
    const SUPABASE_URL = 'https://gwxwxsvuuhuovmrjwold.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_Vquz6FcYtbLp7bwN8ad3uQ_AVwax1Ij';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const WHATSAPP_NUMBER = '5521959433111';

    // =========================================================================
    // Header — Efeito de scroll (caso exista)
    // =========================================================================
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

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
            content.style.maxHeight = item.classList.contains('active')
                ? content.scrollHeight + 'px'
                : null;
        });
    });

    // =========================================================================
    // Formulário Multi-etapas (4 etapas)
    // =========================================================================
    const form = document.getElementById('simulation-form');
    const steps = document.querySelectorAll('.form-step');
    const progress = document.getElementById('progress');
    const loadingEl = document.getElementById('loading-step');
    const successEl = document.getElementById('success-step');
    const progressSteps = document.querySelectorAll('.pstep');
    const totalSteps = steps.length;

    let currentStep = 1;

    // --- Atualiza visual das etapas, barra e indicadores ---
    function updateForm() {
        steps.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === currentStep);
        });

        // Barra de progresso
        progress.style.width = `${(currentStep / totalSteps) * 100}%`;

        // Indicadores de etapa
        progressSteps.forEach(ps => {
            const target = parseInt(ps.dataset.target);
            ps.classList.remove('active', 'done');
            if (target === currentStep) ps.classList.add('active');
            else if (target < currentStep) ps.classList.add('done');
        });
    }

    // --- Validação genérica por etapa ---
    function validateStep(stepNum) {
        const step = document.querySelector(`.form-step[data-step="${stepNum}"]`);
        let isValid = true;

        // Limpa erros anteriores
        step.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        step.querySelectorAll('.chip-error').forEach(el => el.classList.remove('chip-error'));
        step.querySelectorAll('.value-grid.value-error').forEach(el => el.classList.remove('value-error'));
        step.querySelectorAll('.error-message').forEach(el => el.remove());

        // Valida todos os radio groups dentro da etapa
        const radioNames = new Set();
        step.querySelectorAll('input[type="radio"]').forEach(r => radioNames.add(r.name));

        radioNames.forEach(name => {
            const checked = step.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                isValid = false;
                // Encontra o container correto
                const chipGroup = step.querySelector(`.chip-group[data-name="${name}"]`);
                const valueGrid = step.querySelector('.value-grid');
                if (chipGroup) {
                    chipGroup.classList.add('chip-error');
                    appendError(chipGroup.closest('.field-block') || chipGroup.parentElement, 'Selecione uma opção.');
                } else if (valueGrid) {
                    valueGrid.classList.add('value-error');
                    appendError(valueGrid.parentElement, 'Selecione um valor.');
                }
            }
        });

        // Valida inputs de texto / tel
        step.querySelectorAll('input[type="text"], input[type="tel"]').forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                input.classList.add('input-error');
                appendError(input.closest('.input-group'), 'Este campo é obrigatório.');
            }
            
            if (input.id === 'cpf') {
                const rawValue = input.value.replace(/\D/g, '');
                if (rawValue.length > 0 && !validarCPF(rawValue)) {
                    isValid = false;
                    input.classList.add('input-error');
                    const msgEl = document.getElementById('cpf-msg');
                    if (msgEl) {
                        msgEl.textContent = 'Informe um CPF válido para continuar.';
                        msgEl.style.color = 'var(--danger)';
                        msgEl.style.display = 'block';
                    }
                }
            }
        });

        return isValid;
    }

    function appendError(container, message) {
        if (!container || container.querySelector('.error-message')) return;
        const el = document.createElement('p');
        el.className = 'error-message visible';
        el.textContent = message;
        container.appendChild(el);
    }

    // Limpa erro ao interagir
    document.querySelectorAll('.form-step input').forEach(input => {
        const event = input.type === 'radio' ? 'change' : 'input';
        input.addEventListener(event, () => {
            input.classList.remove('input-error');
            const step = input.closest('.form-step');
            if (step) {
                step.querySelectorAll('.chip-error').forEach(el => el.classList.remove('chip-error'));
                step.querySelectorAll('.value-error').forEach(el => el.classList.remove('value-error'));
                step.querySelectorAll('.error-message').forEach(el => el.remove());
            }
        });
    });

    // --- Botões Continuar ---
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                updateForm();
            }
        });
    });

    // --- Botões Voltar ---
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateForm();
            }
        });
    });

    // =========================================================================
    // Envio do formulário — Loading → Gravar no Supabase → Tela de sucesso
    // =========================================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) return;

        // O disparo do pixel foi movido para o bloco de sucesso (após enviar ao Supabase)

        // Esconde etapas e mostra loading
        steps.forEach(step => step.style.display = 'none');
        document.querySelector('.progress-steps').style.display = 'none';
        loadingEl.style.display = 'block';
        progress.style.width = '100%';

        // Prepara os dados
        const valorSolicitadoStr = document.getElementById('valor').value.replace(/\D/g, '');
        const valor = valorSolicitadoStr ? parseInt(valorSolicitadoStr) / 100 : 0;
        const renda = 0;

        const finalidade = document.getElementById('finalidade').value.trim();
        const tipo_contrato = getRadioValue('tipo_contrato');
        
        const renda_media = getRadioValue('renda_media');
        const comprovante = getRadioValue('comprovante');
        const tempo_renda = getRadioValue('tempo_renda');
        
        let statusComprovacao = comprovante;
        if (comprovante === 'Não consigo comprovar') {
            statusComprovacao = 'Comprovação de renda pendente';
        }

        const rua = document.getElementById('rua').value.trim();
        const numero = document.getElementById('numero').value.trim();
        const complemento = document.getElementById('complemento').value.trim();
        const enderecoCompleto = `${rua}, ${numero} ${complemento ? '- ' + complemento : ''}`;

        const observacoes = `Endereço: ${enderecoCompleto} | Finalidade: ${finalidade} | Tipo de contrato: ${tipo_contrato} | Renda Média: ${renda_media} | Comprovante: ${statusComprovacao} | Tempo: ${tempo_renda}`;

        try {
            // Usando a API REST exata que você forneceu
            const response = await fetch('https://gwxwxsvuuhuovmrjwold.supabase.co/rest/v1/leads', {
                method: 'POST',
                headers: {
                    'apikey': 'sb_publishable_Vquz6FcYtbLp7bwN8ad3uQ_AVwax1Ij',
                    'Authorization': 'Bearer sb_publishable_Vquz6FcYtbLp7bwN8ad3uQ_AVwax1Ij',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    nome: document.getElementById('nome').value.trim(),
                    cpf: document.getElementById('cpf').value.trim(),
                    telefone: document.getElementById('whatsapp').value.trim(),
                    cep: document.getElementById('cep').value.trim(),
                    cidade: document.getElementById('cidade').value.trim(),
                    bairro: document.getElementById('bairro').value.trim(),
                    uf: document.getElementById('uf').value.trim().toUpperCase(),
                    valor_solicitado: valor,
                    renda_mensal: renda,
                    observacoes: observacoes,
                    origem: 'Landing Page'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro da API:", errorData);
                throw new Error('Erro na comunicação com a API');
            }

            // Esconde loading e mostra sucesso
            loadingEl.style.display = 'none';
            successEl.style.display = 'block';

            // Dispara eventos Meta Pixel confirmando o sucesso
            if (window.fbq) {
                window.fbq('track', 'CompleteRegistration', {
                    content_name: 'Pre-Solicitacao de Credito'
                });
                window.fbq('track', 'Lead', {
                    currency: 'BRL',
                    value: valor
                });
            }

            // Integração WhatsApp removida a pedido do usuário

        } catch (err) {
            console.error('Erro detalhado:', err);
            loadingEl.style.display = 'none';
            alert('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
            steps[currentStep - 1].style.display = 'block';
            document.querySelector('.progress-steps').style.display = 'flex';
        }
    });

    // =========================================================================
    // Monta a mensagem formatada com TODOS os dados do novo formulário
    // =========================================================================
    function buildWhatsAppMessage() {
        const valor       = document.getElementById('valor').value.trim();
        const finalidade  = document.getElementById('finalidade').value.trim();
        const tipo_contrato = getRadioValue('tipo_contrato');
        
        const renda_media = getRadioValue('renda_media');
        const comprovante = getRadioValue('comprovante');
        const tempo_renda = getRadioValue('tempo_renda');
        
        let statusComprovacao = comprovante;
        if (comprovante === 'Não consigo comprovar') {
            statusComprovacao = 'Comprovação de renda pendente';
        }

        const nome        = document.getElementById('nome').value.trim();
        const cpf         = document.getElementById('cpf').value.trim();
        const whatsapp    = document.getElementById('whatsapp').value.trim();
        const cep         = document.getElementById('cep').value.trim();
        const rua         = document.getElementById('rua').value.trim();
        const numero      = document.getElementById('numero').value.trim();
        const complemento = document.getElementById('complemento').value.trim();
        const cidade      = document.getElementById('cidade').value.trim();
        const bairro      = document.getElementById('bairro').value.trim();
        const uf          = document.getElementById('uf').value.trim().toUpperCase();

        const lines = [
            'Olá! Gostaria de solicitar uma pré-análise de crédito.',
            '',
            '📋 *Dados da Pré-Solicitação*',
            '',
            '💰 *Valor desejado:*',
            valor,
            '',
            `🎯 *Finalidade:* ${finalidade}`,
            `⏱️ *Tipo de contrato:* ${tipo_contrato}`,
            '',
            '── *Renda* ──',
            '',
            `💵 *Renda média:* ${renda_media}`,
            `🕒 *Tempo de renda:* ${tempo_renda}`,
            `📄 *Comprovação:* ${statusComprovacao}`,
            '',
            '── *Contato e Endereço* ──',
            '',
            `👤 *Nome:* ${nome}`,
            `🆔 *CPF:* ${cpf}`,
            `📱 *WhatsApp:* ${whatsapp}`,
            `📍 *Endereço:* ${rua}, ${numero} ${complemento ? '- ' + complemento : ''}`,
            `🏘️ *Bairro:* ${bairro}`,
            `🏙️ *Cidade/UF:* ${cidade} - ${uf}`,
            `📮 *CEP:* ${cep}`,
            '',
            'Aguardo o retorno. Obrigado!'
        ];

        return lines.join('\n');
    }

    function getRadioValue(name) {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : '';
    }

    // =========================================================================
    // Máscaras de input
    // =========================================================================
    function applyCurrencyMask(input) {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (!value) { e.target.value = ''; return; }
            value = (parseInt(value) / 100).toFixed(2);
            value = value.replace('.', ',');
            value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            e.target.value = `R$ ${value}`;
        });
    }

    const valorInput = document.getElementById('valor');
    if (valorInput) applyCurrencyMask(valorInput);

    // Validação de CPF
    function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g,'');
        if(cpf == '') return false;
        if (cpf.length != 11 || 
            /^(\d)\1{10}$/.test(cpf))
                return false;
        var add = 0;
        for (var i=0; i < 9; i ++)
            add += parseInt(cpf.charAt(i)) * (10 - i);
        var rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(9))) return false;
        add = 0;
        for (var i = 0; i < 10; i ++)
            add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(10))) return false;
        return true;
    }

    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
            
            const msgEl = document.getElementById('cpf-msg');
            msgEl.style.display = 'none';
            cpfInput.classList.remove('input-error');
        });

        cpfInput.addEventListener('blur', (e) => {
            const rawValue = e.target.value.replace(/\D/g, '');
            const msgEl = document.getElementById('cpf-msg');
            
            if (rawValue.length === 0) return;

            if (validarCPF(rawValue)) {
                cpfInput.classList.remove('input-error');
                msgEl.textContent = 'CPF validado.';
                msgEl.style.color = '#059669'; // success color
                msgEl.style.display = 'block';
            } else {
                cpfInput.classList.add('input-error');
                msgEl.textContent = 'Informe um CPF válido para continuar.';
                msgEl.style.color = 'var(--danger)';
                msgEl.style.display = 'block';
            }
        });
    }

    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', async (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            e.target.value = value.replace(/(\d{5})(\d)/, '$1-$2');
            
            if (value.length === 8) {
                document.getElementById('cep-loading').style.display = 'inline-block';
                document.getElementById('cep-error').style.display = 'none';
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
                    const data = await res.json();
                    if (data.erro) {
                        document.getElementById('cep-error').style.display = 'inline-block';
                        document.getElementById('rua').value = '';
                        document.getElementById('bairro').value = '';
                        document.getElementById('cidade').value = '';
                        document.getElementById('uf').value = '';
                    } else {
                        document.getElementById('rua').value = data.logradouro || '';
                        document.getElementById('bairro').value = data.bairro || '';
                        document.getElementById('cidade').value = data.localidade || '';
                        document.getElementById('uf').value = data.uf || '';
                        document.getElementById('numero').focus();
                        
                        // Limpa os erros desses campos se já estiverem preenchidos
                        ['rua', 'bairro', 'cidade', 'uf'].forEach(id => {
                            const el = document.getElementById(id);
                            if (el && el.value) {
                                el.classList.remove('input-error');
                                const err = el.closest('.input-group').querySelector('.error-message');
                                if (err) err.remove();
                            }
                        });
                    }
                } catch (err) {
                    document.getElementById('cep-error').style.display = 'inline-block';
                } finally {
                    document.getElementById('cep-loading').style.display = 'none';
                }
            }
        });
    }

});
