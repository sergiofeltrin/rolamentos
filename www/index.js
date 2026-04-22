function previewImage(input, containerId) {
    const container = document.getElementById(containerId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            const existingImg = container.querySelector('img');
            if (existingImg) existingImg.remove();
            const img = document.createElement('img');
            img.src = data;
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            container.appendChild(img);
            if(container.querySelector('.icon')) container.querySelector('.icon').style.display = 'none';
            
            if(containerId === 'logo-left-container') {
                localStorage.setItem('inspection-logo-left', data);
                if(!localStorage.getItem('inspection-logo-right')) {
                    localStorage.setItem('inspection-logo-right', data);
                    restoreLogo(data, 'logo-right-container');
                }
            }
            if(containerId === 'logo-right-container') localStorage.setItem('inspection-logo-right', data);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    let leftLogo = localStorage.getItem('inspection-logo-left');
    let rightLogo = localStorage.getItem('inspection-logo-right');
    if(leftLogo && !rightLogo) {
        rightLogo = leftLogo;
        localStorage.setItem('inspection-logo-right', leftLogo);
    }
    if(leftLogo) restoreLogo(leftLogo, 'logo-left-container');
    if(rightLogo) restoreLogo(rightLogo, 'logo-right-container');

    // Força o preenchimento dos campos padrão caso o HTML esteja em cache
    const detalhes = document.getElementById('detalhes-inspecao');
    const sugestoes = document.getElementById('sugestoes-recomendacoes');

    if (detalhes && !detalhes.value.trim()) {
        detalhes.value = "Item 1 - Faces preservadas; Item 2 - Anel externo íntegro; Item 3 - Pista interna íntegra; Item 4 - Gaiolas preservadas; Item 5 – carreira de rolos íntegra; Item 6: Bucha preservada; Item 7 - O rolamento e bucha poderá ser montado novamente;";
    }
    if (sugestoes && !sugestoes.value.trim()) {
        sugestoes.value = "Utilizar a bucha cônica e rolamento na montagem atual.\nRealizar lavagem do rolamento em sua totalidade, realizar secagem total e aplicação de óleo protetivo.\nArmazenar em local coerente livre de poeiras e agentes externos.";
    }
});

function restoreLogo(data, containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    const existingImg = container.querySelector('img');
    if (existingImg) existingImg.remove();
    const img = document.createElement('img');
    img.src = data;
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    container.appendChild(img);
    if(container.querySelector('.icon')) container.querySelector('.icon').style.display = 'none';
}

