/* =========================================================
   52-i18n — AI-assisted UI and content translation cache
   ========================================================= */
var I18N_KEY = 'sanke-i18n-cache-v11';
var i18nMemory = null;
var i18nQueue = [];
var i18nBusy = false;
var i18nTimer = null;
var i18nApplying = false;
var i18nNoApiNotice = false;
var i18nEpoch = 0;
var i18nErrorNoticeAt = 0;
var i18nConfigNoticeAt = 0;
var i18nFullTimer = null;
var i18nScrollTimer = null;
var i18nLastDoneToast = 0;
var i18nConcurrency = 6;
var i18nDocTitleSource = null;
var i18nRetryHold = [];
var i18nRetryTimer = null;
var i18nRetryDelay = 5000;
var i18nPageKey = '';
var I18N_UI = {
  "zh-TW": {
    "四科错题本": "四科錯題本",
    "高代 · 数分 · 解几 · 西经": "高代 · 數分 · 解幾 · 西經",
    "总览": "總覽",
    "错题": "錯題",
    "模板库": "模板庫",
    "题库": "題庫",
    "规范": "規範",
    "笔记库": "筆記庫",
    "期末复习": "期末複習",
    "高等代数": "高等代數",
    "数学分析": "數學分析",
    "解析几何": "解析幾何",
    "西方经济学": "西方經濟學",
    "导出备份": "匯出備份",
    "手动新增": "手動新增",
    "智能录入": "智慧錄入",
    "去题库": "前往題庫",
    "导入": "匯入",
    "导出": "匯出",
    "保存": "儲存",
    "取消": "取消",
    "删除": "刪除",
    "编辑": "編輯",
    "关闭": "關閉",
    "新建": "新建",
    "扫描": "掃描",
    "设置": "設定",
    "语言": "語言",
    "主题": "主題",
    "更新记录": "更新記錄",
    "最近更新": "最近更新",
    "历史更新": "歷史更新",
    "首页": "首頁",
    "搜索题目 / 知识点": "搜尋題目 / 知識點",
    "已掌握": "已掌握",
    "未掌握": "未掌握",
    "全部": "全部",
    "模板": "模板",
    "笔记": "筆記",
    "先按自己的节奏来": "先按自己的節奏來",
    "欢迎回来": "歡迎回來",
    "设置与同步": "設定與同步",
    "外观与称呼": "外觀與稱呼",
    "AI与智能录入": "AI 與智慧錄入",
    "同步与数据": "同步與資料",
    "关于与更新": "關於與更新"
  },
  "en": {
    "四科错题本": "Four-Subject Notebook",
    "高代 · 数分 · 解几 · 西经": "Alg. · Anal. · Geom. · Econ.",
    "总览": "Overview",
    "错题": "Mistakes",
    "模板库": "Templates",
    "题库": "Question Bank",
    "规范": "Conventions",
    "笔记库": "Notes",
    "期末复习": "Final Review",
    "高等代数": "Advanced Algebra",
    "数学分析": "Mathematical Analysis",
    "解析几何": "Analytic Geometry",
    "西方经济学": "Western Economics",
    "导出备份": "Export Backup",
    "手动新增": "Add Manually",
    "智能录入": "Smart Entry",
    "去题库": "Question Bank",
    "导入": "Import",
    "导出": "Export",
    "保存": "Save",
    "取消": "Cancel",
    "删除": "Delete",
    "编辑": "Edit",
    "关闭": "Close",
    "新建": "New",
    "扫描": "Scan",
    "设置": "Settings",
    "语言": "Language",
    "主题": "Theme",
    "更新记录": "Changelog",
    "最近更新": "Latest Update",
    "历史更新": "Past Updates",
    "首页": "Home",
    "搜索题目 / 知识点": "Search questions / topics",
    "已掌握": "Mastered",
    "未掌握": "Not Mastered",
    "全部": "All",
    "模板": "Template",
    "笔记": "Notes",
    "先按自己的节奏来": "Go at your own pace",
    "欢迎回来": "Welcome back",
    "设置与同步": "Settings & Sync",
    "外观与称呼": "Appearance & Name",
    "AI与智能录入": "AI & Smart Entry",
    "同步与数据": "Sync & Data",
    "关于与更新": "About & Updates"
  },
  "fr": {
    "四科错题本": "Cahier des quatre matières",
    "高代 · 数分 · 解几 · 西经": "Alg. · Anal. · Géom. · Écon.",
    "总览": "Vue d’ensemble",
    "错题": "Erreurs",
    "模板库": "Modèles",
    "题库": "Banque de questions",
    "规范": "Conventions",
    "笔记库": "Notes",
    "期末复习": "Révision finale",
    "高等代数": "Algèbre avancée",
    "数学分析": "Analyse mathématique",
    "解析几何": "Géométrie analytique",
    "西方经济学": "Économie occidentale",
    "导出备份": "Exporter la sauvegarde",
    "手动新增": "Ajouter manuellement",
    "智能录入": "Saisie intelligente",
    "去题库": "Banque de questions",
    "导入": "Importer",
    "导出": "Exporter",
    "保存": "Enregistrer",
    "取消": "Annuler",
    "删除": "Supprimer",
    "编辑": "Modifier",
    "关闭": "Fermer",
    "新建": "Nouveau",
    "扫描": "Scanner",
    "设置": "Paramètres",
    "语言": "Langue",
    "主题": "Thème",
    "更新记录": "Journal des mises à jour",
    "最近更新": "Dernières mises à jour",
    "历史更新": "Mises à jour précédentes",
    "首页": "Accueil",
    "搜索题目 / 知识点": "Rechercher des questions / notions",
    "已掌握": "Maîtrisé",
    "未掌握": "Non maîtrisé",
    "全部": "Tout",
    "模板": "Modèle",
    "笔记": "Notes",
    "先按自己的节奏来": "À votre rythme",
    "欢迎回来": "Bon retour",
    "设置与同步": "Paramètres et synchronisation",
    "外观与称呼": "Apparence et nom",
    "AI与智能录入": "IA et saisie intelligente",
    "同步与数据": "Synchronisation et données",
    "关于与更新": "À propos et mises à jour"
  },
  "de": {
    "四科错题本": "Vier-Fächer-Notizbuch",
    "高代 · 数分 · 解几 · 西经": "Alg. · Anal. · Geom. · Ökon.",
    "总览": "Übersicht",
    "错题": "Fehler",
    "模板库": "Vorlagen",
    "题库": "Fragenpool",
    "规范": "Konventionen",
    "笔记库": "Notizen",
    "期末复习": "Prüfung",
    "高等代数": "Höhere Algebra",
    "数学分析": "Analysis",
    "解析几何": "Analytische Geometrie",
    "西方经济学": "Westliche Ökonomie",
    "导出备份": "Sicherung exportieren",
    "手动新增": "Manuell hinzufügen",
    "智能录入": "Intelligente Eingabe",
    "去题库": "Zum Fragenpool",
    "导入": "Importieren",
    "导出": "Exportieren",
    "保存": "Speichern",
    "取消": "Abbrechen",
    "删除": "Löschen",
    "编辑": "Bearbeiten",
    "关闭": "Schließen",
    "新建": "Neu",
    "扫描": "Scannen",
    "设置": "Einstellungen",
    "语言": "Sprache",
    "主题": "Design",
    "更新记录": "Änderungsprotokoll",
    "最近更新": "Neueste Änderungen",
    "历史更新": "Frühere Änderungen",
    "首页": "Startseite",
    "搜索题目 / 知识点": "Fragen / Konzepte suchen",
    "已掌握": "Beherrscht",
    "未掌握": "Nicht beherrscht",
    "全部": "Alle",
    "模板": "Vorlage",
    "笔记": "Notizen",
    "先按自己的节奏来": "In Ihrem eigenen Tempo",
    "欢迎回来": "Willkommen zurück",
    "设置与同步": "Einstellungen & Synchronisierung",
    "外观与称呼": "Darstellung & Name",
    "AI与智能录入": "KI & intelligente Eingabe",
    "同步与数据": "Synchronisierung & Daten",
    "关于与更新": "Info & Updates"
  },
  "ja": {
    "四科错题本": "四科目ノート",
    "高代 · 数分 · 解几 · 西经": "線形 · 解析 · 幾何 · 経済",
    "总览": "概要",
    "错题": "誤答",
    "模板库": "テンプレート",
    "题库": "問題バンク",
    "规范": "ガイドライン",
    "笔记库": "ノート",
    "期末复习": "期末対策",
    "高等代数": "線形代数学",
    "数学分析": "数学解析",
    "解析几何": "解析幾何学",
    "西方经济学": "西洋経済学",
    "导出备份": "バックアップ書き出し",
    "手动新增": "手動追加",
    "智能录入": "スマート入力",
    "去题库": "問題バンクへ",
    "导入": "インポート",
    "导出": "エクスポート",
    "保存": "保存",
    "取消": "キャンセル",
    "删除": "削除",
    "编辑": "編集",
    "关闭": "閉じる",
    "新建": "新規",
    "扫描": "スキャン",
    "设置": "設定",
    "语言": "言語",
    "主题": "テーマ",
    "更新记录": "更新履歴",
    "最近更新": "最新の更新",
    "历史更新": "過去の更新",
    "首页": "ホーム",
    "搜索题目 / 知识点": "問題 / 用語を検索",
    "已掌握": "習得済み",
    "未掌握": "未習得",
    "全部": "すべて",
    "模板": "テンプレート",
    "笔记": "ノート",
    "先按自己的节奏来": "自分のペースで進めましょう",
    "欢迎回来": "おかえりなさい",
    "设置与同步": "設定と同期",
    "外观与称呼": "外観と呼称",
    "AI与智能录入": "AI とスマート入力",
    "同步与数据": "同期とデータ",
    "关于与更新": "このアプリと更新"
  },
  "ko": {
    "四科错题本": "사과목 노트",
    "高代 · 数分 · 解几 · 西经": "대수 · 해석 · 기하 · 경제",
    "总览": "개요",
    "错题": "오답",
    "模板库": "템플릿",
    "题库": "문제 은행",
    "规范": "규칙",
    "笔记库": "노트",
    "期末复习": "기말 복습",
    "高等代数": "고급 대수학",
    "数学分析": "수학적 해석학",
    "解析几何": "해석 기하학",
    "西方经济学": "서양 경제학",
    "导出备份": "백업 내보내기",
    "手动新增": "수동 추가",
    "智能录入": "스마트 입력",
    "去题库": "문제 은행으로",
    "导入": "가져오기",
    "导出": "내보내기",
    "保存": "저장",
    "取消": "취소",
    "删除": "삭제",
    "编辑": "편집",
    "关闭": "닫기",
    "新建": "새로 만들기",
    "扫描": "스캔",
    "设置": "설정",
    "语言": "언어",
    "主题": "테마",
    "更新记录": "업데이트 기록",
    "最近更新": "최신 업데이트",
    "历史更新": "지난 업데이트",
    "首页": "홈",
    "搜索题目 / 知识点": "문제 / 개념 검색",
    "已掌握": "습득",
    "未掌握": "미습득",
    "全部": "전체",
    "模板": "템플릿",
    "笔记": "노트",
    "先按自己的节奏来": "자신의 속도로 진행하세요",
    "欢迎回来": "다시 오신 것을 환영합니다",
    "设置与同步": "설정 및 동기화",
    "外观与称呼": "화면과 이름",
    "AI与智能录入": "AI 및 스마트 입력",
    "同步与数据": "동기화 및 데이터",
    "关于与更新": "정보 및 업데이트"
  },
  "pt": {
    "四科错题本": "Caderno de quatro disciplinas",
    "高代 · 数分 · 解几 · 西经": "Álg. · Anál. · Geom. · Econ.",
    "总览": "Visão geral",
    "错题": "Erros",
    "模板库": "Modelos",
    "题库": "Banco de questões",
    "规范": "Convenções",
    "笔记库": "Notas",
    "期末复习": "Revisão final",
    "高等代数": "Álgebra avançada",
    "数学分析": "Análise matemática",
    "解析几何": "Geometria analítica",
    "西方经济学": "Economia ocidental",
    "导出备份": "Exportar backup",
    "手动新增": "Adicionar manualmente",
    "智能录入": "Entrada inteligente",
    "去题库": "Banco de questões",
    "导入": "Importar",
    "导出": "Exportar",
    "保存": "Salvar",
    "取消": "Cancelar",
    "删除": "Excluir",
    "编辑": "Editar",
    "关闭": "Fechar",
    "新建": "Novo",
    "扫描": "Digitalizar",
    "设置": "Configurações",
    "语言": "Idioma",
    "主题": "Tema",
    "更新记录": "Registro de atualizações",
    "最近更新": "Atualizações recentes",
    "历史更新": "Atualizações anteriores",
    "首页": "Início",
    "搜索题目 / 知识点": "Pesquisar questões / conceitos",
    "已掌握": "Dominado",
    "未掌握": "Não dominado",
    "全部": "Tudo",
    "模板": "Modelo",
    "笔记": "Notas",
    "先按自己的节奏来": "No seu próprio ritmo",
    "欢迎回来": "Bem-vindo de volta",
    "设置与同步": "Configurações e sincronização",
    "外观与称呼": "Aparência e nome",
    "AI与智能录入": "IA e entrada inteligente",
    "同步与数据": "Sincronização e dados",
    "关于与更新": "Sobre e atualizações"
  },
  "ru": {
    "四科错题本": "Тетрадь по четырём предметам",
    "高代 · 数分 · 解几 · 西经": "Алг. · Ан. · Геом. · Экон.",
    "总览": "Обзор",
    "错题": "Ошибки",
    "模板库": "Шаблоны",
    "题库": "Банк вопросов",
    "规范": "Правила",
    "笔记库": "Заметки",
    "期末复习": "Экзамен",
    "高等代数": "Высшая алгебра",
    "数学分析": "Математический анализ",
    "解析几何": "Аналитическая геометрия",
    "西方经济学": "Западная экономика",
    "导出备份": "Экспорт резервной копии",
    "手动新增": "Добавить вручную",
    "智能录入": "Умный ввод",
    "去题库": "В банк вопросов",
    "导入": "Импорт",
    "导出": "Экспорт",
    "保存": "Сохранить",
    "取消": "Отмена",
    "删除": "Удалить",
    "编辑": "Изменить",
    "关闭": "Закрыть",
    "新建": "Создать",
    "扫描": "Сканировать",
    "设置": "Настройки",
    "语言": "Язык",
    "主题": "Тема",
    "更新记录": "История обновлений",
    "最近更新": "Последние обновления",
    "历史更新": "Прошлые обновления",
    "首页": "Главная",
    "搜索题目 / 知识点": "Поиск вопросов / понятий",
    "已掌握": "Освоено",
    "未掌握": "Не освоено",
    "全部": "Все",
    "模板": "Шаблон",
    "笔记": "Заметки",
    "先按自己的节奏来": "В своём темпе",
    "欢迎回来": "С возвращением",
    "设置与同步": "Настройки и синхронизация",
    "外观与称呼": "Оформление и имя",
    "AI与智能录入": "ИИ и умный ввод",
    "同步与数据": "Синхронизация и данные",
    "关于与更新": "О приложении и обновления"
  },
  "es": {
    "四科错题本": "Cuaderno de cuatro materias",
    "高代 · 数分 · 解几 · 西经": "Álg. · Anál. · Geom. · Econ.",
    "总览": "Resumen",
    "错题": "Errores",
    "模板库": "Plantillas",
    "题库": "Banco de preguntas",
    "规范": "Convenciones",
    "笔记库": "Notas",
    "期末复习": "Repaso final",
    "高等代数": "Álgebra avanzada",
    "数学分析": "Análisis matemático",
    "解析几何": "Geometría analítica",
    "西方经济学": "Economía occidental",
    "导出备份": "Exportar copia de seguridad",
    "手动新增": "Añadir manualmente",
    "智能录入": "Entrada inteligente",
    "去题库": "Banco de preguntas",
    "导入": "Importar",
    "导出": "Exportar",
    "保存": "Guardar",
    "取消": "Cancelar",
    "删除": "Eliminar",
    "编辑": "Editar",
    "关闭": "Cerrar",
    "新建": "Nuevo",
    "扫描": "Escanear",
    "设置": "Ajustes",
    "语言": "Idioma",
    "主题": "Tema",
    "更新记录": "Registro de cambios",
    "最近更新": "Últimas actualizaciones",
    "历史更新": "Actualizaciones anteriores",
    "首页": "Inicio",
    "搜索题目 / 知识点": "Buscar preguntas / conceptos",
    "已掌握": "Dominado",
    "未掌握": "No dominado",
    "全部": "Todo",
    "模板": "Plantilla",
    "笔记": "Notas",
    "先按自己的节奏来": "A tu propio ritmo",
    "欢迎回来": "Bienvenido de nuevo",
    "设置与同步": "Ajustes y sincronización",
    "外观与称呼": "Apariencia y nombre",
    "AI与智能录入": "IA y entrada inteligente",
    "同步与数据": "Sincronización y datos",
    "关于与更新": "Acerca de y actualizaciones"
  }
};
var I18N_SHORT = {
  en: { "高代": "Adv. Algebra", "数分": "Math. Analysis", "解几": "Analytic Geom.", "西经": "Western Econ." },
  fr: { "高代": "Alg. av.", "数分": "Anal. math.", "解几": "Géom. anal.", "西经": "Écon. occ." },
  de: { "高代": "Höhere Alg.", "数分": "Analysis", "解几": "Analyt. Geom.", "西经": "Westl. Ökon." },
  ja: { "高代": "線形代数", "数分": "解析学", "解几": "解析幾何", "西经": "西洋経済" },
  ko: { "高代": "고급 대수", "数分": "해석학", "解几": "해석기하", "西经": "서구경제" },
  pt: { "高代": "Álg. Av.", "数分": "Anál. Mat.", "解几": "Geom. Anal.", "西经": "Econ. Oc." },
  ru: { "高代": "Высш. алг.", "数分": "Мат. анализ", "解几": "Аналит. геом.", "西经": "Зап. экон." },
  es: { "高代": "Álg. Av.", "数分": "Anál. Mat.", "解几": "Geom. Anal.", "西经": "Econ. Occ." },
  "zh-TW": { "高代": "高代", "数分": "數分", "解几": "解幾", "西经": "西經" }
};
var I18N_STYLE = {
  "en": "Standard academic English for problems, solutions, explanations and notes; UI labels in sentence case; welcome, guidance and confirmation copy in a calm, warm, plain second person; natural software and textbook terms, not literal Chinese calques.",
  "fr": "Français académique soutenu pour les énoncés, corrigés, démonstrations et notes ; libellés d’interface en casse de phrase ; textes d’accueil, d’aide et de confirmation au ton calme, chaleureux et au vouvoiement naturel, sans exclamation.",
  "de": "Wissenschaftliches Deutsch für Aufgaben, Lösungen, Erklärungen und Notizen; UI-Beschriftungen gemäß deutscher Softwarekonventionen; Begrüßungs-, Hinweis- und Bestätigungstexte ruhig, freundlich und in natürlicher Sie-Form, ohne Ausrufezeichen.",
  "ja": "問題・解答・解説・ノートは日本語の学術文体。UI は名詞止めで簡潔に。歓迎・案内・確認文は落ち着いた丁寧語（です・ます）で、威圧感や過剰な敬語を避ける。",
  "ko": "문제·풀이·해설·노트는 한국어 학술 문체. UI는 명사형으로 간결하게. 환영·안내·확인 문구는 차분한 존댓말로, 과도한 격식이나 명령조를 피한다.",
  "pt": "Português acadêmico formal para enunciados, resoluções, demonstrações e notas; rótulos de interface em caixa de frase; textos de boas-vindas, orientação e confirmação em tom calmo, acolhedor e segunda pessoa natural.",
  "ru": "Академический русский язык для условий, решений, доказательств и заметок; подписи интерфейса в форме существительных; приветствия, подсказки и подтверждения — спокойный, доброжелательный тон, естественное обращение на «вы».",
  "es": "Español académico formal para enunciados, soluciones, demostraciones y notas; etiquetas de interfaz en minúscula inicial; textos de bienvenida, ayuda y confirmación en tono tranquilo, cercano y segunda persona natural.",
  "zh-TW": "題目、證明、解答與筆記使用學術書面語；歡迎、提醒與詢問使用溫和親切的第二人稱；介面名詞簡潔，避免中國大陸特有譯法與直譯。"
};

