(function() {
    function initNebula() {
        const canvas = document.getElementById('starfield');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (isMobile) {
            canvas.style.display = 'none';
            document.body.style.background = '#0a0a0a';
            return;
        }

        let width, height;
        let particles = [];
        let backgroundStars = [];
        const PARTICLE_COUNT = 1200;
        const STAR_COUNT = 4000;
        let time = 0;
        let mouseX = null, mouseY = null;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            generateStars();
            generateParticles();
        }

        function generateStars() {
            backgroundStars = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                backgroundStars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: 0.3 + Math.random() * 1.2,
                    alpha: 0.3 + Math.random() * 0.6,
                    twinkleSpeed: 0.001 + Math.random() * 0.004,
                    twinkleOffset: Math.random() * Math.PI * 2
                });
            }
        }

        function generateParticles() {
            particles = [];
            const cx = width / 2;
            const cy = height / 2;
            const maxR = Math.max(width, height) * 0.6;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const r = Math.pow(Math.random(), 0.8) * maxR;
                const angle = Math.random() * Math.PI * 2;
                const spread = 20 + Math.random() * 50;
                const x = cx + Math.cos(angle) * r + (Math.random() - 0.5) * spread;
                const y = cy + Math.sin(angle) * r + (Math.random() - 0.5) * spread;
                particles.push({
                    x, y,
                    radius: r,
                    angle: Math.atan2(y - cy, x - cx),
                    size: 0.8 + Math.random() * 2.5,
                    brightness: 0.3 + Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.0002 + Math.random() * 0.0008,
                    driftX: (Math.random() - 0.5) * 0.4,
                    driftY: (Math.random() - 0.5) * 0.4,
                    twinkleSpeed: 0.002 + Math.random() * 0.006,
                    twinkleOffset: Math.random() * Math.PI * 2
                });
            }
        }

        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        document.addEventListener('mouseleave', () => {
            mouseX = null;
            mouseY = null;
        });

        function draw() {
            ctx.clearRect(0, 0, width, height);
            let offsetX = 0, offsetY = 0;
            if (mouseX !== null && mouseY !== null) {
                offsetX = (mouseX - width / 2) * 0.008;
                offsetY = (mouseY - height / 2) * 0.008;
            }
            time += 0.002;

            for (let star of backgroundStars) {
                const twinkle = 0.6 + 0.4 * Math.sin(star.twinkleOffset + performance.now() * star.twinkleSpeed);
                const alpha = star.alpha * twinkle;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220, 225, 255, ${alpha * 0.7})`;
                ctx.fill();
            }

            const cx = width / 2 + offsetX;
            const cy = height / 2 + offsetY;
            for (let p of particles) {
                const angle = p.angle + time * p.speed * 18;
                const r = p.radius + Math.sin(p.phase + time * 0.1) * 8;
                const x = cx + Math.cos(angle) * r + Math.sin(p.phase + time * 0.05) * p.driftX * 20;
                const y = cy + Math.sin(angle) * r + Math.cos(p.phase + time * 0.07) * p.driftY * 20;
                const distFactor = 1 - Math.min(r / (Math.max(width, height) * 0.6), 1);
                const size = p.size * (0.6 + 0.4 * distFactor);
                const alpha = p.brightness * (0.5 + 0.5 * distFactor) * 0.7;
                const mix = (x / width + y / height) * 0.5;
                const rCol = 180 + 70 * mix;
                const gCol = 180 + 70 * (1 - mix);
                const bCol = 255 - 20 * mix;

                ctx.beginPath();
                ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha * 0.85})`;
                ctx.fill();
                if (size > 1.5) {
                    ctx.beginPath();
                    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha * 0.06})`;
                    ctx.fill();
                }
            }

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.4);
            grad.addColorStop(0, 'rgba(220, 230, 255, 0.05)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            requestAnimationFrame(draw);
        }

        resize();
        draw();
    }

    const links = document.querySelectorAll('.nav-link');
    const pages = {
        main: document.getElementById('page-main'),
        constitution: document.getElementById('page-constitution'),
        criminal: document.getElementById('page-criminal'),
        coap: document.getElementById('page-coap'),
        upk: document.getElementById('page-upk'),
        party: document.getElementById('page-party'),
        services: document.getElementById('page-services')
    };
    const indicator = document.querySelector('.nav-indicator');
    const terminalCommand = document.getElementById('terminalCommand');

    const terminalMessages = window.MALDENIA_DATA.terminalMessages;

    let typeInterval = null;

    function typeText(text) {
        if (typeInterval) {
            clearInterval(typeInterval);
            typeInterval = null;
        }
        terminalCommand.textContent = '';
        let index = 0;
        typeInterval = setInterval(() => {
            if (index < text.length) {
                terminalCommand.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(typeInterval);
                typeInterval = null;
                updateIndicator();
            }
        }, 30 + Math.random() * 20);
    }

    function moveIndicator(link) {
        const rect = link.getBoundingClientRect();
        const containerRect = link.parentElement.getBoundingClientRect();
        const left = rect.left - containerRect.left;
        const width = rect.width;
        indicator.style.left = left + 'px';
        indicator.style.width = width + 'px';
    }

    function updateIndicator() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            requestAnimationFrame(() => {
                moveIndicator(activeLink);
            });
        }
    }

    const pagesWithTabs = ['constitution', 'criminal', 'coap', 'upk'];

    const sections = [
        {
            id: 'constitution',
            data: window.MALDENIA_DATA.chapterData,
            tabs: document.querySelectorAll('.constitution-tab'),
            container: document.getElementById('chapterContent'),
            color: '#5a9c6a',
            pageId: 'constitution'
        },
        {
            id: 'criminal',
            data: window.MALDENIA_DATA.criminalData,
            tabs: document.querySelectorAll('.criminal-tab'),
            container: document.getElementById('criminalContent'),
            color: '#d45a5a',
            pageId: 'criminal'
        },
        {
            id: 'coap',
            data: window.MALDENIA_DATA.coapData,
            tabs: document.querySelectorAll('.coap-tab'),
            container: document.getElementById('coapContent'),
            color: '#d4b48c',
            pageId: 'coap'
        },
        {
            id: 'upk',
            data: window.MALDENIA_DATA.upkData,
            tabs: document.querySelectorAll('.upk-tab'),
            container: document.getElementById('upkContent'),
            color: '#5a7a9c',
            pageId: 'upk'
        }
    ];

    function renderSection(sectionId, index) {
        const section = sections.find(s => s.id === sectionId);
        if (!section) return;
        const { data, tabs, container, color, pageId } = section;
        if (!container || index < 0 || index >= data.length) return;
        const item = data[index];
        container.classList.add('fade-out');
        setTimeout(() => {
            container.innerHTML = `<h3 style="color:${color}; margin-bottom:16px; font-weight:600;">${item.title}</h3>` + item.content;
            container.classList.remove('fade-out');
        }, 100);
        tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
        let hash = pageId;
        if (index !== 0) hash += '-' + index;
        if (window.location.hash !== '#' + hash) {
            history.pushState(null, '', '#' + hash);
        }
    }

    document.querySelectorAll('.chapter-tabs').forEach(tabsContainer => {
        tabsContainer.addEventListener('click', function(e) {
            const tab = e.target.closest('.chapter-tab');
            if (!tab) return;
            const parentBlock = tab.closest('.section-block');
            if (!parentBlock) return;
            let sectionId = null;
            if (parentBlock.classList.contains('constitution-block')) sectionId = 'constitution';
            else if (parentBlock.classList.contains('criminal-block')) sectionId = 'criminal';
            else if (parentBlock.classList.contains('coap-block')) sectionId = 'coap';
            else if (parentBlock.classList.contains('upk-block')) sectionId = 'upk';
            if (!sectionId) return;
            const index = parseInt(tab.dataset.chapter || tab.dataset.criminal || tab.dataset.coap || tab.dataset.upk);
            if (isNaN(index)) return;
            const page = document.getElementById('page-' + sectionId);
            if (!page.classList.contains('active')) {
                switchPage(sectionId, index);
            } else {
                renderSection(sectionId, index);
                let hash = sectionId;
                if (index !== 0) hash += '-' + index;
                if (window.location.hash !== '#' + hash) {
                    history.pushState(null, '', '#' + hash);
                }
            }
        });
    });

    function switchPage(pageId, tabIndex) {
        if (typeInterval) {
            clearInterval(typeInterval);
            typeInterval = null;
        }
        if (pagesWithTabs.includes(pageId) && (tabIndex === undefined || tabIndex === null)) {
            tabIndex = 0;
        }
        Object.values(pages).forEach(p => p.classList.remove('active'));
        if (pages[pageId]) {
            pages[pageId].classList.add('active');
        }
        links.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });
        const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (activeLink) {
            requestAnimationFrame(() => {
                moveIndicator(activeLink);
            });
        }
        const text = terminalMessages[pageId] || "─ waiting for input";
        typeText(text);
        if (window.scrollY > 100) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (tabIndex !== undefined && tabIndex !== null && pagesWithTabs.includes(pageId)) {
            renderSection(pageId, tabIndex);
        }

        let hash = pageId;
        if (tabIndex !== undefined && tabIndex !== null && tabIndex !== 0) {
            hash += '-' + tabIndex;
        }
        if (window.location.hash !== '#' + hash) {
            history.pushState(null, '', '#' + hash);
        }
    }

    function parseHash() {
        const hash = window.location.hash.slice(1);
        if (!hash) {
            switchPage('main');
            return;
        }
        let parts = hash.split('-');
        let page = parts[0];
        let tab = parts.length > 1 ? parseInt(parts[1]) : undefined;
        if (pages[page]) {
            switchPage(page, tab);
        } else {
            switchPage('main');
        }
    }

    window.addEventListener('hashchange', parseHash);

    function init() {
        const active = document.querySelector('.nav-link.active');
        if (active) {
            requestAnimationFrame(() => {
                moveIndicator(active);
            });
        }
        setTimeout(() => {
            typeText(terminalMessages['main']);
        }, 600);
        parseHash();
    }

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            switchPage(page, 0);
        });
    });

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    window.switchPage = switchPage;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNebula);
    } else {
        initNebula();
    }

    (function() {
        const bootScreen = document.getElementById('boot-screen');
        const bootContent = document.getElementById('boot-content');
        const progressFill = document.getElementById('boot-progress-fill');
        if (!bootScreen || !bootContent || !progressFill) return;

        const bootMessages = window.MALDENIA_DATA.bootMessages;
        const fastfetchData = window.MALDENIA_DATA.fastfetchData;
        const loginLines = window.MALDENIA_DATA.loginLines;

        let currentIndex = 0;
        let typeTimer = null;
        let isSkipped = false;
        let progressWidth = 0;

        const hasVisited = localStorage.getItem('maldenia_visited');
        const speedMultiplier = hasVisited ? 0.4 : 1.0;

        function addBootLine(text, type) {
            const lineEl = document.createElement('div');
            lineEl.className = 'boot-line';
            if (type) {
                lineEl.classList.add(type);
            }
            lineEl.textContent = text;
            bootContent.appendChild(lineEl);
            bootScreen.scrollTop = bootScreen.scrollHeight;
            progressWidth += 0.8;
            progressFill.style.width = Math.min(progressWidth, 98) + '%';
        }

        function typeCommandInline(promptText, command, callback) {
            const lineEl = document.createElement('div');
            lineEl.className = 'boot-line prompt';
            lineEl.textContent = promptText;
            bootContent.appendChild(lineEl);
            bootScreen.scrollTop = bootScreen.scrollHeight;
            const cursorSpan = document.createElement('span');
            cursorSpan.style.cssText = 'display:inline-block; width:10px; height:1.2em; background:#c4b5d4; animation:blink 0.8s step-end infinite; margin-left:2px;';
            lineEl.appendChild(cursorSpan);
            setTimeout(() => {
                let index = 0;
                const intervalTime = (12 + Math.random() * 8) * speedMultiplier;
                typeTimer = setInterval(() => {
                    if (isSkipped) {
                        lineEl.textContent = promptText + command;
                        lineEl.appendChild(cursorSpan);
                        clearInterval(typeTimer);
                        typeTimer = null;
                        if (callback) callback();
                        return;
                    }
                    if (index < command.length) {
                        const currentText = lineEl.textContent;
                        lineEl.textContent = currentText + command.charAt(index);
                        lineEl.appendChild(cursorSpan);
                        index++;
                        bootScreen.scrollTop = bootScreen.scrollHeight;
                    } else {
                        clearInterval(typeTimer);
                        typeTimer = null;
                        cursorSpan.remove();
                        if (callback) callback();
                    }
                }, intervalTime);
            }, 400);
        }

        function runBootSequence() {
            let msgInterval = (1.5 + Math.random() * 1.5) * speedMultiplier;

            function showSystemMessages() {
                if (isSkipped) {
                    while (currentIndex < bootMessages.length) {
                        const msg = bootMessages[currentIndex];
                        addBootLine(msg.text, msg.type || '');
                        currentIndex++;
                    }
                    setTimeout(() => {
                        addBootLine('', '');
                        addBootLine('Welcome to Gentoo Linux!', 'welcome');
                        setTimeout(() => {
                            typeFastfetchCommand();
                        }, 50);
                    }, 50);
                    return;
                }
                if (currentIndex < bootMessages.length) {
                    const msg = bootMessages[currentIndex];
                    addBootLine(msg.text, msg.type || '');
                    currentIndex++;
                    const delay = msgInterval + (Math.random() > 0.7 ? 30 : 0);
                    setTimeout(showSystemMessages, delay);
                } else {
                    setTimeout(showWelcome, 100 * speedMultiplier);
                }
            }

            function showWelcome() {
                addBootLine('', '');
                addBootLine('Welcome to Gentoo Linux!', 'welcome');
                setTimeout(() => {
                    addBootLine('', '');
                    addBootLine('', '');
                    typeFastfetchCommand();
                }, 120 * speedMultiplier);
            }

            function typeFastfetchCommand() {
                typeCommandInline('root@maldenia ~ # ', 'fastfetch', function() {
                    addBootLine('', '');
                    setTimeout(showFastfetch, 80 * speedMultiplier);
                });
            }

            function showFastfetch() {
                let ffIndex = 0;
                function addFastfetchLine() {
                    if (isSkipped) {
                        while (ffIndex < fastfetchData.length) {
                            const line = fastfetchData[ffIndex];
                            addBootLine(line.text, line.type || '');
                            ffIndex++;
                        }
                        setTimeout(() => {
                            addBootLine('', '');
                            typeLoginCommand();
                        }, 50);
                        return;
                    }
                    if (ffIndex < fastfetchData.length) {
                        const line = fastfetchData[ffIndex];
                        addBootLine(line.text, line.type || '');
                        ffIndex++;
                        const delay = (1.5 + Math.random() * 1.5) * speedMultiplier;
                        setTimeout(addFastfetchLine, delay);
                    } else {
                        setTimeout(() => {
                            addBootLine('', '');
                            typeLoginCommand();
                        }, 150 * speedMultiplier);
                    }
                }
                addFastfetchLine();
            }

            function typeLoginCommand() {
                typeCommandInline('root@maldenia ~ # ', './maldenia-login --start', function() {
                    addBootLine('', '');
                    setTimeout(showLoginMessages, 80 * speedMultiplier);
                });
            }

            function showLoginMessages() {
                let liIndex = 0;
                function addLoginLine() {
                    if (isSkipped) {
                        while (liIndex < loginLines.length) {
                            const line = loginLines[liIndex];
                            addBootLine(line.text, line.type || '');
                            liIndex++;
                        }
                        setTimeout(finishBoot, 400 * speedMultiplier);
                        return;
                    }
                    if (liIndex < loginLines.length) {
                        const line = loginLines[liIndex];
                        addBootLine(line.text, line.type || '');
                        liIndex++;
                        const delay = (60 + Math.random() * 40) * speedMultiplier;
                        setTimeout(addLoginLine, delay);
                    } else {
                        setTimeout(() => {
                            finishBoot();
                        }, 700 * speedMultiplier);
                    }
                }
                addLoginLine();
            }

            function finishBoot() {
                progressFill.style.width = '100%';
                setTimeout(() => {
                    bootScreen.classList.add('hidden');
                    document.body.classList.add('loaded');
                    localStorage.setItem('maldenia_visited', 'true');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    setTimeout(() => {
                        if (bootScreen.parentNode) {
                            bootScreen.remove();
                        }
                    }, 1000);
                }, 300);
            }

            showSystemMessages();

            const skipHandler = function(e) {
                if (e.type === 'keydown' && e.key !== 'Escape' && e.key !== 'Esc') return;
                if (isSkipped) return;
                isSkipped = true;
                if (typeTimer) {
                    clearInterval(typeTimer);
                    typeTimer = null;
                }
            };
            document.addEventListener('click', skipHandler);
            document.addEventListener('keydown', skipHandler);
        }

        setTimeout(runBootSequence, 300);
    })();
})();