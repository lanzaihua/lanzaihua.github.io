/* =========================================================
   55-notifications — 全站通知中心
   ========================================================= */
var NOTIF_MAX = 50;
var NOTIF_KIND_LABEL = { update: '更新', review: '复习', tip: '提示', warn: '提醒' };
var notifToastLast = '';
var notifToastAt = 0;
var notifMirrorSuppressed = false;

function notifId() {
  return 'n-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function notifUnreadCount() {
  return (state.notifications || []).filter(function (n) { return n && !n.read; }).length;
}

function notifAdd(title, body, kind, extra) {
  state.notifications = Array.isArray(state.notifications) ? state.notifications : [];
  state.notifications.unshift(Object.assign({
    id: notifId(),
    title: String(title || '提示'),
    body: String(body || ''),
    kind: kind || 'tip',
    read: false,
    time: nowIso()
  }, extra || {}));
  if (state.notifications.length > NOTIF_MAX) state.notifications = state.notifications.slice(0, NOTIF_MAX);
}

function notifUpdateSignature(latest) {
  var raw = [latest.date || '', latest.title || '', latest.notifySummary || latest.summary || ''].join('|') + '||' +
    (latest.items || []).map(function (it) { return (it.group || '') + ':' + (it.text || ''); }).join('||') + '||notify||' +
    (latest.notifyItems || []).map(function (it) { return (it.group || '') + ':' + (it.text || ''); }).join('||');
  var h = 2166136261;
  for (var i = 0; i < raw.length; i++) h = Math.imul(h ^ raw.charCodeAt(i), 16777619) >>> 0;
  return String(latest.date || '') + '|' + (h >>> 0).toString(36);
}

function notifPageLabel() {
  try {
    if (typeof isHomeRoute === 'function' && isHomeRoute()) return '欢迎页';
    if (state && state.activeView === 'notes') return '笔记库';
    var subj = typeof currentSubject === 'function' ? currentSubject() : null;
    var view = (typeof VIEWS !== 'undefined' ? VIEWS : []).filter(function (v) { return v.id === (state && state.activeView); })[0];
    return (subj ? subj.name : '') + (view ? ' · ' + view.label : '');
  } catch (e) { return '四科错题本'; }
}

function notifTitleFor(text) {
  var m = text.match(/^已记录\s+(D\d+)\s+复习/);
  if (m) return '复习打卡 · ' + m[1];
  m = text.match(/^已取消\s+(D\d+)\s+打卡/);
  if (m) return '已取消复习 · ' + m[1];
  if (/已掌握/.test(text)) return '已标记掌握';
  if (/未掌握/.test(text)) return '已取消掌握';
  if (/^主题：/.test(text)) return '主题已切换';
  if (/已复制|链接已复制/.test(text)) return '内容已复制';
  if (/已保存|保存成功/.test(text)) return '保存完成';
  if (/已删除/.test(text)) return '删除完成';
  if (/已创建/.test(text)) return '创建完成';
  if (/已导入|导入完成/.test(text)) return '导入完成';
  if (/已同步|已载入|同步完成/.test(text)) return '同步完成';
  if (/失败|错误|异常|无法|不能/.test(text)) return '操作未完成';
  if (/将在|还需等到|未解锁|下次解锁/.test(text)) return '解锁时间提示';
  if (/请先/.test(text)) return '操作顺序提示';
  if (/翻译/.test(text)) return '翻译状态';
  return '操作提示';
}

function mirrorToastNotification(msg, meta) {
  if (notifMirrorSuppressed) return;
  meta = meta && typeof meta === 'object' ? meta : {};
  var text = String(msg || '').trim();
  if (!text) return;
  var now = Date.now();
  if (text === notifToastLast && now - notifToastAt < 4000) return;
  notifToastLast = text;
  notifToastAt = now;
  var isWarn = /失败|错误|异常|无法|不能|请先|不足|未到期|未开放|未解锁|已被|为空|超时|锁/.test(text);
  var title = String(meta.title || notifTitleFor(text));
  var kind = meta.kind || (isWarn ? 'warn' : 'tip');
  var lines = [];
  if (meta.detail) lines.push(String(meta.detail));
  lines.push(text);
  lines.push('页面：' + notifPageLabel());
  notifAdd(title, lines.join('\n'), kind);
  markDirty();
  renderNotificationBadge();
  var layer = qs('#notifLayer');
  if (layer && !layer.hidden) renderNotifications();
}