function i18nLoad() {
  if (i18nMemory) return i18nMemory;
  ['sanke-i18n-cache-v10','sanke-i18n-cache-v9','sanke-i18n-cache-v8','sanke-i18n-cache-v7','sanke-i18n-cache-v6'].forEach(function (k) { safeStorage.remove(k); });
  i18nMemory = safeStorage.getJSON(I18N_KEY, {}) || {};
  i18nSeedUI();
  return i18nMemory;
}

function i18nFor(language) {
  var all = i18nLoad();
  var id = language || (state.prefs && state.prefs.lang) || 'zh-CN';
  if (!all[id] || typeof all[id] !== 'object') all[id] = {};
  return all[id];
}

function i18nSave() {
  return safeStorage.setJSON(I18N_KEY, i18nMemory || {});
}

function i18nSeedUI() {
  if (!i18nMemory) i18nMemory = {};
  Object.keys(I18N_UI).forEach(function (lang) {
    var target = i18nMemory[lang] || (i18nMemory[lang] = {});
    var dict = I18N_UI[lang];
    Object.keys(dict).forEach(function (key) {
      if (target[key] == null || target[key] === '' || key === '高代 · 数分 · 解几 · 西经' || key === '四科错题本') target[key] = dict[key];
    });
  });
  Object.keys(I18N_SHORT).forEach(function (lang) {
    var target = i18nMemory[lang] || (i18nMemory[lang] = {});
    var dict = I18N_SHORT[lang];
    Object.keys(dict).forEach(function (key) { target[key] = dict[key]; });
  });
}

