/* =========================================================
   90-init — events, routing, boot
   ========================================================= */
var suppressHash = false;

function syncModalScrollLock() {
  var open = !!document.querySelector('dialog[open]');
  document.documentElement.classList.toggle('has-modal', open);
  document.body.classList.toggle('has-modal', open);
}

function setHash(h) {
  suppressHash = true;
  location.hash = h;
  setTimeout(function () { suppressHash = false; }, 0);
}

function parseHash() {
  var rawHash = String(location.hash || '');
  var canonicalHash = rawHash.replace(/^#\/xifang(?=\/|$|\?)/, '#/xijing');
  if (canonicalHash !== rawHash) {
    try { history.replaceState(null, '', location.pathname + location.search + canonicalHash); } catch (e) { /* keep parsing */ }
  }
  var h = canonicalHash.replace(/^#\/?/, '');
  var entryMatch = h.match(/[?&]e=([^&]+)/);
  if (entryMatch) {
    try { ui.open[decodeURIComponent(entryMatch[1])] = true; }
    catch (e) { toast('链接中的条目编号无效，已打开当前页面'); }
  }
  var clean = h.split('?')[0].split('&')[0];
  var parts = clean.split('/').filter(Boolean);
  if (parts[0] === 'home' || parts[0] === 'welcome') return;
  if (parts[0] === 'final') { state.activeView = 'final'; ui.noteKb = false; return; }
  if (parts[0] === 'notes') { state.activeView = 'notes'; ui.noteBatch = false; ui.noteKb = parts[1] === 'kb'; ui.noteLibrary = !ui.noteKb; return; }
  ui.noteKb = false;
  if (parts[0] && (SUBJ_BY_ID[parts[0]] || parts[0] === 'xijing')) {
    state.activeSubject = subjectFromRoute(parts[0]);
    if (!parts[1]) state.activeView = 'overview';
  }
  if (parts[1] === 'notes') { state.activeView = 'notes'; ui.noteBatch = false; ui.noteKb = false; ui.noteLibrary = true; return; }
  if (parts[1] && VIEWS.some(function (v) { return v.id === parts[1]; })) state.activeView = parts[1];

  var topKnown = !parts[0] || parts[0] === 'final' || parts[0] === 'notes' || !!SUBJ_BY_ID[parts[0]];
  if (!topKnown) {
    state.activeView = 'overview';
    try { history.replaceState(null, '', location.pathname + location.search + '#/'); } catch (e) { /* keep current url */ }
    toast('链接指向的页面不存在，已回到首页');
    return;
  }
  if (parts[0] && parts[1] && !VIEWS.some(function (v) { return v.id === parts[1]; })) {
    state.activeView = 'overview';
    var subjectMeta = SUBJ_BY_ID[state.activeSubject] || SUBJECTS[0];
    var targetHash = '#/' + subjectRouteId(state.activeSubject) + '/overview';
    try { history.replaceState(null, '', location.pathname + location.search + targetHash); } catch (e) { /* keep current url */ }
    toast('链接指向的页面不存在，已回到' + (subjectMeta.short || subjectMeta.name) + '总览');
  }
}

function updateHash() {
  if (state.activeView === 'final') { setHash('#/final'); return; }
  if (state.activeView === 'notes') { setHash(ui.noteKb ? '#/notes/kb' : '#/notes'); return; }
  setHash('#/' + subjectRouteId(state.activeSubject) + '/' + state.activeView);
}

function copyPlain(text, done) {
  var ok = done || function () { toast('已复制'); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(ok).catch(function () { fallbackCopy(text); ok(); });
  } else {
    fallbackCopy(text);
    ok();
  }
}

function copyLink(entryId) {
  var url = location.origin + location.pathname + '#/' + subjectRouteId(state.activeSubject) + '/entries?e=' + encodeURIComponent(entryId || '');
  copyPlain(url, function () { toast('链接已复制，可在手机浏览器打开'); });
}
function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) { /* noop */ }
  ta.remove();
}

