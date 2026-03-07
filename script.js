(function () {
    var cornerLogos = document.querySelectorAll(".corner-logo-stack");
    if (!cornerLogos.length) {
        return;
    }

    function syncCornerLogos() {
        var hideOnMobile = window.innerWidth <= 900;
        cornerLogos.forEach(function (logo) {
            logo.style.display = hideOnMobile ? "none" : "";
        });
    }

    syncCornerLogos();
    window.addEventListener("resize", syncCornerLogos);
})();

(function () {
    var navToggles = document.querySelectorAll("[data-nav-toggle]");
    if (!navToggles.length) {
        return;
    }

    navToggles.forEach(function (toggle) {
        var nav = toggle.closest(".top-nav");
        if (!nav) {
            return;
        }

        var links = nav.querySelector("[data-nav-links]");
        if (!links) {
            return;
        }

        function setOpenState(isOpen) {
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            toggle.classList.toggle("open", isOpen);
            links.classList.toggle("open", isOpen);
            if (window.innerWidth <= 640) {
                document.body.classList.toggle("nav-menu-open", isOpen);
            } else {
                document.body.classList.remove("nav-menu-open");
            }
        }

        toggle.addEventListener("click", function () {
            var isOpen = links.classList.contains("open");
            setOpenState(!isOpen);
        });

        links.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                setOpenState(false);
            });
        });

        document.addEventListener("click", function (event) {
            if (!links.classList.contains("open")) {
                return;
            }

            if (!nav.contains(event.target)) {
                setOpenState(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && links.classList.contains("open")) {
                setOpenState(false);
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 640) {
                setOpenState(false);
            }
        });
    });
})();

(function () {
    var toggle = document.querySelector("[data-branches-toggle]");
    var panel = document.querySelector("[data-branches-panel]");
    if (!toggle || !panel) {
        return;
    }

    panel.hidden = false;
    panel.removeAttribute("hidden");

    function setOpen(isOpen) {
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        panel.classList.toggle("is-open", isOpen);
        panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }

    toggle.addEventListener("click", function () {
        var isOpen = toggle.getAttribute("aria-expanded") === "true";
        setOpen(!isOpen);
    });

    setOpen(false);
})();