function i18nNeeds() {
  var lang = (state.prefs && state.prefs.lang) || 'zh-CN';
  return lang !== 'zh-CN';
}

function i18nSkip(el) {
  if (!el || el.nodeType !== 1) return false;
  if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|CODE|PRE|KBD|MATH)$/.test(el.tagName)) return true;
  if (el.closest('[data-no-i18n], .notranslate, .note-canvas-wrap, .kb-editor, .brand-seal, .hne-seal, .note-book-initial')) return true;
  return false;
}

function i18nWalk(root, visitor) {
  if (!root) return;
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      if (!node.nodeValue || !/[\u3400-\u9fff]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      if (!node.parentNode || i18nSkip(node.parentNode)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(visitor);
}

function i18nNormalizeSkillName(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\/linear-algebra\b/g, '/advanced-algebra')
    .replace(/(^|[^A-Za-z0-9_-])linear-algebra\b/g, '$1advanced-algebra');
}

function i18nNormalizeTypography(value) {
  var lang = (state.prefs && state.prefs.lang) || 'zh-CN';
  if (!/^(en|fr|de|ko|pt|ru|es)$/.test(lang) || typeof value !== 'string') return value;
  return value
    .replace(/§\s*(\d)/g, '§ $1')
    .replace(/\b(Chapter|Chapitre|Kapitel|Capítulo|Глава)\s+(\d+)\s+(?=\p{L})/gu, '$1 $2: ')
    .replace(/\bmaximal linearly independent set\b/gi, function (m) { return /^M/.test(m) ? 'Maximal linearly independent subset' : 'maximal linearly independent subset'; })
    .replace(/\blinearly independent set\b/gi, function (m) { return /^L/.test(m) ? 'Linearly independent subset' : 'linearly independent subset'; })
    .replace(/[ \t]{2,}/g, ' ');
}

function i18nNormalizeSkillNode(value, el) {
  if (el && el.closest && el.closest('#changelogBody')) return value;
  return i18nNormalizeTypography(i18nNormalizeSkillName(value));
}

function i18nFixInlineSpacing(root) {
  var lang = (state.prefs && state.prefs.lang) || 'zh-CN';
  if (!/^(en|fr|de|ko|pt|ru|es)$/.test(lang)) return;
  var scope = root || document.body;
  if (!scope || !scope.querySelectorAll) return;
  i18nApplying = true;
  Array.prototype.forEach.call(scope.querySelectorAll('b, strong, em, a'), function (el) {
    var text = (el.textContent || '').trim();
    if (!text) return;
    var prev = el.previousSibling;
    if (prev && prev.nodeType === 3) {
      var pv = prev.nodeValue || '';
      if (pv && !/\s$/.test(pv) && !/[(\[{（【]$/.test(pv) && /^[\p{L}\p{N}]/u.test(text)) {
        prev.nodeValue = pv + ' ';
      }
    }
    var next = el.nextSibling;
    if (next && next.nodeType === 3) {
      var nv = next.nodeValue || '';
      if (nv && !/^\s/.test(nv) && !/^[.,;:!?%)\]}]/u.test(nv) && /[\p{L}\p{N}]$/u.test(text)) {
        next.nodeValue = ' ' + nv;
      }
    }
  });
    // Remove spaces before punctuation in translated inline labels.
    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, null);
    var textNode;
    while ((textNode = walker.nextNode())) {
      var parent = textNode.parentNode;
      if (!parent || !parent.tagName) continue;
      if (/^(SCRIPT|STYLE|PRE|CODE|TEXTAREA)$/.test(parent.tagName)) continue;
      if (parent.closest && parent.closest('.notranslate, [data-no-i18n]')) continue;
      var beforePunct = lang === 'fr' ? ',，.。' : ':：;；,，.。!?！？、';
      var originalText = textNode.nodeValue;
      var fixedText = originalText
        .replace(/：/g, ':')
        .replace(/；/g, ';')
        .replace(/，/g, ',')
        .replace(/。/g, '.')
        .replace(/！/g, '!')
        .replace(/？/g, '?')
        .replace(/、/g, ',')
        .replace(/（/g, '(')
        .replace(/）/g, ')')
        .replace(/([:;,])(?=[\p{L}])/gu, '$1 ')
        .replace(/([!?])(?=[\p{L}])/gu, '$1 ')
        .replace(/\.(?=[\p{Lu}\p{Lt}])/gu, '. ')
        .replace(new RegExp('[ \\t\\u00a0]+(?=[' + beforePunct + '])', 'g'), '')
        .replace(/[ \t\u00a0]+(?=[)）\]】」』”’])/g, '');
      if (fixedText !== originalText) textNode.nodeValue = fixedText;
    }
  i18nApplying = false;
}