function handleAction(act, el) {
  switch (act) {
    case 'nav-subject': navSubject(el.getAttribute('data-subject')); break;
    case 'nav-view': navView(el.getAttribute('data-view')); break;
    case 'final-add-entry': finalAddEntry(el.getAttribute('data-id')); el.textContent = '已在期末'; el.classList.add('is-added'); break;
    case 'final-add-bank': finalAddBank(el.getAttribute('data-bank-id')); el.textContent = '已在期末'; el.classList.add('is-added'); break;
    case 'final-remove-item': finalRemoveItem(el.getAttribute('data-key')); break;
    case 'final-task-toggle': finalToggleTask(el.getAttribute('data-date'), !!el.checked); break;
    case 'final-generate-paper': finalGeneratePaper(); break;
    case 'final-select-paper': finalSelectPaper(el.getAttribute('data-id')); break;
    case 'final-delete-paper': finalDeletePaper(); break;
    case 'final-delete-selected-papers': finalDeleteSelectedPapers(); break;
    case 'final-remove-paper-item': finalRemovePaperItem(Number(el.getAttribute('data-index'))); break;
    case 'final-move-paper-item': finalMovePaperItem(Number(el.getAttribute('data-index')), Number(el.getAttribute('data-dir'))); break;
    case 'final-add-paper-item': finalAddPaperItem(); break;
    case 'final-import-bank': finalPaperImportOpen('bank'); break;
    case 'final-import-entry': finalPaperImportOpen('entry'); break;
    case 'final-import-close': finalPaperImportClose(); break;
    case 'final-import-add': finalPaperImportAdd(el.getAttribute('data-kind'), el.getAttribute('data-id')); break;
    case 'final-save-paper': finalSavePaper(); break;
    case 'final-export-docx': finalExportDocx(); break;
    case 'final-export-pdf': finalPrintPaper(); break;
    case 'note-paper': {
      var np = noteCurrent(state.activeSubject);
      if (np) { ui.noteMode = 'draw'; np.paper = el.getAttribute('data-paper') || 'ruled'; np.updatedAt = nowIso(); markDirty(); noteRenderKeepToolbar(); }
      break;
    }
    case 'entry-note-paper': entryNotePaperChange(el.getAttribute('data-id'), el.getAttribute('data-paper')); break;
    case 'entry-note-color': entryNoteColorChange(el.getAttribute('data-color')); break;
    case 'entry-note-pen-size': entryNotePenSize(el.getAttribute('data-size')); break;
    case 'entry-note-tool': entryNoteToolChange(el.getAttribute('data-tool')); break;
    case 'entry-note-resize': entryNoteResize(el.getAttribute('data-id'), Number(el.getAttribute('data-delta')) || 0); break;
    case 'entry-note-undo': entryNoteUndo(el.getAttribute('data-id')); break;
    case 'entry-note-clear': entryNoteClear(el.getAttribute('data-id')); break;
    case 'save-entry-note': saveEntryNote(el.getAttribute('data-id')); break;
    case 'entry-note-sync': syncEntryNote(); break;
    case 'entry-note-no-sync': entryNoteNoSync(); break;
    case 'note-open-synced': openEntrySyncedPage(el.getAttribute('data-id')); break;
    case 'note-open-entry': openSyncedEntry(el.getAttribute('data-id')); break;
    case 'note-mode': {
      ui.noteMode = el.getAttribute('data-mode') === 'browse' ? 'browse' : 'draw';
      noteRenderKeepToolbar();
      break;
    }
    case 'note-tool': {
      var nextTool = el.getAttribute('data-tool') || 'pen';
      if (nextTool === 'eraser') noteRememberInkTool(ui.noteTool);
      else noteRememberInkTool(nextTool);
      ui.noteMode = 'draw';
      ui.noteTool = nextTool;
      noteRenderKeepToolbar();
      break;
    }
    case 'note-lasso-delete': noteLassoDelete(); break;
    case 'note-lasso-duplicate': noteLassoDuplicate(); break;
    case 'note-save': if (noteSaveNow()) toast('笔记已保存'); break;
    case 'jump-tpl-chapter': {
      var chapterEl = qs('#tpl-chapter-' + el.getAttribute('data-index'));
      if (chapterEl) chapterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
    case 'note-goto-subject':
      noteSaveNow();
      state.activeSubject = el.getAttribute('data-subject');
      state.activeView = 'overview';
      location.hash = '#/' + subjectRouteId(state.activeSubject);
      break;
    case 'note-pen-style': ui.noteMode = 'draw'; ui.noteTool = 'pen'; noteRememberInkTool('pen'); ui.notePenStyle = el.getAttribute('data-style') || 'ballpoint'; noteRenderKeepToolbar(); break;
    case 'note-color':
      ui.noteMode = 'draw';
      if (ui.noteTool === 'eraser') ui.noteTool = noteLastInkTool();
      ui.noteColor = el.getAttribute('data-color') || '#111111';
      noteRenderKeepToolbar();
      break;
    case 'note-prev': noteChangePage(state.activeSubject, noteIndex(state.activeSubject) - 1); break;
    case 'note-next': noteChangePage(state.activeSubject, noteIndex(state.activeSubject) + 1); break;
    case 'note-page': { var pageIndex = Number(el.getAttribute('data-index')); if (ui.notePageBatch) notePageBatchToggle(pageIndex); else if (ui.noteSwapMode) noteSwapSelect(pageIndex); else noteChangePage(state.activeSubject, pageIndex); break; }
    case 'note-page-batch-start': notePageBatchStart(); break;
    case 'note-page-batch-cancel': notePageBatchCancel(); break;
    case 'note-page-batch-all': notePageBatchAll(); break;
    case 'note-page-batch-delete': notePageBatchDelete(); break;
    case 'note-swap-start': noteSwapStart(); break;
    case 'note-new-page': noteAddBlank(state.activeSubject); break;
    case 'open-notes-library': {
      state.activeView = 'notes';
      ui.noteKb = false;
      ui.noteLibrary = true;
      ui.noteBatch = false;
      if (typeof noteSwapReset === 'function') noteSwapReset();
      updateHash();
      render();
      updateHomeVisibility();
      break;
    }
    case 'note-library': noteOpenLibrary(); break;
    case 'note-library-close': ui.noteLibrary = false; render(); break;
    case 'note-filter': { ui.noteFilter = el.getAttribute('data-filter') || 'all'; ui.noteBatch = false; ui.noteBatchSelected = {}; render(); break; }
    case 'note-switch-books': ui.noteFilter = 'books'; render(); break;
    case 'note-switch-kb': ui.noteFilter = 'kb'; render(); break;
    case 'note-open': noteOpenBook(Number(el.getAttribute('data-book'))); break;
    case 'note-delete-book': noteDeleteBook(Number(el.getAttribute('data-book'))); break;
    case 'note-batch': noteStartBatch(); break;
    case 'note-batch-toggle': noteBatchToggle(Number(el.getAttribute('data-book'))); break;
    case 'note-batch-all': noteBatchAll(); break;
    case 'note-batch-cancel': noteCancelBatch(); break;
    case 'note-batch-delete': noteBatchDelete(); break;
    case 'note-delete-page': noteDeletePage(state.activeSubject); break;
    case 'note-delete-page-side': noteDeletePage(state.activeSubject, Number(el.getAttribute('data-index'))); break;
    case 'note-duplicate-page': noteDuplicatePage(Number(el.getAttribute('data-index'))); break;
    case 'note-move-page': noteMovePage(Number(el.getAttribute('data-from')), Number(el.getAttribute('data-to'))); break;
    case 'note-undo': noteUndoPage(); break;
    case 'note-redo': noteRedoPage(); break;
    case 'note-insert-text': noteOpenTextDialog(''); break;
    case 'note-text-confirm': noteConfirmText(); break;
    case 'note-insert-image': { var ni = qs('#noteInsertImageFile'); if (ni) ni.click(); break; }
    case 'note-scan-a4': { var ns = qs('#noteScanA4File'); if (ns) ns.click(); break; }
    case 'note-scan-close': noteScanClose(); break;
    case 'open-knowledge': { ui.noteKb = true; ui.noteLibrary = false; ui.kbGraph = false; if (state.activeView !== 'notes') { state.activeView = 'notes'; } setHash('#/notes/kb'); render(); break; }
    case 'kb-back': kbBack(); break;
    case 'kb-new': kbNew(); break;
    case 'kb-note': kbOpen(el.getAttribute('data-id')); break;
    case 'kb-delete': kbDelete(el.getAttribute('data-id')); break;
    case 'kb-mode': if (ui.kbGraph) { ui.kbGraph = false; } else { ui.kbPreview = !ui.kbPreview; } render(); break;
    case 'kb-graph': ui.kbGraph = !ui.kbGraph; render(); break;
    case 'kb-tag': { var kbt = el.getAttribute('data-tag'); ui.kbTag = ui.kbTag === kbt ? '' : kbt; render(); break; }
    case 'kb-link': kbOpenLink(el.getAttribute('data-title')); break;
    case 'note-scan-more': { var sm = qs('#noteScanMoreFile'); if (sm) sm.click(); break; }
    case 'note-scan-filter': noteScanSetFilter(el.getAttribute('data-filter')); break;
    case 'note-scan-pick': noteScanPick(Number(el.getAttribute('data-index'))); break;
    case 'note-scan-remove': noteScanRemove(Number(el.getAttribute('data-index'))); break;
    case 'note-scan-rotate': noteScanRotate(Number(el.getAttribute('data-dir'))); break;
    case 'note-scan-auto': noteScanAutoCrop(); break;
    case 'note-scan-ocr': noteScanOcrCurrent(); break;
    case 'note-scan-ocr-copy': noteScanOcrCopy(); break;
    case 'note-scan-ocr-download': noteScanOcrDownload(); break;
    case 'note-scan-save': noteScanSave(); break;
    case 'note-rename': noteOpenRenameDialog(); break;
    case 'note-rename-book': noteOpenRenameDialog(Number(el.getAttribute('data-book'))); break;
    case 'note-cover': noteOpenCoverDialog(); break;
    case 'note-cover-book': noteOpenCoverDialog(Number(el.getAttribute('data-book'))); break;
    case 'note-cover-import': { var cf = qs('#noteCoverFile'); if (cf) cf.click(); break; }
    case 'note-cover-remove': noteRemoveCoverImage(); break;
    case 'note-cover-crop-fit': noteCoverCropSetFit(el.getAttribute('data-fit')); break;
    case 'note-cover-crop-apply': noteCoverCropApply(); break;
    case 'note-cover-crop-cancel': { var ccd = qs('#noteCoverCropDialog'); if (ccd && ccd.open) ccd.close(); break; }
    case 'note-cover-pick': notePickCover(el.getAttribute('data-cover')); break;
    case 'note-cover-confirm': noteConfirmCover(); break;
    case 'note-rename-confirm': noteConfirmRename(); break;
    case 'note-open-export': noteOpenExportDialog(); break;
    case 'note-export-start': noteExportStart(); break;
    case 'note-export-pages-all': noteExportSelectPages(true); break;
    case 'note-export-pages-none': noteExportSelectPages(false); break;
    case 'note-item-edit': noteEditItem(); break;
    case 'note-item-delete': noteConfirmDeleteItem(); break;
    case 'note-delete-item': noteDeleteSelected(); break;
    case 'note-clear': noteClearPage(); break;
    case 'note-import': { var f = qs('#noteFile'); if (f) f.click(); break; }
    case 'toggle-entry': toggleEntry(el.getAttribute('data-id')); break;
    case 'set-mastery': setMastery(el.getAttribute('data-id'), el.getAttribute('data-value')); break;
    case 'toggle-review': toggleReview(el.getAttribute('data-id'), el.getAttribute('data-day')); break;
    case 'filter-status': filterFor(state.activeSubject).status = el.getAttribute('data-value'); render(); break;
    case 'filter-chapter': {
      var f = filterFor(state.activeSubject);
      f.chapter = el.getAttribute('data-chapter');
      state.activeView = 'entries';
      updateHash();
      render();
      break;
    }
    case 'add-entry': openEditor(state.activeSubject, null); break;
    case 'ai-open': openAiDialog(el.getAttribute('data-subject') || state.activeSubject); break;
    case 'ai-submit': aiSubmit(); break;
    case 'ai-defer': aiDeferAdd(); break;
    case 'open-ai-defer': openAiDeferDialog(); break;
    case 'ai-defer-open': aiDeferOpen(el.getAttribute('data-id')); break;
    case 'ai-defer-remove': aiDeferRemove(el.getAttribute('data-id')); break;
    case 'open-ai-from-defer-empty': { var ad = qs('#aiDeferDialog'); if (ad) ad.close(); openAiDialog(state.activeSubject); break; }
    case 'ai-abort': if (aiState.abort) aiState.abort.abort(); break;
    case 'ai-retry': aiRetry(); break;
    case 'ai-remove-wrong-image': aiRemoveWrongImage(Number(el.getAttribute('data-index'))); break;
    case 'ai-remove-image': {
      var aiIdx = Number(el.getAttribute('data-index'));
      if (aiIdx >= 0 && aiIdx < aiState.images.length) {
        aiState.images.splice(aiIdx, 1);
        renderAiForm();
      }
      break;
    }
    case 'ai-save': aiSaveDirect(); break;
    case 'ai-open-saved': aiOpenSaved(); break;
    case 'ai-save-edit': aiSaveEdit(); break;
    case 'edit-entry': openEditor(state.activeSubject, el.getAttribute('data-id')); break;
    case 'delete-entry': deleteEntry(state.activeSubject, el.getAttribute('data-id')); break;
    case 'jump-entry': jumpToEntry(el.getAttribute('data-id')); break;
    case 'goto-template': gotoTemplate(el.getAttribute('data-template')); break;
    case 'bank-origin':
      bankFilterFor(state.activeSubject).origin = el.getAttribute('data-value') || 'all';
      ui.bankShowLimit = 120;
      render();
      break;
    case 'clear-bank-filters': {
      var bf = bankFilterFor(state.activeSubject);
      bf.chapter = 'all';
      bf.category = 'all';
      bf.type = 'all';
      bf.template = 'all';
      bf.diff = 'all';
      bf.origin = 'all';
      ui.bankShowLimit = 120;
      render();
      break;
    }
    case 'clear-template-filters':
      templateFilterFor(state.activeSubject).chapter = 'all';
      render();
      break;
    case 'clear-entry-filters': {
      var ef = filterFor(state.activeSubject);
      ef.status = 'all';
      ef.chapter = 'all';
      ef.template = 'all';
      ef.date = 'all';
      ef.stars = 'all';
      ef.sort = 'date-desc';
      state.prefs.entrySorts = state.prefs.entrySorts || {};
      state.prefs.entrySorts[state.activeSubject] = 'date-desc';
      persistLocal();
      render();
      break;
    }
    case 'goto-bank': gotoBank(el.getAttribute('data-template')); break;
    case 'open-bank-item': openBankItem(el.getAttribute('data-bank-id')); break;
    case 'toggle-bank-answer': {
      var id = el.getAttribute('data-bank-id');
      ui.bankOpen[id] = !ui.bankOpen[id];
      render();
      var bankEl = qs('#bank-' + id);
      if (bankEl) bankEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (typeof decorateMathScrollers === 'function') setTimeout(function () { decorateMathScrollers(bankEl); }, 30);
      break;
    }
    case 'bank-show-more': ui.bankShowLimit = Math.max(120, Number(ui.bankShowLimit) || 120) + 120; render(); break;
    case 'add-from-bank': addFromBank(el.getAttribute('data-bank-id')); break;
    case 'add-from-entry': addFromEntry(el.getAttribute('data-id')); break;
    case 'open-changelog': openChangelog(); break;
    case 'open-attachment': {
      var attImg = el.querySelector('img');
      if (attImg) openAttachmentLightbox(attImg.src, attImg.alt || '手写作答');
      break;
    }
    case 'close-attachment': {
      var attDlg = qs('#entryImageLightbox');
      if (attDlg) attDlg.close();
      break;
    }
    case 'merge-conflict-renumber': resolveMergeConflict('renumber'); break;
    case 'merge-conflict-skip': resolveMergeConflict('skip'); break;
    case 'confirm-import': {
      var modeEl = qs('input[name="importMode"]:checked');
      applyImportMode(modeEl ? modeEl.value : 'merge');
      break;
    }
    case 'copy-link': copyLink(el.getAttribute('data-id')); break;
    case 'copy-template-md': {
      var tplId = el.getAttribute('data-template');
      var tpl = templatesOf(state.activeSubject).filter(function (x) { return x.id === tplId; })[0];
      if (tpl) copyPlain(templateMarkdown(tpl), function () { toast('模板 Markdown 已复制'); });
      break;
    }
    case 'copy-bank-md': {
      var bid = el.getAttribute('data-bank-id');
      var bit = bankOf(state.activeSubject).filter(function (x) { return x.id === bid; })[0];
      if (bit) copyPlain(bankMarkdown(bit), function () { toast('题目 Markdown 已复制'); });
      break;
    }
    case 'copy-entry-md': {
      var eid = el.getAttribute('data-id');
      var ent = findEntry(state.activeSubject, eid);
      if (ent) copyPlain(entryMarkdown(ent), function () { toast('错题 Markdown 已复制'); });
      break;
    }
    case 'add-block': addBlockEditor(qs('#newBlockKey').value); break;
    case 'block-remove': {
      var b = el.closest('[data-block]');
      if (b) b.remove();
      break;
    }
    case 'block-up': {
      var up = el.closest('[data-block]');
      if (up && up.previousElementSibling) up.parentNode.insertBefore(up, up.previousElementSibling);
      break;
    }
    case 'block-down': {
      var down = el.closest('[data-block]');
      if (down && down.nextElementSibling) down.parentNode.insertBefore(down.nextElementSibling, down);
      break;
    }
    case 'block-preview': {
      var host = el.closest('[data-block]');
      if (!host) break;
      var pv = qs('.preview', host);
      var ta = qs('.b-md', host);
      if (!pv || !ta) break;
      pv.innerHTML = renderMarkdown(ta.value);
      pv.classList.toggle('is-on');
      break;
    }
    case 'add-variant': {
      var vh = qs('#variantEditors');
      if (vh) {
        var wrap = document.createElement('div');
        wrap.innerHTML = variantEditorHtml({ q: '', a: '' });
        vh.appendChild(wrap.firstChild);
      }
      break;
    }
    case 'variant-remove': {
      var vn = el.closest('[data-variant]');
      if (vn) vn.remove();
      break;
    }
    case 'save-entry': saveEditor(); break;
    case 'close-dialog': {
      var dlg = qs('#' + el.getAttribute('data-dialog'));
      if (dlg) dlg.close();
      break;
    }
    case 'open-settings': openSettings(); break;
    case 'dismiss-api-welcome': dismissApiWelcome(false); break;
    case 'configure-api-welcome': dismissApiWelcome(true); break;
    case 'open-language': { var sd = qs('#settings'); if (sd && sd.open) sd.close(); openLanguageDialog(); break; }
    case 'ai-image': openAiFormImage(false, el.getAttribute('data-index')); break;
    case 'ai-wrong-image': openAiFormImage(true, el.getAttribute('data-index')); break;
    case 'ai-defer-image': openAiDeferImage(el.getAttribute('data-id'), el.getAttribute('data-index')); break;
    case 'ai-defer-image-prev': stepAiDeferLightbox(-1); break;
    case 'ai-defer-image-next': stepAiDeferLightbox(1); break;
    case 'ai-defer-image-close': closeAiDeferLightbox(); break;
    case 'ai-defer-expand': toggleAiDeferText(el); break;
    case 'set-language': setLanguage(el.getAttribute('data-id')); break;
    case 'auto-ai-now': autoAiNow(el.getAttribute('data-id')); break;
    case 'auto-ai-retry': autoAiRetry(el.getAttribute('data-id')); break;
    case 'auto-ai-skip': autoAiSkip(el.getAttribute('data-id')); break;
    case 'auto-ai-cancel': autoAiCancel(el.getAttribute('data-id')); break;
    case 'toggle-auto-ai': {
      state.prefs.autoAi = !autoAiEnabled();
      persistLocal();
      if (autoAiEnabled()) { autoAiKick(); } else { render(); }
      openSettings();
      break;
    }
    case 'model-pick': {
      var pickInput = qs('#aiModel');
      aiOpenModelMenu();
      if (pickInput) pickInput.focus();
      break;
    }
    case 'model-choose': {
      var chosenModel = el.getAttribute('data-model');
      var chooseInput = qs('#aiModel');
      if (chooseInput && chosenModel) chooseInput.value = chosenModel;
      if (chooseInput) chooseInput.focus();
      aiCloseModelMenu();
      if (typeof aiUpdateModelHint === 'function') aiUpdateModelHint();
      break;
    }
    case 'clear-ai-model-blacklist': {
      aiClearModelBlacklist();
      openSettings();
      toast('已恢复被移除的模型');
      break;
    }
    case 'save-ai-config': {
      var protocolEl = qs('#aiProtocol');
      var baseEl = qs('#aiBaseUrl');
      var modelEl = qs('#aiModel');
      var keyEl = qs('#aiApiKey');
      var oldCfg = aiConfig();
      var protocol = protocolEl ? protocolEl.value : oldCfg.protocol;
      var baseUrl = baseEl ? baseEl.value.trim() : '';
      var model = modelEl ? modelEl.value.trim() : '';
      var key = keyEl ? keyEl.value.trim() : '';
      if (!key) key = oldCfg.apiKey;
      if (!key) { toast('请填写 API Key'); break; }
      if (!model) { toast('请填写模型名称'); break; }
      if (!/^https?:\/\//i.test(baseUrl)) { toast('API 地址需要以 http:// 或 https:// 开头'); break; }
      aiSaveConfig({ protocol: protocol, baseUrl: baseUrl, model: model, apiKey: key });
      toast('AI 服务已保存 · ' + aiProtocolLabel(protocol));
      if (typeof autoAiKick === 'function') autoAiKick();
      openSettings();
      break;
    }
    case 'save-user-name': saveUserName(); break;
    case 'clear-ai-config': {
      aiClearConfig();
      toast('已清除 AI 服务设置');
      openSettings();
      break;
    }
    case 'cycle-theme': cycleTheme(); break;
    case 'set-theme': {
      state.prefs.theme = el.getAttribute('data-theme');
      applyTheme();
      persistLocal();
      openSettings();
      break;
    }
    case 'push-sync': {
      var tok = qs('#syncToken');
      if (tok) { sync.token = tok.value.trim(); localStorage.setItem(TOKEN_KEY, sync.token); }
      if (!(state.rev || 0) && sync.available) {
        pullSync(true).then(function () { pushSync(true); });
      } else {
        pushSync(true);
      }
      break;
    }
    case 'pull-sync': {
      var tok2 = qs('#syncToken');
      if (tok2) { sync.token = tok2.value.trim(); localStorage.setItem(TOKEN_KEY, sync.token); }
      pullSync(true);
      break;
    }
    case 'dismiss-pages-banner':
      pagesBannerDismissed = true;
      try { localStorage.setItem('sanke-pages-banner-dismissed', '1'); } catch (e) { /* noop */ }
      render();
      break;
    case 'export-state': exportState(); break;
    case 'import-state': {
      var fi = qs('#importFile');
      if (fi) fi.click();
      break;
    }
    case 'reset-state': {
      confirmDialog('要恢复初始数据吗？', '这会清空错题、笔记、AI 服务配置、同步口令和所有设置，只保留模板库与题库；导出的 JSON 备份不受影响。此操作无法撤销，请确认。', function () {
        var oldRev = state.rev || 0;
        try {
          Object.keys(localStorage).forEach(function (k) {
            if (k.indexOf('sanke-') === 0) localStorage.removeItem(k);
          });
        } catch (e) { /* ignore */ }
        storageRecoveryBlocked = false;
        state = seedState();
        state.rev = oldRev + 1;
        ui = { open: {}, bankOpen: {}, filters: {}, bankFilters: {}, noteLibrary: true, noteFilter: 'all', noteQuery: '' };
        sync.token = '';
        sync.available = false;
        sync.online = false;
        sync.lastSync = null;
        pagesBannerDismissed = false;
        qsa('dialog[open]').forEach(function (d) { d.close(); });
        persistLocal();
        applyTheme();
        render();
        renderSyncStatus();
        toast('已恢复初始数据 · 模板与题库保留');
      });
      break;
    }
    case 'open-notifications': if (typeof openNotifications === 'function') openNotifications(); break;
    case 'close-notifications': if (typeof closeNotifications === 'function') closeNotifications(); break;
    case 'notif-expand': {
      var nid = el.getAttribute('data-id');
      ui.notifOpen = ui.notifOpen || {};
      ui.notifOpen[nid] = !ui.notifOpen[nid];
      if (ui.notifOpen[nid] && typeof notifMarkRead === 'function') notifMarkRead(nid);
      if (typeof renderNotifications === 'function') renderNotifications();
      break;
    }
    case 'notif-delete': if (typeof notifDelete === 'function') notifDelete(el.getAttribute('data-id')); break;
    case 'notif-delete-selected': if (typeof notifDeleteSelected === 'function') notifDeleteSelected(); break;
    case 'notif-mark-all-read': if (typeof notifMarkAllRead === 'function') notifMarkAllRead(); break;
    default: break;
  }
}

function bindEvents() {
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) return;
    e.preventDefault();
    handleAction(el.getAttribute('data-act'), el);
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.matches && t.matches('[data-notif-check]')) {
      ui.notifSelected = ui.notifSelected || {};
      var nid = t.getAttribute('data-id');
      if (t.checked) ui.notifSelected[nid] = true; else delete ui.notifSelected[nid];
      if (typeof renderNotifications === 'function') renderNotifications();
    } else if (t && t.id === 'notifSelectAll') {
      ui.notifSelected = {};
      if (t.checked) (state.notifications || []).forEach(function (n) { ui.notifSelected[n.id] = true; });
      if (typeof renderNotifications === 'function') renderNotifications();
    } else if (t.matches('[data-filter]')) {
      var key = t.getAttribute('data-filter');
      filterFor(state.activeSubject)[key] = t.value;
      if (key === 'sort') {
        state.prefs.entrySorts = state.prefs.entrySorts || {};
        state.prefs.entrySorts[state.activeSubject] = t.value;
        persistLocal();
      }
      render();
    } else if (t.matches('[data-bank-filter]')) {
      var bk = t.getAttribute('data-bank-filter');
      bankFilterFor(state.activeSubject)[bk] = t.value;
      ui.bankShowLimit = 120;
      render();
    } else if (t.matches('[data-template-filter]')) {
      var tk = t.getAttribute('data-template-filter');
      templateFilterFor(state.activeSubject)[tk] = t.value;
      render();
    } else if (t.matches('#aiThinkingToggle') || t.matches('#settingsThinkingToggle')) {
      aiSaveThinking({ enabled: t.checked });
      aiSyncThinkingControls();
    } else if (t.matches('#aiThinkingEffort') || t.matches('#settingsThinkingEffort')) {
      aiSaveThinking({ effort: t.value });
      aiSyncThinkingControls();
    } else if (t.matches('#aiProtocol')) {
      var preset = AI_PROTOCOL_PRESETS[t.value];
      if (preset) {
        var base = qs('#aiBaseUrl'); var model = qs('#aiModel');
        if (base) base.value = preset.baseUrl;
        setAiModelPicker(t.value, preset.model);
        if (typeof aiUpdateModelHint === 'function') aiUpdateModelHint();
      }
    } else if (t.matches('#importFile')) {
      importStateFile(t.files && t.files[0]);
      t.value = '';
    }
  });

  document.addEventListener('focusin', function (e) {
    if (e.target && e.target.id === 'aiModel') aiOpenModelMenu();
  });
  document.addEventListener('change', function (e) {
  if (e.target && e.target.name === 'noteExportScope') noteExportSyncScope();
  if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-note-export-page')) noteExportUpdatePageSummary();
});

