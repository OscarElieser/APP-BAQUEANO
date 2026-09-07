// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PORTAL DE ANFITRIONES & NEGOCIOS (business-portal.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Habilitar a cooperativas campesinas, posadas comunitarias y guías baqueanos
//   para registrar su negocio de turismo responsable directamente en Firestore
//   sin intermediarios, sin comisiones y con supervisión de INTUR/Ley 306.
// - Garantizar que el proceso de auto-registro es transparente, validado y
//   auditable en el Ops Center por el Administrador General.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Formulario multi-paso (3 etapas) con validación en tiempo real campo por campo.
// - Persistencia en /businesses con estado inicial 'pending_review'.
// - Registro de audit log en /audit_logs al completar el formulario.
// - Feedback visual glassmorphism con estados: idle → loading → success → error.
// - Defensivo: si Firestore no está disponible, confirma la solicitud localmente.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initBusinessPortal(): Inicializa el formulario multi-paso.
// - validateBusinessStep(step): Valida cada etapa del formulario.
// - submitBusinessRegistration(): Envía los datos a Firestore.
// ============================================================================

function initBusinessPortal() {
  const form = document.getElementById('businessRegForm');
  const stepsContainer = document.getElementById('regStepsContainer');
  const successPanel = document.getElementById('regSuccessPanel');
  const steps = document.querySelectorAll('.reg-step-panel');
  const stepIndicators = document.querySelectorAll('.reg-step-indicator');
  const btnNext = document.getElementById('btnRegNext');
  const btnPrev = document.getElementById('btnRegPrev');
  const btnSubmit = document.getElementById('btnRegSubmit');

  if (!form) return;

  let currentStep = 0;
  let formData = {};

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });

    stepIndicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
      ind.classList.toggle('completed', i < index);
    });

    if (btnPrev) btnPrev.style.display = index === 0 ? 'none' : 'inline-flex';
    if (btnNext) btnNext.style.display = index < steps.length - 1 ? 'inline-flex' : 'none';
    if (btnSubmit) btnSubmit.style.display = index === steps.length - 1 ? 'inline-flex' : 'none';

    currentStep = index;
  }

  function validateStep(stepIndex) {
    const step = steps[stepIndex];
    if (!step) return true;

    const required = step.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      const val = field.value.trim();
      const errorEl = document.getElementById(field.id + '_error');

      if (!val) {
        valid = false;
        field.classList.add('field-error');
        if (errorEl) errorEl.style.display = 'block';
      } else {
        field.classList.remove('field-error');
        if (errorEl) errorEl.style.display = 'none';

        // Validación de email
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          valid = false;
          field.classList.add('field-error');
          if (errorEl) {
            errorEl.textContent = 'Correo electrónico inválido.';
            errorEl.style.display = 'block';
          }
        }

        // Validación de teléfono nicaragüense
        if (field.type === 'tel' && !/^\+?[0-9\s\-]{7,15}$/.test(val)) {
          valid = false;
          field.classList.add('field-error');
          if (errorEl) {
            errorEl.textContent = 'Número de teléfono inválido.';
            errorEl.style.display = 'block';
          }
        }
      }
    });

    return valid;
  }

  function collectStepData(stepIndex) {
    const step = steps[stepIndex];
    if (!step) return;

    const inputs = step.querySelectorAll('input, select, textarea');
    inputs.forEach(field => {
      if (field.name || field.id) {
        const key = field.name || field.id;
        formData[key] = field.type === 'checkbox' ? field.checked : field.value.trim();
      }
    });
  }

  // Navegación entre pasos
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        collectStepData(currentStep);
        if (currentStep < steps.length - 1) {
          showStep(currentStep + 1);
          updatePreview();
        }
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 0) {
        showStep(currentStep - 1);
      }
    });
  }

  // Limpieza de errores en tiempo real
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('field-error');
      const errorEl = document.getElementById(field.id + '_error');
      if (errorEl) errorEl.style.display = 'none';
    });
  });

  // Actualizar panel de previsualización en paso 3
  function updatePreview() {
    const previewName = document.getElementById('previewBizName');
    const previewType = document.getElementById('previewBizType');
    const previewDept = document.getElementById('previewBizDept');
    const previewContact = document.getElementById('previewBizContact');

    if (previewName) previewName.textContent = formData['bizName'] || '—';
    if (previewType) previewType.textContent = formData['bizType'] || '—';
    if (previewDept) previewDept.textContent = formData['bizDepartment'] || '—';
    if (previewContact) previewContact.textContent = formData['bizEmail'] || formData['bizPhone'] || '—';
  }

  // Envío final del formulario
  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      if (!validateStep(currentStep)) return;
      collectStepData(currentStep);
      await submitBusinessRegistration(formData, stepsContainer, successPanel, btnSubmit);
    });
  }

  showStep(0);
}