function i18nSplit(text) {
  var m = String(text).match(/^(\s*)([\s\S]*?)(\s*)$/);
  return { lead: m ? m[1] : '', key: m ? m[2] : text, tail: m ? m[3] : '' };
}

function i18nPriority(key) {
  return key.length <= 52 ? 2 : 1;
}

function i18nCollectAttrs(root, cache, full) {
  var els = (root || document.body).querySelectorAll('[placeholder], [title], [aria-label]');
  Array.prototype.forEach.call(els, function (el) {
    if (el.closest('[data-no-i18n], .notranslate, .brand, .home-brand')) return;
    if (!full && !i18nInViewport(el)) return;
    ['placeholder', 'title', 'aria-label'].forEach(function (attrName) {
      var raw = el.getAttribute(attrName);
      if (!raw || !/[\u3400-\u9fff]/.test(raw) || raw.trim().length < 2) return;
      if (el.__i18nAttrDone && el.__i18nAttrDone[attrName]) return;
      var parts = i18nSplit(raw);
      if (!el.__i18nAttrSource) el.__i18nAttrSource = {};
      if (el.__i18nAttrSource[attrName] == null) el.__i18nAttrSource[attrName] = raw;
      var hit = i18nNormalizeSkillNode(cache[parts.key], el);
      if (hit) {
        if (hit !== cache[parts.key]) cache[parts.key] = hit;
        el.setAttribute(attrName, parts.lead + hit + parts.tail);
        el.__i18nAttrDone = el.__i18nAttrDone || {};
        el.__i18nAttrDone[attrName] = true;
        return;
      }
      if (i18nQueue.some(function (q) { return q.el === el && q.attr === attrName; })) return;
      i18nQueue.push({ el: el, attr: attrName, key: parts.key, lead: parts.lead, tail: parts.tail, priority: 2 });
    });
  });
}

function i18nInViewport(el) {
  try {
    if (!el || !el.isConnected || !el.getClientRects().length) return false;
    var r = el.getBoundingClientRect();
    return r.bottom > -500 && r.top < (window.innerHeight + 700);
  } catch (e) { return false; }
}

function i18nTakeBatch() {
  if (!i18nQueue.length) return [];
  i18nQueue.sort(function (a, b) {
    return (b.priority || 0) - (a.priority || 0) || String(a.key).length - String(b.key).length;
  });
  var longText = String((i18nQueue[0] && i18nQueue[0].key) || '').length > 240;
  var maxBatch = longText ? 6 : ((i18nQueue[0] && i18nQueue[0].priority >= 2) ? 48 : 20);
  var maxChars = longText ? 4200 : 3600;
  var batch = [], chars = 0;
  while (i18nQueue.length && batch.length < maxBatch) {
    var next = i18nQueue.shift();
    if (next.node && !next.node.isConnected) continue;
    if (next.el && !next.el.isConnected) continue;
    if (chars + next.key.length > maxChars && batch.length) { i18nQueue.unshift(next); break; }
    batch.push(next); chars += next.key.length;
  }
  return batch;
}

function i18nScheduleFull(delay) {
  if (i18nFullTimer) clearTimeout(i18nFullTimer);
  i18nFullTimer = setTimeout(function () {
    i18nFullTimer = null;
    if (!i18nNeeds()) return;
    i18nCollect(document.body, true);
    if (i18nQueue.length && !i18nBusy) i18nFlush();
  }, delay || 1600);
}

function i18nScrollCollect() {
  if (!i18nNeeds()) return;
  if (i18nScrollTimer) clearTimeout(i18nScrollTimer);
  i18nScrollTimer = setTimeout(function () {
    i18nScrollTimer = null;
    i18nCollect(document.body, false);
    if (i18nQueue.length && !i18nBusy) i18nFlush();
  }, 110);
}

