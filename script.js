(function() {
    function initNebula() {
        const canvas = document.getElementById('starfield');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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
        party: document.getElementById('page-party'),
        services: document.getElementById('page-services')
    };
    const indicator = document.querySelector('.nav-indicator');
    const terminalCommand = document.getElementById('terminalCommand');

    const terminalMessages = {
        main: "cat /home/maldenia/README.md && echo 'Main page loaded'",
        constitution: "grep -r 'article' /usr/share/maldenia/laws/* | less && echo 'Constitution loaded'",
        party: "rc-service pnem status && cat /etc/maldenia/party/pnem.cfg",
        services: "ls -la /etc/maldenia/services/ && rc-service army status && rc-service police status"
    };

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

    function switchPage(pageId) {
        if (typeInterval) {
            clearInterval(typeInterval);
            typeInterval = null;
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
    }

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
    }

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            switchPage(page);
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

    const chapterData = [
        {
            title: "Глава I. Общие положения",
            content: `
                <p><strong>Статья 1.</strong> Республика Мальдения является суверенным, единым и неделимым государством, построенным на принципах национального единства, порядка и дисциплины.</p>
                <p><strong>Статья 2.</strong> Столицей Республики Мальдения является город Нордхейм.</p>
                <p><strong>Статья 3.</strong> Государственным языком Республики Мальдения является мальденский язык.</p>
                <p><strong>Статья 4.</strong> Единственной законной правящей партией Республики Мальдения является Партия национального единства Мальдении (ПНЕМ). Деятельность иных политических партий, движений и объединений на территории Республики запрещена.</p>
                <p><strong>Статья 5.</strong> Идеология национального единства, воплощённая в программе ПНЕМ, признаётся государственной идеологией и обязательна для изучения во всех учебных заведениях.</p>
                <p><strong>Статья 6.</strong> Государственная власть в Республике Мальдения осуществляется Президентом, Верховным канцлером, Правительством, Национальным собранием и судами в соответствии с настоящей Конституцией.</p>
                <p><strong>Статья 7.</strong> Носителем суверенитета в Республике Мальдения признаётся мальденский народ, объединённый под руководством ПНЕМ.</p>
                <p><strong>Статья 8.</strong> Государственными символами Республики Мальдения являются флаг, герб и гимн, утверждаемые Съездом партии.</p>
                <p><strong>Статья 9.</strong> Государственной религией Мальдения не устанавливает. Вместе с тем всякая религиозная деятельность подлежит регистрации и контролю со стороны государственных органов.</p>
                <p><strong>Статья 10.</strong> Любые действия, направленные на подрыв единства партии и государства, признаются государственной изменой и преследуются по закону.</p>
            `
        },
        {
            title: "Глава II. Партия национального единства Мальдении",
            content: `
                <p><strong>Статья 11.</strong> ПНЕМ является руководящей и направляющей силой мальденского общества и государства.</p>
                <p><strong>Статья 12.</strong> Высшим органом ПНЕМ является Съезд партии, созываемый не реже одного раза в пять лет, а также внеочередным порядком в случаях, предусмотренных настоящей Конституцией.</p>
                <p><strong>Статья 13.</strong> Главой партии является Председатель партии, избираемый Съездом на неограниченный срок полномочий.</p>
                <p><strong>Статья 14.</strong> Председатель партии определяет идеологический курс государства и утверждает состав руководящих органов партии.</p>
                <p><strong>Статья 15.</strong> Съезд партии избирает нового Президента Республики в случае смерти действующего Президента.</p>
                <p><strong>Статья 16.</strong> Кандидатуры на пост Президента предварительно рассматриваются Центральным комитетом ПНЕМ и выносятся на утверждение Съезда.</p>
                <p><strong>Статья 17.</strong> Каждый член Правительства, руководитель министерства, ведомства и иного государственного органа обязан состоять в ПНЕМ и лично участвовать в работе Съездов партии.</p>
                <p><strong>Статья 18.</strong> Членство в ПНЕМ является обязательным условием для занятия любой руководящей должности в государственном аппарате, армии и системе образования.</p>
                <p><strong>Статья 19.</strong> Отказ от членства в партии или исключение из неё влечёт немедленное отстранение от занимаемой государственной должности.</p>
                <p><strong>Статья 20.</strong> Центральный комитет ПНЕМ осуществляет постоянный контроль за деятельностью Правительства, министерств и местных органов власти в период между Съездами.</p>
                <p><strong>Статья 21.</strong> Первичные партийные организации создаются на каждом предприятии, в каждом учебном заведении и в каждой воинской части.</p>
                <p><strong>Статья 22.</strong> Партия осуществляет воспитание граждан в духе преданности государству, дисциплины и готовности к защите Родины.</p>
                <p><strong>Статья 23.</strong> Символика, атрибутика и печатные издания ПНЕМ находятся под защитой государства. Их использование иными организациями запрещено.</p>
                <p><strong>Статья 24.</strong> Финансирование деятельности ПНЕМ осуществляется за счёт государственного бюджета в порядке, определяемом Съездом.</p>
                <p><strong>Статья 25.</strong> Решения Съезда партии обязательны для исполнения всеми государственными органами и должностными лицами Республики Мальдения.</p>
            `
        },
        {
            title: "Глава III. Президент Республики",
            content: `
                <p><strong>Статья 26.</strong> Президент Республики Мальдения является главой государства, верховным главнокомандующим вооружёнными силами и высшим представителем ПНЕМ в системе государственной власти.</p>
                <p><strong>Статья 27.</strong> Президент избирается Съездом партии пожизненно. Полномочия Президента прекращаются исключительно вследствие его смерти.</p>
                <p><strong>Статья 28.</strong> Факт смерти Президента подлежит обязательному подтверждению Верховным канцлером до объявления о начале процедуры избрания нового Президента.</p>
                <p><strong>Статья 29.</strong> До подтверждения Верховным канцлером факта смерти Президента любые сведения об этом событии считаются государственной тайной.</p>
                <p><strong>Статья 30.</strong> После подтверждения Верховным канцлером факта смерти Президента созывается внеочередной Съезд партии для избрания нового Президента в срок не более тридцати дней.</p>
                <p><strong>Статья 31.</strong> Президентом Республики может быть избран член ПНЕМ, достигший тридцати пяти лет, прошедший полный срок воинской службы в составе общевойсковых частей.</p>
                <p><strong>Статья 32.</strong> Президент подписывает законы, издаёт указы и распоряжения, обязательные к исполнению на всей территории Республики.</p>
                <p><strong>Статья 33.</strong> Президент назначает и освобождает от должности членов Правительства по представлению Верховного канцлера.</p>
                <p><strong>Статья 34.</strong> Президент утверждает военную доктрину государства и объявляет военное и чрезвычайное положение.</p>
                <p><strong>Статья 35.</strong> Президент представляет Республику Мальдения в международных отношениях.</p>
                <p><strong>Статья 36.</strong> Президент вправе помиловать осуждённых граждан, за исключением лиц, осуждённых за государственную измену.</p>
                <p><strong>Статья 37.</strong> Указы Президента приобретают юридическую силу после скрепления подписью и печатью Верховного канцлера.</p>
                <p><strong>Статья 38.</strong> Резиденция Президента находится в городе Нордхейме.</p>
                <p><strong>Статья 39.</strong> Личность Президента объявляется неприкосновенной. Посягательство на жизнь и достоинство Президента признаётся тягчайшим государственным преступлением.</p>
                <p><strong>Статья 40.</strong> Президент ежегодно обращается к Съезду партии с докладом о положении дел в государстве.</p>
            `
        },
        {
            title: "Глава IV. Верховный канцлер",
            content: `
                <p><strong>Статья 41.</strong> Верховный канцлер является важнейшим должностным лицом государства после Президента, обеспечивающим непрерывность и законность государственного управления.</p>
                <p><strong>Статья 42.</strong> Верховный канцлер назначается Президентом пожизненно. Смещение Верховного канцлера при жизни Президента не допускается.</p>
                <p><strong>Статья 43.</strong> Все документы, направляемые Правительством, министерствами, ведомствами и местными органами власти на имя Президента, проходят обязательное рассмотрение и утверждение Верховным канцлером.</p>
                <p><strong>Статья 44.</strong> Ни один документ, указ либо постановление не приобретает законной силы без печати и подписи Верховного канцлера, за исключением случаев, прямо предусмотренных настоящей Конституцией.</p>
                <p><strong>Статья 45.</strong> Верховный канцлер ведёт обязательный учёт и фиксацию всех событий государственной важности, включая факты смерти, болезни либо недееспособности высших должностных лиц.</p>
                <p><strong>Статья 46.</strong> Верховный канцлер обязан подтвердить факт смерти Президента и незамедлительно уведомить об этом Центральный комитет ПНЕМ для созыва Съезда.</p>
                <p><strong>Статья 47.</strong> Верховный канцлер осуществляет надзор за деятельностью Правительства и вправе приостанавливать исполнение решений, противоречащих настоящей Конституции.</p>
                <p><strong>Статья 48.</strong> Верховный канцлер хранит государственную печать Республики Мальдения.</p>
                <p><strong>Статья 49.</strong> Верховный канцлер представляет вновь избранного Президента Съезду партии для принесения присяги.</p>
                <p><strong>Статья 50.</strong> В случае временной недееспособности Президента Верховный канцлер исполняет его обязанности вплоть до восстановления дееспособности либо до подтверждения смерти Президента.</p>
                <p><strong>Статья 51.</strong> Архив Верховного канцлера, содержащий фиксацию всех государственных актов, признаётся государственной тайной высшей категории.</p>
                <p><strong>Статья 52.</strong> Верховный канцлер несёт личную ответственность перед Президентом за достоверность и полноту фиксации государственных событий.</p>
            `
        },
        {
            title: "Глава V. Правительство и государственный аппарат",
            content: `
                <p><strong>Статья 53.</strong> Правительство Республики Мальдения осуществляет исполнительную власть под руководством Президента и контролем Верховного канцлера.</p>
                <p><strong>Статья 54.</strong> Правительство возглавляет Премьер министр, назначаемый Президентом из числа членов ПНЕМ.</p>
                <p><strong>Статья 55.</strong> Члены Правительства приносят присягу на верность Президенту и Партии.</p>
                <p><strong>Статья 56.</strong> Каждое министерство обязано ежемесячно направлять отчёт о своей деятельности Верховному канцлеру.</p>
                <p><strong>Статья 57.</strong> Государственная служба в Республике Мальдения строится на принципах преданности, дисциплины и подотчётности.</p>
                <p><strong>Статья 58.</strong> Назначение на руководящие должности государственной службы производится по представлению соответствующих партийных органов.</p>
                <p><strong>Статья 59.</strong> Местные органы власти формируются из членов ПНЕМ и подотчётны как Правительству, так и региональным партийным комитетам.</p>
                <p><strong>Статья 60.</strong> Государственный бюджет утверждается Президентом по представлению Правительства и с согласия Верховного канцлера.</p>
                <p><strong>Статья 61.</strong> Государственная безопасность обеспечивается специальными органами, подчинёнными непосредственно Президенту.</p>
                <p><strong>Статья 62.</strong> Служащие государственного аппарата обязаны сохранять в тайне сведения, отнесённые к государственной тайне, в том числе на протяжении всей жизни после увольнения со службы.</p>
            `
        },
        {
            title: "Глава VI. Национальное собрание",
            content: `
                <p><strong>Статья 63.</strong> Национальное собрание является совещательным законодательным органом Республики Мальдения.</p>
                <p><strong>Статья 64.</strong> Депутаты Национального собрания избираются из числа членов ПНЕМ сроком на пять лет.</p>
                <p><strong>Статья 65.</strong> Национальное собрание рассматривает и одобряет законопроекты, представленные Правительством и утверждённые Президентом.</p>
                <p><strong>Статья 66.</strong> Законопроекты, не получившие одобрения Президента и Верховного канцлера, не подлежат рассмотрению Национальным собранием.</p>
                <p><strong>Статья 67.</strong> Национальное собрание не вправе выступать с инициативами, противоречащими программе ПНЕМ.</p>
                <p><strong>Статья 68.</strong> Заседания Национального собрания проводятся в городе Нордхейме не реже двух раз в год.</p>
                <p><strong>Статья 69.</strong> Депутат Национального собрания может быть отозван Съездом партии в любое время без объяснения причин.</p>
                <p><strong>Статья 70.</strong> Решения Национального собрания приобретают силу закона после подписания Президентом и скрепления печатью Верховного канцлера.</p>
            `
        },
        {
            title: "Глава VII. Судебная система",
            content: `
                <p><strong>Статья 71.</strong> Правосудие в Республике Мальдения осуществляется судами именем Партии и Государства.</p>
                <p><strong>Статья 72.</strong> Судьи назначаются Президентом по представлению Верховного канцлера из числа членов ПНЕМ, имеющих безупречную репутацию.</p>
                <p><strong>Статья 73.</strong> Высшим судебным органом является Верховный суд Республики Мальдения, действующий под надзором Верховного канцлера.</p>
                <p><strong>Статья 74.</strong> Дела о государственной измене, шпионаже и посягательстве на основы государственного строя рассматриваются Особым трибуналом.</p>
                <p><strong>Статья 75.</strong> Заседания Особого трибунала проводятся в закрытом режиме, решения обжалованию не подлежат.</p>
                <p><strong>Статья 76.</strong> Судьи несут ответственность перед Партией за соответствие выносимых решений государственной идеологии.</p>
                <p><strong>Статья 77.</strong> Адвокатская деятельность по делам о государственной измене осуществляется исключительно защитниками, аккредитованными Верховным канцлером.</p>
            `
        },
        {
            title: "Глава VIII. Воинская обязанность",
            content: `
                <p><strong>Статья 78.</strong> Защита Республики Мальдения является священным долгом и абсолютной обязанностью каждого гражданина.</p>
                <p><strong>Статья 79.</strong> Воинская обязанность распространяется на всех граждан Республики Мальдения без исключения, независимо от состояния здоровья, социального положения либо иных обстоятельств.</p>
                <p><strong>Статья 80.</strong> Граждане, достигшие пятнадцатилетнего возраста, подлежат зачислению в юношеские отряды ПНЕМ для прохождения начальной военной и идеологической подготовки.</p>
                <p><strong>Статья 81.</strong> Пребывание в юношеских отрядах предусматривает физическую, строевую и политическую подготовку под руководством партийных наставников.</p>
                <p><strong>Статья 82.</strong> По достижении восемнадцатилетнего возраста граждане подлежат переводу из юношеских отрядов в общевойсковые части действительной военной службы.</p>
                <p><strong>Статья 83.</strong> Началом срока воинской службы считается исключительно день перевода гражданина в общевойсковые части. Период пребывания в юношеских отрядах в срок службы не засчитывается.</p>
                <p><strong>Статья 84.</strong> Срок действительной воинской службы в общевойсковых частях составляет десять лет.</p>
                <p><strong>Статья 85.</strong> Досрочное освобождение от воинской службы не допускается ни при каких обстоятельствах, кроме случаев, прямо установленных военным законодательством.</p>
                <p><strong>Статья 86.</strong> Уклонение от зачисления в юношеские отряды либо от перевода в общевойсковые части признаётся государственным преступлением.</p>
                <p><strong>Статья 87.</strong> Женщины подлежат воинской обязанности наравне с мужчинами в порядке, установленном военным законодательством.</p>
                <p><strong>Статья 88.</strong> По окончании десятилетнего срока службы гражданин переводится в резерв и обязан проходить периодические военные сборы.</p>
                <p><strong>Статья 89.</strong> Военная подготовка и патриотическое воспитание являются обязательной частью учебной программы во всех образовательных учреждениях начиная с семилетнего возраста.</p>
                <p><strong>Статья 90.</strong> Отказ от несения воинской службы по идеологическим, религиозным либо иным мотивам не допускается и не освобождает гражданина от исполнения воинского долга.</p>
            `
        },
        {
            title: "Глава IX. Средства массовой информации",
            content: `
                <p><strong>Статья 91.</strong> Средства массовой информации в Республике Мальдения служат делу воспитания граждан в духе преданности Партии и Государству.</p>
                <p><strong>Статья 92.</strong> Все средства массовой информации подлежат обязательной государственной регистрации и предварительной цензуре со стороны уполномоченного органа.</p>
                <p><strong>Статья 93.</strong> Распространение сведений, порочащих Партию, Президента, Верховного канцлера либо основы государственного строя, запрещается.</p>
                <p><strong>Статья 94.</strong> Государство осуществляет систематическую военно патриотическую пропаганду через печать, радио, телевидение и иные средства массовой информации.</p>
                <p><strong>Статья 95.</strong> Деятельность иностранных средств массовой информации на территории Республики допускается только с разрешения и под контролем уполномоченного органа.</p>
                <p><strong>Статья 96.</strong> Ввоз, хранение и распространение материалов, не прошедших цензуру, признаётся правонарушением против государственной безопасности.</p>
            `
        },
        {
            title: "Глава X. Права и обязанности граждан",
            content: `
                <p><strong>Статья 97.</strong> Гражданином Республики Мальдения признаётся лицо, преданное делу Партии и готовое к защите Отечества.</p>
                <p><strong>Статья 98.</strong> Граждане обязаны беспрекословно исполнять законы, указы Президента и распоряжения Верховного канцлера.</p>
                <p><strong>Статья 99.</strong> Граждане обязаны хранить верность Партии и разоблачать деяния, направленные против единства государства.</p>
                <p><strong>Статья 100.</strong> Гражданам гарантируется право на труд, отдых и социальное обеспечение в порядке, установленном государством, с учётом интересов обороны и безопасности Республики.</p>
                <p><strong>Статья 101.</strong> Свобода слова и печати осуществляется гражданами в рамках, не противоречащих государственной идеологии и интересам безопасности.</p>
                <p><strong>Статья 102.</strong> Право на объединение в общественные организации допускается исключительно под руководством и контролем ПНЕМ.</p>
                <p><strong>Статья 103.</strong> Выезд граждан за пределы Республики Мальдения осуществляется с разрешения уполномоченных органов.</p>
                <p><strong>Статья 104.</strong> Воспитание детей осуществляется родителями совместно с государством в духе преданности Партии и готовности к воинской службе.</p>
                <p><strong>Статья 105.</strong> Неисполнение гражданского долга, включая уклонение от воинской обязанности, влечёт уголовную ответственность.</p>
            `
        },
        {
            title: "Глава XI. Заключительные положения",
            content: `
                <p><strong>Статья 106.</strong> Настоящая Конституция является основным законом Республики Мальдения и обладает высшей юридической силой.</p>
                <p><strong>Статья 107.</strong> Изменения и дополнения в настоящую Конституцию вносятся исключительно решением Съезда партии по представлению Президента и с согласия Верховного канцлера.</p>
                <p><strong>Статья 108.</strong> Толкование положений настоящей Конституции относится к исключительной компетенции Верховного канцлера.</p>
                <p><strong>Статья 109.</strong> Настоящая Конституция вступает в силу со дня её подписания Президентом и скрепления печатью Верховного канцлера.</p>
                <p><strong>Статья 110.</strong> С момента вступления настоящей Конституции в силу все ранее действовавшие законы и акты применяются в части, не противоречащей ей.</p>
            `
        }
    ];

    const chapterTabs = document.querySelectorAll('.chapter-tab');
    const chapterContent = document.getElementById('chapterContent');

    function renderChapter(index) {
        if (!chapterContent || index < 0 || index >= chapterData.length) return;
        const data = chapterData[index];

        chapterContent.style.opacity = '0';
        chapterContent.style.transform = 'translateY(8px)';

        setTimeout(() => {
            chapterContent.innerHTML = `<h3 style="color:#c4b5d4; margin-bottom:16px; font-weight:600;">${data.title}</h3>` + data.content;
            chapterContent.style.opacity = '1';
            chapterContent.style.transform = 'translateY(0)';
        }, 300);

        chapterTabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });
    }

    chapterTabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            renderChapter(index);
        });
    });

    setTimeout(() => {
        renderChapter(0);
    }, 100);

    (function() {
        const bootScreen = document.getElementById('boot-screen');
        const bootContent = document.getElementById('boot-content');
        if (!bootScreen || !bootContent) return;

        const bootMessages = [
            { text: "Booting Gentoo Linux 6.10.0", type: "" },
            { text: "Loading kernel...", type: "" },
            { text: "Detecting CPU: AMD Ryzen 5 7600X (6 cores, 12 threads)", type: "ok" },
            { text: "Memory: 32GB DDR5-6000 (2x16GB)", type: "ok" },
            { text: "Detecting PCIe 5.0 controllers", type: "ok" },
            { text: "Detecting USB 3.2 Gen 2 controllers", type: "ok" },
            { text: "Detecting SATA 3.0 controllers", type: "ok" },
            { text: "Detecting NVMe controllers", type: "ok" },
            { text: "Loading kernel modules", type: "" },
            { text: "Loading module: amdgpu (version 6.5.0)", type: "ok" },
            { text: "Loading module: snd_hda_intel (audio)", type: "ok" },
            { text: "Loading module: r8169 (Realtek Ethernet)", type: "ok" },
            { text: "Loading module: mt7921e (MediaTek Wi-Fi 6E)", type: "ok" },
            { text: "Loading module: ext4 (filesystem)", type: "ok" },
            { text: "Loading module: xfs (filesystem)", type: "ok" },
            { text: "Loading module: btrfs (filesystem)", type: "ok" },
            { text: "Loading module: nvme (NVMe driver)", type: "ok" },
            { text: "Loading module: usb_storage", type: "ok" },
            { text: "Loading module: xhci_pci", type: "ok" },
            { text: "Loading module: ahci", type: "ok" },
            { text: "Loading module: i915 (Intel GPU)", type: "ok" },
            { text: "Loading module: nouveau (NVIDIA open-source)", type: "warn" },
            { text: "Loading module: vfio-pci (PCI passthrough)", type: "ok" },
            { text: "Loading module: kvm (Kernel Virtual Machine)", type: "ok" },
            { text: "Loading module: kvm_amd (AMD SVM)", type: "ok" },
            { text: "Loading module: zfs (ZFS support)", type: "ok" },
            { text: "Loading module: fuse (Filesystem in Userspace)", type: "ok" },
            { text: "Loading module: overlayfs (Overlay filesystem)", type: "ok" },
            { text: "Checking root filesystem (ext4 on /dev/nvme0n1p2)", type: "ok" },
            { text: "Checking /boot partition (ext4)", type: "ok" },
            { text: "Checking /home partition (xfs)", type: "ok" },
            { text: "Checking /var partition (btrfs)", type: "ok" },
            { text: "Mounting /dev/nvme0n1p2 on /", type: "ok" },
            { text: "Mounting /dev/nvme0n1p1 on /boot/efi", type: "ok" },
            { text: "Mounting /dev/nvme0n1p3 on /home", type: "ok" },
            { text: "Mounting /tmp on tmpfs", type: "ok" },
            { text: "Mounting /run on tmpfs", type: "ok" },
            { text: "Mounting /dev/shm on tmpfs", type: "ok" },
            { text: "Mounting /sys/fs/cgroup", type: "ok" },
            { text: "Mounting /sys/kernel/security", type: "ok" },
            { text: "Mounting /sys/kernel/debug", type: "ok" },
            { text: "Bringing up loopback interface", type: "ok" },
            { text: "Detecting network interfaces", type: "" },
            { text: "Interface enp2s0: DHCP address 192.168.1.101/24", type: "ok" },
            { text: "Interface wlp3s0: scanning for networks", type: "" },
            { text: "Interface wlp3s0: authenticated, connected", type: "ok" },
            { text: "Interface wlp3s0: assigned 192.168.1.102/24", type: "ok" },
            { text: "Interface wlp3s0: default route via 192.168.1.1", type: "ok" },
            { text: "Starting Network Manager", type: "ok" },
            { text: "Starting OpenRC", type: "ok" },
            { text: "Starting systemd-resolved", type: "ok" },
            { text: "Starting systemd-timesyncd", type: "ok" },
            { text: "Starting systemd-logind", type: "ok" },
            { text: "Starting dbus (message bus)", type: "ok" },
            { text: "Starting cron (task scheduler)", type: "ok" },
            { text: "Starting sshd (secure shell daemon)", type: "ok" },
            { text: "Starting nginx (web server)", type: "ok" },
            { text: "Starting postgresql (database)", type: "ok" },
            { text: "Starting redis (in-memory cache)", type: "ok" },
            { text: "Starting memcached (object cache)", type: "ok" },
            { text: "Starting mysql (relational database)", type: "ok" },
            { text: "Starting docker (container runtime)", type: "ok" },
            { text: "Starting containerd (container runtime)", type: "ok" },
            { text: "Starting kubelet (Kubernetes node agent)", type: "ok" },
            { text: "Starting k3s (lightweight Kubernetes)", type: "ok" },
            { text: "Starting accounts-daemon (user accounts)", type: "ok" },
            { text: "Starting avahi-daemon (mDNS/DNS-SD)", type: "ok" },
            { text: "Starting bluetooth (Bluetooth service)", type: "ok" },
            { text: "Starting cups (printing system)", type: "ok" },
            { text: "Starting gdm (GNOME Display Manager)", type: "ok" },
            { text: "Starting lightdm (Lightweight Display Manager)", type: "ok" },
            { text: "Starting sddm (Simple Desktop Display Manager)", type: "ok" },
            { text: "[  OK  ] Reached target multi-user.target", type: "ok" },
        ];

        const fastfetchData = [
            { text: "", type: "" },
            { text: "         -/oyddmdhs+:.                 ╭─ Gentoo Linux", type: "highlight" },
            { text: "     -odNMMMMMMMMNNmhy+-`              ├─ Kernel: 6.10.0-gentoo", type: "highlight" },
            { text: "   -yNMMMMMMMMMMMNNNmmdhy+-            ├─ CPU: AMD Ryzen 5 7600X", type: "highlight" },
            { text: " `omMMMMMMMMMMMMNmdmmmmddhhy/`         ├─ GPU: AMD Radeon RX 7900 XTX", type: "highlight" },
            { text: " omMMMMMMMMMMMNhhyyyohmdddhhhdo`       ├─ Memory: 14.24GiB / 31.20GiB (44%)", type: "highlight" },
            { text: ".ydMMMMMMMMMMdhs++so/smdddhhhhdm+`     ├─ Disk (/): 204.32GiB / 467.40GiB (44%)", type: "highlight" },
            { text: " oyhdmNMMMMMMMNdyooydmddddhhhhyhNd.    ├─ Uptime: 2 min, 34 sec", type: "highlight" },
            { text: "  :oyhhdNNMMMMMMMNNNmmdddhhhhhyymMh    ├─ Init: OpenRC", type: "highlight" },
            { text: "    .:+sydNMMMMMNNNmmmdddhhhhhhmMmy    ├─ Shell: fish 4.8.0", type: "highlight" },
            { text: "       /mMMMMMMNNNmmmdddhhhhhmMNhs:    ╰─ Packages: 1613 (emerge)", type: "highlight" },
            { text: "    `oNMMMMMMMNNNmmmddddhhdmMNhs+`     ", type: "highlight" },
            { text: "  `sNMMMMMMMMNNNmmmdddddmNMmhs/.       ", type: "highlight" },
            { text: " /NMMMMMMMMNNNNmmmdddmNMNdso:`         ", type: "highlight" },
            { text: "+MMMMMMMNNNNNmmmmdmNMNdso/-            ⬤ ⬤ ⬤ ⬤ ⬤ ⬤ ⬤ ⬤", type: "highlight" },
            { text: "yMMNNNNNNNmmmmmNNMmhs+/-`              ", type: "highlight" },
            { text: "/hMMNNNNNNNNMNdhs++/-`                ", type: "highlight" },
            { text: "`/ohdmmddhys+++/:.`                   ", type: "highlight" },
            { text: "  `-//////:--.                        ", type: "highlight" },
            { text: "", type: "" },
        ];

        const loginLines = [
            { text: "Starting Maldenia session...", type: "ok" },
            { text: "Loading user profile...", type: "ok" },
            { text: "Welcome to Republic of Maldenia!", type: "welcome" },
        ];

        let currentIndex = 0;
        let typeTimer = null;

        function addBootLine(text, type) {
            const lineEl = document.createElement('div');
            lineEl.className = 'boot-line';
            if (type) {
                lineEl.classList.add(type);
            }
            lineEl.textContent = text;
            bootContent.appendChild(lineEl);
            bootScreen.scrollTop = bootScreen.scrollHeight;
        }

        function typeCommandInline(promptText, command, callback) {
            const lineEl = document.createElement('div');
            lineEl.className = 'boot-line prompt';
            lineEl.textContent = promptText;
            bootContent.appendChild(lineEl);
            bootScreen.scrollTop = bootScreen.scrollHeight;

            setTimeout(() => {
                let index = 0;
                const cmdInterval = 30 + Math.random() * 20;
                typeTimer = setInterval(() => {
                    if (index < command.length) {
                        lineEl.textContent += command.charAt(index);
                        index++;
                        bootScreen.scrollTop = bootScreen.scrollHeight;
                    } else {
                        clearInterval(typeTimer);
                        typeTimer = null;
                        if (callback) callback();
                    }
                }, cmdInterval);
            }, 400);
        }

        function runBootSequence() {
            const msgInterval = 4 + Math.floor(Math.random() * 4);

            function showSystemMessages() {
                if (currentIndex < bootMessages.length) {
                    const msg = bootMessages[currentIndex];
                    addBootLine(msg.text, msg.type || '');
                    currentIndex++;
                    setTimeout(showSystemMessages, msgInterval);
                } else {
                    setTimeout(showWelcome, 300);
                }
            }

            function showWelcome() {
                addBootLine('', '');
                addBootLine('Welcome to Gentoo Linux!', 'welcome');
                setTimeout(() => {
                    addBootLine('', '');
                    addBootLine('', '');
                    typeFastfetchCommand();
                }, 500);
            }

            function typeFastfetchCommand() {
                typeCommandInline('root@maldenia ~ # ', 'fastfetch', function() {
                    addBootLine('', '');
                    setTimeout(showFastfetch, 200);
                });
            }

            function showFastfetch() {
                let ffIndex = 0;

                function addFastfetchLine() {
                    if (ffIndex < fastfetchData.length) {
                        const line = fastfetchData[ffIndex];
                        addBootLine(line.text, line.type || '');
                        ffIndex++;
                        setTimeout(addFastfetchLine, 4 + Math.random() * 4);
                    } else {
                        setTimeout(() => {
                            addBootLine('', '');
                            typeLoginCommand();
                        }, 600);
                    }
                }

                addFastfetchLine();
            }

            function typeLoginCommand() {
                typeCommandInline('root@maldenia ~ # ', './maldenia-login --start', function() {
                    addBootLine('', '');
                    setTimeout(showLoginMessages, 300);
                });
            }

            function showLoginMessages() {
                let liIndex = 0;

                function addLoginLine() {
                    if (liIndex < loginLines.length) {
                        const line = loginLines[liIndex];
                        addBootLine(line.text, line.type || '');
                        liIndex++;
                        setTimeout(addLoginLine, 200 + Math.random() * 100);
                    } else {
                        setTimeout(finishBoot, 800);
                    }
                }

                addLoginLine();
            }

            function finishBoot() {
                bootScreen.classList.add('hidden');
                document.body.classList.add('loaded');
                window.scrollTo({ top: 0, behavior: 'instant' });
                setTimeout(() => {
                    if (bootScreen.parentNode) {
                        bootScreen.remove();
                    }
                }, 1000);
            }

            showSystemMessages();
        }

        setTimeout(runBootSequence, 300);
    })();
})();