function notifPreview(text) {
  var s = String(text || '').replace(/\s+/g, ' ').trim();
  return s.length > 120 ? s.slice(0, 120) + '…' : s;
}

function notifRenderInline(text) {
  if (typeof renderInline === 'function') return renderInline(text);
  return esc(text);
}

function notifRenderMarkdown(text) {
  if (typeof renderMarkdown === 'function') return renderMarkdown(text);
  return '<p>' + esc(text) + '</p>';
}

function notifTime(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso || '');
  return formatDate(iso) + ':' + pad(d.getSeconds(), 2);
}

function notifClock(date) {
  var d = date instanceof Date ? date : new Date();
  if (isNaN(d.getTime())) d = new Date();
  return pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2);
}

function renderNotificationBadge() {
  var count = notifUnreadCount();
  qsa('[data-notif-badge]').forEach(function (badge) {
    badge.hidden = count <= 0;
    badge.textContent = count > 99 ? '99+' : String(count);
  });
  qsa('[data-act="open-notifications"]').forEach(function (btn) {
    btn.setAttribute('aria-label', count > 0 ? '打开通知，' + count + ' 条未读' : '打开通知');
  });
}

function notifParseUpdateMeta(body) {
  var first = String(body || '').split('\n')[0] || '';
  var m = first.match(/^版本[：:]\s*(\d{4}-\d{2}-\d{2})\s*[·・]\s*(.+)$/);
  if (!m) return { date: '', label: first.replace(/^版本[：:]\s*/, '') };
  return { date: m[1], label: m[2] };
}