function i18nCollect(root, full) {
  if (!i18nNeeds()) {
    if (root === document.body && i18nDocTitleSource != null) document.title = i18nDocTitleSource;
    return;
  }
  var cache = i18nFor();
  if (root === document.body) i18nCollectDocumentTitle();
  i18nCollectAttrs(root || document.body, cache, full);
  i18nWalk(root || document.body, function (node) {
    if (node.__i18nDone) return;
    var parts = i18nSplit(node.nodeValue);
    var key = parts.key;
    if (!key || !/[\u3400-\u9fff]/.test(key)) return;
    if (!full && !i18nInViewport(node.parentNode)) return;
    var hit = i18nNormalizeSkillNode(cache[key], node.parentNode);
    if (hit) {
      if (hit !== cache[key]) cache[key] = hit;
      i18nApplying = true;
      if (node.__i18nSource == null) node.__i18nSource = node.nodeValue;
      node.nodeValue = parts.lead + hit + parts.tail;
      node.__i18nDone = true;
      i18nApplying = false;
      return;
    }
    if (i18nQueue.some(function (q) { return q.node === node; })) return;
    i18nQueue.push({ node: node, key: key, lead: parts.lead, tail: parts.tail, priority: i18nPriority(key) });
  });
  i18nFixInlineSpacing(root || document.body);
}

function i18nTitleSource() {
  if (i18nDocTitleSource == null) i18nDocTitleSource = document.title;
  return i18nDocTitleSource;
}

function i18nCollectDocumentTitle() {
  if (!i18nNeeds()) {
    if (i18nDocTitleSource != null) document.title = i18nDocTitleSource;
    return;
  }
  var source = i18nTitleSource();
  if (!source || !/[\u3400-\u9fff]/.test(source)) return;
  var cache = i18nFor();
  if (cache[source]) {
    document.title = cache[source];
    return;
  }
  if (i18nQueue.some(function (q) { return q.docTitle; })) return;
  i18nQueue.push({ docTitle: true, key: source, priority: 2 });
}

function i18nApplyTranslated(batch, translated, langId, epoch) {
  if (epoch != null && epoch !== i18nEpoch) return;
  if (langId && langId !== ((state.prefs && state.prefs.lang) || 'zh-CN')) return;
  var cache = i18nFor(langId || undefined);
  for (var i = 0; i < batch.length; i++) {
    var item = batch[i];
    var value = i18nNormalizeSkillNode(translated[i], item.el || (item.node && item.node.parentNode));
    if (typeof value !== 'string' || !value.trim()) continue;
    cache[item.key] = value;
    if (item.docTitle) {
      if (document.title === item.key) document.title = value;
      continue;
    }
    if (item.el) {
      if (!item.el.__i18nAttrSource) item.el.__i18nAttrSource = {};
      if (item.el.__i18nAttrSource[item.attr] == null) item.el.__i18nAttrSource[item.attr] = item.lead + item.key + item.tail;
      if (item.el.isConnected && item.el.getAttribute(item.attr) && i18nSplit(item.el.getAttribute(item.attr)).key === item.key) {
        item.el.setAttribute(item.attr, item.lead + value + item.tail);
        item.el.__i18nAttrDone = item.el.__i18nAttrDone || {};
        item.el.__i18nAttrDone[item.attr] = true;
      }
      continue;
    }
    if (item.node && item.node.isConnected && item.node.nodeValue && i18nSplit(item.node.nodeValue).key === item.key) {
      i18nApplying = true;
      if (item.node.__i18nSource == null) item.node.__i18nSource = item.lead + item.key + item.tail;
      item.node.nodeValue = item.lead + value + item.tail;
      item.node.__i18nDone = true;
      i18nApplying = false;
    }
  }
  i18nFixInlineSpacing(document.body);
  i18nSave();
}

function i18nParseArray(text) {
  var s = String(text || '').trim();
  var fence = String.fromCharCode(96, 96, 96);
  if (s.slice(0, fence.length) === fence) s = s.slice(fence.length).replace(/^[a-zA-Z]+\s*/, '');
  var endFence = s.lastIndexOf(fence);
  if (endFence >= 0) s = s.slice(0, endFence);
  s = s.trim();
  var a = s.indexOf('['), b = s.lastIndexOf(']');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  var arr = JSON.parse(s);
  return Array.isArray(arr) ? arr : [];
}

function i18nScheduleRetry() {
  if (i18nRetryTimer) clearTimeout(i18nRetryTimer);
  if (!i18nRetryHold.length) return;
  var delay = i18nRetryDelay;
  i18nRetryTimer = setTimeout(function () {
    i18nRetryTimer = null;
    if (!i18nNeeds()) return;
    if (!i18nRetryHold.length) return;
    i18nQueue = i18nRetryHold.concat(i18nQueue);
    i18nRetryHold = [];
    i18nRetryDelay = Math.min(30000, Math.round(i18nRetryDelay * 1.7));
    if (i18nQueue.length && !i18nBusy) i18nFlush();
  }, delay);
}