async function submitBusinessRegistration(data, stepsContainer, successPanel, btnSubmit) {
  const originalText = btnSubmit.innerHTML;

  try {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando en Firestore...';

    const businessPayload = {
      name: data.bizName || '',
      type: data.bizType || '',
      department: data.bizDepartment || '',
      municipality: data.bizMunicipality || '',
      description: data.bizDescription || '',
      contactEmail: data.bizEmail || '',
      contactPhone: data.bizPhone || '',
      whatsapp: data.bizWhatsapp || '',
      ownerName: data.bizOwnerName || '',
      ownerCedula: data.bizOwnerCedula || '',
      inturRegistered: data.bizInturReg === 'true' || false,
      capacity: parseInt(data.bizCapacity) || 0,
      pricePerPerson: parseFloat(data.bizPrice) || 0,
      acceptsDirectPayment: data.bizDirectPayment === 'true' || true,
      services: data.bizServices || '',
      communityBenefit: data.bizCommunityBenefit || '',
      registeredByWeb: true,
      status: 'pending_review'
    };

    let businessId = '';

    if (typeof window.BaqueanoFirestore !== 'undefined') {
      businessId = await window.BaqueanoFirestore.registerBusiness(businessPayload);

      // Registrar en audit log
      await window.BaqueanoFirestore.writeAuditLog(
        'BUSINESS_REGISTRATION_SUBMITTED',
        `Negocio "${businessPayload.name}" registrado por ${businessPayload.ownerName} desde portal web.`,
        businessPayload.contactEmail
      );
    } else {
      // Fallback local si Firestore no cargó
      businessId = `biz_local_${Date.now()}`;
      console.info('[BusinessPortal] Registro local (Firestore no disponible):', businessPayload);
    }

    // Mostrar pantalla de éxito
    if (stepsContainer) stepsContainer.style.display = 'none';
    if (successPanel) {
      successPanel.style.display = 'flex';
      const regIdEl = document.getElementById('regConfirmId');
      const regNameEl = document.getElementById('regConfirmName');
      if (regIdEl) regIdEl.textContent = businessId;
      if (regNameEl) regNameEl.textContent = businessPayload.name;

      // Animación de entrada
      successPanel.style.opacity = '0';
      successPanel.style.transform = 'translateY(20px)';
      setTimeout(() => {
        successPanel.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        successPanel.style.opacity = '1';
        successPanel.style.transform = 'translateY(0)';
      }, 50);
    }

  } catch (err) {
    console.error('[BusinessPortal] Error en registro:', err.message);
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = originalText;

    const errorBanner = document.getElementById('regErrorBanner');
    if (errorBanner) {
      errorBanner.style.display = 'flex';
      errorBanner.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Error al registrar: ${err.message}. Intenta nuevamente.`;
      setTimeout(() => { errorBanner.style.display = 'none'; }, 5000);
    } else {
      alert('Error al registrar el negocio: ' + err.message);
    }
  }
}