function selectCondition(element) {
    document.querySelectorAll('.light-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('condicao').value = element.getAttribute('data-value');
}

function toggleDimensionalRow() {
    const isRadial = document.getElementById('check-radial').checked;
    const isAxial = document.getElementById('check-axial').checked;
    document.getElementById('row-radial').style.display = isRadial ? 'table-row' : 'none';
    document.getElementById('row-axial').style.display = isAxial ? 'table-row' : 'none';
}

async function preparePDFData() {
    const { jsPDF } = window.jspdf;
    const template = document.getElementById('pdf-template');
    template.innerHTML = '';
    
    const formData = {
        relatorioNumero: document.getElementById('relatorio-numero')?.value || '',
        data: document.getElementById('data-elaboracao')?.value || '',
        equipamento: document.getElementById('equipamento')?.value || '',
        bioparque: document.getElementById('bioparque')?.value || '',
        designacao: document.getElementById('designacao')?.value || '',
        fabricante: document.getElementById('fabricante')?.value || '',
        bucha: document.getElementById('bucha')?.value || '',
        classe: document.getElementById('classe')?.value || '',
        elaborador: document.getElementById('elaborado-por')?.value || '',
        respTecnico: document.getElementById('responsavel-tecnico')?.value || '',
        detalhesInspecao: document.getElementById('detalhes-inspecao')?.value || '',
        sugestoesRecomendacoes: document.getElementById('sugestoes-recomendacoes')?.value || '',
        condicao: document.getElementById('condicao')?.value || 'reutilizar',
        condicaoTexto: document.getElementById('condicao')?.options[document.getElementById('condicao').selectedIndex]?.text || 'Aprovado',
        falhas: Array.from(document.querySelectorAll('input[name="falha"]:checked')).map(cb => cb.value),
        radial: { 
            show: document.getElementById('check-radial')?.checked || false, 
            de: document.getElementById('radial-de')?.value || '', 
            ate: document.getElementById('radial-ate')?.value || '', 
            enc: document.getElementById('radial-encontrado')?.value || '' 
        },
        axial: { 
            show: document.getElementById('check-axial')?.checked || false, 
            de: document.getElementById('axial-de')?.value || '', 
            ate: document.getElementById('axial-ate')?.value || '', 
            enc: document.getElementById('axial-encontrado')?.value || '' 
        }
    };

    const logos = {
        left: document.getElementById('logo-left-container').querySelector('img')?.src,
        right: document.getElementById('logo-right-container').querySelector('img')?.src
    };
    const photos = [];
    for(let i=1; i<=6; i++) {
        const img = document.getElementById(`photo-${i}-container`).querySelector('img')?.src;
        if(img) photos.push(img);
    }

    const borderColor = '#808080';
    const labelColor = '#4F6D5E';
    const fillingColor = '#000080';

    let conditionColor = '#ccc';
    let conditionTextDark = false;
    if(formData.condicao === 'reutilizar') conditionColor = '#28a745';
    if(formData.condicao === 'ressalvas') conditionColor = '#007aff';
    if(formData.condicao === 'repotencializar') { conditionColor = '#ffc107'; conditionTextDark = true; }
    if(formData.condicao === 'descartar') conditionColor = '#dc3545';

    template.innerHTML = `
        <div id="capture-area" style="width: 794px; padding: 0px; box-sizing: border-box; font-family: 'Helvetica', Arial, sans-serif; background: white; margin: 0 auto; overflow: hidden;">
            <div style="padding: 10px 0; width: 100%;">
                <div style="border: 1px solid ${borderColor}; padding: 10px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="width: 155px; height: 75px; display: flex; align-items: center; justify-content: center;">
                        ${logos.left ? `<img src="${logos.left}" style="max-height: 100%; max-width: 100%; object-fit: contain;">` : ''}
                    </div>
                    <div style="text-align: center; flex: 1; padding: 0 10px;">
                        <h1 style="margin: 0; font-size: 20px; text-transform: uppercase; color: #000;">Relatório de Inspeção de Rolamento</h1>
                        <div style="font-size: 11px; font-weight: bold; margin-top: 6px; color: ${labelColor};">Nº CONTROLE: <span style="color: ${fillingColor}">${formData.relatorioNumero}</span></div>
                    </div>
                    <div style="width: 155px; height: 75px; display: flex; align-items: center; justify-content: center;">
                        ${logos.right ? `<img src="${logos.right}" style="max-height: 100%; max-width: 100%; object-fit: contain;">` : ''}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                    <div style="border: 0.5px solid ${borderColor};">
                        <div style="background: #f8f8f8; border-bottom: 0.5px solid ${borderColor}; padding: 4px 10px; font-weight: bold; font-size: 10px; color: ${labelColor};">DADOS DO EQUIPAMENTO</div>
                        <div style="padding: 10px; font-size: 11px; line-height: 1.7; color: ${labelColor};">
                            <b>Equipamento:</b> <span style="color: ${fillingColor}">${formData.equipamento}</span><br>
                            <b>Bioparque:</b> <span style="color: ${fillingColor}">${formData.bioparque}</span>
                        </div>
                    </div>
                    <div style="border: 0.5px solid ${borderColor};">
                        <div style="background: #f8f8f8; border-bottom: 0.5px solid ${borderColor}; padding: 4px 10px; font-weight: bold; font-size: 10px; color: ${labelColor};">DADOS DO ROLAMENTO</div>
                        <div style="padding: 10px; font-size: 11px; line-height: 1.7; color: ${labelColor};">
                            <b>Designação:</b> <span style="color: ${fillingColor}">${formData.designacao}</span> / <b>Bucha:</b> <span style="color: ${fillingColor}">${formData.bucha}</span><br>
                            <b>Fabricante:</b> <span style="color: ${fillingColor}">${formData.fabricante}</span> / <b>Classe:</b> <span style="color: ${fillingColor}">${formData.classe}</span>
                        </div>
                    </div>
                </div>

                <div style="border: 0.5px solid ${borderColor}; margin-bottom: 12px;">
                    <div style="background: #f8f8f8; border-bottom: 0.5px solid ${borderColor}; padding: 4px 10px; font-weight: bold; font-size: 10px; text-align: center; color: ${labelColor};">CONTROLE DIMENSIONAL DE ENTRADA</div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: center; color: ${labelColor};">
                        <tr style="background: #fafafa; font-weight: bold;">
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; width: 25%;">Folga</td>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; width: 25%;">De (µm)</td>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; width: 25%;">Até (µm)</td>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; width: 25%;">Encontrado (µm)</td>
                        </tr>
                        ${formData.radial.show ? `<tr>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; font-weight: bold;">Radial</td>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; color: ${fillingColor}">${formData.radial.de}</td>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; color: ${fillingColor}">${formData.radial.ate}</td>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; color: ${fillingColor}">${formData.radial.enc}</td>
                        </tr>` : ''}
                        ${formData.axial.show ? `<tr>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; font-weight: bold;">Axial</td>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; color: ${fillingColor}">${formData.axial.de}</td>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; color: ${fillingColor}">${formData.axial.ate}</td>
                            <td style="border: 0.5px solid ${borderColor}; padding: 6px; color: ${fillingColor}">${formData.axial.enc}</td>
                        </tr>` : ''}
                    </table>
                </div>

                <div style="border: 0.5px solid ${borderColor}; margin-bottom: 12px;">
                    <div style="background: #f8f8f8; border-bottom: 0.5px solid ${borderColor}; padding: 4px 10px; font-weight: bold; font-size: 10px; color: ${labelColor};">FALHAS ENCONTRADAS (ISO 15243:2017)</div>
                    <div style="padding: 10px; font-size: 10px; line-height: 1.4; display: grid; grid-template-columns: 1fr 1fr; column-gap: 20px; color: ${fillingColor};">
                        ${formData.falhas.map(f => `<span>• ${f}</span>`).join('') || '<span style="color:#888;">Nenhuma falha selecionada</span>'}
                    </div>
                </div>

                <div style="border: 0.5px solid ${borderColor}; margin-bottom: 12px;">
                    <div style="background: #f8f8f8; border-bottom: 0.5px solid ${borderColor}; padding: 4px 10px; font-weight: bold; font-size: 10px; color: ${labelColor};">DETALHES DA INSPEÇÃO E RECOMENDAÇÕES</div>
                    <div style="padding: 10px; font-size: 11px; line-height: 1.5; min-height: 90px; white-space: pre-wrap;">
                        ${formData.detalhesInspecao ? `<b style="color: ${labelColor}">Observações:</b> <span style="color: ${fillingColor}">${formData.detalhesInspecao}</span>\n\n` : ''}
                        ${formData.sugestoesRecomendacoes ? `<b style="color: ${labelColor}">Recomendações:</b> <span style="color: ${fillingColor}">${formData.sugestoesRecomendacoes}</span>` : ''}
                    </div>
                </div>

                <div style="border: 1px solid ${borderColor}; background: ${conditionColor}; padding: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 20px; color: ${conditionTextDark ? 'black' : 'white'};">
                     <span style="font-size: 14px; font-weight: bold; text-transform: uppercase;">CONDIÇÃO FINAL:</span>
                     <span style="font-size: 16px; font-weight: 900; background: rgba(0,0,0,0.1); padding: 5px 20px; border-radius: 4px;">${formData.condicaoTexto.toUpperCase()}</span>
                </div>

                <div style="border: 0.5px solid ${borderColor}; padding: 8px; margin-bottom: 12px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                        ${photos.map(p => `
                            <div style="border: 0.5px solid #eee; height: 145px; background: #fafafa; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                <img src="${p}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                            </div>
                        `).join('')}
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11px; color: ${labelColor}; text-align: center;">
                    <tr style="background: #f8f8f8; font-weight: bold; font-size: 9px; text-transform: uppercase;">
                        <td style="border: 0.5px solid ${borderColor}; padding: 4px; width: 33%;">Data Elaboração</td>
                        <td style="border: 0.5px solid ${borderColor}; padding: 4px; width: 33%;">Elaborado Por</td>
                        <td style="border: 0.5px solid ${borderColor}; padding: 4px; width: 34%;">Responsável Técnico</td>
                    </tr>
                    <tr>
                        <td style="border: 0.5px solid ${borderColor}; padding: 10px; color: ${fillingColor}; font-size: 11px;">${formData.data}</td>
                        <td style="border: 0.5px solid ${borderColor}; padding: 10px; color: ${fillingColor}; font-size: 11px;">${formData.elaborador}</td>
                        <td style="border: 0.5px solid ${borderColor}; padding: 10px; color: ${fillingColor}; font-size: 11px;">${formData.respTecnico}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;

    console.log('Gerando Canvas...');
    const captureEl = document.getElementById('capture-area');
    if(!captureEl) throw new Error("Área de captura não encontrada");

    const canvas = await html2canvas(captureEl, {
        scale: 2, // Reduzido de 3 para 2 para economizar memória
        logging: true,
        useCORS: true,
        backgroundColor: '#ffffff',
        imageTimeout: 15000
    });

    console.log('Canvas gerado. Criando PDF...');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.85); // Compressão em 85%
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    console.log('PDF pronto!');
    return { pdf, filename: `Relatorio_${formData.relatorioNumero || 'Final'}.pdf` };
}

async function generatePDF() {
    const btn = document.querySelector('.btn-secondary') || document.querySelector('.top-app-bar span[onclick*="generatePDF"]');
    const originalText = btn ? btn.textContent : '';
    if(btn) {
        btn.textContent = btn.tagName === 'SPAN' ? 'hourglass_empty' : 'Processando...';
        btn.disabled = true;
    }

    try {
        console.log('Iniciando geração...');
        const { pdf, filename } = await preparePDFData();
        console.log('Salvando...');
        pdf.save(filename);
        alert('Relatório salvo com sucesso!');
    } catch (error) {
        console.error('Erro detalhado:', error);
        alert('Erro ao gerar PDF: ' + error.message);
    } finally {
        if(btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}

async function generateAndShare(type = 'share') {
    const buttons = document.querySelectorAll('.bottom-actions button');
    const btn = type === 'email' ? buttons[0] : buttons[1];
    if (!btn) return;

    const originalText = btn.textContent;
    btn.textContent = 'Gerando...';
    btn.disabled = true;

    try {
        const { pdf, filename } = await preparePDFData();
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });

        // Tenta usar a API Web Share (funciona bem em dispositivos móveis modernos)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Relatório de Inspeção',
                text: 'Segue em anexo o relatório de inspeção de rolamento.'
            });
        } else {
            // Fallback para quando o compartilhamento de arquivos não é suportado (ex: PC)
            pdf.save(filename); // Garante que o usuário tenha o arquivo
            
            if(type === 'email') {
                const mailtoLink = `mailto:?subject=Relatório de Inspeção - ${filename}&body=Olá, o relatório foi gerado e salvo em seu dispositivo. Por favor, anexe-o a este e-mail.`;
                window.location.href = mailtoLink;
            } else {
                alert('Compartilhamento direto não suportado neste navegador. O PDF foi baixado automaticamente. Você pode enviá-lo manualmente pelo WhatsApp.');
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar relatório: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