async function i18nFlush() {
  if (i18nBusy || !i18nNeeds() || !i18nQueue.length) return;
  if (typeof aiConfigReady !== 'function' || !aiConfigReady()) {
    if (i18nQueue.length) {
      i18nRetryHold = i18nQueue.concat(i18nRetryHold);
      i18nQueue = [];
      i18nScheduleRetry();
    }
    if (!i18nNoApiNotice) {
      i18nNoApiNotice = true;
      toast('语言已保存；AI 服务恢复后会自动继续翻译');
    }
    return;
  }
  (function () {
    var seen = {}, cache = i18nFor();
    i18nQueue = i18nQueue.filter(function (x) {
      if (!x || !x.key || cache[x.key] || seen[x.key]) return false;
      seen[x.key] = 1;
      return true;
    });
    i18nRetryHold = i18nRetryHold.filter(function (x) {
      if (!x || !x.key || cache[x.key] || seen[x.key]) return false;
      seen[x.key] = 1;
      return true;
    });
  })();
  i18nBusy = true;
  var epoch = i18nEpoch;
  var langId = (state.prefs && state.prefs.lang) || 'zh-CN';
  document.documentElement.setAttribute('data-i18n-busy', 'true');
  var langName = languageName(langId);
  var style = I18N_STYLE[langId] || I18N_STYLE.en;
  var system = [
    '你是学术出版级本地化译者，长期翻译数学、统计、经济学教材与期刊论文。把输入 JSON 数组中的每一条中文翻译成' + langName + '。',
    '0. 目标语言风格：' + style + ' 界面短词用目标语言软件与教材的惯用术语，标题和导航简洁，不逐字直译；正文保持正式学术书面语。',
    '0.1 文风分轨：题目、证明、解答、解析、模板、知识要点、错因分析使用正式、准确、克制的学术书面语，术语按目标语言教材与期刊惯例；不用网络口语、卖萌、感叹号或表情。',
    '0.1a 学术文风硬约束：题目、证明、解答、解析、模板、知识要点、错因分析必须使用教材、专著与期刊论文的正式书面语；禁止口语化、网络用语、聊天语气、第二人称闲聊、感叹句、反问句、比喻、夸张和表情。禁止“我们很容易看出”“显而易见”“其实”“大概”“随便”“说白了”等表达，也禁止英语 gonna / wanna / kinda / stuff / a lot of / let’s / don’t / can’t，法语 du coup / genre / en fait，德语 halt / mal eben，日语 ～だよね / ～じゃん，韩语 ～잖아요 / ～네요 等口语标记。',
    '0.1b 解题文本使用规范连接：设、若、则、由……可得、因此、故、从而、证毕；答案以“解：”或“证明：”开头，结尾明确写出结论。不得省略条件、量词、逻辑连接，也不得把步骤改写成口语解释。',
    '0.1c 各语言的学术体例：英语用无缩写的正式学术英语；法语用 soutenu 书面体；德语用 wissenschaftliches Deutsch；日语用だ・である体；韩语用문어체；西语、葡语、俄语用正式学术书面体；繁体中文用书面语，避免口语助词与网络用语。',
    '0.2 欢迎、提醒、询问、空状态、确认和引导文案使用温和、亲切、具体的语气；采用目标语言自然的第二人称与礼貌层级，不命令、不责备、不夸张承诺，不添加原文没有的感叹号或表情。',
    '0.3 同一批文本可能混合两类：逐条按原文语气判断，不得把所有句子统一成学术腔，也不得把题目写成寒暄。',
    '0.4 翻译是改写而非解释：不增删条件、结论、步骤、警告与限制，保留原文的确定程度。',
    '1. 术语以目标语言的标准教材、权威期刊、出版社译本为准；同一术语全篇统一，不得自造或同义词漂移。以下英文仅供定位概念，不要照抄英文，按目标语言的标准术语输出：',
    '线性代数：极大无关组/极大线性无关组 maximal linearly independent set；线性表出/表出 express as a linear combination；秩 rank；行最简形 reduced row echelon form；线性空间/子空间 linear space/subspace；基/标准基 basis/standard basis；维数 dimension；核/像 kernel/image；过渡矩阵 transition matrix；特征多项式/最小多项式 characteristic/minimal polynomial；若尔当标准形 Jordan canonical form；有理标准形 rational canonical form；二次型 quadratic form；合同 congruent；相似 similar；正定/半正定 positive definite/semidefinite；顺序主子式 leading principal minor；欧几里得空间 Euclidean space；正交补 orthogonal complement；双线性函数 bilinear form；辛空间 symplectic space；线性相关/无关 linearly dependent/independent；基础解系 fundamental system of solutions；通解/特解 general/particular solution；齐次/非齐次 homogeneous/nonhomogeneous；解空间 solution space；直和 direct sum。',
    '数学分析：极限 limit；连续/一致连续 continuity/uniform continuity；聚点 accumulation point；上/下确界 supremum/infimum；数列 sequence；柯西序列 Cauchy sequence；级数 series；收敛/绝对收敛/条件收敛/一致收敛 convergence/absolute/conditional/uniform convergence；幂级数 power series；傅里叶级数 Fourier series；泰勒展开/泰勒公式 Taylor expansion/Taylor formula；拉格朗日中值定理 Lagrange mean value theorem；洛必达法则 L’Hôpital’s rule；反常积分 improper integral；重积分 multiple integral；曲线/曲面积分 line/surface integral；格林/高斯/斯托克斯公式 Green/Gauss/Stokes theorem；原函数 antiderivative；换元积分/分部积分 integration by substitution/by parts；方向导数 directional derivative；梯度 gradient；条件极值 constrained extremum；拉格朗日乘数 Lagrange multiplier。',
    '解析几何：数量积 dot product；向量积 cross product；混合积 scalar triple product；仿射变换 affine transformation；二次曲线 conic；二次曲面 quadric surface；渐近方向 asymptotic direction；主方向 principal direction；不变量 invariant；柱面/锥面/旋转曲面 cylinder/cone/surface of revolution；单叶双曲面 hyperboloid of one sheet；双曲抛物面 hyperbolic paraboloid；母线 generatrix；准线 directrix；点法式 point-normal form；一般式 general form；平面束 pencil of planes；参数方程 parametric equation；法向量 normal vector；夹角 angle；距离 distance。',
    '西方经济学：需求/供给价格弹性 price elasticity of demand/supply；需求/供给函数 demand/supply function；均衡价格/数量 equilibrium price/quantity；消费者/生产者剩余 consumer/producer surplus；无谓损失 deadweight loss；税负归宿 tax incidence；机会成本 opportunity cost；边际成本/平均成本 marginal/average cost；收入效应/替代效应 income/substitution effect；无差异曲线 indifference curve；预算约束 budget constraint；替代品/互补品 substitutes/complements；正常品/劣等品 normal/inferior good；吉芬商品 Giffen good；规模经济/不经济 economies/diseconomies of scale；外部性 externality；公共物品 public good；道德风险/逆向选择 moral hazard/adverse selection；价格歧视 price discrimination；纳什均衡 Nash equilibrium；囚徒困境 prisoners’ dilemma；科斯定理 Coase theorem；国内生产总值 GDP；通货膨胀 inflation；财政政策/货币政策 fiscal/monetary policy；乘数 multiplier；菲利普斯曲线 Phillips curve。',
    '2. 正文用正式、准确的学术书面语；长句按目标语言学术写作重组，但不增删条件、结论、证明步骤。界面按钮、标签、导航等短词用简洁自然的 UI 用语。',
    '3. 定理、证明、定义、例、推论、引理等标题按目标语言教材惯例翻译并保持一致；保留编号、引用、文献格式、单位与符号。',
    '4. 保留 LaTeX（$...$、$$...$$）、Markdown、代码、数字、URL；变量名、函数名、矩阵名、集合符号不翻译；不把数学表达式改写成自然语言。',
    '5. 人名、书名、机构名按目标语言学术惯例；无通行译名时保留原文并首次括注；不要音译后当作标准术语。',
    '6. 若原文已经是目标语言或纯公式/数字/符号，原样返回。',
    '7. 输出前逐条自检：术语是否符合目标语言教材惯例、文体是否统一、公式与编号是否完整、是否漏译或误译数学对象；不合格先改写再输出。',
    '8. 外文界面中的分隔符（·、/、—、×）按目标语言排版习惯与前后词留出空格；路径、URL、公式和技能名中的符号不额外加空格。',
    '9. 技能名 /advanced-algebra 必须原样保留，不得翻译、拆词或写成 /linear-algebra。',
    '10. 数学章节写成“Chapter N: Title”这类目标语言规范格式，节号写成“§ N”；术语用 maximal linearly independent subset / linearly independent subset；公式变量不得省略。',
    '11. 严格返回同样长度的 JSON 字符串数组，不要解释、不要代码围栏；不要遗漏任何一条。',
    '12. 文本中的 ⟦M0⟧、⟦M1⟧ 等是公式占位符，必须原样保留，不得翻译、改写、增删空格或包裹代码；译文中的占位符数量必须与原文一致。'
  ].join('\n');

  function i18nCjkCount(text) {
    var m = String(text || '').match(/[\u3400-\u9fff]/g);
    return m ? m.length : 0;
  }

  function i18nMathParts(text) {
    var out = [];
    var re = /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]*\$/g;
    var m;
    while ((m = re.exec(String(text || '')))) out.push(m[0].replace(/\s+/g, ''));
    return out;
  }

  function i18nProtectMath(text) {
    var store = [];
    var out = String(text || '').replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g, function (m) {
      store.push(m);
      return '⟦M' + (store.length - 1) + '⟧';
    });
    return { text: out, store: store };
  }

  function i18nRestoreMath(text, store) {
    if (!store || !store.length) return text;
    return String(text || '').replace(/⟦M(\d+)⟧/g, function (m, i) {
      return store[+i] != null ? store[+i] : m;
    });
  }

  function i18nValidateBatch(batch, translated, langId) {
    var checkChinese = langId !== 'zh-TW' && langId !== 'ja';
    for (var i = 0; i < batch.length; i++) {
      var src = String(batch[i].key || '');
      var dst = translated[i];
      if (typeof dst !== 'string' || !dst.trim()) return '空译文';
      if (checkChinese) {
        var sc = i18nCjkCount(src);
        var dc = i18nCjkCount(dst);
        if (sc >= 2 && dc / sc > 0.55 && dst.length < src.length * 2.4) return '中文未翻译';
      }
      var sp = i18nMathParts(src);
      if (sp.length) {
        var flat = String(dst).replace(/\s+/g, '');
        for (var j = 0; j < sp.length; j++) {
          if (flat.indexOf(sp[j]) < 0) return '公式或符号丢失';
        }
      }
      var academicSource = /(证明|解答|解析|定理|定义|推论|例题|考点|易错|求|设|若|则|答案|要点)/.test(src) || src.length > 120;
      if (academicSource) {
        var styleRe = {
          en: /\b(gonna|wanna|kinda|sorta|stuff|a lot of|tons of|okay|alright|let's|don't|can't|won't|isn't|aren't|doesn't|didn't|we can see|it's easy)\b/i,
          fr: /\b(du coup|genre|en fait|voilà|bref)\b/i,
          de: /\b(halt|mal eben|irgendwie|einfach mal)\b/i,
          ja: /(だよね|じゃん|だよ|だね|かな|でしょ)/,
          ko: /(잖아요|잖아|네요|죠|거든요)/,
          es: /\b(o sea|pues|bueno|vale)\b/i,
          pt: /\b(tipo assim|então|beleza|né)\b/i,
          ru: /\b(ну|типа|как бы|вообще)\b/i
        }[langId];
        if (styleRe && styleRe.test(dst) && !styleRe.test(src)) return '语体口语化';
        if (src.length > 80 && dst.length < 12) return '译文过短';
      }
    }
    return '';
  }

  async function i18nRepairBatch(batch, draft, protectedKeys, langId) {
    try {
      var repairSystem = [
        '你是学术出版级译审，只修复不合格译文，不改变原意。目标语言：' + languageName(langId) + '。',
        '题目、证明、解答、解析、模板、知识要点必须使用正式学术书面语，禁止口语、网络用语、聊天语气、缩略口语、感叹句和表情；术语按目标语言教材与期刊惯例统一。',
        '保留全部 LaTeX、Markdown、编号、数字、URL、公式占位符与逻辑连接；不增删条件、结论或步骤。',
        '输入 JSON 数组每项含 source 与 draft；只输出与输入等长的 JSON 字符串数组，不要解释或代码围栏。'
      ].join('\n');
      var payload = batch.map(function (x, i) { return { source: protectedKeys[i], draft: draft[i] }; });
      var out = await callConfiguredDirect(aiConfig(), repairSystem, JSON.stringify(payload), [], 90000);
      var arr = i18nParseArray(out.text);
      if (arr.length !== batch.length) return null;
      arr = arr.map(function (v, i) { return i18nRestoreMath(v, batch[i].__mathStore); });
      if (i18nValidateBatch(batch, arr, langId)) return null;
      return arr;
    } catch (e) { return null; }
  }

  async function worker() {
    while (i18nQueue.length && epoch === i18nEpoch && langId === ((state.prefs && state.prefs.lang) || 'zh-CN')) {
      var batch = i18nTakeBatch();
      if (!batch.length) return;
      try {
        var protectedKeys = batch.map(function (x) {
          var p = i18nProtectMath(x.key);
          x.__mathStore = p.store;
          return p.text;
        });
        var out = await callConfiguredDirect(aiConfig(), system, JSON.stringify(protectedKeys), [], 150000);
        if (epoch !== i18nEpoch || langId !== ((state.prefs && state.prefs.lang) || 'zh-CN')) return;
        var arr = i18nParseArray(out.text);
        if (arr.length !== batch.length) throw new Error('翻译数量不匹配');
        arr = arr.map(function (v, i) { return i18nRestoreMath(v, batch[i].__mathStore); });
        var invalid = i18nValidateBatch(batch, arr, langId);
        if (invalid) {
          var repaired = await i18nRepairBatch(batch, arr, protectedKeys, langId);
          if (repaired) arr = repaired;
          else throw new Error('译文校验未通过：' + invalid);
        }
        i18nApplyTranslated(batch, arr, langId, epoch);
        i18nRetryDelay = 5000;
      } catch (err) {
        if (epoch !== i18nEpoch) return;
        if (Date.now() - i18nErrorNoticeAt > 15000) {
          i18nErrorNoticeAt = Date.now();
          toast('翻译暂时中断，会自动继续重试，不会停在这里');
        }
        var pieces = [batch];
        if (batch.length > 1 && /数量|JSON|格式|数组|校验|公式|未翻译/.test(String(err && err.message || ''))) {
          var mid = Math.ceil(batch.length / 2);
          pieces = [batch.slice(0, mid), batch.slice(mid)].filter(function (part) { return part.length; });
        }
        pieces.forEach(function (part) {
          part.forEach(function (item) {
            item.attempts = (item.attempts || 0) + 1;
            i18nRetryHold.push(item);
          });
        });
      }
    }
  }

  try {
    var workers = [];
    for (var w = 0; w < i18nConcurrency; w++) workers.push(worker());
    await Promise.all(workers);
    if (epoch === i18nEpoch && !i18nQueue.length && !i18nRetryHold.length && Date.now() - i18nLastDoneToast > 15000) {
      i18nLastDoneToast = Date.now();
      i18nRetryDelay = 5000;
      toast('界面翻译已更新；长内容会在后台继续补齐');
    }
    if (epoch === i18nEpoch && i18nRetryHold.length) i18nScheduleRetry();
  } finally {
    if (epoch === i18nEpoch) {
      i18nBusy = false;
      document.documentElement.removeAttribute('data-i18n-busy');
      if (i18nQueue.length) scheduleI18n(80);
    }
  }
}