document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'aiModel') { aiRefreshModelMenu(e.target.value); if (typeof aiUpdateModelHint === 'function') aiUpdateModelHint(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') aiCloseModelMenu();
  });
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest || !e.target.closest('.model-combo')) aiCloseModelMenu();
  });

  var search = qs('#searchInput');
  if (search) {
    var timer = null;
    search.addEventListener('input', function () {
      if (typeof examSearchLocked === 'function' && examSearchLocked()) return;
      if (typeof knowledgeSearchOnInput === 'function') knowledgeSearchOnInput(search.value);
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (state.activeView === 'overview') { render(); return; }
        render();
      }, 160);
    });
  }

  window.addEventListener('hashchange', function () {
    if (suppressHash) return;
    parseHash();
    render();
    updateHomeVisibility();
    var m = String(location.hash).match(/[?&]e=([^&]+)/);
    if (m) {
      var el = qs('#entry-' + decodeURIComponent(m[1]));
      if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  });

  document.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('toggle', function () {
      d.__toastOrder = d.open ? Date.now() : 0;
      mountToast();
      syncModalScrollLock();
    });
  });

  document.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('cancel', function () { /* native close */ });
  });
  var importDlg = qs('#importDialog');
  if (importDlg) importDlg.addEventListener('close', function () { pendingImport = null; });
  var entryNoteDlg = qs('#entryNoteSyncDialog');
  if (entryNoteDlg) entryNoteDlg.addEventListener('close', function () { if (!entryNoteDlg.open) pendingEntryNoteSync = null; });
  var mergeDlg = qs('#mergeConflictDialog');
  if (mergeDlg) mergeDlg.addEventListener('close', function () { if (!mergeDlg.open) pendingMerge = null; });
  var aiDlg = qs('#aiDialog');
  if (aiDlg) {
    aiDlg.addEventListener('close', function () {
      if (aiState.abort) { aiState.abort.abort(); aiState.abort = null; }
      clearAiStage();
      aiState.busy = false;
    });
  }

  window.addEventListener('focus', function () {
    if (sync.available && !document.hidden) pullSync(false);
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && sync.available) pullSync(false);
  });
}