(function () {
    var tabGroups = document.querySelectorAll("[data-fixture-tabs]");
    if (!tabGroups.length) {
        return;
    }

    tabGroups.forEach(function (group) {
        var tabs = group.querySelectorAll("[data-fixture-tab]");
        if (!tabs.length) {
            return;
        }

        var panelsContainer = group.nextElementSibling;
        if (!panelsContainer) {
            return;
        }

        var panels = panelsContainer.querySelectorAll("[data-fixture-panel]");

        function activate(branch) {
            tabs.forEach(function (tab) {
                var isActive = tab.getAttribute("data-fixture-tab") === branch;
                tab.classList.toggle("active", isActive);
                tab.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            panels.forEach(function (panel) {
                var isActive = panel.getAttribute("data-fixture-panel") === branch;
                panel.classList.toggle("active", isActive);
                panel.hidden = !isActive;
            });
        }

        tabs.forEach(function (tab) {
            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-selected", tab.classList.contains("active") ? "true" : "false");
            tab.addEventListener("click", function () {
                activate(tab.getAttribute("data-fixture-tab"));
            });
        });

        panels.forEach(function (panel) {
            panel.setAttribute("role", "tabpanel");
            panel.hidden = !panel.classList.contains("active");
        });

        var initiallyActive = group.querySelector("[data-fixture-tab].active");
        activate(initiallyActive ? initiallyActive.getAttribute("data-fixture-tab") : tabs[0].getAttribute("data-fixture-tab"));
    });
})();

(function () {
    var navs = document.querySelectorAll(".top-nav");
    if (!navs.length) {
        return;
    }

    var LANG_KEY = "dcfl_lang";
    var LANGS = ["tr", "en", "pl"];
    var LANG_OPTIONS = [
        { code: "tr", label: "TR" },
        { code: "en", label: "EN" },
        { code: "pl", label: "PL" }
    ];

    var common = {
        tr: {
            menu: "Menü",
            pickerAria: "Dil",
            nav: {
                "index.html": "Ana Sayfa",
                "kurumsal.html": "Amacımız",
                "hizmetler.html": "Sıkça Sorulanlar",
                "program.html": "Program & Turnuva",
                "finans.html": "Finans",
                "blog.html": "Blog",
                "arsiv.html": "Arşiv",
                "iletisim.html": "İletişim",
                "turnuva.html": "Program & Turnuva"
            }
        },
        en: {
            menu: "Menu",
            pickerAria: "Language",
            nav: {
                "index.html": "Home",
                "kurumsal.html": "About",
                "hizmetler.html": "FAQ",
                "program.html": "Program & Tournament",
                "finans.html": "Finance",
                "blog.html": "Blog",
                "arsiv.html": "Archive",
                "iletisim.html": "Contact",
                "turnuva.html": "Program & Tournament"
            }
        },
        pl: {
            menu: "Menu",
            pickerAria: "Jezyk",
            nav: {
                "index.html": "Strona glowna",
                "kurumsal.html": "O nas",
                "hizmetler.html": "FAQ",
                "program.html": "Program i Turniej",
                "finans.html": "Finanse",
                "blog.html": "Blog",
                "arsiv.html": "Archiwum",
                "iletisim.html": "Kontakt",
                "turnuva.html": "Program i Turniej"
            }
        }
    };

    function normalizeLang(value) {
        return LANGS.indexOf(value) >= 0 ? value : "tr";
    }

    function getLang() {
        return normalizeLang(window.localStorage.getItem(LANG_KEY) || "tr");
    }

    function setLang(lang) {
        window.localStorage.setItem(LANG_KEY, normalizeLang(lang));
    }

    function pageKey() {
        var file = window.location.pathname.split("/").pop();
        return (file && file.length ? file : "index.html").toLowerCase();
    }

    function setText(selector, value) {
        if (typeof value !== "string") {
            return;
        }
        var el = document.querySelector(selector);
        if (el) {
            el.textContent = value;
        }
    }

    function setHTML(selector, value) {
        if (typeof value !== "string") {
            return;
        }
        var el = document.querySelector(selector);
        if (el) {
            el.innerHTML = value;
        }
    }

    function setAttr(selector, attrName, value) {
        if (typeof value !== "string") {
            return;
        }
        var el = document.querySelector(selector);
        if (el) {
            el.setAttribute(attrName, value);
        }
    }

    function setList(selector, values) {
        if (!Array.isArray(values)) {
            return;
        }
        var nodes = document.querySelectorAll(selector);
        values.forEach(function (value, index) {
            if (nodes[index]) {
                nodes[index].textContent = value;
            }
        });
    }

    function mapText(selector, mapping) {
        if (!mapping || typeof mapping !== "object") {
            return;
        }
        document.querySelectorAll(selector).forEach(function (node) {
            var base = node.getAttribute("data-i18n-base");
            if (!base) {
                base = node.textContent.trim();
                node.setAttribute("data-i18n-base", base);
            }
            node.textContent = Object.prototype.hasOwnProperty.call(mapping, base) ? mapping[base] : base;
        });
    }

    function applyCommon(lang) {
        var copy = common[lang] || common.tr;
        document.documentElement.lang = lang;

        document.querySelectorAll(".nav-toggle").forEach(function (button) {
            button.textContent = copy.menu;
        });

        document.querySelectorAll(".nav-actions a.nav-link").forEach(function (link) {
            var href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
            if (Object.prototype.hasOwnProperty.call(copy.nav, href)) {
                link.textContent = copy.nav[href];
            }
        });

        document.querySelectorAll("[data-lang-picker]").forEach(function (picker) {
            picker.value = lang;
            picker.setAttribute("aria-label", copy.pickerAria);
        });
    }

    function applyIndex(lang) {
        var copy = {
            tr: {
                title: "DCFLSPORTFEST'26 | Ana Sayfa",
                h1: "Uluslararası Spor ve Gençlik Festivali",
                hero: [
                    "DCFLSPORTFEST'26, yalnızca yerel bir organizasyon değildir.",
                    "Bu yapı sayesinde etkinlik, sponsor markalar için global görünürlük sağlar."
                ],
                list: [
                    "Birden fazla ülkeden takım ve bireysel sporcu katılımı",
                    "Nitelikli okullar ve spor kulüplerinin katılımı",
                    "Profesyonel hakemler ve davetli konuşmacılar",
                    "Çok dilli iletişim ve tanıtım"
                ],
                cta: "Program ve Turnuva",
                sponsorCta: "Sponsor Ol",
                countdown: "SportFeste kalan süre",
                countdownLabels: ["Gün", "Saat", "Dakika", "Saniye"],
                ended: "Festival başladı!",
                sectionKicker: "FESTIVAL HATLARI",
                sectionTitle: "Branşlar",
                branches: ["Voleybol", "Basketbol", "Futbol", "Masa tenisi", "Okçuluk", "Oryantiring", "Bahçe Satrancı", "Playstation Turnuvası", "Atletizm", "Bahçe Oyunları"],
                contactTitle: "İletişim Formu",
                quick: "Hızlı Mesaj",
                labels: ["Ad Soyad/ Firma Adı", "E-posta", "Konu", "Mesaj"],
                placeholders: ["Ad Soyad/ Firma Adı", "ornek@mail.com", "Takım kaydı / Sponsorluk / Soru", "Mesajını yaz..."],
                send: "Gönder"
            },
            en: {
                title: "DCFLSPORTFEST'26 | Home",
                h1: "International Scale",
                hero: [
                    "DCFLSPORTFEST'26 is not only a local organization.",
                    "This structure gives sponsor brands global visibility."
                ],
                list: [
                    "Teams and individual athletes from multiple countries",
                    "Participation of qualified schools and sports clubs",
                    "Professional referees and invited speakers",
                    "Multilingual communication and promotion"
                ],
                cta: "Program and Tournament",
                sponsorCta: "Become a Sponsor",
                countdown: "Time left to Sportfest",
                countdownLabels: ["Days", "Hours", "Minutes", "Seconds"],
                ended: "The festival has started!",
                sectionKicker: "FESTIVAL LINES",
                sectionTitle: "Sports Branches",
                branches: ["Volleyball", "Basketball", "Football", "Table Tennis", "Archery", "Orienteering", "Garden Chess", "PlayStation Tournament", "Athletics", "Garden Games"],
                contactTitle: "Contact Form",
                quick: "Quick Message",
                labels: ["Name / Company Name", "E-mail", "Subject", "Message"],
                placeholders: ["Name / Company Name", "example@mail.com", "Team registration / Sponsorship / Question", "Write your message..."],
                send: "Send"
            },
            pl: {
                title: "DCFLSPORTFEST'26 | Strona glowna",
                h1: "Wymiar miedzynarodowy",
                hero: [
                    "DCFLSPORTFEST'26 to nie tylko lokalna organizacja.",
                    "Dzieki temu wydarzenie zapewnia sponsorom globalna widocznosc."
                ],
                list: [
                    "Udzial druzyn i zawodnikow indywidualnych z wielu krajow",
                    "Udzial renomowanych szkol i klubow sportowych",
                    "Profesjonalni sedziowie i zaproszeni prelegenci",
                    "Wielojezyczna komunikacja i promocja"
                ],
                cta: "Program i Turniej",
                sponsorCta: "Zostan sponsorem",
                countdown: "Czas do Sportfestu",
                countdownLabels: ["Dni", "Godz", "Min", "Sek"],
                ended: "Festiwal sie rozpoczal!",
                sectionKicker: "LINIE FESTIWALU",
                sectionTitle: "Dyscypliny",
                branches: ["Siatkowka", "Koszykowka", "Pilka nozna", "Tenis stolowy", "Lucznictwo", "Bieg na orientacje", "Szachy ogrodowe", "Turniej PlayStation", "Lekkoatletyka", "Gry ogrodowe"],
                contactTitle: "Formularz kontaktowy",
                quick: "Szybka wiadomosc",
                labels: ["Imie i nazwisko / Firma", "E-mail", "Temat", "Wiadomosc"],
                placeholders: ["Imie i nazwisko / Firma", "przyklad@mail.com", "Rejestracja druzyny / Sponsoring / Pytanie", "Napisz wiadomosc..."],
                send: "Wyslij"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".hero-copy h1", copy.h1);
        setList(".hero-copy .hero-text", copy.hero);
        setList(".hero-list li", copy.list);
        setText(".cta-row .btn", copy.cta);
        setText(".countdown-title", copy.countdown);
        setText(".countdown-cta", copy.sponsorCta);
        setList(".countdown-label", copy.countdownLabels);
        setAttr("[data-countdown]", "data-ended-text", copy.ended);
        setList(".home-branch-list li", copy.branches);
        setText("main > .panel .section-head .section-kicker", copy.sectionKicker);
        setText("main > .panel .section-head h2", copy.sectionTitle);
        setList(".branch-list li", copy.branches);
        setText(".contact-info h2", copy.contactTitle);
        setText(".contact-form-card h2", copy.quick);
        setText("label[for='home-name']", copy.labels[0]);
        setText("label[for='home-email']", copy.labels[1]);
        setText("label[for='home-topic']", copy.labels[2]);
        setText("label[for='home-message']", copy.labels[3]);
        setAttr("#home-name", "placeholder", copy.placeholders[0]);
        setAttr("#home-email", "placeholder", copy.placeholders[1]);
        setAttr("#home-topic", "placeholder", copy.placeholders[2]);
        setAttr("#home-message", "placeholder", copy.placeholders[3]);
        setText(".contact-form-card .btn", copy.send);
    }

    function applyProgram(lang) {
        var copy = {
            tr: {
                title: "Program & Turnuva | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM & TURNUVA",
                h1: "12-13-14 Mayıs etkinlik ve fikstür akışı.",
                hero: "Açılış, günlük etkinlik planı ve branş bazlı tüm turnuva fikstürlerini tek sayfada takip edebilirsin.",
                sections: ["OPERASYON AKIŞI", "FESTİVAL HATLARI", "FİKSTÜR DETAYLARI"],
                titles: ["Günlük Program", "Branşlar", "Turnuva Seçim Ekranı"],
                tabs: ["Voleybol", "Basketbol", "Futbol", "Masa Tenisi", "Okçuluk", "Oryantiring", "Bahçe Satrancı", "PlayStation", "Atletizm", "Bahçe Oyunları"],
                panels: ["Voleybol Fikstürü", "Basketbol Fikstürü", "Futbol Fikstürü", "Masa Tenisi Fikstürü", "Okçuluk Fikstürü", "Oryantiring Fikstürü", "Bahçe Satrancı Fikstürü", "PlayStation Turnuvası Fikstürü", "Atletizm Fikstürü", "Bahçe Oyunları Fikstürü"],
                headerMap: { "Tarih": "Tarih", "Saat": "Saat", "Eşleşme": "Eşleşme", "Saha": "Saha", "Tur": "Tur", "Alan": "Alan", "Yarış": "Yarış", "Pist": "Pist", "Etap": "Etap" },
                footer: "Program & Turnuva Sayfası"
            },
            en: {
                title: "Program & Tournament | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM & TOURNAMENT",
                h1: "12-13-14 May event and fixture flow.",
                hero: "Follow opening, daily schedule and all branch-based fixtures on one page.",
                sections: ["OPERATION FLOW", "FESTIVAL LINES", "FIXTURE DETAILS"],
                titles: ["Daily Program", "Sports Branches", "Tournament Selection Screen"],
                tabs: ["Volleyball", "Basketball", "Football", "Table Tennis", "Archery", "Orienteering", "Garden Chess", "PlayStation", "Athletics", "Garden Games"],
                panels: ["Volleyball Fixture", "Basketball Fixture", "Football Fixture", "Table Tennis Fixture", "Archery Fixture", "Orienteering Fixture", "Garden Chess Fixture", "PlayStation Tournament Fixture", "Athletics Fixture", "Garden Games Fixture"],
                headerMap: { "Tarih": "Date", "Saat": "Time", "Eşleşme": "Match", "Saha": "Court", "Tur": "Round", "Alan": "Area", "Yarış": "Race", "Pist": "Track", "Etap": "Stage" },
                footer: "Program & Tournament Page"
            },
            pl: {
                title: "Program i Turniej | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM I TURNIEJ",
                h1: "Harmonogram wydarzenia i terminarzy 12-13-14 maja.",
                hero: "Na jednej stronie sledzisz otwarcie, plan dnia i wszystkie terminarze turniejowe.",
                sections: ["PRZEBIEG OPERACYJNY", "LINIE FESTIWALU", "SZCZEGOLY TERMINARZA"],
                titles: ["Program Dzienny", "Dyscypliny", "Ekran Wyboru Turnieju"],
                tabs: ["Siatkowka", "Koszykowka", "Pilka nozna", "Tenis stolowy", "Lucznictwo", "Bieg na orientacje", "Szachy ogrodowe", "PlayStation", "Lekkoatletyka", "Gry ogrodowe"],
                panels: ["Terminarz siatkowki", "Terminarz koszykowki", "Terminarz pilki noznej", "Terminarz tenisa stolowego", "Terminarz lucznictwa", "Terminarz biegu na orientacje", "Terminarz szachow ogrodowych", "Terminarz turnieju PlayStation", "Terminarz lekkoatletyki", "Terminarz gier ogrodowych"],
                headerMap: { "Tarih": "Data", "Saat": "Godz.", "Eşleşme": "Mecz", "Saha": "Boisko", "Tur": "Runda", "Alan": "Strefa", "Yarış": "Bieg", "Pist": "Tor", "Etap": "Etap" },
                footer: "Strona Program i Turniej"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell .eyebrow", copy.eyebrow);
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        if (Array.isArray(copy.sections) && copy.sections.length) {
            setText(".program-overview-program .section-head .section-kicker", copy.sections[0]);
            setText(".fixture-section .section-head .section-kicker", copy.sections[copy.sections.length - 1]);
        }
        if (Array.isArray(copy.titles) && copy.titles.length) {
            setText(".program-overview-program .section-head h2", copy.titles[0]);
            setText(".fixture-section .section-head h2", copy.titles[copy.titles.length - 1]);
        }
        setList(".fixture-tab", copy.tabs);
        setList(".fixture-panel > h3", copy.panels);
        mapText(".fixture-table th", copy.headerMap);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyFinans(lang) {
        var copy = {
            tr: {
                title: "Finans | DCFLSPORTFEST'26",
                h1: "Sponsorluk Paketlerini Karşılaştırın",
                hero: "Ayni sponsorluğu ayrı bir blokta, maddi sponsorluk paketlerini ise kolay karşılaştırmalı kart düzeninde inceleyebilirsin.",
                section: "FİNANS",
                sectionTitle: "Sponsorluk Paketlerini Karşılaştırın",
                group: "MADDİ SPONSORLUK PAKETLERİ",
                groupTitle: "Maddi Sponsorluk Paketleri",
                footer: "Finans Sayfası",
                contact: "İletişim",
                quick: "Hızlı Mesaj",
                send: "Gönder"
            },
            en: {
                title: "Finance | DCFLSPORTFEST'26",
                h1: "Compare Sponsorship Packages",
                hero: "Review in-kind sponsorship in a dedicated block and compare financial packages side by side.",
                section: "FINANCE",
                sectionTitle: "Compare Sponsorship Packages",
                group: "FINANCIAL SPONSORSHIP PACKAGES",
                groupTitle: "Financial Sponsorship Packages",
                footer: "Finance Page",
                contact: "Contact",
                quick: "Quick Message",
                send: "Send"
            },
            pl: {
                title: "Finanse | DCFLSPORTFEST'26",
                h1: "Porownaj pakiety sponsorskie",
                hero: "Sponsorstwo rzeczowe sprawdzisz osobno, a pakiety finansowe porownasz obok siebie.",
                section: "FINANSE",
                sectionTitle: "Porownaj pakiety sponsorskie",
                group: "PAKIETY SPONSORINGU FINANSOWEGO",
                groupTitle: "Pakiety Sponsoringu Finansowego",
                footer: "Strona Finanse",
                contact: "Kontakt",
                quick: "Szybka wiadomosc",
                send: "Wyslij"
            }
        }[lang] || {};

        var map = {
            en: {
                "Ayni Sponsorluk": "In-Kind Sponsorship",
                "Bronz Sponsorluk": "Bronze Sponsorship",
                "Gümüş Sponsorluk": "Silver Sponsorship",
                "Altın Sponsorluk": "Gold Sponsorship",
                "Destek niteliğine göre özel görünürlük.": "Custom visibility based on support type.",
                "Temel görünürlük ve resmi teşekkür paketi.": "Core visibility and official appreciation package.",
                "Daha fazla görünürlük ve sahne teşekkürü.": "Higher visibility and stage appreciation.",
                "Maksimum görünürlük ve premium haklar.": "Maximum visibility and premium rights.",
                "Açılışta özel teşekkür": "Special thanks during opening",
                "Açılışta isimle teşekkür": "Name mention during opening",
                "Stant açma hakkı": "Right to open a stand",
                "Firmaya özel teşekkür belgesi": "Custom certificate of appreciation",
                "Firmaya özel teşekkür plaketi": "Custom appreciation plaque",
                "Medyada yapılan toplu teşekkür paylaşımında logosu bulunur.": "Logo placement in collective media thank-you post."
            },
            pl: {
                "Ayni Sponsorluk": "Sponsorstwo rzeczowe",
                "Bronz Sponsorluk": "Sponsorstwo brazowe",
                "Gümüş Sponsorluk": "Sponsorstwo srebrne",
                "Altın Sponsorluk": "Sponsorstwo zlote",
                "Destek niteliğine göre özel görünürlük.": "Widocznosc dopasowana do rodzaju wsparcia.",
                "Temel görünürlük ve resmi teşekkür paketi.": "Podstawowa widocznosc i oficjalny pakiet podziekowan.",
                "Daha fazla görünürlük ve sahne teşekkürü.": "Wieksza widocznosc i podziekowanie na scenie.",
                "Maksimum görünürlük ve premium haklar.": "Maksymalna widocznosc i prawa premium.",
                "Açılışta özel teşekkür": "Specjalne podziekowanie podczas otwarcia",
                "Açılışta isimle teşekkür": "Podziekowanie z nazwa podczas otwarcia",
                "Stant açma hakkı": "Prawo do otwarcia stoiska",
                "Firmaya özel teşekkür belgesi": "Dedykowany certyfikat podziekowania",
                "Firmaya özel teşekkür plaketi": "Dedykowana plakieta podziekowania",
                "Medyada yapılan toplu teşekkür paylaşımında logosu bulunur.": "Logo w zbiorczym wpisie podziekowan w mediach."
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.sectionTitle);
        setText(".finance-group-head .section-kicker", copy.group);
        setText(".finance-group-head h3", copy.groupTitle);
        setText(".contact-info h2", copy.contact);
        setText(".contact-form-card h2", copy.quick);
        setText(".contact-form-card .btn", copy.send);
        setText(".footer p:nth-of-type(2)", copy.footer);

        if (lang === "en") {
            setHTML(".contact-info .section-text:nth-of-type(1)", "<strong>E-mail:</strong> dcflsportfest2020@gmail.com");
            setHTML(".contact-info .section-text:nth-of-type(2)", "<strong>Location:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul");
            setHTML(".contact-info .section-text:nth-of-type(3)", "<strong>Note:</strong> Contact us for sponsorship file and proposal process.");
            setText("label[for='finans-name']", "Name / Company Name");
            setText("label[for='finans-email']", "E-mail");
            setText("label[for='finans-topic']", "Subject");
            setText("label[for='finans-message']", "Message");
            setAttr("#finans-name", "placeholder", "Name / Company Name");
            setAttr("#finans-email", "placeholder", "example@mail.com");
            setAttr("#finans-topic", "placeholder", "Sponsorship Package / File Request");
            setAttr("#finans-message", "placeholder", "Write your message...");
        } else if (lang === "pl") {
            setHTML(".contact-info .section-text:nth-of-type(1)", "<strong>E-mail:</strong> dcflsportfest2020@gmail.com");
            setHTML(".contact-info .section-text:nth-of-type(2)", "<strong>Lokalizacja:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul");
            setHTML(".contact-info .section-text:nth-of-type(3)", "<strong>Notatka:</strong> Skontaktuj sie z nami, aby otrzymac plik sponsorki i zlozyc oferte.");
            setText("label[for='finans-name']", "Imie i nazwisko / Firma");
            setText("label[for='finans-email']", "E-mail");
            setText("label[for='finans-topic']", "Temat");
            setText("label[for='finans-message']", "Wiadomosc");
            setAttr("#finans-name", "placeholder", "Imie i nazwisko / Firma");
            setAttr("#finans-email", "placeholder", "przyklad@mail.com");
            setAttr("#finans-topic", "placeholder", "Pakiet sponsorski / Prosba o plik");
            setAttr("#finans-message", "placeholder", "Napisz wiadomosc...");
        } else {
            setHTML(".contact-info .section-text:nth-of-type(1)", "<strong>E-posta:</strong> dcflsportfest2020@gmail.com");
            setHTML(".contact-info .section-text:nth-of-type(2)", "<strong>Konum:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Küçükçekmece / İstanbul");
            setHTML(".contact-info .section-text:nth-of-type(3)", "<strong>Not:</strong> Sponsorluk detay dosyası ve teklif gönderimi için iletişime geçebilirsin.");
            setText("label[for='finans-name']", "Ad Soyad / Firma Adı");
            setText("label[for='finans-email']", "E-posta");
            setText("label[for='finans-topic']", "Konu");
            setText("label[for='finans-message']", "Mesaj");
            setAttr("#finans-name", "placeholder", "Ad Soyad / Firma Adı");
            setAttr("#finans-email", "placeholder", "ornek@mail.com");
            setAttr("#finans-topic", "placeholder", "Sponsorluk Paketi / Dosya Talebi");
            setAttr("#finans-message", "placeholder", "Mesajını yaz...");
        }

        mapText(".finance-card h3", map);
        mapText(".finance-sub", map);
        mapText(".feature-name", map);
    }

    function applySimplePage(lang, file, trTitle, enTitle, plTitle, trH1, enH1, plH1, trFooter, enFooter, plFooter) {
        if (pageKey() !== file) {
            return;
        }
        if (lang === "en") {
            document.title = enTitle;
            setText(".page-shell h1", enH1);
            setText(".footer p:nth-of-type(2)", enFooter);
        } else if (lang === "pl") {
            document.title = plTitle;
            setText(".page-shell h1", plH1);
            setText(".footer p:nth-of-type(2)", plFooter);
        } else {
            document.title = trTitle;
            setText(".page-shell h1", trH1);
            setText(".footer p:nth-of-type(2)", trFooter);
        }
    }

    function applyFaq(lang) {
        var copy = {
            tr: {
                title: "Sıkça Sorulanlar | DCFLSPORTFEST'26",
                h1: "Merak edilen soruların net cevapları.",
                hero: "Katılım, kayıt, kontenjan ve sponsorluk süreçleriyle ilgili en çok sorulan soruları burada bulabilirsin.",
                section: "SIKÇA SORULANLAR",
                title2: "Hızlı Cevaplar",
                footer: "Sıkça Sorulanlar Sayfası"
            },
            en: {
                title: "FAQ | DCFLSPORTFEST'26",
                h1: "Clear answers to common questions.",
                hero: "Find the most frequently asked questions about registration, quotas and sponsorship.",
                section: "FAQ",
                title2: "Quick Answers",
                footer: "FAQ Page"
            },
            pl: {
                title: "FAQ | DCFLSPORTFEST'26",
                h1: "Jasne odpowiedzi na najczestsze pytania.",
                hero: "Znajdziesz tu najczestsze pytania o rejestracje, limity i sponsoring.",
                section: "FAQ",
                title2: "Szybkie odpowiedzi",
                footer: "Strona FAQ"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.title2);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyBlog(lang) {
        var copy = {
            tr: { title: "Blog | DCFLSPORTFEST'26", h1: "Sportfest gündeminden notlar.", hero: "Etkinlik hazırlıkları, branş hikayeleri ve organizasyon güncellemeleri.", section: "ÖNE ÇIKANLAR", title2: "Son Yazılar", footer: "Blog Sayfası" },
            en: { title: "Blog | DCFLSPORTFEST'26", h1: "Notes from the Sportfest agenda.", hero: "Event preparations, branch stories and organization updates.", section: "HIGHLIGHTS", title2: "Latest Posts", footer: "Blog Page" },
            pl: { title: "Blog | DCFLSPORTFEST'26", h1: "Notatki z agendy Sportfest.", hero: "Przygotowania wydarzenia, historie dyscyplin i aktualizacje organizacyjne.", section: "WYROZNIONE", title2: "Najnowsze wpisy", footer: "Strona Blog" }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.title2);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyArsiv(lang) {
        var copy = {
            tr: { title: "Arşiv | DCFLSPORTFEST'26", h1: "Etkinlik Arşivi", hero: "Geçmiş yıllara ait duyurular, görseller ve öne çıkan anlar yakında burada yer alacak.", section: "ARŞİV", title2: "Yakında Eklenecek İçerikler", footer: "Arşiv Sayfası" },
            en: { title: "Archive | DCFLSPORTFEST'26", h1: "Event Archive", hero: "Announcements, visuals and highlights from previous years will be added here soon.", section: "ARCHIVE", title2: "Upcoming Archive Content", footer: "Archive Page" },
            pl: { title: "Archiwum | DCFLSPORTFEST'26", h1: "Archiwum Wydarzenia", hero: "Wkrotce pojawia sie tu ogloszenia, materialy wizualne i najwazniejsze momenty z poprzednich lat.", section: "ARCHIWUM", title2: "Nadchodzace Materialy", footer: "Strona Archiwum" }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.title2);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyIletisim(lang) {
        var copy = {
            tr: { title: "İletişim | DCFLSPORTFEST'26", h1: "Bize ulaş, birlikte planlayalım.", hero: "Takım kaydı, partnerlik veya genel sorular için formu doldurabilirsin.", contact: "İletişim Bilgileri", quick: "Hızlı Mesaj", labels: ["Ad Soyad/ Firma Adı", "E-posta", "Konu", "Mesaj"], placeholders: ["Ad Soyad/ Firma Adı", "ornek@mail.com", "Takım kaydı / Sponsorluk / Soru", "Mesajını yaz..."], send: "Gönder", footer: "İletişim Sayfası" },
            en: { title: "Contact | DCFLSPORTFEST'26", h1: "Reach us, let's plan together.", hero: "You can fill in the form for team registration, partnership or general questions.", contact: "Contact Details", quick: "Quick Message", labels: ["Name / Company Name", "E-mail", "Subject", "Message"], placeholders: ["Name / Company Name", "example@mail.com", "Team registration / Sponsorship / Question", "Write your message..."], send: "Send", footer: "Contact Page" },
            pl: { title: "Kontakt | DCFLSPORTFEST'26", h1: "Skontaktuj sie z nami, zaplanujmy to razem.", hero: "Wypelnij formularz w sprawie rejestracji druzyny, partnerstwa lub pytan.", contact: "Dane kontaktowe", quick: "Szybka wiadomosc", labels: ["Imie i nazwisko / Firma", "E-mail", "Temat", "Wiadomosc"], placeholders: ["Imie i nazwisko / Firma", "przyklad@mail.com", "Rejestracja druzyny / Sponsoring / Pytanie", "Napisz wiadomosc..."], send: "Wyslij", footer: "Strona Kontakt" }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText(".contact-info h2", copy.contact);
        setText(".contact-form-card h2", copy.quick);
        setText("label[for='name']", copy.labels[0]);
        setText("label[for='email']", copy.labels[1]);
        setText("label[for='topic']", copy.labels[2]);
        setText("label[for='message']", copy.labels[3]);
        setAttr("#name", "placeholder", copy.placeholders[0]);
        setAttr("#email", "placeholder", copy.placeholders[1]);
        setAttr("#topic", "placeholder", copy.placeholders[2]);
        setAttr("#message", "placeholder", copy.placeholders[3]);
        setText(".contact-form-card .btn", copy.send);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyPage(lang) {
        var key = pageKey();
        if (key === "index.html") {
            applyIndex(lang);
        } else if (key === "program.html") {
            applyProgram(lang);
        } else if (key === "finans.html") {
            applyFinans(lang);
        } else if (key === "hizmetler.html") {
            applyFaq(lang);
        } else if (key === "blog.html") {
            applyBlog(lang);
        } else if (key === "arsiv.html") {
            applyArsiv(lang);
        } else if (key === "iletisim.html") {
            applyIletisim(lang);
        }

        applySimplePage(lang, "kurumsal.html", "Amacımız | DCFLSPORTFEST'26", "About | DCFLSPORTFEST'26", "O nas | DCFLSPORTFEST'26", "Etkinliğin Amacı", "A festival vision without borders.", "Wizja festiwalu bez granic.", "Amacımız Sayfası", "About Page", "Strona O nas");
    }

    function placePicker(nav, wrap) {
        var actions = nav.querySelector("[data-nav-links]");
        var toggle = nav.querySelector("[data-nav-toggle]");
        if (!actions || !wrap) {
            return;
        }

        if (window.innerWidth <= 640 && toggle) {
            wrap.setAttribute("data-nav-lang", "");
            if (wrap.parentElement !== nav || wrap.previousElementSibling !== toggle) {
                toggle.insertAdjacentElement("afterend", wrap);
            }
            return;
        }

        wrap.removeAttribute("data-nav-lang");
        if (wrap.parentElement !== actions) {
            actions.appendChild(wrap);
        }
    }

    function addPicker(nav) {
        var actions = nav.querySelector("[data-nav-links]");
        if (!actions) {
            return;
        }

        var existing = nav.querySelector("[data-lang-picker]");
        if (existing) {
            var existingWrap = existing.closest(".lang-switch") || existing.parentElement;
            if (existingWrap) {
                if (existingWrap.parentElement !== actions) {
                    actions.appendChild(existingWrap);
                }
                placePicker(nav, existingWrap);
            }
            return;
        }

        var wrap = document.createElement("div");
        wrap.className = "lang-switch";

        var picker = document.createElement("select");
        picker.className = "lang-picker";
        picker.setAttribute("data-lang-picker", "");

        LANG_OPTIONS.forEach(function (item) {
            var option = document.createElement("option");
            option.value = item.code;
            option.textContent = item.label;
            picker.appendChild(option);
        });

        picker.value = getLang();
        picker.addEventListener("change", function () {
            var nextLang = normalizeLang(picker.value);
            setLang(nextLang);
            applyCommon(nextLang);
            applyPage(nextLang);
        });

        wrap.appendChild(picker);
        actions.appendChild(wrap);
        placePicker(nav, wrap);
    }

    function syncPickerLayout() {
        navs.forEach(function (nav) {
            var wrap = nav.querySelector(".lang-switch");
            if (wrap) {
                placePicker(nav, wrap);
            }
        });
    }

    var initialLang = getLang();
    navs.forEach(addPicker);
    syncPickerLayout();
    window.addEventListener("resize", syncPickerLayout);
    applyCommon(initialLang);
    applyPage(initialLang);
})();