function i18nResetForSwitch() {
  i18nEpoch++;
  i18nQueue = [];
  i18nRetryHold = [];
  i18nRetryDelay = 5000;
  if (i18nRetryTimer) { clearTimeout(i18nRetryTimer); i18nRetryTimer = null; }
  i18nBusy = false;
  if (i18nTimer) { clearTimeout(i18nTimer); i18nTimer = null; }
  if (i18nFullTimer) { clearTimeout(i18nFullTimer); i18nFullTimer = null; }
  if (i18nScrollTimer) { clearTimeout(i18nScrollTimer); i18nScrollTimer = null; }
  document.documentElement.removeAttribute('data-i18n-busy');
}

function i18nRestoreAll() {
  if (i18nDocTitleSource != null) document.title = i18nDocTitleSource;
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    var node = walker.currentNode;
    if (node.__i18nSource != null) {
      i18nApplying = true;
      node.nodeValue = node.__i18nSource;
      i18nApplying = false;
      node.__i18nDone = false;
      delete node.__i18nSource;
    }
  }
  var els = document.querySelectorAll('[placeholder], [title], [aria-label]');
  Array.prototype.forEach.call(els, function (el) {
    if (!el.__i18nAttrSource) return;
    Object.keys(el.__i18nAttrSource).forEach(function (attrName) {
      var original = el.__i18nAttrSource[attrName];
      if (original != null) el.setAttribute(attrName, original);
    });
    delete el.__i18nAttrSource;
    delete el.__i18nAttrDone;
  });
}

function i18nRefreshOpenDialogs() {
  var settings = qs('#settings');
  if (settings && settings.open && typeof openSettings === 'function') {
    try { openSettings(); } catch (e) { /* body is refreshed before showModal */ }
  }
  var changelog = qs('#changelogDialog');
  if (changelog && changelog.open && typeof updateLogHtml === 'function') {
    var cb = qs('#changelogBody');
    if (cb) { cb.innerHTML = updateLogHtml(); cb.scrollTop = 0; }
  }
  var language = qs('#languageDialog');
  if (language && language.open && typeof languageBodyHtml === 'function') {
    var lb = qs('#languageBody');
    if (lb) lb.innerHTML = languageBodyHtml();
  }
  if (typeof renderAiDeferDialog === 'function') {
    var ad = qs('#aiDeferDialog');
    if (ad && ad.open) renderAiDeferDialog();
  }
}

function scheduleI18n(delay) {
  if (i18nTimer) clearTimeout(i18nTimer);
  i18nTimer = setTimeout(function () {
    i18nTimer = null;
    if (!i18nNeeds()) return;
    i18nCollect(document.body, false);
    if (i18nQueue.length) i18nFlush();
  }, delay || 180);
}

