document.addEventListener("DOMContentLoaded", () => {

    const waLinkEl = document.getElementById("waLink");
    const instaLinkEl = document.getElementById("instaLink");
    const siteLinkEl = document.getElementById("siteLink");
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userMessage");
    const sendBtn = document.getElementById("sendBtn");
    const typingIndicator = document.getElementById("luninha-typing");
    const ping = document.getElementById("pingSound");

    // ===============================
    // PRODUTOS
    // ===============================

    const PRODUCTS = [
        { id: "p001", title: "Pulseiras Personalizadas", desc: "Delicadas e únicas, com nome e acabamento perolado.", img: "imagens/pulseira.png", badge: "Novo", link: "https://thaulunaacessorios.meloja.com.br/produto/pulseiras/2020623", rating: 4, userRatings: JSON.parse(localStorage.getItem("p001_ratings")) || [] },
        { id: "p002", title: "Chaveiros Personalizados", desc: "Perfeitos para presentear com carinho.", img: "imagens/chaveiro.png", badge: "Favorito", link: "https://thaulunaacessorios.meloja.com.br/produto/chaveiros/2020678", rating: 4, userRatings: JSON.parse(localStorage.getItem("p002_ratings")) || [] },
        { id: "p003", title: "Box Encantarte", desc: "Caixa surpresa cheia de magia e acessórios lindos.", img: "imagens/box.png", badge: "Novo", link: "https://thaulunaacessorios.meloja.com.br/produto/box-surprise-encantarte/2020554", rating: 4.5, userRatings: JSON.parse(localStorage.getItem("p003_ratings")) || [] },
        { id: "p004", title: "Phone Strap Personalizado", desc: "Cordão estiloso para celular, seguro e personalizado.", img: "imagens/phone-strap.png", badge: "", link: "https://thaulunaacessorios.meloja.com.br/produto/phone-strap/2020747", rating: 4, userRatings: JSON.parse(localStorage.getItem("p004_ratings")) || [] },
        { id: "p005", title: "Combos Encantados", desc: "Combos especiais com desconto pra você aproveitar!", img: "imagens/combos.png", badge: "Promoção", link: "https://thaulunaacessorios.meloja.com.br/produto/combos/2020975", rating: 5, userRatings: JSON.parse(localStorage.getItem("p005_ratings")) || [] },
        { id: "p006", title: "Kit Digital de Colorir", desc: "PDF para imprimir, colorir e relaxar.", img: "imagens/kit-colorindo.png", badge: "Novo", link: "https://thaulunaacessorios.meloja.com.br/produto/kit-digital-de-colorir/2030654", rating: 4, userRatings: JSON.parse(localStorage.getItem("p006_ratings")) || [] }
    ];

    // ===============================
    // VARIAÇÕES DE TEXTO
    // ===============================

    const VARIATIONS = {
        greet: [
            "Oiii! Que alegria te ver aqui ✨",
            "Oiê! A Luninha chegou pra te ajudar 💖",
            "Oláá! Como posso deixar seu dia mais fofo hoje? 😊"
        ],
        fallback: [
            "Hm… não entendi direito, pode me dizer de outro jeito? 💕",
            "Eu quero entender! Repete só mais uma vez, por favorzinho ✨"
        ]
    };

    // ===============================
    // FUNÇÕES DE UTILIDADE
    // ===============================

    function scrollSmooth() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTyping(duration = 700) {
        typingIndicator.style.display = "block";
        setTimeout(() => { typingIndicator.style.display = "none"; }, duration);
    }

    function playNotification() {
        if (!ping) return;
        ping.currentTime = 0;
        ping.play().catch(() => {});
    }

    function createTextElement(text) {
        const d = document.createElement("div");
        d.textContent = text;
        d.style.marginBottom = "8px";
        return d;
    }

    function createBotMessage(content) {
        const el = document.createElement("div");
        el.classList.add("message", "bot-message");
        if (typeof content === "string") el.textContent = content;
        else el.appendChild(content);
        chatBox.appendChild(el);
        scrollSmooth();
        playNotification();
        return el;
    }

    function createUserMessage(text) {
        const el = document.createElement("div");
        el.classList.add("message", "user-message");
        el.textContent = text;
        chatBox.appendChild(el);
        scrollSmooth();
        return el;
    }

    function createQuickReplies(options = []) {
        const container = document.createElement("div");
        container.classList.add("quick-replies");
        container.style.display = "flex";
        container.style.flexWrap = "wrap";
        container.style.gap = "8px";

        options.forEach(opt => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.classList.add("quick-reply-btn");
            btn.textContent = opt.label;
            btn.addEventListener("click", () => handleUser(opt.value));
            container.appendChild(btn);
        });

        return container;
    }

    // ===============================
    // AVALIAÇÃO DE PRODUTOS
    // ===============================

    function renderStarsInt(rating) {
        const r = Math.max(0, Math.min(5, Math.round(rating)));
        return Array.from({ length: 5 }, (_, i) => i < r ? "⭐" : "☆").join("");
    }

    function getAverageRating(product) {
        const all = [product.rating, ...product.userRatings];
        if (!all.length) return 0;
        const sum = all.reduce((a, b) => a + b, 0);
        return sum / all.length;
    }

    function updateRatingDisplay(product, ratingEl) {
        const avg = getAverageRating(product);
        ratingEl.textContent = renderStarsInt(avg);
        ratingEl.title = `Média: ${avg.toFixed(1)} (${product.userRatings.length} avaliações de usuários)`;
    }

    function saveProductRatings(product) {
        localStorage.setItem(`${product.id}_ratings`, JSON.stringify(product.userRatings));
    }

    // ===============================
    // CARDS DE PRODUTOS
    // ===============================

    function createProductCards(products) {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "12px";

        products.forEach(p => {

            const card = document.createElement("div");
            card.classList.add("product-card");

            if (p.badge) {
                const badge = document.createElement("div");
                badge.classList.add("badge");
                badge.textContent = p.badge;
                card.appendChild(badge);
            }

            const img = document.createElement("img");
            img.src = p.img;
            img.alt = p.title;
            img.onerror = () => { img.src = "imagens/placeholder.png"; };

            const meta = document.createElement("div");
            meta.classList.add("product-meta");

            const title = document.createElement("div");
            title.classList.add("title");
            title.textContent = p.title;

            const desc = document.createElement("div");
            desc.classList.add("desc");
            desc.textContent = p.desc;

            const ratingEl = document.createElement("div");
            ratingEl.classList.add("rating");
            updateRatingDisplay(p, ratingEl);

            const actions = document.createElement("div");
            actions.classList.add("product-actions");

            const btnWhats = document.createElement("button");
            btnWhats.type = "button";
            btnWhats.classList.add("whatsapp");
            btnWhats.textContent = "Comprar (WhatsApp)";
            btnWhats.addEventListener("click", () => openWhatsApp(p.title));

            const btnSite = document.createElement("button");
            btnSite.type = "button";
            btnSite.classList.add("site");
            btnSite.textContent = "Ver no site";
            btnSite.addEventListener("click", () => window.open(p.link, "_blank"));

            actions.append(btnWhats, btnSite);

            const feedback = document.createElement("div");
            feedback.style.marginTop = "6px";
            feedback.textContent = "Avalie este produto: ";

            for (let i = 1; i <= 5; i++) {
                const star = document.createElement("span");
                star.textContent = "☆";
                star.style.cursor = "pointer";
                star.style.fontSize = "18px";
                star.style.marginLeft = "6px";

                star.addEventListener("mouseover", () => star.textContent = "⭐");
                star.addEventListener("mouseout", () => star.textContent = "☆");
                star.addEventListener("click", () => {
                    p.userRatings.push(i);
                    saveProductRatings(p);
                    updateRatingDisplay(p, ratingEl);
                    feedback.textContent = `Você avaliou ${p.title} com ${i}⭐! ✨`;
                    createBotMessage(createTextElement(`Obrigada pela avaliação de ${p.title}! 🌙💖`));
                });

                feedback.appendChild(star);
            }

            meta.append(title, desc, ratingEl, actions, feedback);
            card.append(img, meta);
            container.appendChild(card);
        });

        return container;
    }

    // ===============================
    // AVALIAR LUNINHA
    // ===============================

    function showBotRating() {
        const container = document.createElement("div");
        container.textContent = "Avalie a Luninha: ";

        const localStars = document.createElement("div");
        localStars.style.marginTop = "6px";

        let botRatings = JSON.parse(localStorage.getItem("bot_ratings")) || [];

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement("span");
            star.textContent = "☆";
            star.style.cursor = "pointer";
            star.style.fontSize = "18px";
            star.style.marginLeft = "6px";

            star.addEventListener("mouseover", () => star.textContent = "⭐");
            star.addEventListener("mouseout", () => star.textContent = "☆");
            star.addEventListener("click", () => {
                botRatings.push(i);
                localStorage.setItem("bot_ratings", JSON.stringify(botRatings));
                const avg = botRatings.reduce((a, b) => a + b, 0) / botRatings.length;
                createBotMessage(createTextElement(`Obrigada pela avaliação 🌙! Minha média atual é ${avg.toFixed(1)}⭐ 💖`));
            });

            localStars.appendChild(star);
        }

        const wrapper = document.createElement("div");
        wrapper.appendChild(container);
        wrapper.appendChild(localStars);
        createBotMessage(wrapper);
    }

    // ===============================
    // FUNÇÃO WHATSAPP
    // ===============================

    function openWhatsApp(productTitle = null) {
        if (!waLinkEl) return;
        let msg = "Oi! Gostaria de saber mais sobre os produtos da Thau Luna Acessórios ✨";
        if (productTitle) msg = `Oi! Quero comprar: ${productTitle} 💕`;
        const encoded = encodeURIComponent(msg);
        const url = waLinkEl.href.split("?")[0] + `?text=${encoded}`;
        window.open(url, "_blank");
    }

    // ===============================
    // INTENÇÕES
    // ===============================

    function interpret(text) {
        const t = text.toLowerCase();

        if (["oi","ola","olá","oie","opa","hello","eai","oiii"].some(w => t.includes(w)))
            return { intent: "greet" };

        if (["produto","produtos","pulseira","chaveiro","box","kit","combos","strap","phone"].some(w => t.includes(w)))
            return { intent: "products" };

        if (["whatsapp","zap"].some(w => t.includes(w)))
            return { intent: "contact_whatsapp" };

        if (["instagram","insta"].some(w => t.includes(w)))
            return { intent: "contact_instagram" };

        if (["site","loja","web"].some(w => t.includes(w)))
            return { intent: "contact_site" };

        if (["avaliar luninha","nota luninha","feedback luninha","avaliar"].some(w => t.includes(w)))
            return { intent: "rate_bot" };

        return { intent: "unknown" };
    }

    // ===============================
    // MANIPULAÇÃO DO USUÁRIO
    // ===============================

    function handleUser(text) {
        createUserMessage(text);
        scrollSmooth();

        const typingMessageEl = document.createElement("div");
        typingMessageEl.classList.add("message", "bot-message");
        typingMessageEl.textContent = "digitando...";
        chatBox.appendChild(typingMessageEl);
        scrollSmooth();

        const typingTimeout = 600 + Math.floor(Math.random() * 700);

        setTimeout(() => {

            typingMessageEl.remove();

            const intent = interpret(text);
            const container = document.createElement("div");

            switch (intent.intent) {

                case "greet":
                    container.appendChild(createTextElement(VARIATIONS.greet[Math.floor(Math.random() * VARIATIONS.greet.length)]));
                    container.appendChild(createQuickReplies([
                        { label: "Ver produtos", value: "produtos" },
                        { label: "Avaliar Luninha", value: "avaliar luninha" }
                    ]));
                    createBotMessage(container);
                    break;

                case "products":
                    createBotMessage(createTextElement("Aqui estão nossos produtos mais fofos 💖"));
                    createBotMessage(createProductCards(PRODUCTS));
                    break;

                case "contact_whatsapp":
                    openWhatsApp();
                    break;

                case "contact_instagram":
                    if (instaLinkEl) window.open(instaLinkEl.href, "_blank");
                    break;

                case "contact_site":
                    if (siteLinkEl) window.open(siteLinkEl.href, "_blank");
                    break;

                case "rate_bot":
                    showBotRating();
                    break;

                default:
                    container.appendChild(createTextElement(VARIATIONS.fallback[Math.floor(Math.random() * VARIATIONS.fallback.length)]));
                    createBotMessage(container);
                    break;
            }

        }, typingTimeout);
    }

    // ===============================
    // EVENTOS
    // ===============================

    sendBtn.addEventListener("click", () => {
        const txt = userInput.value.trim();
        if (!txt) return;
        userInput.value = "";
        handleUser(txt);
    });

    userInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendBtn.click();
        }
    });

    // MENSAGEM INICIAL
    setTimeout(() => {
        createBotMessage(createTextElement("Oi! Eu sou a Luninha 🌙, assistente da Thau Luna Acessórios. Posso te mostrar nossos produtos, responder dúvidas ou receber seu feedback ✨"));
    }, 300);

});