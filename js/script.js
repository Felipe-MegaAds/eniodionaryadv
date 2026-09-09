/**
 * ==========================================================================
 * PROJETO: ENIO DIONARY ADVOCACIA - DIREITO DE TRÂNSITO
 * ARQUIVO: JS/SCRIPT.JS
 * DESCRIÇÃO: COMPORTAMENTOS INTERATIVOS, RASTREAMENTO GTM E ANIMAÇÕES
 * 100% VANILLA JS - SEM DEPENDÊNCIAS EXTERNAS - CÓDIGO AMPLAMENTE COMENTADO
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. INICIALIZAÇÃO DO DATALAYER E SISTEMA DE RASTREAMENTO GTM / GOOGLE ADS
  // Garante a marcação precisa de cliques e conversões de tráfego pago
  // ------------------------------------------------------------------------
  window.dataLayer = window.dataLayer || [];

  /**
   * Função para enviar eventos formatados diretamente ao dataLayer do GTM
   * @param {string} eventName - Nome do evento personalizado
   * @param {Object} eventParams - Dados contextuais do clique/conversão
   */
  function trackEvent(eventName, eventParams = {}) {
    try {
      window.dataLayer.push({
        event: eventName,
        timestamp: new Date().toISOString(),
        ...eventParams
      });
      // Log de diagnóstico no console em ambiente de testes
      // console.log('[GTM Traqueamento]', eventName, eventParams);
    } catch (err) {
      console.warn('Erro ao disparar evento no dataLayer:', err);
    }
  }

  /**
   * Event Listener Global para botões e links de conversão com classe .elementor-button e .gtm-trackable
   * Captura dados de clique (WhatsApp, formulários, botões) para o Google Ads e GTM
   * Graças à regra pointer-events: none no CSS, textos e ícones internos nunca interceptam o clique.
   */
  function initGtmTracking() {
    document.addEventListener('click', (event) => {
      // Captura o elemento âncora/botão mesmo em cliques próximos ou internos
      const targetElement = event.target.closest('.elementor-button, .gtm-trackable');
      if (!targetElement) return;

      const eventName = targetElement.getAttribute('data-gtm-event') || 'conversion_click';
      const eventCategory = targetElement.getAttribute('data-gtm-category') || 'general_cta';
      const eventAction = targetElement.getAttribute('data-gtm-action') || 'click';
      const eventLabel = targetElement.getAttribute('data-gtm-label') || targetElement.id || 'btn_cta';
      const destinationUrl = targetElement.getAttribute('href') || '';

      // Dispara o evento genérico e o evento de conversão do Google Ads
      trackEvent(eventName, {
        event_category: eventCategory,
        event_action: eventAction,
        event_label: eventLabel,
        link_url: destinationUrl,
        page_location: window.location.href,
        page_title: document.title
      });

      // Se for um link direto de WhatsApp, dispara evento específico de Lead
      if (destinationUrl.includes('wa.me') || destinationUrl.includes('whatsapp.com')) {
        trackEvent('whatsapp_conversion_lead', {
          lead_type: 'whatsapp_click',
          origin_section: eventLabel
        });
      }
    });
  }

  // ------------------------------------------------------------------------
  // 2. CABEÇALHO FIXO COM TRANSIÇÃO AO ROLAR A PÁGINA (SCROLL HEADER)
  // Adiciona classe .scrolled ao descer a página para efeito de blur e sombra
  // ------------------------------------------------------------------------
  function initHeaderScroll() {
    const siteHeader = document.getElementById('siteHeader');
    if (!siteHeader) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 40) {
            siteHeader.classList.add('scrolled');
          } else {
            siteHeader.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ------------------------------------------------------------------------
  // 3. MENU MOBILE RESPONSIVO (HAMBÚRGUER)
  // Abertura, fechamento e encerramento ao selecionar uma seção
  // ------------------------------------------------------------------------
  function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!mobileToggle || !mainNav) return;

    // Alternar visibilidade do menu
    mobileToggle.addEventListener('click', () => {
      const isOpened = mobileToggle.classList.toggle('active');
      mainNav.classList.toggle('nav-open', isOpened);
      mobileToggle.setAttribute('aria-expanded', isOpened ? 'true' : 'false');
    });

    // Fechar ao clicar em qualquer item da lista de navegação
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('nav-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Fechar ao clicar fora do cabeçalho
    document.addEventListener('click', (e) => {
      if (!mobileToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('nav-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ------------------------------------------------------------------------
  // 4. ACORDEÃO INTERATIVO DE DÚVIDAS FREQUENTES (FAQ)
  // Permite abrir um item e fechar os demais com transição fluida
  // ------------------------------------------------------------------------
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    // Inicializa a altura do primeiro item que já vem ativo por padrão
    faqItems.forEach(item => {
      const content = item.querySelector('.faq-content');
      if (item.classList.contains('active') && content) {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });

    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const content = item.querySelector('.faq-content');

      if (!trigger || !content) return;

      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Fecha todos os outros itens para manter o visual limpo e refinado
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.faq-content');
            const otherTrigger = otherItem.querySelector('.faq-trigger');
            if (otherContent) otherContent.style.maxHeight = null;
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        // Alterna o estado do item clicado
        if (isActive) {
          item.classList.remove('active');
          content.style.maxHeight = null;
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. WIDGET FLUTUANTE DO WHATSAPP E BALÃO DE ATENDIMENTO
  // Apresentação inteligente com delay e fechamento no botão X
  // ------------------------------------------------------------------------
  function initWhatsappFloatingWidget() {
    const whatsappWidget = document.getElementById('whatsappWidget');
    const whatsappBubble = document.getElementById('whatsappBubble');
    const bubbleCloseBtn = document.getElementById('bubbleCloseBtn');
    const chatTime = document.getElementById('chatTime');

    if (!whatsappWidget || !whatsappBubble) return;

    // Atualiza o horário atual da mensagem no balão
    if (chatTime) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      chatTime.textContent = `${hours}:${minutes}`;
    }

    // Abre o balão automaticamente após 4 segundos para engajar o visitante
    let hasAutoOpened = false;
    setTimeout(() => {
      if (!hasAutoOpened && !sessionStorage.getItem('whatsapp_bubble_closed')) {
        whatsappBubble.classList.add('active');
        whatsappBubble.setAttribute('aria-hidden', 'false');
        hasAutoOpened = true;
      }
    }, 4000);

    // Botão de fechar o balão (X)
    if (bubbleCloseBtn) {
      bubbleCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        whatsappBubble.classList.remove('active');
        whatsappBubble.setAttribute('aria-hidden', 'true');
        sessionStorage.setItem('whatsapp_bubble_closed', 'true');
      });
    }

    // Suporte a toque no dispositivo móvel para abrir/fechar balão antes de redirecionar
    const floatingBtn = document.getElementById('floatingWhatsappBtn');
    if (floatingBtn && window.innerWidth <= 768) {
      floatingBtn.addEventListener('click', (e) => {
        // Se o balão estiver fechado no mobile, primeiro toque abre o balão
        if (!whatsappBubble.classList.contains('active')) {
          e.preventDefault();
          whatsappBubble.classList.add('active');
          whatsappBubble.setAttribute('aria-hidden', 'false');
        }
        // Se já estiver aberto, o clique no botão ou no botão interno leva ao WhatsApp normalmente
      });
    }
  }

  // ------------------------------------------------------------------------
  // 6. ANIMAÇÕES DE ENTRADA SUAVE AO ROLAR (INTERSECTION OBSERVER)
  // Animação leve de 60fps ativada apenas quando os elementos entram na tela
  // ------------------------------------------------------------------------
  function initScrollObserver() {
    // Adiciona classe de animação aos cards e seções
    const animatables = document.querySelectorAll('.service-card, .diff-card, .about-frame, .about-content, .location-info-card, .location-map-wrapper');
    
    animatables.forEach(el => {
      el.classList.add('reveal-on-scroll');
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target); // Libera o elemento após animar
          }
        });
      }, {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      animatables.forEach(el => observer.observe(el));
    } else {
      // Fallback para navegadores legados sem suporte a IntersectionObserver
      animatables.forEach(el => el.classList.add('is-visible'));
    }
  }

  // ------------------------------------------------------------------------
  // 7. ATUALIZAÇÃO AUTOMÁTICA DO ANO NO COPYRIGHT
  // Mantém o rodapé sempre atualizado com o ano vigente
  // ------------------------------------------------------------------------
  function initCopyrightYear() {
    const yearElem = document.getElementById('currentYear');
    if (yearElem) {
      yearElem.textContent = new Date().getFullYear();
    }
  }

  // ------------------------------------------------------------------------
  // INICIALIZAÇÃO DE TODOS OS MÓDULOS
  // ------------------------------------------------------------------------
  initGtmTracking();
  initHeaderScroll();
  initMobileMenu();
  initFaqAccordion();
  initWhatsappFloatingWidget();
  initScrollObserver();
  initCopyrightYear();
});