function i18nResetPageIfNeeded() {
  var key = [state.activeView, state.activeSubject, ui.noteKb ? 'kb' : (ui.noteLibrary ? 'lib' : 'editor'), ui.kbId || '', location.hash].join('|');
  if (i18nPageKey && key !== i18nPageKey) {
    i18nEpoch++;
    i18nQueue = [];
    i18nRetryHold = [];
    i18nRetryDelay = 5000;
    if (i18nRetryTimer) { clearTimeout(i18nRetryTimer); i18nRetryTimer = null; }
    if (i18nTimer) { clearTimeout(i18nTimer); i18nTimer = null; }
    if (i18nFullTimer) { clearTimeout(i18nFullTimer); i18nFullTimer = null; }
    if (i18nScrollTimer) { clearTimeout(i18nScrollTimer); i18nScrollTimer = null; }
    i18nBusy = false;
    document.documentElement.removeAttribute('data-i18n-busy');
  }
  i18nPageKey = key;
}

function translatePage() {
  if (!i18nNeeds()) return;
  i18nResetPageIfNeeded();
  i18nCollect(document.body, false);
  if (i18nQueue.length) scheduleI18n(180);
  i18nScheduleFull(1800);
}

function initI18n() {
  if (window.__i18nObserver) return;
  var obs = new MutationObserver(function (mutations) {
    if (i18nApplying || !i18nNeeds()) return;
    var relevant = false, structure = false;
    for (var i = 0; i < mutations.length; i++) {
      var mt = mutations[i].target;
      var mel = mt && mt.nodeType === 3 ? mt.parentElement : mt;
      if (mel && mel.closest && mel.closest('[data-no-i18n], .notranslate')) continue;
      if (mutations[i].type === 'childList' && mutations[i].addedNodes.length) { relevant = true; structure = true; }
      if (mutations[i].type === 'characterData') { relevant = true; }
    }
    if (relevant) scheduleI18n(240);
    if (structure) i18nScheduleFull(1200);
  });
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.__i18nObserver = obs;
  window.addEventListener('scroll', i18nScrollCollect, { passive: true });
  document.addEventListener('scroll', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('dlg-body')) i18nScrollCollect();
  }, true);
  scheduleI18n(300);
  i18nScheduleFull(2200);
}

function i18nCollectObjectStrings(obj, out, seen) {
  if (!obj) return;
  if (typeof obj === 'string') {
    if (/[\u3400-\u9fff]/.test(obj) && obj.trim().length > 1 && !seen[obj]) { seen[obj] = 1; out.push(obj); }
    return;
  }
  if (Array.isArray(obj)) { obj.forEach(function (v) { i18nCollectObjectStrings(v, out, seen); }); return; }
  if (typeof obj !== 'object') return;
  Object.keys(obj).forEach(function (k) {
    if (k === 'preview' || k === 'thumb' || k === 'background' || k === 'userName') return;
    i18nCollectObjectStrings(obj[k], out, seen);
  });
}

function i18nBackupStrings(stateObj, libraries) {
  var out = [], seen = {};
  i18nCollectObjectStrings(stateObj, out, seen);
  i18nCollectObjectStrings(libraries, out, seen);
  return out;
}

async function i18nTranslateMany(strings) {
  if (!strings || !strings.length || !i18nNeeds()) return 0;
  if (typeof aiConfigReady !== 'function' || !aiConfigReady()) {
    if (Date.now() - i18nConfigNoticeAt > 15000) {
      i18nConfigNoticeAt = Date.now();
      if (typeof aiConfigNoticeText === 'function') toast(aiConfigNoticeText('translation'));
    }
    return 0;
  }
  var cache = i18nFor();
  var missing = strings.filter(function (s) { return s && !cache[s]; });
  if (!missing.length) return 0;
  var lang = languageName((state.prefs && state.prefs.lang) || 'zh-CN');
  var done = 0;
  var taskOn = typeof longTaskStart === 'function';
  if (taskOn) longTaskStart('i18n-backup', {
    steps: ['收集条目', '分批翻译', '写入缓存'],
    label: '翻译进度',
    step: 0,
    percent: 0,
    valueText: '0 / ' + missing.length,
    stage: '正在准备翻译备份内容…',
    detail: '共 ' + missing.length + ' 条待翻译，按每批 12 条并发处理。'
  });
  var system = [
    '你是学术出版级本地化译者，长期翻译数学、统计、经济学教材与期刊论文。把输入 JSON 数组中的每一条中文翻译成' + lang + '。',
    '题目、证明、解答、解析、规范与知识要点必须使用正式学术书面语，禁止口语、网络用语、聊天语气、缩略口语、感叹句、反问句、比喻和表情；术语按目标语言教材与期刊惯例统一。',
    '答案以“解：”或“证明：”开头并明确结论；保留逻辑连接、条件、量词与步骤，不增删信息。',
    '保留 LaTeX（$...$、$$...$$）、Markdown 标记、代码、数字、URL、题号、公式占位符与专有名词；不要改写数学含义。',
    '严格返回同样长度的 JSON 字符串数组，不要解释、不要代码围栏；如果原文已经是目标语言，原样返回。'
  ].join('\n');
  var jobs = [];
  for (var offset = 0; offset < missing.length; offset += 12) jobs.push(missing.slice(offset, offset + 12));
  var jobIndex = 0;
  async function backupWorker() {
    while (jobIndex < jobs.length) {
      var batch = jobs[jobIndex++];
      try {
        var out = await callConfiguredDirect(aiConfig(), system, JSON.stringify(batch), [], 120000);
        var arr = i18nParseArray(out.text);
        if (arr.length !== batch.length) continue;
        for (var i = 0; i < batch.length; i++) {
          if (typeof arr[i] === 'string' && arr[i].trim()) { cache[batch[i]] = arr[i]; done++; }
        }
        i18nSave();
        if (taskOn) {
          var pct = missing.length ? Math.round(done / missing.length * 100) : 0;
          longTaskUpdate('i18n-backup', {
            step: 1,
            percent: pct,
            valueText: done + ' / ' + missing.length,
            stage: '正在分批翻译…',
            detail: '已翻译 ' + done + ' 条，剩余 ' + Math.max(0, missing.length - done) + ' 条。'
          });
        }
      } catch (e) {
        if (Date.now() - i18nConfigNoticeAt > 15000 && e && (e.code === 'NO_AI_KEY' || e.code === 'NO_AI_MODEL' || e.code === 'BAD_BASE_URL' || e.code === 'UPSTREAM_AUTH' || e.status === 401 || e.status === 403 || e.status === 404 || /api key|model|auth|unauthorized|not found/i.test(String(e.message || '')))) {
          i18nConfigNoticeAt = Date.now();
          if (typeof aiConfigNoticeText === 'function') toast(aiConfigNoticeText('translation'));
        }
      }
    }
  }
  await Promise.all([backupWorker(), backupWorker(), backupWorker(), backupWorker()]);
  if (taskOn) {
    if (done >= missing.length) {
      longTaskFinish('i18n-backup', { stage: '翻译完成', detail: '已翻译 ' + done + ' 条，并写入本机缓存。' });
    } else if (done > 0) {
      longTaskFinish('i18n-backup', { stage: '翻译结束', detail: '已翻译 ' + done + ' / ' + missing.length + ' 条，未完成部分保留原文。' });
    } else {
      longTaskFail('i18n-backup', '翻译没有完成，未完成的条目会保留原文；请检查 AI 配置或网络后重试。');
    }
  }
  return done;
}

function i18nCacheForBackup() {
  var lang = (state.prefs && state.prefs.lang) || 'zh-CN';
  if (lang === 'zh-CN') return null;
  var map = i18nFor(lang);
  var keys = Object.keys(map);
  if (!keys.length) return null;
  var out = {};
  keys.forEach(function (k) { out[k] = map[k]; });
  return { language: lang, entries: out };
}