function notifUpdateDigestHtml(meta, summary, items) {
  var html = '<div class="notif-update">';
  if (meta.date || meta.label) {
    html += '<div class="notif-update-head">';
    if (meta.date) html += '<span class="notif-update-date">' + esc(meta.date) + '</span>';
    if (meta.label) html += '<span class="notif-update-label">' + notifRenderInline(meta.label) + '</span>';
    html += '</div>';
  }
  if (summary) html += '<p class="notif-update-summary">' + notifRenderInline(summary) + '</p>';
  if (items.length) {
    html += '<div class="notif-update-list">';
    items.forEach(function (it, i) {
      html += '<div class="notif-update-item">' +
        '<span class="notif-update-index">' + pad(i + 1, 2) + '</span>' +
        '<div class="notif-update-body"><p class="notif-update-group">' + esc(it.group) + '</p>' +
        '<p class="notif-update-text">' + notifRenderInline(it.text) + '</p></div>' +
        '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
}
function notificationItemHtml(n) {
  var expanded = !!(ui.notifOpen && ui.notifOpen[n.id]);
  var selected = !!(ui.notifSelected && ui.notifSelected[n.id]);
  var kind = NOTIF_KIND_LABEL[n.kind] || '提示';
  var body = String(n.body || '');
  var update = n.kind === 'update';
  var updateItems = update ? notifParseUpdateItems(body) : [];
  var updateSummary = update ? notifParseUpdateSummary(body) : '';
  var updateMeta = update ? notifParseUpdateMeta(body) : { date: '', label: '' };
  var showDigestHead = update && !/^网页已更新\s*·\s*\d{4}-\d{2}-\d{2}/.test(String(n.title || ''));
  var previewText = update ? (updateSummary || (updateItems[0] && updateItems[0].text) || body) : body;
  var updateCount = update && updateItems.length ? '<span class="notif-update-count">' + updateItems.length + ' 条要点</span>' : '';
  return '<article class="notif-item' + (n.read ? '' : ' is-unread') + (expanded ? ' is-expanded' : '') + '" data-notif-id="' + attr(n.id) + '">' +
    '<label class="notif-check"><input type="checkbox" data-notif-check data-id="' + attr(n.id) + '"' + (selected ? ' checked' : '') + ' aria-label="选择这条通知"><span></span></label>' +
    '<div class="notif-main">' +
      '<div class="notif-meta"><span class="notif-kind">' + esc(kind) + '</span><time datetime="' + attr(n.time) + '">' + esc(notifTime(n.time)) + '</time>' + updateCount + '</div>' +
      '<button class="notif-item-title md" data-act="notif-expand" data-id="' + attr(n.id) + '" type="button" aria-expanded="' + expanded + '">' + esc(n.title) + '</button>' +
      '<div class="notif-preview md">' + notifRenderInline(previewText) + '</div>' +
      (expanded ? '<div class="notif-full md">' + (update && (updateItems.length || updateSummary) ? notifUpdateDigestHtml(showDigestHead ? updateMeta : { date: '', label: '' }, updateSummary, updateItems) : notifRenderMarkdown(body)) + '</div>' : '') +
    '</div>' +
    '<button class="notif-delete" data-act="notif-delete" data-id="' + attr(n.id) + '" type="button" aria-label="删除这条通知" title="删除">×</button>' +
  '</article>';
}

function renderNotifications() {
  var list = qs('#notifList');
  if (!list) return;
  var items = Array.isArray(state.notifications) ? state.notifications : [];
  var countEl = qs('#notifCount');
  if (countEl) countEl.textContent = items.length ? items.length + ' 条 · ' + notifUnreadCount() + ' 未读' : '';
  var all = qs('#notifSelectAll');
  var selectedCount = items.filter(function (n) { return ui.notifSelected && ui.notifSelected[n.id]; }).length;
  if (all) {
    all.checked = items.length > 0 && selectedCount === items.length;
    all.indeterminate = selectedCount > 0 && selectedCount < items.length;
    all.disabled = items.length === 0;
  }
  qsa('.notif-tool').forEach(function (btn) {
    btn.disabled = items.length === 0;
  });
  var del = qs('[data-act="notif-delete-selected"]');
  var markAll = qs('[data-act="notif-mark-all-read"]');
  if (markAll) {
    markAll.disabled = notifUnreadCount() === 0;
    markAll.title = markAll.disabled ? '没有未读通知' : '把全部未读通知标为已读';
  }
  if (del) del.disabled = selectedCount === 0;
  if (!items.length) {
    list.innerHTML = '<div class="notif-empty"><span class="notif-empty-mark" aria-hidden="true">○</span><p class="notif-empty-title">还没有通知</p><p class="notif-empty-text">网页更新、复习提醒和提示会出现在这里。</p></div>';
    renderNotificationBadge();
    return;
  }
  list.innerHTML = items.map(notificationItemHtml).join('');
  renderNotificationBadge();
}

function openNotifications() {
  var layer = qs('#notifLayer');
  var panel = qs('#notifPanel');
  if (!layer || !panel) return;
  layer.hidden = false;
  layer.classList.toggle('notif-from-home', typeof isHomeRoute === 'function' && isHomeRoute());
  document.documentElement.classList.add('notif-open');
  renderNotifications();
  qsa('[data-act="open-notifications"]').forEach(function (btn) { btn.setAttribute('aria-expanded', 'true'); });
  try { panel.focus({ preventScroll: true }); } catch (e) { /* noop */ }
}

function notifMarkRead(id) {
  var n = (state.notifications || []).filter(function (item) { return item && item.id === id; })[0];
  if (!n || n.read) return;
  n.read = true;
  markDirty();
  renderNotifications();
}

function closeNotifications() {
  var layer = qs('#notifLayer');
  if (!layer || layer.hidden) return;
  layer.hidden = true;
  document.documentElement.classList.remove('notif-open');
  qsa('[data-act="open-notifications"]').forEach(function (btn) { btn.setAttribute('aria-expanded', 'false'); });
  var trigger = qs('[data-act="open-notifications"]');
  if (trigger) { try { trigger.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
}

function notifDelete(id) {
  state.notifications = (state.notifications || []).filter(function (n) { return n.id !== id; });
  if (ui.notifSelected) delete ui.notifSelected[id];
  if (ui.notifOpen) delete ui.notifOpen[id];
  markDirty();
  renderNotifications();
}

function notifDeleteSelected() {
  var ids = Object.keys(ui.notifSelected || {}).filter(function (id) { return ui.notifSelected[id]; });
  if (!ids.length) return;
  state.notifications = (state.notifications || []).filter(function (n) { return ids.indexOf(n.id) < 0; });
  ui.notifSelected = {};
  markDirty();
  renderNotifications();
}

function notifMarkAllRead() {
  var changed = false;
  (state.notifications || []).forEach(function (n) {
    if (!n || n.read) return;
    n.read = true;
    changed = true;
  });
  if (!changed) return;
  markDirty();
  renderNotifications();
}

function notifParseUpdateItems(body) {
  var out = [];
  String(body || '').split('\n').forEach(function (line) {
    var m = line.match(/^\s*\d+\.\s*【([^】]+)】(.*)$/);
    if (m) out.push({ group: m[1], text: m[2] });
  });
  return out;
}

function notifParseUpdateSummary(body) {
  var lines = String(body || '').split('\n');
  if (!lines.length || !/^版本：/.test(lines[0])) return '';
  for (var i = 1; i < lines.length; i++) {
    var line = String(lines[i] || '').trim();
    if (!line) continue;
    if (/^本次更新内容/.test(line)) break;
    return line;
  }
  return '';
}

function notifUpdateDelta(latest, previousItems, previousSummary) {
  var items = (latest && latest.items) || [];
  var prev = Array.isArray(previousItems) ? previousItems : [];
  var deltas = [];
  items.forEach(function (it, index) {
    var group = it.group || '更新';
    var text = String(it.text || '');
    var p = prev[index] && prev[index].group === group ? prev[index] : null;
    if (!p) p = prev.filter(function (x, i) { return i !== index && x.group === group; })[0] || null;
    if (p && String(p.text || '') === text) return;
    var part = text;
    if (p && p.text) {
      var oldText = String(p.text);
      if (text.indexOf(oldText) === 0) part = text.slice(oldText.length);
      else {
        var n = 0;
        while (n < oldText.length && n < text.length && oldText.charAt(n) === text.charAt(n)) n++;
        if (n >= 24 && n < text.length) part = text.slice(n);
      }
    }
    part = part.replace(/^[\s；;，,。、:：\-—]+/, '').trim();
    if (part) deltas.push({ group: group, text: part });
  });
  var summary = String((latest && (latest.notifySummary || latest.summary)) || '');
  return { items: deltas, summary: summary, summaryChanged: !!summary && summary !== String(previousSummary || '') };
}

function initNotifications() {
  if (!state.notifications) state.notifications = [];
  (state.notifications || []).forEach(function (n) {
    if (!n || typeof n.body !== 'string') return;
    var cleaned = n.body.replace(/\n?构建：[^\n]*/g, '').replace(/\n{3,}/g, '\n\n').trim();
    if (cleaned !== n.body) n.body = cleaned;
  });
  var seenUpdateTitles = {};
  state.notifications = state.notifications.filter(function (n) {
    if (!n || n.kind !== 'update') return true;
    var key = String(n.title || '');
    if (seenUpdateTitles[key]) return false;
    seenUpdateTitles[key] = true;
    return true;
  });
  if (!ui.notifSelected) ui.notifSelected = {};
  if (!ui.notifOpen) ui.notifOpen = {};
  var latest = (typeof UPDATE_LOG !== 'undefined' && UPDATE_LOG && UPDATE_LOG[0]) ? UPDATE_LOG[0] : null;
  var versionKey = latest ? notifUpdateSignature(latest) : '';
  var buildId = String((typeof window !== 'undefined' && window.__BUILD_ID__) || '');
  var alreadyNotified = !!(state.notifications || []).some(function (n) {
    return n && n.kind === 'update' && n.updateSignature === versionKey;
  });
  var contentChanged = !!latest && state.notifVersion !== versionKey;
  var lastUpdate = (state.notifications || []).filter(function (n) { return n && n.kind === 'update'; })[0] || null;
  var previousItems = Array.isArray(state.notifUpdateItems) && state.notifUpdateItems.length
    ? state.notifUpdateItems
    : (lastUpdate && Array.isArray(lastUpdate.updateItems) ? lastUpdate.updateItems : (lastUpdate ? notifParseUpdateItems(lastUpdate.body) : []));
  var previousSummary = typeof state.notifUpdateSummary === 'string'
    ? state.notifUpdateSummary
    : (lastUpdate && typeof lastUpdate.updateSummary === 'string' ? lastUpdate.updateSummary : (lastUpdate ? notifParseUpdateSummary(lastUpdate.body) : ''));
  var previousNotifyItems = Array.isArray(state.notifNotifyItems) ? state.notifNotifyItems : [];
  var sameEdition = !!(lastUpdate && latest && String(lastUpdate.title || '').indexOf(String(latest.date || '')) >= 0);
  var notifyDelta = latest && Array.isArray(latest.notifyItems) && latest.notifyItems.length
    ? latest.notifyItems.filter(function (it) {
        var group = it.group || '更新';
        var text = String(it.text || '');
        if (previousNotifyItems.length) {
          return !previousNotifyItems.some(function (p) { return p && (p.group || '更新') === group && String(p.text || '') === text; });
        }
        return !previousItems.some(function (p) { return p && (p.group || '更新') === group; });
      })
    : [];
  var hasPreviousEdition = !!(previousNotifyItems.length || previousItems.length);
  var delta = latest && Array.isArray(latest.notifyItems) && latest.notifyItems.length
    ? { items: (hasPreviousEdition ? notifyDelta : latest.notifyItems), summary: String(latest.notifySummary || latest.summary || ''), summaryChanged: !!(latest.notifySummary || latest.summary) && String(latest.notifySummary || latest.summary || '') !== String(previousSummary || '') }
    : (latest ? notifUpdateDelta(latest, previousItems, previousSummary) : { items: [], summary: '', summaryChanged: false });
  var previousSummaryText = String(previousSummary || '');
  var deltaSummaryText = String(delta.summary || '');
  if (delta.summaryChanged && previousSummaryText && deltaSummaryText.indexOf(previousSummaryText) === 0) {
    delta.summary = deltaSummaryText.slice(previousSummaryText.length).replace(/^[\s；;，,。、:：\-—]+/, '');
  }
  var hasNewContent = delta.items.length > 0 || (!sameEdition && delta.summaryChanged && !!delta.summary);
  if (latest && contentChanged && !alreadyNotified && hasNewContent) {
    var upLines = ['版本：' + (latest.date || '') + ' · ' + (latest.title || '新版本')];
    if (delta.summaryChanged && delta.summary) upLines.push(delta.summary);
    if (delta.items.length) {
      upLines.push('');
      upLines.push('本次更新内容：');
      delta.items.forEach(function (it, i) {
        upLines.push((i + 1) + '. 【' + (it.group || '更新') + '】' + it.text);
      });
    }
    var updateTitle = '网页已更新 · ' + (latest.date || '') + ' · ' + (latest.title || '新版本');
    if (sameEdition && previousItems.length) updateTitle += ' · 补充 ' + notifClock();
    notifAdd(updateTitle, upLines.join('\n'), 'update', {
      updateSignature: versionKey,
      buildId: buildId,
      updateItems: (latest.items || []).map(function (it) { return { group: it.group || '更新', text: String(it.text || '') }; }),
      updateSummary: String(latest.notifySummary || latest.summary || '')
    });
    state.notifVersion = versionKey;
    state.notifBuildId = buildId;
    state.notifNotifyItems = (latest.notifyItems || []).map(function (it) { return { group: it.group || '更新', text: String(it.text || '') }; });
    state.notifUpdateItems = (latest.items || []).map(function (it) { return { group: it.group || '更新', text: String(it.text || '') }; });
    state.notifUpdateSummary = String(latest.notifySummary || latest.summary || '');
  } else if (latest) {
    state.notifVersion = versionKey;
    if (buildId) state.notifBuildId = buildId;
  }
  var today = formatDate(nowIso()).slice(0, 10);
  if (state.notifReviewDate !== today) {
    var due = 0;
    SUBJECTS.forEach(function (s) {
      (state.entries[s.id] || []).forEach(function (e) {
        if (!e || !Array.isArray(e.reviewPlan)) return;
        var next = reviewPlanKeys(e).filter(function (d) { return !e.review[d]; })[0];
        if (next && reviewDayUnlocked(e, next)) due++;
      });
    });
    if (due > 0) {
      notifAdd('有 ' + due + ' 道题到复习时间', '打开错题页，按顺序完成今天的复习打卡；一次只开放一个节点。', 'review');
    }
    state.notifReviewDate = today;
  }
  if (!state.notifWelcomed) {
    notifAdd('欢迎使用四科错题本', '题目、模板、题库和笔记都保存在本机；设置里可以导出备份。', 'tip');
    state.notifWelcomed = true;
  }
  if (state.notifVersion || state.notifBuildId || state.notifUpdateItems || state.notifReviewDate || state.notifWelcomed) markDirty();
  renderNotifications();
  renderNotificationBadge();
}


document.addEventListener('click', function (e) {
  var layer = qs('#notifLayer');
  if (!layer || layer.hidden) return;
  var t = e.target;
  if (!t || !t.closest) return;
  if (t.closest('#notifPanel') || t.closest('[data-act="open-notifications"]')) return;
  closeNotifications();
});

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  var layer = qs('#notifLayer');
  if (layer && !layer.hidden) closeNotifications();
});