function syncResponsiveLabels() {
  var search = qs('#searchInput');
  if (!search) return;
  if (typeof examSearchLocked === 'function' && examSearchLocked()) {
    search.disabled = true;
    search.placeholder = '模拟考进行中 · 搜索已锁定';
    return;
  }
  var label = '搜索题目 / 知识点';
  var needs = typeof i18nNeeds === 'function' && i18nNeeds();
  if (needs && typeof i18nFor === 'function') {
    try {
      var hit = i18nFor()[label];
      if (hit) label = hit;
    } catch (e) { /* cache unavailable */ }
  }
  if (search.__i18nAttrDone) delete search.__i18nAttrDone.placeholder;
  if (search.__i18nAttrSource) delete search.__i18nAttrSource.placeholder;
  search.placeholder = label;
  if (needs && label === '搜索题目 / 知识点' && typeof scheduleI18n === 'function') {
    scheduleI18n(80);
  }
}

function boot() {
  try {
    var tm = String(location.search || '').match(/[?&]token=([^&]+)/);
    if (tm) {
      sync.token = decodeURIComponent(tm[1]);
      localStorage.setItem(TOKEN_KEY, sync.token);
      if (window.history && history.replaceState) history.replaceState(null, '', location.pathname + location.hash);
    }
  } catch (e) { /* file:// */ }
  applyTheme();
  parseHash();
  if (typeof finalExamAutoCollectExpired === 'function') finalExamAutoCollectExpired();
  render();
  if (typeof initNotifications === 'function') initNotifications();
  syncResponsiveLabels();
  window.addEventListener('resize', syncResponsiveLabels);
  var navResizeTimer = null;
  window.addEventListener('resize', function () {
    if (navResizeTimer) clearTimeout(navResizeTimer);
    navResizeTimer = setTimeout(function () {
      if (typeof renderTopbar === 'function') renderTopbar();
    }, 120);
  });
  updateHomeVisibility();
  bindEvents();
  if ('serviceWorker' in navigator && window.isSecureContext) {
    setTimeout(function () { navigator.serviceWorker.register('sw.js').catch(function () { /* 离线缓存不可用不影响主流程 */ }); }, 1200);
  }
  var apiWelcomeDlg = qs('#apiWelcomeDialog');
  if (apiWelcomeDlg) apiWelcomeDlg.addEventListener('cancel', function (e) { e.preventDefault(); dismissApiWelcome(false); });
  if (typeof initI18n === 'function') initI18n();
  startHomeClock();
  var fi = document.createElement('input');
  fi.type = 'file';
  fi.accept = 'application/json,application/gzip,.json,.gz';
  fi.id = 'importFile';
  fi.style.display = 'none';
  document.body.appendChild(fi);
  initSync().then(function () {
    if (typeof startAutoAi === 'function') startAutoAi();
    var m = String(location.hash).match(/[?&]e=([^&]+)/);
    if (m) {
      var el = qs('#entry-' + decodeURIComponent(m[1]));
      if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  });
  setInterval(function () {
    if (sync.available && !document.hidden) pullSync(false);
  }, 15000);
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener ? mq.addEventListener('change', function () { if ((state.prefs.theme || 'auto') === 'auto') applyTheme(); }) : null;
  }
}

document.addEventListener('input', function (e) {
  if (e.target && e.target.id === 'noteLibrarySearch') noteFilterLibrary(e.target.value);
});

document.addEventListener('keydown', function (e) {
  if (state.activeView !== 'notes') return;
  if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 's') {
    e.preventDefault();
    if (noteSaveNow()) toast('笔记已保存');
  }
});

boot();
